// AI API business logic
// Extracted from Next.js API routes for clear frontend/backend separation

import {
  analyzeTrace,
  detectAnomalies,
  suggestOptimizations,
  scoreQuality,
  chatAboutTrace
} from '../services/ai'
import { createClientServer } from '../services/supabase'

export type AIAction = 'summary' | 'anomalies' | 'optimizations' | 'quality' | 'chat'

export interface AIRequest {
  action: AIAction
  traceId: string
  question?: string
  spans?: any[]
}

export class AIAPI {
  /**
   * Process AI request for trace analysis
   */
  static async process(userId: string, request: AIRequest) {
    const { action, traceId, question, spans } = request
    const supabase = await createClientServer()

    // Fetch trace with agent info
    const { data: trace, error } = await supabase
      .from('traces')
      .select('*, agents(name, type)')
      .eq('id', traceId)
      .eq('user_id', userId)
      .single()

    if (error || !trace) {
      throw new Error('Trace not found')
    }

    // Fetch historical data for anomaly detection
    const { data: historicalTraces } = await supabase
      .from('traces')
      .select('duration, cost, tokens_used')
      .eq('user_id', userId)
      .limit(100)

    const historicalData = historicalTraces || []

    // Process based on action type
    switch (action) {
      case 'summary':
        const summary = await analyzeTrace(trace)
        return { summary }

      case 'anomalies':
        const anomalies = await detectAnomalies(trace, historicalData)
        return { anomalies }

      case 'optimizations':
        const optimizations = suggestOptimizations(trace, spans || [])
        return { optimizations }

      case 'quality':
        const qualityScore = scoreQuality(trace, spans || [])
        return { qualityScore }

      case 'chat':
        if (!question) {
          throw new Error('Question is required for chat action')
        }
        const answer = await chatAboutTrace(question, trace, spans || [])
        return { answer }

      default:
        throw new Error(`Invalid action: ${action}`)
    }
  }

  /**
   * Check AI services health
   */
  static async healthCheck() {
    const { checkAIHealth } = await import('../services/ai')
    return await checkAIHealth()
  }
}
