// ALL TypeScript types in ONE file for minimal structure

export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[]

// Database types (matches Supabase schema exactly)
export interface Database {
  public: {
    Tables: {
      agents: {
        Row: {
          id: string
          user_id: string
          name: string
          type: string
          status: 'active' | 'inactive' | 'error'
          metadata: Json
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          name: string
          type: string
          status?: 'active' | 'inactive' | 'error'
          metadata?: Json
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          name?: string
          type?: string
          status?: 'active' | 'inactive' | 'error'
          metadata?: Json
          created_at?: string
        }
      }
      traces: {
        Row: {
          id: string
          agent_id: string
          user_id: string
          span_data: Json
          duration: number
          status: 'success' | 'error' | 'pending'
          tokens_used: number
          cost: number
          created_at: string
        }
        Insert: {
          id?: string
          agent_id: string
          user_id: string
          span_data: Json
          duration: number
          status?: 'success' | 'error' | 'pending'
          tokens_used?: number
          cost?: number
          created_at?: string
        }
        Update: {
          id?: string
          agent_id?: string
          user_id?: string
          span_data?: Json
          duration?: number
          status?: 'success' | 'error' | 'pending'
          tokens_used?: number
          cost?: number
          created_at?: string
        }
      }
      evaluations: {
        Row: {
          id: string
          trace_id: string
          score: number
          feedback: string | null
          created_at: string
        }
        Insert: {
          id?: string
          trace_id: string
          score: number
          feedback?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          trace_id?: string
          score?: number
          feedback?: string | null
          created_at?: string
        }
      }
      embeddings: {
        Row: {
          id: string
          trace_id: string
          embedding: number[] | null
          created_at: string
        }
        Insert: {
          id?: string
          trace_id: string
          embedding?: number[] | null
          created_at?: string
        }
        Update: {
          id?: string
          trace_id?: string
          embedding?: number[] | null
          created_at?: string
        }
      }
    }
    Functions: {
      match_traces: {
        Args: {
          query_embedding: number[]
          match_threshold: number
          match_count: number
        }
        Returns: Array<{
          id: string
          trace_id: string
          similarity: number
        }>
      }
    }
  }
}

// UI types
export interface DashboardStats {
  totalTraces: number
  activeAgents: number
  avgDuration: number
  totalCost: number
  trends: {
    traces: number
    cost: number
    duration: number
  }
}

export interface AgentStats {
  total: number
  avgDuration: number
  totalTokens: number
  totalCost: number
  successRate: number
}

export interface SpanData {
  name: string
  type: 'llm' | 'tool' | 'agent' | 'retrieval'
  startTime: string
  endTime: string
  duration: number
  input?: Json
  output?: Json
  metadata?: Json
}

export interface TraceWithAgent extends Database['public']['Tables']['traces']['Row'] {
  agents: {
    name: string
    type: string
  }
}

export interface TraceWithEvaluations extends Database['public']['Tables']['traces']['Row'] {
  agents: {
    name: string
    type: string
  }
  evaluations: Database['public']['Tables']['evaluations']['Row'][]
}
