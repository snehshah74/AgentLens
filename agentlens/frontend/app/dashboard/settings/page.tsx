'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { toast } from 'sonner'
import { 
  User, Key, Plug, Settings as SettingsIcon, Copy, Check, Eye, EyeOff, 
  Trash2, Plus, RefreshCw, Upload, Bell, Palette, Clock, Database,
  Zap, CheckCircle2, XCircle, AlertTriangle
} from 'lucide-react'

type Tab = 'profile' | 'api-keys' | 'integrations' | 'preferences'

type ApiKey = {
  id: string
  key: string
  name: string
  created_at: string
  last_used?: string
  status: 'active' | 'revoked'
}

type Integration = {
  id: string
  name: string
  provider: string
  logo: string
  status: 'connected' | 'disconnected'
  enabled: boolean
  api_key?: string
  connected_at?: string
}

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState<Tab>('profile')
  const [loading, setLoading] = useState(false)
  const [user, setUser] = useState<any>(null)
  
  // Profile state
  const [fullName, setFullName] = useState('')
  const [company, setCompany] = useState('')
  const [avatarUrl, setAvatarUrl] = useState('')
  
  // API Keys state
  const [apiKeys, setApiKeys] = useState<ApiKey[]>([])
  const [showNewKey, setShowNewKey] = useState(false)
  const [newKeyValue, setNewKeyValue] = useState('')
  const [copiedKey, setCopiedKey] = useState('')
  const [revokeDialog, setRevokeDialog] = useState<string | null>(null)
  
  // Integrations state
  const [integrations, setIntegrations] = useState<Integration[]>([
    { id: '1', name: 'OpenAI', provider: 'openai', logo: '🤖', status: 'disconnected', enabled: false },
    { id: '2', name: 'Anthropic', provider: 'anthropic', logo: '🧠', status: 'disconnected', enabled: false },
    { id: '3', name: 'Groq', provider: 'groq', logo: '⚡', status: 'disconnected', enabled: false },
    { id: '4', name: 'LangChain', provider: 'langchain', logo: '🦜', status: 'disconnected', enabled: false },
  ])
  const [integrationDialog, setIntegrationDialog] = useState<Integration | null>(null)
  const [integrationApiKey, setIntegrationApiKey] = useState('')
  
  // Preferences state
  const [theme, setTheme] = useState<'dark' | 'light'>('dark')
  const [autoRefresh, setAutoRefresh] = useState('30s')
  const [emailNotifications, setEmailNotifications] = useState(true)
  const [dataRetention, setDataRetention] = useState('30')

  useEffect(() => {
    loadUserData()
    loadApiKeys()
    loadIntegrations()
    loadPreferences()
  }, [])

  const loadUserData = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (user) {
        setUser(user)
        setFullName(user.user_metadata?.full_name || '')
        setCompany(user.user_metadata?.company || '')
        setAvatarUrl(user.user_metadata?.avatar_url || '')
      }
    } catch (error) {
      console.error('Error loading user:', error)
    }
  }

  const loadApiKeys = async () => {
    // Simulate loading API keys from database
    // In production, fetch from Supabase table
    setApiKeys([
      {
        id: '1',
        key: 'als_1234567890abcdef',
        name: 'Production Key',
        created_at: new Date().toISOString(),
        last_used: new Date().toISOString(),
        status: 'active',
      },
    ])
  }

  const loadIntegrations = async () => {
    // Load integrations from database
    // This is demo data
  }

  const loadPreferences = async () => {
    // Load user preferences from database
  }

  // Profile functions
  const handleProfileSave = async () => {
    setLoading(true)
    try {
      const { error } = await supabase.auth.updateUser({
        data: { full_name: fullName, company }
      })
      if (error) throw error
      toast.success('Profile updated successfully!')
    } catch (error: any) {
      toast.error(error.message || 'Failed to update profile')
    } finally {
      setLoading(false)
    }
  }

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    setLoading(true)
    try {
      // Upload to Supabase Storage
      const fileExt = file.name.split('.').pop()
      const fileName = `${user?.id}-${Math.random()}.${fileExt}`
      
      // In production, upload to Supabase Storage
      toast.success('Avatar uploaded successfully!')
      setAvatarUrl(URL.createObjectURL(file))
    } catch (error: any) {
      toast.error('Failed to upload avatar')
    } finally {
      setLoading(false)
    }
  }

  // API Key functions
  const generateApiKey = () => {
    const key = 'als_' + Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15)
    setNewKeyValue(key)
    setShowNewKey(true)
    
    // Add to keys list
    setApiKeys([...apiKeys, {
      id: Date.now().toString(),
      key,
      name: 'New API Key',
      created_at: new Date().toISOString(),
      status: 'active',
    }])
    
    toast.success('API key generated! Copy it now - you won\'t see it again.')
  }

  const copyApiKey = (key: string) => {
    navigator.clipboard.writeText(key)
    setCopiedKey(key)
    toast.success('API key copied to clipboard!')
    setTimeout(() => setCopiedKey(''), 2000)
  }

  const revokeApiKey = (id: string) => {
    setApiKeys(apiKeys.map(k => k.id === id ? { ...k, status: 'revoked' as const } : k))
    setRevokeDialog(null)
    toast.success('API key revoked successfully')
  }

  const maskApiKey = (key: string) => {
    return key.substring(0, 8) + '...'
  }

  // Integration functions
  const handleAddIntegration = (integration: Integration) => {
    setIntegrationDialog(integration)
    setIntegrationApiKey('')
  }

  const handleSaveIntegration = () => {
    if (!integrationDialog || !integrationApiKey) return

    setIntegrations(integrations.map(int => 
      int.id === integrationDialog.id 
        ? { ...int, status: 'connected', enabled: true, api_key: integrationApiKey, connected_at: new Date().toISOString() }
        : int
    ))
    
    setIntegrationDialog(null)
    setIntegrationApiKey('')
    toast.success(`${integrationDialog.name} connected successfully!`)
  }

  const handleDeleteIntegration = (id: string) => {
    setIntegrations(integrations.map(int => 
      int.id === id 
        ? { ...int, status: 'disconnected', enabled: false, api_key: undefined }
        : int
    ))
    toast.success('Integration removed')
  }

  const toggleIntegration = (id: string) => {
    setIntegrations(integrations.map(int => 
      int.id === id ? { ...int, enabled: !int.enabled } : int
    ))
  }

  // Preference functions
  const handleSavePreferences = () => {
    // Save to database
    toast.success('Preferences saved successfully!')
  }

  const tabs = [
    { id: 'profile' as Tab, label: 'Profile', icon: User },
    { id: 'api-keys' as Tab, label: 'API Keys', icon: Key },
    { id: 'integrations' as Tab, label: 'Integrations', icon: Plug },
    { id: 'preferences' as Tab, label: 'Preferences', icon: SettingsIcon },
  ]

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold gradient-text">Settings</h1>
        <p className="text-white/60 mt-1">Manage your account and preferences</p>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 overflow-x-auto pb-2">
        {tabs.map((tab) => {
          const Icon = tab.icon
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`
                flex items-center gap-2 px-6 py-3 rounded-lg transition-all duration-300 whitespace-nowrap
                ${activeTab === tab.id
                  ? 'glass-hover bg-gradient-to-r from-purple-500/20 to-pink-500/20 border-purple-500/50'
                  : 'glass border-white/10 hover:border-white/20'
                }
              `}
            >
              <Icon className="w-5 h-5" />
              <span className="font-medium">{tab.label}</span>
            </button>
          )
        })}
      </div>

      {/* Tab Content */}
      <div className="animate-fade-in">
        {/* PROFILE TAB */}
        {activeTab === 'profile' && (
          <div className="space-y-6">
            <Card className="p-6 glass-hover">
              <h2 className="text-xl font-semibold mb-6">Profile Information</h2>
              
              {/* Avatar Upload */}
              <div className="flex items-center gap-6 mb-6 pb-6 border-b border-white/10">
                <div className="relative group">
                  <div className="w-24 h-24 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-3xl font-bold">
                    {avatarUrl ? (
                      <img src={avatarUrl} alt="Avatar" className="w-full h-full rounded-full object-cover" />
                    ) : (
                      fullName?.charAt(0) || user?.email?.charAt(0) || '?'
                    )}
                  </div>
                  <label className="absolute inset-0 bg-black/50 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer">
                    <Upload className="w-6 h-6" />
                    <input type="file" accept="image/*" className="hidden" onChange={handleAvatarUpload} />
                  </label>
                </div>
                <div>
                  <h3 className="text-lg font-semibold">{fullName || 'Set your name'}</h3>
                  <p className="text-white/60 text-sm">{user?.email}</p>
                  <Badge className="mt-2 bg-green-500/15 text-green-400 border-green-500/30">
                    <CheckCircle2 className="w-3 h-3 mr-1" />
                    Verified
                  </Badge>
                </div>
              </div>

              {/* Form Fields */}
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Full Name</label>
                  <Input
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="John Doe"
                    className="glass border-white/10 text-white"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Email</label>
                  <Input
                    value={user?.email || ''}
                    disabled
                    className="glass border-white/10 text-white/60"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Company</label>
                  <Input
                    value={company}
                    onChange={(e) => setCompany(e.target.value)}
                    placeholder="Acme Inc."
                    className="glass border-white/10 text-white"
                  />
                </div>
              </div>

              <Button
                onClick={handleProfileSave}
                disabled={loading}
                className="mt-6 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 btn-ripple"
              >
                {loading ? (
                  <>
                    <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                    Saving...
                  </>
                ) : (
                  'Save Changes'
                )}
              </Button>
            </Card>
          </div>
        )}

        {/* API KEYS TAB */}
        {activeTab === 'api-keys' && (
          <div className="space-y-6">
            <Card className="p-6 glass-hover">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h2 className="text-xl font-semibold">AgentLens API Keys</h2>
                  <p className="text-white/60 text-sm mt-1">Manage your API keys for accessing AgentLens</p>
                </div>
                <Button
                  onClick={generateApiKey}
                  className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 btn-ripple"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Generate New Key
                </Button>
              </div>

              {/* New Key Alert */}
              {showNewKey && newKeyValue && (
                <Card className="p-4 mb-6 bg-yellow-500/10 border-yellow-500/30 animate-fade-in">
                  <div className="flex items-start gap-3">
                    <AlertTriangle className="w-5 h-5 text-yellow-400 mt-0.5" />
                    <div className="flex-1">
                      <h3 className="font-semibold text-yellow-400 mb-2">Your new API key</h3>
                      <p className="text-sm text-white/80 mb-3">
                        Make sure to copy your API key now. You won't be able to see it again!
                      </p>
                      <div className="flex items-center gap-2">
                        <code className="flex-1 p-3 bg-black/30 rounded text-sm font-mono">
                          {newKeyValue}
                        </code>
                        <Button
                          onClick={() => copyApiKey(newKeyValue)}
                          variant="outline"
                          className="border-yellow-500/30 hover:bg-yellow-500/10"
                        >
                          {copiedKey === newKeyValue ? (
                            <><Check className="w-4 h-4 mr-2" /> Copied</>
                          ) : (
                            <><Copy className="w-4 h-4 mr-2" /> Copy</>
                          )}
                        </Button>
                      </div>
                    </div>
                    <button
                      onClick={() => setShowNewKey(false)}
                      className="text-white/60 hover:text-white"
                    >
                      ×
                    </button>
                  </div>
                </Card>
              )}

              {/* API Keys Table */}
              <div className="space-y-3">
                {apiKeys.map((key) => (
                  <Card
                    key={key.id}
                    className={`p-4 glass transition-all duration-300 ${
                      key.status === 'revoked' ? 'opacity-50' : ''
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <code className="text-sm font-mono px-3 py-1 bg-white/5 rounded">
                            {maskApiKey(key.key)}
                          </code>
                          <Badge
                            className={
                              key.status === 'active'
                                ? 'bg-green-500/15 text-green-400 border-green-500/30'
                                : 'bg-red-500/15 text-red-400 border-red-500/30'
                            }
                          >
                            {key.status}
                          </Badge>
                        </div>
                        <div className="flex items-center gap-4 text-sm text-white/60">
                          <span>Created {new Date(key.created_at).toLocaleDateString()}</span>
                          {key.last_used && (
                            <span>Last used {new Date(key.last_used).toLocaleDateString()}</span>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        {key.status === 'active' && (
                          <>
                            <Button
                              onClick={() => copyApiKey(key.key)}
                              variant="outline"
                              size="sm"
                              className="border-white/10 hover:border-white/20"
                            >
                              {copiedKey === key.key ? (
                                <Check className="w-4 h-4" />
                              ) : (
                                <Copy className="w-4 h-4" />
                              )}
                            </Button>
                            <Button
                              onClick={() => setRevokeDialog(key.id)}
                              variant="outline"
                              size="sm"
                              className="border-red-500/30 hover:bg-red-500/10 text-red-400"
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </>
                        )}
                      </div>
                    </div>
                  </Card>
                ))}
              </div>

              {apiKeys.length === 0 && (
                <div className="text-center py-12 text-white/60">
                  <Key className="w-12 h-12 mx-auto mb-4 opacity-50" />
                  <p>No API keys yet. Generate one to get started.</p>
                </div>
              )}
            </Card>
          </div>
        )}

        {/* INTEGRATIONS TAB */}
        {activeTab === 'integrations' && (
          <div className="space-y-4">
            {integrations.map((integration) => (
              <Card key={integration.id} className="p-6 glass-hover">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-lg bg-white/5 flex items-center justify-center text-2xl">
                      {integration.logo}
                    </div>
                    <div>
                      <h3 className="font-semibold">{integration.name}</h3>
                      <div className="flex items-center gap-2 mt-1">
                        {integration.status === 'connected' ? (
                          <>
                            <CheckCircle2 className="w-4 h-4 text-green-400" />
                            <span className="text-sm text-green-400">Connected</span>
                            {integration.connected_at && (
                              <span className="text-sm text-white/40">
                                • {new Date(integration.connected_at).toLocaleDateString()}
                              </span>
                            )}
                          </>
                        ) : (
                          <>
                            <XCircle className="w-4 h-4 text-white/40" />
                            <span className="text-sm text-white/60">Not connected</span>
                          </>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    {integration.status === 'connected' ? (
                      <>
                        <button
                          onClick={() => toggleIntegration(integration.id)}
                          className={`
                            relative w-12 h-6 rounded-full transition-colors
                            ${integration.enabled ? 'bg-green-500' : 'bg-white/20'}
                          `}
                        >
                          <div
                            className={`
                              absolute top-1 left-1 w-4 h-4 rounded-full bg-white transition-transform
                              ${integration.enabled ? 'translate-x-6' : ''}
                            `}
                          />
                        </button>
                        <Button
                          onClick={() => handleDeleteIntegration(integration.id)}
                          variant="outline"
                          size="sm"
                          className="border-red-500/30 hover:bg-red-500/10 text-red-400"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </>
                    ) : (
                      <Button
                        onClick={() => handleAddIntegration(integration)}
                        className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600"
                      >
                        <Plus className="w-4 h-4 mr-2" />
                        Connect
                      </Button>
                    )}
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}

        {/* PREFERENCES TAB */}
        {activeTab === 'preferences' && (
          <div className="space-y-6">
            <Card className="p-6 glass-hover">
              <h2 className="text-xl font-semibold mb-6">General Preferences</h2>

              <div className="space-y-6">
                {/* Theme */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Palette className="w-5 h-5 text-purple-400" />
                    <div>
                      <h3 className="font-medium">Theme</h3>
                      <p className="text-sm text-white/60">Choose your interface theme</p>
                    </div>
                  </div>
                  <select
                    value={theme}
                    onChange={(e) => setTheme(e.target.value as 'dark' | 'light')}
                    className="px-4 py-2 rounded-lg glass border-white/10 text-white"
                  >
                    <option value="dark">Dark</option>
                    <option value="light">Light</option>
                  </select>
                </div>

                {/* Auto Refresh */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <RefreshCw className="w-5 h-5 text-blue-400" />
                    <div>
                      <h3 className="font-medium">Auto-refresh Interval</h3>
                      <p className="text-sm text-white/60">Update dashboard automatically</p>
                    </div>
                  </div>
                  <select
                    value={autoRefresh}
                    onChange={(e) => setAutoRefresh(e.target.value)}
                    className="px-4 py-2 rounded-lg glass border-white/10 text-white"
                  >
                    <option value="10s">10 seconds</option>
                    <option value="30s">30 seconds</option>
                    <option value="1m">1 minute</option>
                    <option value="5m">5 minutes</option>
                  </select>
                </div>

                {/* Email Notifications */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Bell className="w-5 h-5 text-yellow-400" />
                    <div>
                      <h3 className="font-medium">Email Notifications</h3>
                      <p className="text-sm text-white/60">Receive alerts via email</p>
                    </div>
                  </div>
                  <button
                    onClick={() => setEmailNotifications(!emailNotifications)}
                    className={`
                      relative w-12 h-6 rounded-full transition-colors
                      ${emailNotifications ? 'bg-green-500' : 'bg-white/20'}
                    `}
                  >
                    <div
                      className={`
                        absolute top-1 left-1 w-4 h-4 rounded-full bg-white transition-transform
                        ${emailNotifications ? 'translate-x-6' : ''}
                      `}
                    />
                  </button>
                </div>

                {/* Data Retention */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Database className="w-5 h-5 text-green-400" />
                    <div>
                      <h3 className="font-medium">Data Retention</h3>
                      <p className="text-sm text-white/60">How long to keep trace data</p>
                    </div>
                  </div>
                  <select
                    value={dataRetention}
                    onChange={(e) => setDataRetention(e.target.value)}
                    className="px-4 py-2 rounded-lg glass border-white/10 text-white"
                  >
                    <option value="7">7 days</option>
                    <option value="30">30 days</option>
                    <option value="90">90 days</option>
                  </select>
                </div>
              </div>

              <Button
                onClick={handleSavePreferences}
                className="mt-6 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 btn-ripple"
              >
                Save Preferences
              </Button>
            </Card>
          </div>
        )}
      </div>

      {/* Revoke Dialog */}
      <Dialog open={!!revokeDialog} onOpenChange={() => setRevokeDialog(null)}>
        <DialogContent className="glass border-white/10">
          <DialogHeader>
            <DialogTitle>Revoke API Key</DialogTitle>
            <DialogDescription>
              Are you sure you want to revoke this API key? This action cannot be undone and all applications using this key will stop working.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setRevokeDialog(null)}>
              Cancel
            </Button>
            <Button
              onClick={() => revokeDialog && revokeApiKey(revokeDialog)}
              className="bg-red-500 hover:bg-red-600"
            >
              Revoke Key
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Integration Dialog */}
      <Dialog open={!!integrationDialog} onOpenChange={() => setIntegrationDialog(null)}>
        <DialogContent className="glass border-white/10">
          <DialogHeader>
            <DialogTitle>Connect {integrationDialog?.name}</DialogTitle>
            <DialogDescription>
              Enter your {integrationDialog?.name} API key to connect this integration.
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <label className="block text-sm font-medium mb-2">API Key</label>
            <Input
              type="password"
              value={integrationApiKey}
              onChange={(e) => setIntegrationApiKey(e.target.value)}
              placeholder="sk-..."
              className="glass border-white/10 text-white"
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIntegrationDialog(null)}>
              Cancel
            </Button>
            <Button
              onClick={handleSaveIntegration}
              disabled={!integrationApiKey}
              className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600"
            >
              Connect
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

