// ALL Supabase logic in ONE file - client + queries + real-time
import { createBrowserClient, createServerClient } from '@supabase/ssr'
import type { Database } from '@/types'

// ============================================================================
// CLIENT-SIDE (for client components)
// ============================================================================
export const supabase = createBrowserClient<Database>(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

// ============================================================================
// SERVER-SIDE (for server components & API routes)
// ============================================================================
export async function createClientServer() {
  const { cookies } = await import('next/headers')
  const cookieStore = await cookies()
  
  return createServerClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return cookieStore.get(name)?.value
        },
      },
    }
  )
}

// ============================================================================
// DATABASE SCHEMA (Run this SQL in Supabase SQL Editor)
// ============================================================================
/*

-- Enable extensions
CREATE EXTENSION IF NOT EXISTS vector;
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Agents table
CREATE TABLE agents (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users NOT NULL,
  name TEXT NOT NULL,
  type TEXT NOT NULL,
  status TEXT CHECK (status IN ('active', 'inactive', 'error')) DEFAULT 'active',
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Traces table
CREATE TABLE traces (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  agent_id UUID REFERENCES agents NOT NULL,
  user_id UUID REFERENCES auth.users NOT NULL,
  span_data JSONB NOT NULL,
  duration INTEGER NOT NULL, -- milliseconds
  status TEXT CHECK (status IN ('success', 'error', 'pending')) DEFAULT 'pending',
  tokens_used INTEGER DEFAULT 0,
  cost DECIMAL(10, 6) DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Evaluations table
CREATE TABLE evaluations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  trace_id UUID REFERENCES traces NOT NULL,
  score DECIMAL(3, 2) CHECK (score >= 0 AND score <= 1),
  feedback TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Embeddings table (for semantic search)
CREATE TABLE embeddings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  trace_id UUID REFERENCES traces NOT NULL,
  embedding VECTOR(1536), -- OpenAI ada-002 dimensions
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX idx_agents_user_id ON agents(user_id);
CREATE INDEX idx_agents_status ON agents(status);
CREATE INDEX idx_traces_agent_id ON traces(agent_id);
CREATE INDEX idx_traces_user_id ON traces(user_id);
CREATE INDEX idx_traces_created_at ON traces(created_at DESC);
CREATE INDEX idx_evaluations_trace_id ON evaluations(trace_id);
CREATE INDEX idx_embeddings_trace_id ON embeddings(trace_id);

-- Vector similarity search index (IVFFlat for fast approximate search)
CREATE INDEX idx_embeddings_vector ON embeddings 
  USING ivfflat (embedding vector_cosine_ops) 
  WITH (lists = 100);

-- Enable Row Level Security
ALTER TABLE agents ENABLE ROW LEVEL SECURITY;
ALTER TABLE traces ENABLE ROW LEVEL SECURITY;
ALTER TABLE evaluations ENABLE ROW LEVEL SECURITY;
ALTER TABLE embeddings ENABLE ROW LEVEL SECURITY;

-- RLS Policies for Agents
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

-- RLS Policies for Traces
CREATE POLICY "Users can view own traces"
  ON traces FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own traces"
  ON traces FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own traces"
  ON traces FOR UPDATE
  USING (auth.uid() = user_id);

-- RLS Policies for Evaluations
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

-- RLS Policies for Embeddings
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

*/

// ============================================================================
// AUTH OPERATIONS
// ============================================================================
// Export auth directly (no wrapper needed)
export const auth = supabase.auth

