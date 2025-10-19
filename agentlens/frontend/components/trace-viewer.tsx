'use client'

import { useState } from 'react'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { ChevronDown, ChevronRight, Copy, Check, Zap, Wrench, Database, AlertTriangle, TrendingUp, Clock, DollarSign, Sparkles } from 'lucide-react'
import type { TraceWithAgent } from '@/types'
import { AIInsightsEnhancedPanel } from './trace-viewer-enhanced'

// Span types for the waterfall
export interface Span {
  id: string
  name: string
  type: 'llm' | 'tool' | 'memory' | 'agent'
  startTime: number
  endTime: number
  duration: number
  input?: any
  output?: any
  metadata?: {
    tokens?: number
    cost?: number
    model?: string
    error?: string
  }
  children?: Span[]
}

// Color themes for span types
export const SPAN_COLORS = {
  llm: { bg: '#8b5cf6', text: 'purple', label: 'LLM Call' },
  tool: { bg: '#3b82f6', text: 'blue', label: 'Tool' },
  memory: { bg: '#10b981', text: 'green', label: 'Memory' },
  agent: { bg: '#f59e0b', text: 'amber', label: 'Agent' },
}

// Syntax highlighter (inline, minimal)
export function CodeBlock({ code, language = 'json' }: { code: string; language?: string }) {
  const [copied, setCopied] = useState(false)

  const handleCopy = () => {
    navigator.clipboard.writeText(code)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="relative group">
      <Button
        variant="ghost"
        size="sm"
        className="absolute right-2 top-2 opacity-0 group-hover:opacity-100 transition-opacity z-10"
        onClick={handleCopy}
      >
        {copied ? <Check className="w-4 h-4 text-green-400" /> : <Copy className="w-4 h-4" />}
      </Button>
      <pre className="bg-black/40 rounded-lg p-4 overflow-x-auto text-sm text-gray-300 border border-white/10">
        <code>{code}</code>
      </pre>
    </div>
  )
}

