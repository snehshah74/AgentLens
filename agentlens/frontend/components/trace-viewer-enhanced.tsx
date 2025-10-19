'use client'

import { useState, useEffect } from 'react'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { ChevronDown, ChevronRight, Copy, Check, Zap, Wrench, Database, AlertTriangle, TrendingUp, Clock, DollarSign, Sparkles, Send, Loader2, ChevronUp, MessageSquare, Target, Lightbulb } from 'lucide-react'
import type { TraceWithAgent } from '@/types'

// Import everything from the original trace-viewer
import { WaterfallTimeline, TraceListItem, CodeBlock, Span, SPAN_COLORS, generateSpans } from './trace-viewer'

// AI Insights Enhanced Panel (with all new features inline)
function AIInsightsEnhancedPanel({ trace, spans, traceId }: { trace: TraceWithAgent; spans: Span[]; traceId: string }) {
  const [isExpanded, setIsExpanded] = useState(true)
  const [activeTab, setActiveTab] = useState<'summary' | 'anomalies' | 'optimizations' | 'chat'>('summary')
  
  // AI state
  const [summary, setSummary] = useState<string>('')
  const [anomalies, setAnomalies] = useState<any[]>([])
  const [optimizations, setOptimizations] = useState<any[]>([])
  const [qualityScore, setQualityScore] = useState<number | null>(null)
  const [chatMessages, setChatMessages] = useState<Array<{ role: 'user' | 'assistant'; content: string }>>([])
  const [chatInput, setChatInput] = useState('')
  
  // Loading states
  const [loadingSummary, setLoadingSummary] = useState(false)
  const [loadingAnomalies, setLoadingAnomalies] = useState(false)
  const [loadingOptimizations, setLoadingOptimizations] = useState(false)
  const [loadingChat, setLoadingChat] = useState(false)
  
  // Typing animation
  const [displayedSummary, setDisplayedSummary] = useState('')
  const [typingIndex, setTypingIndex] = useState(0)

  // Fetch AI insights on load
  useEffect(() => {
    if (trace && spans.length > 0) {
      fetchAllInsights()
    }
  }, [traceId])

  // Typing animation effect
  useEffect(() => {
    if (summary && typingIndex < summary.length) {
      const timer = setTimeout(() => {
        setDisplayedSummary(summary.slice(0, typingIndex + 1))
        setTypingIndex(typingIndex + 1)
      }, 20) // 20ms per character
      return () => clearTimeout(timer)
    }
  }, [summary, typingIndex])

  const fetchAllInsights = async () => {
    // Fetch summary
    setLoadingSummary(true)
    try {
      const res = await fetch('/api/ai', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'summary', traceId, spans }),
      })
      const data = await res.json()
      setSummary(data.summary || 'Unable to generate summary')
      setTypingIndex(0)
      setDisplayedSummary('')
    } catch (err) {
      setSummary('Error generating summary')
    } finally {
      setLoadingSummary(false)
    }

    // Fetch anomalies
    setLoadingAnomalies(true)
    try {
      const res = await fetch('/api/ai', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'anomalies', traceId, spans }),
      })
      const data = await res.json()
      setAnomalies(data.anomalies || [])
    } catch (err) {
      setAnomalies([])
    } finally {
      setLoadingAnomalies(false)
    }

    // Fetch optimizations
    setLoadingOptimizations(true)
    try {
      const res = await fetch('/api/ai', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'optimizations', traceId, spans }),
      })
      const data = await res.json()
      setOptimizations(data.optimizations || [])
    } catch (err) {
      setOptimizations([])
    } finally {
      setLoadingOptimizations(false)
    }

    // Fetch quality score
    try {
      const res = await fetch('/api/ai', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'quality', traceId, spans }),
      })
      const data = await res.json()
      setQualityScore(data.qualityScore)
    } catch (err) {
      setQualityScore(null)
    }
  }

  const handleChatSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!chatInput.trim()) return

    const userMessage = chatInput
    setChatInput('')
    setChatMessages(prev => [...prev, { role: 'user', content: userMessage }])

    setLoadingChat(true)
    try {
      const res = await fetch('/api/ai', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'chat', traceId, spans, question: userMessage }),
      })
      const data = await res.json()
      setChatMessages(prev => [...prev, { role: 'assistant', content: data.answer }])
    } catch (err) {
      setChatMessages(prev => [...prev, { role: 'assistant', content: 'Error: Unable to process your question.' }])
    } finally {
      setLoadingChat(false)
    }
  }

  const getSeverityBadge = (severity: 'low' | 'medium' | 'high') => {
    switch (severity) {
      case 'high': return { icon: '⚠️', color: 'red' }
      case 'medium': return { icon: '⚠️', color: 'yellow' }
      case 'low': return { icon: '💡', color: 'blue' }
    }
  }

  const getImpactBadge = (impact: 'high' | 'medium' | 'low') => {
    switch (impact) {
      case 'high': return { icon: '🚀', color: 'green' }
      case 'medium': return { icon: '💡', color: 'blue' }
      case 'low': return { icon: 'ℹ️', color: 'gray' }
    }
  }

  const getQualityColor = (score: number) => {
    if (score >= 80) return { color: 'green', label: 'Excellent' }
    if (score >= 60) return { color: 'blue', label: 'Good' }
    if (score >= 40) return { color: 'yellow', label: 'Fair' }
    return { color: 'red', label: 'Poor' }
  }

  return (
    <Card className="glass overflow-hidden animate-fade-in">
      {/* Header with toggle */}
      <div
        className="p-4 cursor-pointer hover:bg-white/5 transition-colors flex items-center justify-between"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-gradient-to-br from-purple-500/20 to-blue-500/20 glow-sm">
            <Sparkles className="w-5 h-5 text-purple-400" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-white flex items-center gap-2">
              AI-Powered Insights
              {qualityScore !== null && (
                <Badge variant="outline" className={`border-${getQualityColor(qualityScore).color}-500/30 bg-${getQualityColor(qualityScore).color}-500/10 text-${getQualityColor(qualityScore).color}-400`}>
                  {qualityScore}/100 - {getQualityColor(qualityScore).label}
                </Badge>
              )}
            </h3>
            <p className="text-xs text-white/60">Powered by Groq AI</p>
          </div>
        </div>
        <Button variant="ghost" size="sm">
          {isExpanded ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
        </Button>
      </div>

      {/* Content */}
      {isExpanded && (
        <div className="border-t border-white/10">
          {/* Tabs */}
          <div className="flex gap-2 p-4 bg-white/5">
            <Button
              variant={activeTab === 'summary' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setActiveTab('summary')}
              className="flex-1"
            >
              <Target className="w-4 h-4 mr-2" />
              Summary
            </Button>
            <Button
              variant={activeTab === 'anomalies' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setActiveTab('anomalies')}
              className="flex-1"
            >
              <AlertTriangle className="w-4 h-4 mr-2" />
              Anomalies
              {anomalies.length > 0 && (
                <Badge className="ml-2 bg-red-500/20 text-red-400">{anomalies.length}</Badge>
              )}
            </Button>
            <Button
              variant={activeTab === 'optimizations' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setActiveTab('optimizations')}
              className="flex-1"
            >
              <Lightbulb className="w-4 h-4 mr-2" />
              Optimize
              {optimizations.length > 0 && (
                <Badge className="ml-2 bg-green-500/20 text-green-400">{optimizations.length}</Badge>
              )}
            </Button>
            <Button
              variant={activeTab === 'chat' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setActiveTab('chat')}
              className="flex-1"
            >
              <MessageSquare className="w-4 h-4 mr-2" />
              Ask AI
            </Button>
          </div>

          {/* Tab content */}
          <div className="p-6 space-y-4">
            {/* Summary Tab */}
            {activeTab === 'summary' && (
              <div className="space-y-4 animate-fade-in">
                <div className="p-4 bg-gradient-to-br from-purple-500/10 to-blue-500/10 rounded-lg border border-purple-500/30">
                  <div className="flex items-center gap-2 mb-3">
                    <Sparkles className="w-4 h-4 text-purple-400" />
                    <span className="text-sm font-medium text-purple-400">AI-Generated Summary</span>
                  </div>
                  {loadingSummary ? (
                    <div className="flex items-center gap-2 text-white/60">
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Analyzing trace...</span>
                    </div>
                  ) : (
                    <p className="text-white/90 leading-relaxed">
                      {displayedSummary}
                      {typingIndex < summary.length && <span className="animate-pulse">|</span>}
                    </p>
                  )}
                </div>

                {qualityScore !== null && (
                  <div className="p-4 bg-white/5 rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm text-white/60">Quality Score</span>
                      <span className={`text-2xl font-bold text-${getQualityColor(qualityScore).color}-400`}>
                        {qualityScore}/100
                      </span>
                    </div>
                    <div className="w-full bg-white/10 rounded-full h-2 overflow-hidden">
                      <div
                        className={`bg-gradient-to-r from-${getQualityColor(qualityScore).color}-500 to-${getQualityColor(qualityScore).color}-400 h-2 rounded-full transition-all duration-1000`}
                        style={{ width: `${qualityScore}%` }}
                      />
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Anomalies Tab */}
            {activeTab === 'anomalies' && (
              <div className="space-y-3 animate-fade-in">
                {loadingAnomalies ? (
                  <div className="flex items-center justify-center py-8">
                    <Loader2 className="w-6 h-6 animate-spin text-purple-400" />
                  </div>
                ) : anomalies.length === 0 ? (
                  <div className="text-center py-8 text-white/60">
                    <div className="text-4xl mb-2">✅</div>
                    <p>No anomalies detected</p>
                    <p className="text-sm mt-1">This trace looks healthy!</p>
                  </div>
                ) : (
                  anomalies.map((anomaly, i) => {
                    const badge = getSeverityBadge(anomaly.severity)
                    return (
                      <div
                        key={i}
                        className={`p-4 rounded-lg border bg-${badge.color}-500/10 border-${badge.color}-500/30 animate-fade-in`}
                        style={{ animationDelay: `${i * 100}ms` }}
                      >
                        <div className="flex items-start gap-3">
                          <span className="text-2xl">{badge.icon}</span>
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <span className={`text-sm font-medium text-${badge.color}-400`}>
                                {anomaly.type.replace('_', ' ').toUpperCase()}
                              </span>
                              <Badge className={`bg-${badge.color}-500/20 text-${badge.color}-400 text-xs`}>
                                {anomaly.severity}
                              </Badge>
                            </div>
                            <p className="text-sm text-white/80">{anomaly.message}</p>
                          </div>
                        </div>
                      </div>
                    )
                  })
                )}
              </div>
            )}

            {/* Optimizations Tab */}
            {activeTab === 'optimizations' && (
              <div className="space-y-3 animate-fade-in">
                {loadingOptimizations ? (
                  <div className="flex items-center justify-center py-8">
                    <Loader2 className="w-6 h-6 animate-spin text-purple-400" />
                  </div>
                ) : optimizations.length === 0 ? (
                  <div className="text-center py-8 text-white/60">
                    <div className="text-4xl mb-2">🎯</div>
                    <p>Fully optimized!</p>
                    <p className="text-sm mt-1">No improvements needed</p>
                  </div>
                ) : (
                  optimizations.map((opt, i) => {
                    const badge = getImpactBadge(opt.impact)
                    return (
                      <div
                        key={i}
                        className="p-4 rounded-lg border bg-blue-500/10 border-blue-500/30 hover:bg-blue-500/15 transition-colors animate-fade-in"
                        style={{ animationDelay: `${i * 100}ms` }}
                      >
                        <div className="flex items-start gap-3">
                          <span className="text-2xl">{badge.icon}</span>
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <span className="text-sm font-medium text-blue-400">{opt.title}</span>
                              <Badge className="bg-blue-500/20 text-blue-400 text-xs">{opt.impact} impact</Badge>
                            </div>
                            <p className="text-sm text-white/80">{opt.description}</p>
                          </div>
                        </div>
                      </div>
                    )
                  })
                )}
              </div>
            )}

            {/* Chat Tab */}
            {activeTab === 'chat' && (
              <div className="space-y-4 animate-fade-in">
                <div className="h-64 overflow-y-auto space-y-3 p-4 bg-black/20 rounded-lg">
                  {chatMessages.length === 0 ? (
                    <div className="text-center py-8 text-white/60">
                      <MessageSquare className="w-12 h-12 mx-auto mb-2 text-purple-400" />
                      <p>Ask me anything about this trace!</p>
                      <p className="text-xs mt-1">Try: "What caused the latency?" or "How can I reduce cost?"</p>
                    </div>
                  ) : (
                    chatMessages.map((msg, i) => (
                      <div
                        key={i}
                        className={`flex gap-2 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                      >
                        <div
                          className={`max-w-[80%] p-3 rounded-lg ${
                            msg.role === 'user'
                              ? 'bg-purple-500/20 text-white'
                              : 'bg-white/10 text-white/90'
                          }`}
                        >
                          <p className="text-sm">{msg.content}</p>
                        </div>
                      </div>
                    ))
                  )}
                  {loadingChat && (
                    <div className="flex gap-2 items-center text-white/60">
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span className="text-sm">AI is thinking...</span>
                    </div>
                  )}
                </div>

                <form onSubmit={handleChatSubmit} className="flex gap-2">
                  <Input
                    value={chatInput}
                    onChange={(e) => setChatInput(e.target.value)}
                    placeholder="Ask a question about this trace..."
                    className="flex-1 bg-white/5 border-white/10 text-white"
                    disabled={loadingChat}
                  />
                  <Button type="submit" disabled={loadingChat || !chatInput.trim()}>
                    <Send className="w-4 h-4" />
                  </Button>
                </form>
              </div>
            )}
          </div>
        </div>
      )}
    </Card>
  )
}

// Export enhanced component
export { AIInsightsEnhancedPanel }