// ============================================================================
// AGENTS OPERATIONS
// ============================================================================
export const agents = {
  // List all agents for current user
  list: async () => {
    const { data, error } = await supabase
      .from('agents')
      .select('*')
      .order('created_at', { ascending: false })
    
    if (error) throw error
    return data
  },

  // Get single agent
  get: async (id: string) => {
    const { data, error } = await supabase
      .from('agents')
      .select('*')
      .eq('id', id)
      .single()
    
    if (error) throw error
    return data
  },

  // Create new agent
  create: async (agent: {
    name: string
    type: string
    status?: 'active' | 'inactive' | 'error'
    metadata?: Record<string, any>
  }) => {
    const user = await auth.getUser()
    if (!user) throw new Error('Not authenticated')

    const { data, error } = await supabase
      .from('agents')
      .insert({ ...agent, user_id: user.id })
      .select()
      .single()
    
    if (error) throw error
    return data
  },

  // Update agent
  update: async (id: string, updates: {
    name?: string
    type?: string
    status?: 'active' | 'inactive' | 'error'
    metadata?: Record<string, any>
  }) => {
    const { data, error } = await supabase
      .from('agents')
      .update(updates)
      .eq('id', id)
      .select()
      .single()
    
    if (error) throw error
    return data
  },

  // Delete agent
  delete: async (id: string) => {
    const { error } = await supabase
      .from('agents')
      .delete()
      .eq('id', id)
    
    if (error) throw error
  },

  // Get agent stats
  getStats: async (agentId: string) => {
    const { data: traces, error } = await supabase
      .from('traces')
      .select('duration, status, tokens_used, cost')
      .eq('agent_id', agentId)
    
    if (error) throw error

    const total = traces.length
    const avgDuration = total > 0 ? traces.reduce((sum, t) => sum + t.duration, 0) / total : 0
    const totalTokens = traces.reduce((sum, t) => sum + (t.tokens_used || 0), 0)
    const totalCost = traces.reduce((sum, t) => sum + Number(t.cost || 0), 0)
    const successRate = total > 0 ? traces.filter(t => t.status === 'success').length / total : 0

    return { total, avgDuration, totalTokens, totalCost, successRate }
  },
}

// ============================================================================
// TRACES OPERATIONS
// ============================================================================
export const traces = {
  // List traces with optional filters
  list: async (filters?: {
    agentId?: string
    status?: 'success' | 'error' | 'pending'
    limit?: number
  }) => {
    let query = supabase
      .from('traces')
      .select('*, agents(name, type)')
      .order('created_at', { ascending: false })
    
    if (filters?.agentId) {
      query = query.eq('agent_id', filters.agentId)
    }
    if (filters?.status) {
      query = query.eq('status', filters.status)
    }
    if (filters?.limit) {
      query = query.limit(filters.limit)
    }
    
    const { data, error } = await query
    if (error) throw error
    return data
  },

  // Get single trace with evaluations
  get: async (id: string) => {
    const { data, error } = await supabase
      .from('traces')
      .select(`
        *,
        agents(name, type),
        evaluations(*)
      `)
      .eq('id', id)
      .single()
    
    if (error) throw error
    return data
  },

  // Create new trace
  create: async (trace: {
    agent_id: string
    span_data: Record<string, any>
    duration: number
    status?: 'success' | 'error' | 'pending'
    tokens_used?: number
    cost?: number
  }) => {
    const user = await auth.getUser()
    if (!user) throw new Error('Not authenticated')

    const { data, error } = await supabase
      .from('traces')
      .insert({ ...trace, user_id: user.id })
      .select()
      .single()
    
    if (error) throw error
    return data
  },

  // Update trace
  update: async (id: string, updates: {
    span_data?: Record<string, any>
    duration?: number
    status?: 'success' | 'error' | 'pending'
    tokens_used?: number
    cost?: number
  }) => {
    const { data, error } = await supabase
      .from('traces')
      .update(updates)
      .eq('id', id)
      .select()
      .single()
    
    if (error) throw error
    return data
  },

  // Delete trace
  delete: async (id: string) => {
    const { error } = await supabase
      .from('traces')
      .delete()
      .eq('id', id)
    
    if (error) throw error
  },

  // Get dashboard stats
  getDashboardStats: async () => {
    const { data: traces, error } = await supabase
      .from('traces')
      .select('duration, cost, status, created_at')
      .gte('created_at', new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString())
    
    if (error) throw error

    const { data: activeAgents } = await supabase
      .from('agents')
      .select('id')
      .eq('status', 'active')

    const total = traces.length
    const avgDuration = total > 0 ? traces.reduce((sum, t) => sum + t.duration, 0) / total : 0
    const totalCost = traces.reduce((sum, t) => sum + Number(t.cost || 0), 0)

    return {
      totalTraces: total,
      activeAgents: activeAgents?.length || 0,
      avgDuration: Math.round(avgDuration),
      totalCost: totalCost,
      trends: { traces: 12, cost: -5, duration: 8 }, // Calculate from historical data
    }
  },
}

