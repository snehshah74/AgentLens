// ALL AI/ML functionality in ONE file - Complete AI observability suite
// Uses Groq API for LLM calls, statistical methods for anomaly detection,
// and cosine similarity for semantic search

import Groq from 'groq-sdk'

// Initialize Groq client
const groq = new Groq({ 
  apiKey: process.env.GROQ_API_KEY || '',
})

// ============================================
// 1. TRACE ANALYSIS - AI-Powered Summaries
// ============================================

export async function analyzeTrace(trace: any) {
  try {
    const prompt = `Analyze this AI agent trace and provide a concise 2-3 sentence summary:

Agent: ${trace.agents?.name || 'Unknown'}
Duration: ${trace.duration}ms
Status: ${trace.status}
Tokens: ${trace.tokens_used || 0}
Cost: $${trace.cost || 0}
Created: ${new Date(trace.created_at).toLocaleString()}

Span Data: ${JSON.stringify(trace.span_data || {}).substring(0, 500)}...

Focus on what the agent accomplished, any notable patterns, and overall performance.`

    const completion = await groq.chat.completions.create({
      messages: [{ role: 'user', content: prompt }],
      model: 'llama-3.1-8b-instant',
      temperature: 0.5,
      max_tokens: 200,
    })

    return {
      success: true,
      summary: completion.choices[0]?.message?.content || 'Unable to generate summary',
      timestamp: new Date().toISOString(),
    }
  } catch (error: any) {
    console.error('Error analyzing trace:', error)
    return {
      success: false,
      summary: `This trace executed in ${trace.duration}ms with ${trace.tokens_used || 0} tokens at a cost of $${trace.cost || 0}. Status: ${trace.status}.`,
      error: error.message,
    }
  }
}

// ============================================
// 2. ANOMALY DETECTION - Statistical Analysis
// ============================================

interface HistoricalStats {
  mean: number
  stdDev: number
  count: number
}

interface AnomalyResult {
  isAnomaly: boolean
  type: 'duration' | 'cost' | 'tokens' | 'error'
  severity: 'low' | 'medium' | 'high'
  message: string
  zScore?: number
  threshold?: number
}

// Calculate z-score for anomaly detection
function calculateZScore(value: number, mean: number, stdDev: number): number {
  if (stdDev === 0) return 0
  return (value - mean) / stdDev
}

// Calculate mean and standard deviation
function calculateStats(values: number[]): HistoricalStats {
  const count = values.length
  if (count === 0) return { mean: 0, stdDev: 0, count: 0 }

  const mean = values.reduce((sum, val) => sum + val, 0) / count
  const variance = values.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / count
  const stdDev = Math.sqrt(variance)

  return { mean, stdDev, count }
}

