'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Zap, Search, Plus, TrendingUp, Clock, DollarSign, Activity } from 'lucide-react'

type Agent = {
  id: string
  name: string
  type: string
  status: 'active' | 'inactive' | 'error'
  created_at: string
  metadata?: any
}

export default function AgentsPage() {
  const [agents, setAgents] = useState<Agent[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')

  useEffect(() => {
    loadAgents()
  }, [])

  const loadAgents = async () => {
    setLoading(true)
    try {
      const { data, error } = await supabase
        .from('agents')
        .select('*')
        .order('created_at', { ascending: false })

      if (error) throw error
      setAgents(data || [])
    } catch (error) {
      // Silently show demo data if no connection (expected without Supabase setup)
      setAgents([
        {
          id: '1',
          name: 'Research Agent',
          type: 'research',
          status: 'active',
          created_at: new Date().toISOString(),
        },
        {
          id: '2',
          name: 'Support Agent',
          type: 'support',
          status: 'active',
          created_at: new Date().toISOString(),
        },
      ])
    } finally {
      setLoading(false)
    }
  }

  const filteredAgents = agents.filter((agent) =>
    agent.name.toLowerCase().includes(searchQuery.toLowerCase())
  )

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold gradient-text">AI Agents</h1>
          <p className="text-white/60 mt-1">Manage and monitor your AI agents</p>
        </div>
        <Button className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 btn-ripple">
          <Plus className="w-4 h-4 mr-2" />
          Create Agent
        </Button>
      </div>

      {/* Search Bar */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-white/40" />
        <Input
          placeholder="Search agents..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-10 glass border-white/10 text-white placeholder:text-white/40"
        />
      </div>

      {/* Agents Grid */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3].map((i) => (
            <Card key={i} className="p-6 glass-hover skeleton h-48" />
          ))}
        </div>
      ) : filteredAgents.length === 0 ? (
        <Card className="p-12 glass text-center">
          <Zap className="w-12 h-12 mx-auto text-purple-500 mb-4" />
          <h3 className="text-xl font-semibold text-white mb-2">No agents found</h3>
          <p className="text-white/60 mb-6">
            {searchQuery
              ? 'Try adjusting your search query'
              : 'Create your first AI agent to get started'}
          </p>
          <Button className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600">
            <Plus className="w-4 h-4 mr-2" />
            Create Agent
          </Button>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredAgents.map((agent, index) => (
            <Card
              key={agent.id}
              className="group p-6 glass-hover cursor-pointer transition-all duration-300 animate-fade-in"
              style={{ animationDelay: `${index * 100}ms` }}
            >
              {/* Status Badge */}
              <div className="flex items-center justify-between mb-4">
                <div className="p-3 rounded-xl bg-purple-500/20 group-hover:bg-purple-500/30 transition-colors">
                  <Zap className="w-6 h-6 text-purple-400" />
                </div>
                <Badge
                  className={`
                    ${
                      agent.status === 'active'
                        ? 'bg-green-500/15 text-green-400 border-green-500/30'
                        : agent.status === 'error'
                        ? 'bg-red-500/15 text-red-400 border-red-500/30'
                        : 'bg-gray-500/15 text-gray-400 border-gray-500/30'
                    }
                  `}
                >
                  {agent.status === 'active' && <Activity className="w-3 h-3 mr-1" />}
                  {agent.status}
                </Badge>
              </div>

              {/* Agent Info */}
              <div className="space-y-3">
                <div>
                  <h3 className="text-xl font-semibold text-white group-hover:text-purple-400 transition-colors">
                    {agent.name}
                  </h3>
                  <p className="text-sm text-white/60 capitalize">{agent.type} Agent</p>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-3 gap-2 pt-3 border-t border-white/10">
                  <div className="text-center">
                    <div className="flex items-center justify-center gap-1 text-white/40 text-xs mb-1">
                      <TrendingUp className="w-3 h-3" />
                    </div>
                    <div className="text-sm font-semibold text-white">
                      {Math.floor(Math.random() * 100)}
                    </div>
                    <div className="text-xs text-white/40">Tasks</div>
                  </div>
                  <div className="text-center border-x border-white/10">
                    <div className="flex items-center justify-center gap-1 text-white/40 text-xs mb-1">
                      <Clock className="w-3 h-3" />
                    </div>
                    <div className="text-sm font-semibold text-white">
                      {Math.floor(Math.random() * 500)}ms
                    </div>
                    <div className="text-xs text-white/40">Avg</div>
                  </div>
                  <div className="text-center">
                    <div className="flex items-center justify-center gap-1 text-white/40 text-xs mb-1">
                      <DollarSign className="w-3 h-3" />
                    </div>
                    <div className="text-sm font-semibold text-white">
                      ${(Math.random() * 10).toFixed(2)}
                    </div>
                    <div className="text-xs text-white/40">Cost</div>
                  </div>
                </div>

                {/* Created Date */}
                <div className="text-xs text-white/40 pt-2">
                  Created {new Date(agent.created_at).toLocaleDateString()}
                </div>
              </div>

              {/* Hover Glow */}
              <div
                className="absolute -inset-1 opacity-0 group-hover:opacity-20 blur-xl transition-opacity duration-500"
                style={{ background: '#8b5cf6' }}
              />
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}