// Waterfall timeline component
export function WaterfallTimeline({ spans, totalDuration }: { spans: Span[]; totalDuration: number }) {
  const [expandedSpans, setExpandedSpans] = useState<Set<string>>(new Set())
  const [hoveredSpan, setHoveredSpan] = useState<string | null>(null)

  const toggleSpan = (spanId: string) => {
    setExpandedSpans(prev => {
      const next = new Set(prev)
      if (next.has(spanId)) {
        next.delete(spanId)
      } else {
        next.add(spanId)
      }
      return next
    })
  }

  const renderSpan = (span: Span, depth: number = 0) => {
    const startPercent = (span.startTime / totalDuration) * 100
    const widthPercent = (span.duration / totalDuration) * 100
    const isExpanded = expandedSpans.has(span.id)
    const isHovered = hoveredSpan === span.id
    const hasChildren = span.children && span.children.length > 0
    const color = SPAN_COLORS[span.type]

    return (
      <div key={span.id} className="animate-fade-in">
        {/* Span bar */}
        <div
          className="relative mb-1"
          style={{ paddingLeft: `${depth * 24}px` }}
          onMouseEnter={() => setHoveredSpan(span.id)}
          onMouseLeave={() => setHoveredSpan(null)}
        >
          <div className="flex items-center gap-2 py-1">
            {/* Expand button */}
            <button
              onClick={() => toggleSpan(span.id)}
              className="flex-shrink-0 w-6 h-6 flex items-center justify-center hover:bg-white/10 rounded transition-colors"
            >
              {hasChildren ? (
                isExpanded ? (
                  <ChevronDown className="w-4 h-4 text-white/60" />
                ) : (
                  <ChevronRight className="w-4 h-4 text-white/60" />
                )
              ) : (
                <div className="w-1 h-1 rounded-full bg-white/30" />
              )}
            </button>

            {/* Span info */}
            <div className="flex-1 relative">
              <div className="flex items-center justify-between mb-1">
                <div className="flex items-center gap-2">
                  {span.type === 'llm' && <Zap className="w-4 h-4" style={{ color: color.bg }} />}
                  {span.type === 'tool' && <Wrench className="w-4 h-4" style={{ color: color.bg }} />}
                  {span.type === 'memory' && <Database className="w-4 h-4" style={{ color: color.bg }} />}
                  {span.type === 'agent' && <Sparkles className="w-4 h-4" style={{ color: color.bg }} />}
                  <span className="text-sm text-white font-medium">{span.name}</span>
                  <Badge variant="outline" className={`text-xs border-${color.text}-500/30 bg-${color.text}-500/10 text-${color.text}-400`}>
                    {color.label}
                  </Badge>
                </div>
                <span className="text-xs text-white/60">{span.duration.toFixed(2)}ms</span>
              </div>

              {/* Timeline bar */}
              <div className="h-8 bg-white/5 rounded relative overflow-hidden">
                <div
                  className="absolute h-full rounded transition-all duration-300 cursor-pointer group/bar"
                  style={{
                    left: `${startPercent}%`,
                    width: `${widthPercent}%`,
                    background: `linear-gradient(90deg, ${color.bg}, ${color.bg}cc)`,
                    boxShadow: isHovered ? `0 0 20px ${color.bg}80` : 'none',
                    transform: isHovered ? 'scaleY(1.1)' : 'scaleY(1)',
                  }}
                >
                  {/* Hover tooltip */}
                  {isHovered && (
                    <div className="absolute -top-20 left-1/2 -translate-x-1/2 glass p-3 rounded-lg shadow-2xl z-50 min-w-[200px] animate-fade-in">
                      <div className="text-xs space-y-1">
                        <div className="flex justify-between">
                          <span className="text-white/60">Start:</span>
                          <span className="text-white font-medium">{span.startTime.toFixed(2)}ms</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-white/60">Duration:</span>
                          <span className="text-white font-medium">{span.duration.toFixed(2)}ms</span>
                        </div>
                        {span.metadata?.tokens && (
                          <div className="flex justify-between">
                            <span className="text-white/60">Tokens:</span>
                            <span className="text-white font-medium">{span.metadata.tokens}</span>
                          </div>
                        )}
                        {span.metadata?.cost && (
                          <div className="flex justify-between">
                            <span className="text-white/60">Cost:</span>
                            <span className="text-white font-medium">${span.metadata.cost.toFixed(4)}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Expanded details */}
          {isExpanded && (
            <div className="ml-6 mt-2 space-y-3 pl-4 border-l-2 border-white/10 animate-fade-in">
              {/* Input/Output */}
              {span.input && (
                <div>
                  <div className="text-xs text-white/60 mb-1 font-medium">Input:</div>
                  <CodeBlock code={typeof span.input === 'string' ? span.input : JSON.stringify(span.input, null, 2)} />
                </div>
              )}
              {span.output && (
                <div>
                  <div className="text-xs text-white/60 mb-1 font-medium">Output:</div>
                  <CodeBlock code={typeof span.output === 'string' ? span.output : JSON.stringify(span.output, null, 2)} />
                </div>
              )}

              {/* Metadata */}
              {span.metadata && (
                <div className="grid grid-cols-2 gap-2">
                  {span.metadata.model && (
                    <div className="p-2 bg-white/5 rounded">
                      <div className="text-xs text-white/60">Model</div>
                      <div className="text-sm text-white font-medium">{span.metadata.model}</div>
                    </div>
                  )}
                  {span.metadata.tokens && (
                    <div className="p-2 bg-white/5 rounded">
                      <div className="text-xs text-white/60">Tokens</div>
                      <div className="text-sm text-white font-medium">{span.metadata.tokens}</div>
                    </div>
                  )}
                  {span.metadata.cost && (
                    <div className="p-2 bg-white/5 rounded">
                      <div className="text-xs text-white/60">Cost</div>
                      <div className="text-sm text-white font-medium">${span.metadata.cost.toFixed(4)}</div>
                    </div>
                  )}
                  {span.metadata.error && (
                    <div className="p-2 bg-red-500/10 rounded border border-red-500/30 col-span-2">
                      <div className="text-xs text-red-400 flex items-center gap-1">
                        <AlertTriangle className="w-3 h-3" />
                        Error
                      </div>
                      <div className="text-sm text-red-300 font-medium mt-1">{span.metadata.error}</div>
                    </div>
                  )}
                </div>
              )}

              {/* AI Summary */}
              <div className="p-3 bg-purple-500/10 rounded border border-purple-500/30">
                <div className="flex items-center gap-2 mb-2">
                  <Sparkles className="w-4 h-4 text-purple-400" />
                  <span className="text-xs text-purple-400 font-medium">AI Summary</span>
                </div>
                <p className="text-sm text-white/80">
                  This {color.label.toLowerCase()} operation took {span.duration.toFixed(2)}ms
                  {span.metadata?.tokens && ` and consumed ${span.metadata.tokens} tokens`}.
                  {span.metadata?.error ? ' An error occurred during execution.' : ' Completed successfully.'}
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Render children */}
        {hasChildren && isExpanded && span.children!.map(child => renderSpan(child, depth + 1))}
      </div>
    )
  }

  return (
    <div className="space-y-1">
      {spans.map(span => renderSpan(span))}
    </div>
  )
}

// Trace list item
export function TraceListItem({ trace, isSelected, onClick }: { trace: TraceWithAgent; isSelected: boolean; onClick: () => void }) {
  const statusColor = trace.status === 'success' ? 'green' : trace.status === 'error' ? 'red' : 'yellow'

  return (
    <div
      onClick={onClick}
      className={`p-3 rounded-lg cursor-pointer transition-all duration-200 ${
        isSelected
          ? 'bg-purple-500/20 border border-purple-500/50'
          : 'bg-white/5 border border-white/10 hover:bg-white/10 hover:border-white/20'
      }`}
    >
      <div className="flex items-start justify-between mb-2">
        <div className="flex items-center gap-2">
          <div className={`w-2 h-2 rounded-full bg-${statusColor}-500 ${trace.status === 'success' ? 'animate-pulse' : ''}`} />
          <span className="text-sm text-white font-medium truncate">{trace.agents?.name || 'Unknown'}</span>
        </div>
        <Badge variant="outline" className={`text-xs border-${statusColor}-500/30 bg-${statusColor}-500/10 text-${statusColor}-400`}>
          {trace.status}
        </Badge>
      </div>
      <div className="flex items-center gap-3 text-xs text-white/60">
        <div className="flex items-center gap-1">
          <Clock className="w-3 h-3" />
          {trace.duration}ms
        </div>
        {trace.cost && (
          <div className="flex items-center gap-1">
            <DollarSign className="w-3 h-3" />
            ${trace.cost.toFixed(4)}
          </div>
        )}
      </div>
      <div className="text-xs text-white/40 mt-1">
        {new Date(trace.created_at).toLocaleString()}
      </div>
    </div>
  )
}

// AI Insights Panel
function AIInsightsPanel({ trace, spans }: { trace: TraceWithAgent; spans: Span[] }) {
  const totalDuration = trace.duration || 0
  const totalCost = trace.cost || 0
  const totalTokens = trace.tokens_used || 0

  // Calculate insights
  const llmCalls = spans.filter(s => s.type === 'llm').length
  const toolCalls = spans.filter(s => s.type === 'tool').length
  const avgDuration = totalDuration / spans.length
  const hasErrors = trace.status === 'error'

  return (
    <Card className="glass p-6 space-y-4">
      <div className="flex items-center gap-2 mb-4">
        <Sparkles className="w-5 h-5 text-purple-400" />
        <h3 className="text-lg font-semibold text-white">AI Insights</h3>
      </div>

      {/* Anomaly Detection */}
      {hasErrors ? (
        <div className="p-4 bg-red-500/10 rounded-lg border border-red-500/30">
          <div className="flex items-center gap-2 mb-2">
            <AlertTriangle className="w-5 h-5 text-red-400" />
            <span className="font-medium text-red-400">Anomaly Detected</span>
          </div>
          <p className="text-sm text-white/80">
            This trace encountered an error. The execution failed, which may indicate an issue with the agent configuration or external dependencies.
          </p>
        </div>
      ) : totalDuration > 5000 ? (
        <div className="p-4 bg-yellow-500/10 rounded-lg border border-yellow-500/30">
          <div className="flex items-center gap-2 mb-2">
            <AlertTriangle className="w-5 h-5 text-yellow-400" />
            <span className="font-medium text-yellow-400">High Latency Detected</span>
          </div>
          <p className="text-sm text-white/80">
            This trace took {totalDuration.toFixed(2)}ms, which is above the normal threshold. Consider optimizing LLM calls or caching frequently used data.
          </p>
        </div>
      ) : (
        <div className="p-4 bg-green-500/10 rounded-lg border border-green-500/30">
          <div className="flex items-center gap-2 mb-2">
            <TrendingUp className="w-5 h-5 text-green-400" />
            <span className="font-medium text-green-400">Optimal Performance</span>
          </div>
          <p className="text-sm text-white/80">
            This trace executed efficiently with no anomalies detected. Performance is within normal parameters.
          </p>
        </div>
      )}

      {/* Metrics Summary */}
      <div className="grid grid-cols-2 gap-3">
        <div className="p-3 bg-white/5 rounded-lg">
          <div className="text-xs text-white/60 mb-1">LLM Calls</div>
          <div className="text-2xl font-bold text-white">{llmCalls}</div>
        </div>
        <div className="p-3 bg-white/5 rounded-lg">
          <div className="text-xs text-white/60 mb-1">Tool Calls</div>
          <div className="text-2xl font-bold text-white">{toolCalls}</div>
        </div>
        <div className="p-3 bg-white/5 rounded-lg">
          <div className="text-xs text-white/60 mb-1">Total Tokens</div>
          <div className="text-2xl font-bold text-white">{totalTokens.toLocaleString()}</div>
        </div>
        <div className="p-3 bg-white/5 rounded-lg">
          <div className="text-xs text-white/60 mb-1">Total Cost</div>
          <div className="text-2xl font-bold text-white">${totalCost.toFixed(4)}</div>
        </div>
      </div>

      {/* Recommendations */}
      <div className="p-4 bg-blue-500/10 rounded-lg border border-blue-500/30">
        <div className="text-sm font-medium text-blue-400 mb-2">💡 Recommendations</div>
        <ul className="text-sm text-white/80 space-y-1 list-disc list-inside">
          {totalCost > 0.1 && <li>Consider using a smaller model for simple tasks to reduce costs</li>}
          {avgDuration > 1000 && <li>Implement caching for frequently accessed data</li>}
          {llmCalls > 5 && <li>Batch similar LLM calls to reduce latency</li>}
          {llmCalls === 0 && toolCalls === 0 && <li>This trace has no LLM or tool calls - check agent configuration</li>}
        </ul>
      </div>
    </Card>
  )
}

// Generate mock spans from trace data
export const generateSpans = (trace: TraceWithAgent): Span[] => {
    const duration = trace.duration || 1000
    return [
      {
        id: '1',
        name: 'Agent Initialization',
        type: 'agent',
        startTime: 0,
        endTime: duration * 0.1,
        duration: duration * 0.1,
        input: { agent_name: trace.agents?.name, config: {} },
        output: { status: 'initialized' },
        metadata: {},
      },
      {
        id: '2',
        name: 'LLM Call - Main',
        type: 'llm',
        startTime: duration * 0.1,
        endTime: duration * 0.6,
        duration: duration * 0.5,
        input: { prompt: 'Analyze the user request and generate a response...', model: 'llama3-8b-8192' },
        output: { response: 'Based on the analysis, I recommend...' },
        metadata: { tokens: trace.tokens_used || 1200, cost: (trace.cost || 0) * 0.7, model: 'llama3-8b-8192' },
        children: [
          {
            id: '2-1',
            name: 'Memory Retrieval',
            type: 'memory',
            startTime: duration * 0.15,
            endTime: duration * 0.25,
            duration: duration * 0.1,
            input: { query: 'relevant context' },
            output: { results: ['context1', 'context2'] },
            metadata: {},
          },
        ],
      },
      {
        id: '3',
        name: 'Tool Call - Data Fetch',
        type: 'tool',
        startTime: duration * 0.6,
        endTime: duration * 0.85,
        duration: duration * 0.25,
        input: { tool: 'fetch_data', params: { query: 'user_data' } },
        output: { data: { key: 'value' } },
        metadata: {},
      },
      {
        id: '4',
        name: 'LLM Call - Final',
        type: 'llm',
        startTime: duration * 0.85,
        endTime: duration,
        duration: duration * 0.15,
        input: { prompt: 'Format the final response...', model: 'llama3-8b-8192' },
        output: { response: 'Here is your final answer...' },
        metadata: { tokens: (trace.tokens_used || 1200) * 0.3, cost: (trace.cost || 0) * 0.3, model: 'llama3-8b-8192' },
      },
    ]
}

// Main Trace Viewer Component
export function TraceViewerComponent({ traces, selectedTraceId }: { traces: TraceWithAgent[]; selectedTraceId?: string }) {
  const [selectedId, setSelectedId] = useState(selectedTraceId || traces[0]?.id)
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('all')

  const selectedTrace = traces.find(t => t.id === selectedId)

  // Filter traces
  const filteredTraces = traces.filter(trace => {
    const matchesSearch = !searchQuery || 
      trace.agents?.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      trace.id.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesStatus = statusFilter === 'all' || trace.status === statusFilter
    return matchesSearch && matchesStatus
  })

  const spans = selectedTrace ? generateSpans(selectedTrace) : []

  return (
    <div className="flex gap-6 h-[calc(100vh-120px)]">
      {/* Left Sidebar - Trace List */}
      <div className="w-80 flex-shrink-0 space-y-4">
        <Card className="glass p-4">
          <Input
            placeholder="Search traces..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="mb-3 bg-white/5 border-white/10 text-white"
          />
          <div className="flex gap-2">
            <Button
              variant={statusFilter === 'all' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setStatusFilter('all')}
              className="flex-1"
            >
              All
            </Button>
            <Button
              variant={statusFilter === 'success' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setStatusFilter('success')}
              className="flex-1"
            >
              Success
            </Button>
            <Button
              variant={statusFilter === 'error' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setStatusFilter('error')}
              className="flex-1"
            >
              Error
            </Button>
          </div>
        </Card>

        <Card className="glass p-4 overflow-y-auto" style={{ maxHeight: 'calc(100vh - 280px)' }}>
          <div className="space-y-2">
            {filteredTraces.length === 0 ? (
              <div className="text-center py-8 text-white/60">
                <div className="text-4xl mb-2">🔍</div>
                <p>No traces found</p>
              </div>
            ) : (
              filteredTraces.map(trace => (
                <TraceListItem
                  key={trace.id}
                  trace={trace}
                  isSelected={selectedId === trace.id}
                  onClick={() => setSelectedId(trace.id)}
                />
              ))
            )}
          </div>
        </Card>
      </div>

      {/* Right Main Area - Trace Details */}
      <div className="flex-1 space-y-6 overflow-y-auto">
        {selectedTrace ? (
          <>
            {/* Header */}
            <Card className="glass p-6">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h2 className="text-2xl font-bold text-white mb-1">{selectedTrace.agents?.name || 'Unknown Agent'}</h2>
                  <p className="text-white/60">Trace ID: {selectedTrace.id}</p>
                </div>
                <Badge
                  variant="outline"
                  className={`text-sm ${
                    selectedTrace.status === 'success'
                      ? 'border-green-500/30 bg-green-500/10 text-green-400'
                      : 'border-red-500/30 bg-red-500/10 text-red-400'
                  }`}
                >
                  {selectedTrace.status}
                </Badge>
              </div>
              <div className="grid grid-cols-4 gap-4">
                <div className="p-3 bg-white/5 rounded-lg">
                  <div className="text-xs text-white/60 mb-1">Duration</div>
                  <div className="text-xl font-bold text-white">{selectedTrace.duration}ms</div>
                </div>
                <div className="p-3 bg-white/5 rounded-lg">
                  <div className="text-xs text-white/60 mb-1">Tokens</div>
                  <div className="text-xl font-bold text-white">{(selectedTrace.tokens_used || 0).toLocaleString()}</div>
                </div>
                <div className="p-3 bg-white/5 rounded-lg">
                  <div className="text-xs text-white/60 mb-1">Cost</div>
                  <div className="text-xl font-bold text-white">${(selectedTrace.cost || 0).toFixed(4)}</div>
                </div>
                <div className="p-3 bg-white/5 rounded-lg">
                  <div className="text-xs text-white/60 mb-1">Timestamp</div>
                  <div className="text-xs font-medium text-white">{new Date(selectedTrace.created_at).toLocaleTimeString()}</div>
                </div>
              </div>
            </Card>

            {/* Waterfall Timeline */}
            <Card className="glass p-6">
              <h3 className="text-lg font-semibold text-white mb-4">Execution Timeline</h3>
              <WaterfallTimeline spans={spans} totalDuration={selectedTrace.duration || 1000} />
            </Card>

            {/* AI Insights Enhanced */}
            <AIInsightsEnhancedPanel trace={selectedTrace} spans={spans} traceId={selectedTrace.id} />
          </>
        ) : (
          <Card className="glass p-12 text-center">
            <div className="text-6xl mb-4">📊</div>
            <h3 className="text-xl font-semibold text-white mb-2">Select a Trace</h3>
            <p className="text-white/60">Choose a trace from the list to view its details and timeline</p>
          </Card>
        )}
      </div>
    </div>
  )
}