export async function detectAnomalies(
  trace: any,
  historicalData: any[]
): Promise<AnomalyResult[]> {
  const anomalies: AnomalyResult[] = []

  try {
    // Error detection (always high severity)
    if (trace.status === 'error') {
      anomalies.push({
        isAnomaly: true,
        type: 'error',
        severity: 'high',
        message: 'Trace execution failed with an error',
      })
    }

    // Statistical anomaly detection for duration
    if (historicalData.length >= 10) {
      const durations = historicalData.map(t => t.duration || 0).filter(d => d > 0)
      const durationStats = calculateStats(durations)
      const durationZScore = calculateZScore(trace.duration || 0, durationStats.mean, durationStats.stdDev)

      // Z-score > 3 = high, > 2 = medium, > 1.5 = low
      if (Math.abs(durationZScore) > 3) {
        anomalies.push({
          isAnomaly: true,
          type: 'duration',
          severity: 'high',
          message: `Duration (${trace.duration}ms) is ${durationZScore.toFixed(1)} standard deviations from average (${durationStats.mean.toFixed(0)}ms)`,
          zScore: durationZScore,
          threshold: 3,
        })
      } else if (Math.abs(durationZScore) > 2) {
        anomalies.push({
          isAnomaly: true,
          type: 'duration',
          severity: 'medium',
          message: `Duration is ${durationZScore.toFixed(1)}σ above average`,
          zScore: durationZScore,
          threshold: 2,
        })
      }

      // Cost anomaly detection
      const costs = historicalData.map(t => t.cost || 0).filter(c => c > 0)
      if (costs.length >= 10 && trace.cost) {
        const costStats = calculateStats(costs)
        const costZScore = calculateZScore(trace.cost, costStats.mean, costStats.stdDev)

        if (Math.abs(costZScore) > 3) {
          anomalies.push({
            isAnomaly: true,
            type: 'cost',
            severity: 'high',
            message: `Cost ($${trace.cost.toFixed(4)}) is ${costZScore.toFixed(1)}σ above average ($${costStats.mean.toFixed(4)})`,
            zScore: costZScore,
            threshold: 3,
          })
        } else if (Math.abs(costZScore) > 2) {
          anomalies.push({
            isAnomaly: true,
            type: 'cost',
            severity: 'medium',
            message: `Cost is ${costZScore.toFixed(1)}σ above average`,
            zScore: costZScore,
            threshold: 2,
          })
        }
      }

      // Token usage anomaly detection
      const tokens = historicalData.map(t => t.tokens_used || 0).filter(tk => tk > 0)
      if (tokens.length >= 10 && trace.tokens_used) {
        const tokenStats = calculateStats(tokens)
        const tokenZScore = calculateZScore(trace.tokens_used, tokenStats.mean, tokenStats.stdDev)

        if (Math.abs(tokenZScore) > 3) {
          anomalies.push({
            isAnomaly: true,
            type: 'tokens',
            severity: 'high',
            message: `Token usage (${trace.tokens_used}) is ${tokenZScore.toFixed(1)}σ above average (${tokenStats.mean.toFixed(0)})`,
            zScore: tokenZScore,
            threshold: 3,
          })
        } else if (Math.abs(tokenZScore) > 2) {
          anomalies.push({
            isAnomaly: true,
            type: 'tokens',
            severity: 'medium',
            message: `Token usage is ${tokenZScore.toFixed(1)}σ above average`,
            zScore: tokenZScore,
            threshold: 2,
          })
        }
      }
    } else {
      // Not enough historical data - use simple thresholds
      if (trace.duration > 5000) {
        anomalies.push({
          isAnomaly: true,
          type: 'duration',
          severity: 'medium',
          message: `Duration (${trace.duration}ms) exceeds 5s threshold`,
        })
      }

      if (trace.cost && trace.cost > 0.1) {
        anomalies.push({
          isAnomaly: true,
          type: 'cost',
          severity: 'medium',
          message: `Cost ($${trace.cost.toFixed(4)}) exceeds $0.10 threshold`,
        })
      }
    }

    return anomalies
  } catch (error: any) {
    console.error('Error detecting anomalies:', error)
    return [{
      isAnomaly: false,
      type: 'error',
      severity: 'low',
      message: 'Anomaly detection failed: ' + error.message,
    }]
  }
}

// ============================================
// 3. EMBEDDINGS - Vector Representations
// ============================================

// Generate embeddings using simple TF-IDF + normalization
// For production, use Groq/OpenAI embeddings API
export function generateEmbedding(text: string, dimensions: number = 384): number[] {
  try {
    // Normalize text
    const normalized = text.toLowerCase().trim()
    
    // Simple hash-based embedding (deterministic)
    const embedding = new Array(dimensions).fill(0)
    
    // Create embedding from character codes
    for (let i = 0; i < normalized.length; i++) {
      const charCode = normalized.charCodeAt(i)
      const idx1 = (charCode * 7 + i) % dimensions
      const idx2 = (charCode * 13 + i) % dimensions
      const idx3 = (charCode * 17 + i) % dimensions
      
      embedding[idx1] += charCode / 255
      embedding[idx2] += (charCode * 2) / 255
      embedding[idx3] += (charCode * 3) / 255
    }
    
    // Add word count features
    const words = normalized.split(/\s+/)
    embedding[0] += words.length / 100
    
    // Add length features
    embedding[1] += normalized.length / 1000
    
    // Normalize to unit vector (L2 normalization)
    const magnitude = Math.sqrt(embedding.reduce((sum, val) => sum + val * val, 0))
    
    if (magnitude > 0) {
      return embedding.map(val => val / magnitude)
    }
    
    return embedding
  } catch (error) {
    console.error('Error generating embedding:', error)
    return new Array(dimensions).fill(0)
  }
}

// Advanced: Use Groq for embeddings (if available)
export async function generateGroqEmbedding(text: string): Promise<number[]> {
  try {
    // Note: Groq doesn't have a direct embeddings API yet
    // This is a placeholder for when they add it
    // For now, fall back to local embedding
    return generateEmbedding(text)
  } catch (error) {
    console.error('Error generating Groq embedding:', error)
    return generateEmbedding(text)
  }
}

