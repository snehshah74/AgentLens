import { DashboardComponent } from '@/components/dashboard'
import { createClientServer } from '@/lib/supabase'

// Server Component - fetches initial data
export default async function DashboardPage() {
  const supabase = await createClientServer()

  try {
    // Fetch dashboard stats
    const { data: traces } = await supabase
      .from('traces')
      .select('duration, cost, status, created_at')
      .gte('created_at', new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString())

    const { data: activeAgents } = await supabase
      .from('agents')
      .select('id')
      .eq('status', 'active')

    const total = traces?.length || 0
    const avgDuration = total > 0 && traces
      ? traces.reduce((sum: number, t: any) => sum + (t.duration || 0), 0) / total 
      : 0
    const totalCost = traces?.reduce((sum: number, t: any) => sum + Number(t.cost || 0), 0) || 0

    const stats = {
      totalTraces: total,
      activeAgents: activeAgents?.length || 0,
      avgDuration: Math.round(avgDuration),
      totalCost: totalCost,
      trends: { traces: 12, cost: -5, duration: -8 },
    }

    return <DashboardComponent initialStats={stats} />
  } catch (error) {
    // Return demo data if not connected to Supabase yet
    return (
      <DashboardComponent
        initialStats={{
          totalTraces: 0,
          activeAgents: 0,
          avgDuration: 0,
          totalCost: 0,
          trends: { traces: 0, cost: 0, duration: 0 },
        }}
      />
    )
  }
}

// Revalidate every 30 seconds for fresh data
export const revalidate = 30