// ============================================================================
// EVALUATIONS OPERATIONS
// ============================================================================
export const evaluations = {
  // List evaluations for a trace
  list: async (traceId: string) => {
    const { data, error } = await supabase
      .from('evaluations')
      .select('*')
      .eq('trace_id', traceId)
      .order('created_at', { ascending: false })
    
    if (error) throw error
    return data
  },

  // Create evaluation
  create: async (evaluation: {
    trace_id: string
    score: number
    feedback?: string
  }) => {
    const { data, error } = await supabase
      .from('evaluations')
      .insert(evaluation)
      .select()
      .single()
    
    if (error) throw error
    return data
  },

  // Get average score for traces
  getAverageScore: async (agentId?: string) => {
    let query = supabase
      .from('evaluations')
      .select('score, traces!inner(agent_id)')
    
    if (agentId) {
      query = query.eq('traces.agent_id', agentId)
    }
    
    const { data, error } = await query
    if (error) throw error

    if (!data || data.length === 0) return 0
    return data.reduce((sum, e) => sum + Number(e.score), 0) / data.length
  },
}

// ============================================================================
// EMBEDDINGS & SEMANTIC SEARCH
// ============================================================================
export const embeddings = {
  // Create embedding for trace
  create: async (embedding: {
    trace_id: string
    embedding: number[]
  }) => {
    const { data, error } = await supabase
      .from('embeddings')
      .insert(embedding)
      .select()
      .single()
    
    if (error) throw error
    return data
  },

  // Semantic search using cosine similarity
  search: async (queryEmbedding: number[], limit = 10) => {
    const { data, error } = await supabase.rpc('match_traces', {
      query_embedding: queryEmbedding,
      match_threshold: 0.7,
      match_count: limit,
    })
    
    if (error) throw error
    return data
  },

  // Get embedding for trace
  get: async (traceId: string) => {
    const { data, error } = await supabase
      .from('embeddings')
      .select('*')
      .eq('trace_id', traceId)
      .single()
    
    if (error) throw error
    return data
  },
}

// ============================================================================
// REAL-TIME SUBSCRIPTIONS
// ============================================================================
export const realtime = {
  // Subscribe to new traces
  subscribeToTraces: (callback: (payload: any) => void) => {
    return supabase
      .channel('traces-changes')
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'traces' },
        callback
      )
      .subscribe()
  },

  // Subscribe to agent status changes
  subscribeToAgents: (callback: (payload: any) => void) => {
    return supabase
      .channel('agents-changes')
      .on(
        'postgres_changes',
        { event: 'UPDATE', schema: 'public', table: 'agents' },
        callback
      )
      .subscribe()
  },

  // Subscribe to specific agent's traces
  subscribeToAgentTraces: (agentId: string, callback: (payload: any) => void) => {
    return supabase
      .channel(`agent-${agentId}-traces`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'traces',
          filter: `agent_id=eq.${agentId}`,
        },
        callback
      )
      .subscribe()
  },

  // Unsubscribe from channel
  unsubscribe: (channel: ReturnType<typeof supabase.channel>) => {
    return supabase.removeChannel(channel)
  },
}

// ============================================================================
// HELPER FUNCTION: Create semantic search function in Supabase
// Run this SQL to enable semantic search:
// ============================================================================
/*

CREATE OR REPLACE FUNCTION match_traces(
  query_embedding VECTOR(1536),
  match_threshold FLOAT,
  match_count INT
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

*/

// ============================================================================
// TYPE-SAFE EXPORTS
// ============================================================================
export type { Database } from '@/types'
export type Agent = Database['public']['Tables']['agents']['Row']
export type Trace = Database['public']['Tables']['traces']['Row']
export type Evaluation = Database['public']['Tables']['evaluations']['Row']
export type Embedding = Database['public']['Tables']['embeddings']['Row']