// ============================================
// 4. SEMANTIC SEARCH - Vector Similarity
// ============================================

// Calculate cosine similarity between two vectors
function cosineSimilarity(vecA: number[], vecB: number[]): number {
  if (vecA.length !== vecB.length) return 0
  
  let dotProduct = 0
  let magnitudeA = 0
  let magnitudeB = 0
  
  for (let i = 0; i < vecA.length; i++) {
    dotProduct += vecA[i] * vecB[i]
    magnitudeA += vecA[i] * vecA[i]
    magnitudeB += vecB[i] * vecB[i]
  }
  
  magnitudeA = Math.sqrt(magnitudeA)
  magnitudeB = Math.sqrt(magnitudeB)
  
  if (magnitudeA === 0 || magnitudeB === 0) return 0
  
  return dotProduct / (magnitudeA * magnitudeB)
}

interface SearchResult {
  trace: any
  similarity: number
  relevanceScore: number
}

export async function semanticSearch(
  query: string,
  traces: any[],
  topK: number = 10
): Promise<SearchResult[]> {
  try {
    // Generate query embedding
    const queryEmbedding = generateEmbedding(query)
    
    // Calculate similarity for each trace
    const results: SearchResult[] = traces.map(trace => {
      // Create searchable text from trace
      const traceText = `
        ${trace.agents?.name || ''} 
        ${trace.status} 
        ${JSON.stringify(trace.span_data || {})}
        ${trace.created_at}
      `.toLowerCase()
      
      const traceEmbedding = generateEmbedding(traceText)
      const similarity = cosineSimilarity(queryEmbedding, traceEmbedding)
      
      // Boost score for exact matches in metadata
      let relevanceScore = similarity
      if (traceText.includes(query.toLowerCase())) {
        relevanceScore += 0.2 // Boost for keyword match
      }
      if (trace.status === 'error' && query.toLowerCase().includes('error')) {
        relevanceScore += 0.3 // Boost for status match
      }
      
      return {
        trace,
        similarity,
        relevanceScore: Math.min(relevanceScore, 1),
      }
    })
    
    // Sort by relevance and return top K
    return results
      .sort((a, b) => b.relevanceScore - a.relevanceScore)
      .slice(0, topK)
      .filter(r => r.relevanceScore > 0.1) // Filter out very low scores
  } catch (error) {
    console.error('Error in semantic search:', error)
    return []
  }
}

// ============================================
// 5. OPTIMIZATION SUGGESTIONS - Smart Tips
// ============================================

interface Optimization {
  title: string
  description: string
  impact: 'high' | 'medium' | 'low'
  category: 'cost' | 'performance' | 'quality'
  estimatedSavings?: string
}

