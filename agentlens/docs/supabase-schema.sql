-- ============================================================================
-- COMPLETE SUPABASE SCHEMA FOR AI OBSERVABILITY PLATFORM
-- Copy and paste this entire file into Supabase SQL Editor
-- ============================================================================

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS vector;
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================================================
-- TABLES
-- ============================================================================

-- Agents table: AI agents being monitored
CREATE TABLE agents (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users NOT NULL,
  name TEXT NOT NULL,
  type TEXT NOT NULL, -- e.g., 'chatbot', 'assistant', 'workflow'
  status TEXT CHECK (status IN ('active', 'inactive', 'error')) DEFAULT 'active',
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Traces table: Execution traces of agents
CREATE TABLE traces (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  agent_id UUID REFERENCES agents NOT NULL,
  user_id UUID REFERENCES auth.users NOT NULL,
  span_data JSONB NOT NULL, -- Complete trace with spans
  duration INTEGER NOT NULL, -- milliseconds
  status TEXT CHECK (status IN ('success', 'error', 'pending')) DEFAULT 'pending',
  tokens_used INTEGER DEFAULT 0,
  cost DECIMAL(10, 6) DEFAULT 0, -- USD
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Evaluations table: Quality scores for traces
CREATE TABLE evaluations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  trace_id UUID REFERENCES traces NOT NULL,
  score DECIMAL(3, 2) CHECK (score >= 0 AND score <= 1), -- 0.00 to 1.00
  feedback TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Embeddings table: Vector embeddings for semantic search
CREATE TABLE embeddings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  trace_id UUID REFERENCES traces NOT NULL,
  embedding VECTOR(1536), -- OpenAI ada-002 dimensions (or use 384 for all-MiniLM)
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================================
-- INDEXES FOR PERFORMANCE
-- ============================================================================

-- Agents indexes
CREATE INDEX idx_agents_user_id ON agents(user_id);
CREATE INDEX idx_agents_status ON agents(status);
CREATE INDEX idx_agents_created_at ON agents(created_at DESC);

-- Traces indexes
CREATE INDEX idx_traces_agent_id ON traces(agent_id);
CREATE INDEX idx_traces_user_id ON traces(user_id);
CREATE INDEX idx_traces_status ON traces(status);
CREATE INDEX idx_traces_created_at ON traces(created_at DESC);

-- Evaluations indexes
CREATE INDEX idx_evaluations_trace_id ON evaluations(trace_id);
CREATE INDEX idx_evaluations_score ON evaluations(score DESC);

-- Embeddings indexes
CREATE INDEX idx_embeddings_trace_id ON embeddings(trace_id);

-- Vector similarity search index (IVFFlat for fast approximate nearest neighbor search)
CREATE INDEX idx_embeddings_vector ON embeddings 
  USING ivfflat (embedding vector_cosine_ops) 
  WITH (lists = 100);

-- ============================================================================
-- ROW LEVEL SECURITY (RLS)
-- ============================================================================

-- Enable RLS on all tables
ALTER TABLE agents ENABLE ROW LEVEL SECURITY;
ALTER TABLE traces ENABLE ROW LEVEL SECURITY;
ALTER TABLE evaluations ENABLE ROW LEVEL SECURITY;
ALTER TABLE embeddings ENABLE ROW LEVEL SECURITY;

-- ============================================================================
-- RLS POLICIES - AGENTS
-- ============================================================================

CREATE POLICY "Users can view own agents"
  ON agents FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own agents"
  ON agents FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own agents"
  ON agents FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own agents"
  ON agents FOR DELETE
  USING (auth.uid() = user_id);

-- ============================================================================
-- RLS POLICIES - TRACES
-- ============================================================================

CREATE POLICY "Users can view own traces"
  ON traces FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own traces"
  ON traces FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own traces"
  ON traces FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own traces"
  ON traces FOR DELETE
  USING (auth.uid() = user_id);

-- ============================================================================
-- RLS POLICIES - EVALUATIONS
-- ============================================================================

CREATE POLICY "Users can view own evaluations"
  ON evaluations FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM traces 
      WHERE traces.id = evaluations.trace_id 
      AND traces.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can insert own evaluations"
  ON evaluations FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM traces 
      WHERE traces.id = trace_id 
      AND traces.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can delete own evaluations"
  ON evaluations FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM traces 
      WHERE traces.id = evaluations.trace_id 
      AND traces.user_id = auth.uid()
    )
  );

-- ============================================================================
-- RLS POLICIES - EMBEDDINGS
-- ============================================================================

