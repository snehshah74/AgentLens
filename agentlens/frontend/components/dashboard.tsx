'use client'

import { useEffect, useState, useRef } from 'react'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { supabase } from '@/lib/supabase'
import { LineChart, Line, AreaChart, Area, ResponsiveContainer, Tooltip } from 'recharts'
import { Activity, Zap, DollarSign, TrendingUp, TrendingDown, Radio } from 'lucide-react'
import { toast } from 'sonner'
import type { DashboardStats, TraceWithAgent } from '@/types'

// Animated counter hook
function useCountUp(end: number, duration: number = 1000) {
  const [count, setCount] = useState(0)
  const countRef = useRef(0)

  useEffect(() => {
    const startTime = Date.now()

    const timer = setInterval(() => {
      const now = Date.now()
      const progress = Math.min((now - startTime) / duration, 1)
      
      // Easing function (ease-out)
      const easeOut = 1 - Math.pow(1 - progress, 3)
      const currentCount = Math.floor(easeOut * end)
      
      countRef.current = currentCount
      setCount(currentCount)

      if (progress === 1) {
        clearInterval(timer)
      }
    }, 16) // ~60fps

    return () => clearInterval(timer)
  }, [end, duration])

  return count
}

// Enhanced Sparkline component
function Sparkline({ data, color = '#8b5cf6' }: { data: number[]; color?: string }) {
  const chartData = data.map((value, i) => ({ value, index: i }))
  
  return (
    <ResponsiveContainer width="100%" height={60}>
      <LineChart data={chartData} margin={{ top: 5, right: 5, bottom: 5, left: 5 }}>
        <Line
          type="monotone"
          dataKey="value"
          stroke={color}
          strokeWidth={3}
          dot={false}
          animationDuration={1500}
          animationEasing="ease-in-out"
        />
      </LineChart>
    </ResponsiveContainer>
  )
}

// Beautiful Stat Card Component - ALL INLINE
function StatCard({
  icon: Icon,
  label,
  value,
  change,
  trend,
  sparklineData,
  color,
  delay,
  isUpdating,
}: {
  icon: any
  label: string
  value: string | number
  change: string
  trend: 'up' | 'down'
  sparklineData: number[]
  color: string
  delay: number
  isUpdating?: boolean
}) {
  const numericValue = typeof value === 'string' ? parseInt(value.replace(/,/g, '')) || 0 : value
  const animatedValue = useCountUp(numericValue, 2000)
  const displayValue = typeof value === 'string' && value.includes('$') 
    ? `$${animatedValue.toFixed(4)}`
    : typeof value === 'string' && value.includes('ms')
    ? `${animatedValue}ms`
    : animatedValue.toLocaleString()

  return (
    <Card
      className={`group relative overflow-hidden p-4 sm:p-6 glass-hover cursor-pointer transition-all duration-500 animate-fade-in hover:scale-[1.02] hover:shadow-2xl ${
        isUpdating ? 'animate-pulse-glow' : ''
      }`}
      style={{ animationDelay: `${delay}ms` }}
    >
      {/* Gradient border on hover */}
      <div 
        className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500"
        style={{
          background: `linear-gradient(135deg, ${color}20, transparent)`,
          padding: '1px',
          borderRadius: 'inherit',
        }}
      />

      {/* Glow effect */}
      <div 
        className="absolute -inset-1 opacity-0 group-hover:opacity-20 blur-xl transition-opacity duration-500"
        style={{ background: color }}
      />

      {/* Content */}
      <div className="relative z-10 space-y-4">
        {/* Header: Icon + Change Badge */}
        <div className="flex items-center justify-between">
          <div 
            className="p-3 rounded-xl transition-all duration-300 group-hover:scale-110"
            style={{ 
              background: `${color}15`,
              boxShadow: `0 0 20px ${color}20`
            }}
          >
            <Icon 
              className="transition-all duration-300" 
              style={{ color, width: 24, height: 24 }}
              strokeWidth={2.5}
            />
          </div>

          {change && (
            <Badge
              className={`flex items-center gap-1 px-2.5 py-1 border transition-all duration-300 ${
                trend === 'up'
                  ? 'bg-green-500/15 text-green-400 border-green-500/30 group-hover:bg-green-500/25'
                  : 'bg-red-500/15 text-red-400 border-red-500/30 group-hover:bg-red-500/25'
              }`}
            >
              {trend === 'up' ? (
                <TrendingUp className="w-3 h-3" />
              ) : (
                <TrendingDown className="w-3 h-3" />
              )}
              <span className="font-semibold text-xs">{change}</span>
            </Badge>
          )}
        </div>

        {/* Value */}
        <div>
          <div 
            className="text-4xl font-bold mb-1 transition-all duration-300 group-hover:scale-105"
            style={{ color: '#fff' }}
          >
            {displayValue}
          </div>
          <div className="text-sm text-white/60 font-medium">
            {label}
          </div>
        </div>

        {/* Sparkline */}
        <div className="relative -mx-2 opacity-80 group-hover:opacity-100 transition-opacity duration-300">
          <Sparkline data={sparklineData} color={color} />
        </div>
      </div>

      {/* Animated background gradient */}
      <div 
        className="absolute top-0 right-0 w-32 h-32 opacity-5 group-hover:opacity-10 transition-opacity duration-500 blur-3xl"
        style={{ background: color }}
      />
    </Card>
  )
}

