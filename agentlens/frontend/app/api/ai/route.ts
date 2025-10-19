import { NextResponse } from 'next/server'
import { createClientServer } from '@/lib/supabase'
import { 
  analyzeTrace, 
  detectAnomalies, 
  suggestOptimizations,
  scoreQuality,
  chatAboutTrace,
  checkAIHealth
} from '@/lib/ai'

export async function POST(request: Request) {
  const supabase = await createClientServer()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { action, traceId, question, spans } = await request.json()

  try {
    // Fetch trace
    const { data: trace } = await supabase
      .from('traces')
      .select('*, agents(name, type)')
      .eq('id', traceId)
      .eq('user_id', user.id)
      .single()

    if (!trace) {
      return NextResponse.json({ error: 'Trace not found' }, { status: 404 })
    }

    // Fetch historical data for anomaly detection
    const { data: historicalTraces } = await supabase
      .from('traces')
      .select('duration, cost, tokens_used')
      .eq('user_id', user.id)
      .limit(100)

    switch (action) {
      case 'summary':
        const summary = await analyzeTrace(trace)
        return NextResponse.json({ summary })

      case 'anomalies':
        const anomalies = await detectAnomalies(trace, historicalTraces || [])
        return NextResponse.json({ anomalies })

      case 'optimizations':
        const optimizations = suggestOptimizations(trace, spans || [])
        return NextResponse.json({ optimizations })

      case 'quality':
        const qualityScore = scoreQuality(trace, spans || [])
        return NextResponse.json({ qualityScore })

      case 'chat':
        const answer = await chatAboutTrace(question, trace, spans || [])
        return NextResponse.json({ answer })

      default:
        return NextResponse.json({ error: 'Invalid action' }, { status: 400 })
    }
  } catch (error: any) {
    console.error('AI API error:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

export async function GET() {
  try {
    const health = await checkAIHealth()
    return NextResponse.json({ status: 'healthy', services: health })
  } catch (error: any) {
    return NextResponse.json({ status: 'unhealthy', error: error.message }, { status: 500 })
  }
}