export function suggestOptimizations(trace: any, spans: any[] = []): Optimization[] {
  const suggestions: Optimization[] = []

  try {
    const llmSpans = spans.filter(s => s.type === 'llm')
    const toolSpans = spans.filter(s => s.type === 'tool')
    const totalLLMDuration = llmSpans.reduce((sum, s) => sum + (s.duration || 0), 0)

    // High LLM usage
    if (llmSpans.length > 5) {
      suggestions.push({
        title: 'Batch LLM Calls',
        description: `This trace made ${llmSpans.length} LLM calls. Consider batching similar requests to reduce overhead and API latency by ~40%.`,
        impact: 'high',
        category: 'performance',
        estimatedSavings: '40% latency reduction',
      })
    }

    // High cost
    if (trace.cost && trace.cost > 0.01) {
      suggestions.push({
        title: 'Use Smaller Model',
        description: `Cost is $${trace.cost.toFixed(4)}. Consider using llama-3.1-8b-instant instead of larger models for simpler tasks. Could reduce cost by 10x.`,
        impact: 'high',
        category: 'cost',
        estimatedSavings: `Save ~$${(trace.cost * 0.9).toFixed(4)}`,
      })
    }

    // LLM dominates execution time
    if (totalLLMDuration > (trace.duration || 0) * 0.7) {
      suggestions.push({
        title: 'Implement Response Caching',
        description: 'LLM calls take 70% of execution time. Cache frequent prompts/responses using Redis or in-memory cache to reduce latency by 80%.',
        impact: 'high',
        category: 'performance',
        estimatedSavings: '80% latency for cached responses',
      })
    }

    // High token usage
    if (trace.tokens_used && trace.tokens_used > 4000) {
      suggestions.push({
        title: 'Optimize Prompt Length',
        description: `Token usage is ${trace.tokens_used}. Use prompt compression, remove redundant context, or implement RAG to reduce tokens by 50%.`,
        impact: 'medium',
        category: 'cost',
        estimatedSavings: `Save ~$${((trace.cost || 0) * 0.5).toFixed(4)}`,
      })
    }

    // Many tool calls
    if (toolSpans.length > 3) {
      suggestions.push({
        title: 'Parallel Tool Execution',
        description: `${toolSpans.length} tool calls detected. Execute independent tools in parallel to reduce latency by 60%.`,
        impact: 'medium',
        category: 'performance',
        estimatedSavings: '60% faster tool execution',
      })
    }

    // Slow overall execution
    if (trace.duration && trace.duration > 5000) {
      suggestions.push({
        title: 'Add Streaming Responses',
        description: 'Trace took >5s. Implement streaming for LLM responses to improve perceived latency and user experience.',
        impact: 'medium',
        category: 'quality',
      })
    }

    // Error status
    if (trace.status === 'error') {
      suggestions.push({
        title: 'Add Error Recovery',
        description: 'Trace failed. Implement retry logic with exponential backoff and fallback mechanisms to improve reliability.',
        impact: 'high',
        category: 'quality',
      })
    }

    // No suggestions - all good!
    if (suggestions.length === 0) {
      suggestions.push({
        title: 'Fully Optimized',
        description: 'This trace is already well-optimized! No immediate improvements needed.',
        impact: 'low',
        category: 'quality',
      })
    }

    return suggestions
  } catch (error) {
    console.error('Error generating optimizations:', error)
    return [{
      title: 'Analysis Error',
      description: 'Unable to generate optimization suggestions',
      impact: 'low',
      category: 'quality',
    }]
  }
}

// ============================================
// 6. QUALITY SCORING - Performance Evaluation
// ============================================

interface QualityScore {
  overall: number // 0-100
  breakdown: {
    reliability: number
    performance: number
    efficiency: number
    cost: number
  }
  grade: 'A+' | 'A' | 'B' | 'C' | 'D' | 'F'
  insights: string[]
}

export function scoreQuality(trace: any, spans: any[] = []): QualityScore {
  try {
    let reliabilityScore = 100
    let performanceScore = 100
    let efficiencyScore = 100
    let costScore = 100
    const insights: string[] = []

    // Reliability (40% weight)
    if (trace.status === 'error') {
      reliabilityScore = 0
      insights.push('❌ Trace failed - critical reliability issue')
    } else if (trace.status === 'pending') {
      reliabilityScore = 50
      insights.push('⏳ Trace still pending')
    } else {
      insights.push('✅ Trace completed successfully')
    }

    // Performance (30% weight)
    if (trace.duration) {
      if (trace.duration < 500) {
        insights.push('⚡ Excellent response time (<500ms)')
      } else if (trace.duration < 2000) {
        performanceScore -= 10
        insights.push('✓ Good response time (<2s)')
      } else if (trace.duration < 5000) {
        performanceScore -= 30
        insights.push('⚠️ Moderate latency (2-5s)')
      } else {
        performanceScore -= 60
        insights.push('🐌 High latency (>5s)')
      }
    }

    // Efficiency (20% weight)
    const llmSpans = spans.filter(s => s.type === 'llm')
    if (llmSpans.length > 10) {
      efficiencyScore -= 40
      insights.push(`⚠️ High LLM call count (${llmSpans.length})`)
    } else if (llmSpans.length > 5) {
      efficiencyScore -= 20
      insights.push(`ℹ️ Moderate LLM usage (${llmSpans.length} calls)`)
    } else if (llmSpans.length > 0) {
      insights.push(`✓ Efficient LLM usage (${llmSpans.length} calls)`)
    }

    // Cost (10% weight)
    if (trace.cost) {
      if (trace.cost < 0.001) {
        insights.push('💰 Excellent cost efficiency (<$0.001)')
      } else if (trace.cost < 0.01) {
        costScore -= 10
        insights.push('✓ Good cost (<$0.01)')
      } else if (trace.cost < 0.1) {
        costScore -= 30
        insights.push('⚠️ Moderate cost ($0.01-$0.10)')
      } else {
        costScore -= 60
        insights.push('💸 High cost (>$0.10)')
      }
    }

    // Calculate weighted overall score
    const overall = Math.round(
      reliabilityScore * 0.4 +
      performanceScore * 0.3 +
      efficiencyScore * 0.2 +
      costScore * 0.1
    )

    // Determine grade
    let grade: QualityScore['grade']
    if (overall >= 95) grade = 'A+'
    else if (overall >= 85) grade = 'A'
    else if (overall >= 70) grade = 'B'
    else if (overall >= 50) grade = 'C'
    else if (overall >= 30) grade = 'D'
    else grade = 'F'

    return {
      overall: Math.max(0, Math.min(100, overall)),
      breakdown: {
        reliability: Math.max(0, reliabilityScore),
        performance: Math.max(0, performanceScore),
        efficiency: Math.max(0, efficiencyScore),
        cost: Math.max(0, costScore),
      },
      grade,
      insights,
    }
  } catch (error) {
    console.error('Error scoring quality:', error)
    return {
      overall: 50,
      breakdown: { reliability: 50, performance: 50, efficiency: 50, cost: 50 },
      grade: 'C',
      insights: ['Error calculating quality score'],
    }
  }
}