CREATE POLICY "Users can view own embeddings"
  ON embeddings FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM traces 
      WHERE traces.id = embeddings.trace_id 
      AND traces.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can insert own embeddings"
  ON embeddings FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM traces 
      WHERE traces.id = trace_id 
      AND traces.user_id = auth.uid()
    )
  );

-- ============================================================================
-- FUNCTIONS FOR SEMANTIC SEARCH
-- ============================================================================

-- Function to find similar traces using cosine similarity
CREATE OR REPLACE FUNCTION match_traces(
  query_embedding VECTOR(1536),
  match_threshold FLOAT DEFAULT 0.7,
  match_count INT DEFAULT 10
)
RETURNS TABLE (
  id UUID,
  trace_id UUID,
  similarity FLOAT
)
LANGUAGE SQL STABLE
AS $$
  SELECT
    embeddings.id,
    embeddings.trace_id,
    1 - (embeddings.embedding <=> query_embedding) AS similarity
  FROM embeddings
  WHERE 1 - (embeddings.embedding <=> query_embedding) > match_threshold
  ORDER BY similarity DESC
  LIMIT match_count;
$$;

-- ============================================================================
-- HELPER FUNCTIONS
-- ============================================================================

-- Get agent statistics
CREATE OR REPLACE FUNCTION get_agent_stats(agent_uuid UUID)
RETURNS TABLE (
  total_traces BIGINT,
  avg_duration NUMERIC,
  total_tokens BIGINT,
  total_cost NUMERIC,
  success_rate NUMERIC
)
LANGUAGE SQL STABLE
AS $$
  SELECT
    COUNT(*)::BIGINT AS total_traces,
    AVG(duration)::NUMERIC AS avg_duration,
    SUM(tokens_used)::BIGINT AS total_tokens,
    SUM(cost)::NUMERIC AS total_cost,
    (COUNT(*) FILTER (WHERE status = 'success')::NUMERIC / NULLIF(COUNT(*), 0)) AS success_rate
  FROM traces
  WHERE agent_id = agent_uuid;
$$;

-- Get daily trace counts (for charts)
CREATE OR REPLACE FUNCTION get_daily_trace_counts(days_back INT DEFAULT 30)
RETURNS TABLE (
  date DATE,
  count BIGINT
)
LANGUAGE SQL STABLE
AS $$
  SELECT
    DATE(created_at) AS date,
    COUNT(*)::BIGINT AS count
  FROM traces
  WHERE created_at >= NOW() - (days_back || ' days')::INTERVAL
    AND user_id = auth.uid()
  GROUP BY DATE(created_at)
  ORDER BY date DESC;
$$;

-- ============================================================================
-- TRIGGERS (Optional - for automatic updates)
-- ============================================================================

-- Update agent last_seen when new trace is created
CREATE OR REPLACE FUNCTION update_agent_last_seen()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE agents
  SET metadata = jsonb_set(
    COALESCE(metadata, '{}'::jsonb),
    '{last_seen}',
    to_jsonb(NOW())
  )
  WHERE id = NEW.agent_id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_agent_last_seen
  AFTER INSERT ON traces
  FOR EACH ROW
  EXECUTE FUNCTION update_agent_last_seen();

-- ============================================================================
-- SAMPLE DATA (Optional - for testing)
-- ============================================================================

-- Insert sample agent (replace user_id with your auth.users id)
-- INSERT INTO agents (user_id, name, type, status, metadata)
-- VALUES (
--   'your-user-id-here',
--   'Demo Chatbot',
--   'chatbot',
--   'active',
--   '{"version": "1.0", "model": "gpt-4"}'::jsonb
-- );

-- ============================================================================
-- REALTIME PUBLICATION (Enable real-time updates)
-- ============================================================================

-- Enable realtime for all tables
ALTER PUBLICATION supabase_realtime ADD TABLE agents;
ALTER PUBLICATION supabase_realtime ADD TABLE traces;
ALTER PUBLICATION supabase_realtime ADD TABLE evaluations;

-- ============================================================================
-- GRANTS (Ensure proper permissions)
-- ============================================================================

GRANT USAGE ON SCHEMA public TO postgres, anon, authenticated, service_role;
GRANT ALL ON ALL TABLES IN SCHEMA public TO postgres, anon, authenticated, service_role;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO postgres, anon, authenticated, service_role;
GRANT ALL ON ALL FUNCTIONS IN SCHEMA public TO postgres, anon, authenticated, service_role;

-- ============================================================================
-- COMPLETE! Your database is ready.
-- ============================================================================

-- Verify setup:
-- SELECT COUNT(*) FROM agents; -- Should return 0 (or sample data)
-- SELECT * FROM pg_extension WHERE extname = 'vector'; -- Should show vector extension

