// Agents API business logic
// Extracted from Next.js API routes for clear frontend/backend separation

import { createClientServer } from '../services/supabase'

export interface CreateAgentRequest {
  name: string
  type: string
  status?: 'active' | 'inactive' | 'error'
  metadata?: Record<string, any>
}

export interface UpdateAgentRequest {
  name?: string
  type?: string
  status?: 'active' | 'inactive' | 'error'
  metadata?: Record<string, any>
}

export class AgentsAPI {
  /**
   * Get all agents for the authenticated user
   */
  static async list(userId: string) {
    const supabase = await createClientServer()
    
    const { data, error } = await supabase
      .from('agents')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
    
    if (error) throw new Error(error.message)
    return data
  }

  /**
   * Get a single agent by ID
   */
  static async get(agentId: string, userId: string) {
    const supabase = await createClientServer()
    
    const { data, error } = await supabase
      .from('agents')
      .select('*')
      .eq('id', agentId)
      .eq('user_id', userId)
      .single()
    
    if (error) throw new Error(error.message)
    return data
  }

  /**
   * Create a new agent
   */
  static async create(userId: string, agent: CreateAgentRequest) {
    const supabase = await createClientServer()
    
    const { data, error } = await supabase
      .from('agents')
      .insert({ ...agent, user_id: userId })
      .select()
      .single()
    
    if (error) throw new Error(error.message)
    return data
  }

  /**
   * Update an existing agent
   */
  static async update(agentId: string, userId: string, updates: UpdateAgentRequest) {
    const supabase = await createClientServer()
    
    const { data, error } = await supabase
      .from('agents')
      .update(updates)
      .eq('id', agentId)
      .eq('user_id', userId)
      .select()
      .single()
    
    if (error) throw new Error(error.message)
    return data
  }

  /**
   * Delete an agent
   */
  static async delete(agentId: string, userId: string) {
    const supabase = await createClientServer()
    
    const { error } = await supabase
      .from('agents')
      .delete()
      .eq('id', agentId)
      .eq('user_id', userId)
    
    if (error) throw new Error(error.message)
    return { success: true }
  }

  /**
   * Get agent statistics
   */
  static async getStats(agentId: string, userId: string) {
    const supabase = await createClientServer()
    
    const { data: traces, error } = await supabase
      .from('traces')
      .select('duration, status, tokens_used, cost')
      .eq('agent_id', agentId)
      .eq('user_id', userId)
    
    if (error) throw new Error(error.message)

    const total = traces?.length || 0
    const avgDuration = total > 0 && traces
      ? traces.reduce((sum: number, t: any) => sum + (t.duration || 0), 0) / total
      : 0
    const totalTokens = traces?.reduce((sum: number, t: any) => sum + (t.tokens_used || 0), 0) || 0
    const totalCost = traces?.reduce((sum: number, t: any) => sum + Number(t.cost || 0), 0) || 0
    const successRate = total > 0
      ? (traces.filter((t: any) => t.status === 'success').length / total) * 100
      : 0

    return {
      total,
      avgDuration: Math.round(avgDuration),
      totalTokens,
      totalCost,
      successRate: Math.round(successRate),
    }
  }
}