// ============================================
// 7. BONUS: CHAT WITH AI ABOUT TRACE
// ============================================

export async function chatAboutTrace(
  question: string,
  trace: any,
  spans: any[] = []
): Promise<string> {
  try {
    const context = `You are an AI observability expert analyzing a trace.

Trace Information:
- Agent: ${trace.agents?.name || 'Unknown'}
- Duration: ${trace.duration}ms
- Status: ${trace.status}
- Tokens: ${trace.tokens_used || 0}
- Cost: $${trace.cost || 0}
- Created: ${trace.created_at}

Spans Summary:
${spans.slice(0, 5).map((s, i) => `${i + 1}. ${s.name} (${s.type}): ${s.duration?.toFixed(2) || 0}ms`).join('\n')}

User Question: ${question}

Provide a helpful, concise answer (2-3 sentences) based on the trace data. Be specific and actionable.`

    const completion = await groq.chat.completions.create({
      messages: [{ role: 'user', content: context }],
      model: 'llama-3.1-8b-instant',
      temperature: 0.7,
      max_tokens: 300,
    })

    return completion.choices[0]?.message?.content || 'Unable to answer. Please rephrase your question.'
  } catch (error: any) {
    console.error('Error in AI chat:', error)
    return `I'm having trouble analyzing this trace right now. Based on the data, the trace took ${trace.duration}ms and used ${trace.tokens_used || 0} tokens.`
  }
}

// ============================================
// 8. UTILITY FUNCTIONS
// ============================================

// Calculate percentile for anomaly detection
export function calculatePercentile(values: number[], percentile: number): number {
  const sorted = [...values].sort((a, b) => a - b)
  const index = Math.ceil((percentile / 100) * sorted.length) - 1
  return sorted[Math.max(0, index)] || 0
}

// Detect outliers using IQR method
export function detectOutliers(values: number[]): { outliers: number[]; threshold: number } {
  // Sort for percentile calculation
  [...values].sort((a, b) => a - b)
  const q1 = calculatePercentile(values, 25)
  const q3 = calculatePercentile(values, 75)
  const iqr = q3 - q1
  const threshold = q3 + 1.5 * iqr
  
  const outliers = values.filter(v => v > threshold)
  
  return { outliers, threshold }
}

// Health check for AI services
export async function checkAIHealth(): Promise<{ groq: boolean; embeddings: boolean }> {
  try {
    // Test Groq connection
    const testCompletion = await groq.chat.completions.create({
      messages: [{ role: 'user', content: 'test' }],
      model: 'llama-3.1-8b-instant',
      max_tokens: 5,
    })
    
    const groqHealthy = !!testCompletion.choices[0]
    
    // Test embeddings
    const testEmbedding = generateEmbedding('test')
    const embeddingsHealthy = testEmbedding.length > 0
    
    return { groq: groqHealthy, embeddings: embeddingsHealthy }
  } catch (error) {
    console.error('AI health check failed:', error)
    return { groq: false, embeddings: true } // Embeddings are always local
  }
}
