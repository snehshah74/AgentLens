import { createClientServer } from '@/lib/supabase'
import { TraceViewerComponent } from '@/components/trace-viewer'
import type { TraceWithAgent } from '@/types'

export default async function TracesPage() {
  const supabase = await createClientServer()
  const { data: { user } } = await supabase.auth.getUser()

  // Fetch traces with agent data
  let traces: TraceWithAgent[] = []
  if (user) {
    const { data } = await supabase
      .from('traces')
      .select('*, agents(name, type)')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .limit(50)

    if (data) {
      traces = data as TraceWithAgent[]
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-bold text-white mb-2 animate-fade-in">Traces</h1>
          <p className="text-white/60 animate-fade-in" style={{ animationDelay: '100ms' }}>
            Visualize and analyze your AI agent execution traces
          </p>
        </div>
      </div>

      <div className="animate-fade-in" style={{ animationDelay: '200ms' }}>
        {traces.length > 0 ? (
          <TraceViewerComponent traces={traces} />
        ) : (
          <div className="glass p-12 text-center rounded-xl">
            <div className="text-6xl mb-4">📊</div>
            <h3 className="text-xl font-semibold text-white mb-2">No Traces Yet</h3>
            <p className="text-white/60 mb-6">
              Start sending traces from your AI agents to see them visualized here
            </p>
            <button className="px-6 py-3 bg-gradient-to-r from-purple-500 to-blue-500 text-white rounded-lg hover:from-purple-600 hover:to-blue-600 transition-all glow-sm font-medium">
              View Documentation
            </button>
          </div>
        )}
      </div>
    </div>
  )
}