// Skeleton loader
function CardSkeleton() {
  return (
    <Card className="glass p-6 animate-pulse">
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="h-12 w-12 bg-white/10 rounded-xl" />
          <div className="h-6 bg-white/10 rounded w-16" />
        </div>
        <div>
          <div className="h-10 bg-white/10 rounded w-32 mb-2" />
          <div className="h-4 bg-white/10 rounded w-24" />
        </div>
        <div className="h-14 bg-white/10 rounded" />
      </div>
    </Card>
  )
}

// Main dashboard component
export function DashboardComponent({ initialStats }: { initialStats: DashboardStats }) {
  const [stats, setStats] = useState(initialStats)
  const [traces, setTraces] = useState<TraceWithAgent[]>([])
  const [chartData, setChartData] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [isLive, setIsLive] = useState(false)
  const [updatingCards, setUpdatingCards] = useState<Set<string>>(new Set())

  // Fetch traces and setup real-time updates
  useEffect(() => {
    let tracesChannel: any
    let agentsChannel: any

    const loadData = async () => {
      try {
        // Fetch recent traces
        const { data: recentTraces } = await supabase
          .from('traces')
          .select('*, agents(name, type)')
          .order('created_at', { ascending: false })
          .limit(10)
        
        if (recentTraces) {
          setTraces(recentTraces as TraceWithAgent[])
        }

        // Generate chart data (last 24 hours)
        const hours = Array.from({ length: 24 }, (_, i) => {
          const hour = new Date()
          hour.setHours(hour.getHours() - (23 - i))
          return {
            time: hour.toLocaleTimeString('en-US', { hour: 'numeric' }),
            traces: Math.floor(Math.random() * 50) + 10,
            cost: Math.random() * 0.5,
          }
        })
        setChartData(hours)

        setLoading(false)

        // Setup real-time subscriptions
        // 1. Subscribe to new traces
        tracesChannel = supabase
          .channel('public:traces')
          .on('postgres_changes', {
            event: 'INSERT',
            schema: 'public',
            table: 'traces'
          }, (payload) => {
            const newTrace = payload.new as any
            
            // Add to traces list
            setTraces((prev) => [newTrace, ...prev.slice(0, 9)])
            
            // Update stats
            setStats((prev) => ({
              ...prev,
              totalTraces: prev.totalTraces + 1,
              totalCost: prev.totalCost + (newTrace.cost || 0),
            }))

            // Pulse animation on Total Traces card
            setUpdatingCards(prev => new Set(prev).add('traces'))
            setTimeout(() => {
              setUpdatingCards(prev => {
                const next = new Set(prev)
                next.delete('traces')
                return next
              })
            }, 2000)

            // Update chart (add to current hour)
            setChartData(prev => {
              const updated = [...prev]
              updated[updated.length - 1].traces += 1
              updated[updated.length - 1].cost += newTrace.cost || 0
              return updated
            })

            // Show toast notification
            toast.success('New trace received!', {
              description: `${newTrace.agents?.name || 'Agent'} - ${newTrace.duration}ms`,
              duration: 3000,
            })
          })
          .subscribe((status) => {
            if (status === 'SUBSCRIBED') {
              setIsLive(true)
              console.log('✅ Real-time subscriptions active')
            }
          })

        // 2. Subscribe to agent updates
        agentsChannel = supabase
          .channel('public:agents')
          .on('postgres_changes', {
            event: '*',
            schema: 'public',
            table: 'agents'
          }, (payload) => {
            if (payload.eventType === 'INSERT') {
              setStats((prev) => ({
                ...prev,
                activeAgents: prev.activeAgents + 1,
              }))

              // Pulse animation on Active Agents card
              setUpdatingCards(prev => new Set(prev).add('agents'))
              setTimeout(() => {
                setUpdatingCards(prev => {
                  const next = new Set(prev)
                  next.delete('agents')
                  return next
                })
              }, 2000)

              toast.info('New agent created!', {
                description: `${(payload.new as any).name}`,
                duration: 3000,
              })
            } else if (payload.eventType === 'UPDATE') {
              toast.info('Agent updated', {
                description: `${(payload.new as any).name} status changed`,
                duration: 2000,
              })
            }
          })
          .subscribe()

      } catch (error) {
        console.error('Error loading dashboard data:', error)
        setLoading(false)
      }
    }

    loadData()

    return () => {
      // Cleanup subscriptions
      if (tracesChannel) {
        supabase.removeChannel(tracesChannel)
      }
      if (agentsChannel) {
        supabase.removeChannel(agentsChannel)
      }
      setIsLive(false)
      console.log('🔴 Real-time subscriptions cleaned up')
    }
  }, [])

  // Stat cards configuration
  const statCards = [
    {
      id: 'agents',
      icon: Activity,
      label: 'Active Agents',
      value: stats.activeAgents,
      change: '+2',
      trend: 'up' as const,
      sparkline: [20, 35, 28, 42, 38, 45, 52],
      color: '#8b5cf6', // Purple
    },
    {
      id: 'traces',
      icon: Activity,
      label: 'Total Traces',
      value: stats.totalTraces,
      change: `+${stats.trends.traces}%`,
      trend: stats.trends.traces > 0 ? 'up' as const : 'down' as const,
      sparkline: [100, 120, 115, 140, 138, 150, 165],
      color: '#3b82f6', // Blue
    },
    {
      icon: Zap,
      label: 'Avg Latency',
      value: `${Math.round(stats.avgDuration)}ms`,
      change: `${Math.abs(stats.trends.duration)}%`,
      trend: stats.trends.duration < 0 ? 'up' as const : 'down' as const,
      sparkline: [350, 320, 300, 280, 290, 275, 260],
      color: '#06b6d4', // Cyan
    },
    {
      icon: DollarSign,
      label: 'Total Cost',
      value: `$${stats.totalCost.toFixed(4)}`,
      change: `${Math.abs(stats.trends.cost)}%`,
      trend: stats.trends.cost < 0 ? 'up' as const : 'down' as const,
      sparkline: [0.05, 0.08, 0.07, 0.12, 0.10, 0.15, 0.18],
      color: '#10b981', // Green
    },
  ]

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'success': return 'bg-green-500/10 text-green-400 border-green-500/20'
      case 'error': return 'bg-red-500/10 text-red-400 border-red-500/20'
      default: return 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20'
    }
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-bold text-white mb-2 animate-fade-in">Dashboard</h1>
          <p className="text-white/60 animate-fade-in" style={{ animationDelay: '100ms' }}>
            Real-time insights into your AI agents
          </p>
        </div>
        <div className="flex items-center gap-2">
          <div className={`flex items-center gap-2 px-4 py-2 glass rounded-lg animate-fade-in transition-all ${
            isLive ? 'border border-green-500/30 bg-green-500/10' : ''
          }`} style={{ animationDelay: '200ms' }}>
            <Radio className={`w-4 h-4 ${isLive ? 'text-green-400 animate-pulse' : 'text-white/40'}`} />
            <span className={`text-sm font-medium ${isLive ? 'text-green-400' : 'text-white/60'}`}>
              {isLive ? 'Live' : 'Connecting...'}
            </span>
          </div>
        </div>
      </div>

      {/* Stat Cards */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[1, 2, 3, 4].map((i) => <CardSkeleton key={i} />)}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {statCards.map((card, i) => (
            <StatCard
              key={card.id || i}
              icon={card.icon}
              label={card.label}
              value={card.value}
              change={card.change}
              trend={card.trend}
              sparklineData={card.sparkline}
              color={card.color}
              delay={i * 100}
              isUpdating={card.id ? updatingCards.has(card.id) : false}
            />
          ))}
        </div>
      )}

      {/* Chart Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Activity Chart */}
        <Card className="glass p-6 lg:col-span-2 animate-fade-in hover:border-white/20 transition-all" style={{ animationDelay: '400ms' }}>
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold text-white">Activity</h2>
            <div className="flex items-center gap-2">
              <button className="px-3 py-1.5 bg-purple-500/20 text-purple-300 rounded-lg text-sm font-medium hover:bg-purple-500/30 transition-colors">
                24h
              </button>
              <button className="px-3 py-1.5 hover:bg-white/10 rounded-lg text-sm text-white/60 font-medium transition-colors">
                7d
              </button>
              <button className="px-3 py-1.5 hover:bg-white/10 rounded-lg text-sm text-white/60 font-medium transition-colors">
                30d
              </button>
            </div>
          </div>

          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData}>
                <defs>
                  <linearGradient id="colorTraces" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.4}/>
                    <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'rgba(10, 10, 10, 0.95)',
                    border: '1px solid rgba(139, 92, 246, 0.3)',
                    borderRadius: '12px',
                    color: '#fff',
                    backdropFilter: 'blur(10px)',
                  }}
                  labelStyle={{ color: '#fff', fontWeight: 600 }}
                />
                <Area
                  type="monotone"
                  dataKey="traces"
                  stroke="#8b5cf6"
                  strokeWidth={3}
                  fill="url(#colorTraces)"
                  animationDuration={1500}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </Card>

        {/* Quick Stats */}
        <Card className="glass p-6 space-y-4 animate-fade-in hover:border-white/20 transition-all" style={{ animationDelay: '500ms' }}>
          <h2 className="text-xl font-semibold text-white mb-4">Quick Stats</h2>
          
          <div className="space-y-4">
            <div className="p-4 bg-white/5 rounded-xl hover:bg-white/10 transition-colors">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-white/60">Success Rate</span>
                <span className="text-sm font-semibold text-green-400">98.5%</span>
              </div>
              <div className="w-full bg-white/10 rounded-full h-2 overflow-hidden">
                <div 
                  className="bg-gradient-to-r from-green-500 to-emerald-400 h-2 rounded-full transition-all duration-1000"
                  style={{ width: '98.5%' }}
                />
              </div>
            </div>

            <div className="p-4 bg-white/5 rounded-xl hover:bg-white/10 transition-colors">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-white/60">Error Rate</span>
                <span className="text-sm font-semibold text-red-400">1.5%</span>
              </div>
              <div className="w-full bg-white/10 rounded-full h-2 overflow-hidden">
                <div 
                  className="bg-gradient-to-r from-red-500 to-rose-400 h-2 rounded-full transition-all duration-1000"
                  style={{ width: '1.5%' }}
                />
              </div>
            </div>

            <div className="p-4 bg-white/5 rounded-xl hover:bg-white/10 transition-colors">
              <div className="text-sm text-white/60 mb-1">Avg Response Time</div>
              <div className="text-2xl font-bold text-white">{Math.round(stats.avgDuration)}ms</div>
              <div className="flex items-center gap-1 text-xs text-green-400 mt-1">
                <TrendingDown className="w-3 h-3" />
                <span>12% from yesterday</span>
              </div>
            </div>

            <div className="p-4 bg-white/5 rounded-xl hover:bg-white/10 transition-colors">
              <div className="text-sm text-white/60 mb-1">Total Requests</div>
              <div className="text-2xl font-bold text-white">{stats.totalTraces.toLocaleString()}</div>
              <div className="flex items-center gap-1 text-xs text-green-400 mt-1">
                <TrendingUp className="w-3 h-3" />
                <span>24% from yesterday</span>
              </div>
            </div>
          </div>
        </Card>
      </div>

      {/* Recent Traces Table */}
      <Card className="glass p-6 animate-fade-in hover:border-white/20 transition-all" style={{ animationDelay: '600ms' }}>
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold text-white">Recent Traces</h2>
          <button className="text-sm text-purple-400 hover:text-purple-300 transition-colors font-medium flex items-center gap-1">
            View all
            <TrendingUp className="w-4 h-4 rotate-90" />
          </button>
        </div>

        {loading ? (
          <div className="space-y-3">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="h-16 bg-white/5 rounded-lg animate-pulse" />
            ))}
          </div>
        ) : traces.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-6xl mb-4">📊</div>
            <h3 className="text-xl font-semibold text-white mb-2">No traces yet</h3>
            <p className="text-white/60 mb-6">Start sending traces from your AI agents to see them here</p>
            <button className="px-6 py-3 bg-gradient-to-r from-purple-500 to-blue-500 text-white rounded-lg hover:from-purple-600 hover:to-blue-600 transition-all glow-sm font-medium">
              View Documentation
            </button>
          </div>
        ) : (
          <div className="space-y-2">
            {traces.map((trace, i) => (
              <div
                key={trace.id}
                className="group flex items-center justify-between p-4 bg-white/5 rounded-xl hover:bg-white/10 transition-all cursor-pointer animate-fade-in"
                style={{ animationDelay: `${i * 50}ms` }}
              >
                <div className="flex items-center gap-4 flex-1">
                  <div className={`w-2 h-2 rounded-full ${
                    trace.status === 'success' ? 'bg-green-500 animate-pulse' :
                    trace.status === 'error' ? 'bg-red-500' : 'bg-yellow-500'
                  }`} />

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-white font-medium truncate">
                        {trace.agents?.name || 'Unknown Agent'}
                      </span>
                      <Badge variant="outline" className="text-xs border-white/20 text-white/60">
                        {trace.agents?.type || 'agent'}
                      </Badge>
                    </div>
                    <div className="text-sm text-white/60">
                      {new Date(trace.created_at).toLocaleString()}
                    </div>
                  </div>

                  <div className="hidden md:flex items-center gap-6">
                    <div className="text-right">
                      <div className="text-sm text-white/60">Duration</div>
                      <div className="text-white font-medium">{trace.duration}ms</div>
                    </div>
                    <div className="text-right">
                      <div className="text-sm text-white/60">Tokens</div>
                      <div className="text-white font-medium">{trace.tokens_used || 0}</div>
                    </div>
                    <div className="text-right">
                      <div className="text-sm text-white/60">Cost</div>
                      <div className="text-white font-medium">${Number(trace.cost || 0).toFixed(4)}</div>
                    </div>
                  </div>

                  <Badge className={`${getStatusColor(trace.status)} border`}>
                    {trace.status}
                  </Badge>

                  <button className="opacity-0 group-hover:opacity-100 transition-opacity ml-4">
                    <TrendingUp className="w-5 h-5 text-white/60 hover:text-white transition-colors rotate-90" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>
    </div>
  )
}
