// Traces API business logic
// Extracted from Next.js API routes for clear frontend/backend separation

import { createClientServer } from '../services/supabase'

export interface CreateTraceRequest {
  agent_id: string
  span_data: Record<string, any>
  duration: number
  status?: 'success' | 'error' | 'pending'
  tokens_used?: number
  cost?: number
}

export interface UpdateTraceRequest {
  span_data?: Record<string, any>
  duration?: number
  status?: 'success' | 'error' | 'pending'
  tokens_used?: number
  cost?: number
}

export class TracesAPI {
  /**
   * Get all traces for the authenticated user
   */
  static async list(userId: string, filters?: {
    agentId?: string
    status?: 'success' | 'error' | 'pending'
    limit?: number
  }) {
    const supabase = await createClientServer()
    
    let query = supabase
      .from('traces')
      .select('*, agents(name, type)')
      .eq('user_id', userId)
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
    
    if (error) throw new Error(error.message)
    return data
  }

  /**
   * Get a single trace by ID
   */
  static async get(traceId: string, userId: string) {
    const supabase = await createClientServer()
    
    const { data, error } = await supabase
      .from('traces')
      .select(`*, agents(name, type), evaluations(*)`)
      .eq('id', traceId)
      .eq('user_id', userId)
      .single()
    
    if (error) throw new Error(error.message)
    return data
  }

  /**
   * Create a new trace
   */
  static async create(userId: string, trace: CreateTraceRequest) {
    const supabase = await createClientServer()
    
    const { data, error } = await supabase
      .from('traces')
      .insert({ ...trace, user_id: userId })
      .select()
      .single()
    
    if (error) throw new Error(error.message)
    return data
  }

  /**
   * Update an existing trace
   */
  static async update(traceId: string, userId: string, updates: UpdateTraceRequest) {
    const supabase = await createClientServer()
    
    const { data, error } = await supabase
      .from('traces')
      .update(updates)
      .eq('id', traceId)
      .eq('user_id', userId)
      .select()
      .single()
    
    if (error) throw new Error(error.message)
    return data
  }

  /**
   * Delete a trace
   */
  static async delete(traceId: string, userId: string) {
    const supabase = await createClientServer()
    
    const { error } = await supabase
      .from('traces')
      .delete()
      .eq('id', traceId)
      .eq('user_id', userId)
    
    if (error) throw new Error(error.message)
    return { success: true }
  }

  /**
   * Get dashboard statistics
   */
  static async getDashboardStats(userId: string) {
    const supabase = await createClientServer()
    
    const { data: traces, error: tracesError } = await supabase
      .from('traces')
      .select('duration, cost, status, created_at')
      .eq('user_id', userId)
      .gte('created_at', new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString())
    
    if (tracesError) throw new Error(tracesError.message)

    const { data: activeAgents, error: agentsError } = await supabase
      .from('agents')
      .select('id')
      .eq('user_id', userId)
      .eq('status', 'active')
    
    if (agentsError) throw new Error(agentsError.message)

    const total = traces?.length || 0
    const avgDuration = total > 0 && traces
      ? traces.reduce((sum: number, t: any) => sum + (t.duration || 0), 0) / total 
      : 0
    const totalCost = traces?.reduce((sum: number, t: any) => sum + Number(t.cost || 0), 0) || 0

    return {
      totalTraces: total,
      activeAgents: activeAgents?.length || 0,
      avgDuration: Math.round(avgDuration),
      totalCost: totalCost,
      trends: { traces: 12, cost: -5, duration: -8 },
    }
  }
}
