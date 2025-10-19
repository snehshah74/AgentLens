'use client'

import { useState, useEffect, useRef } from 'react'
import { motion, useInView, useAnimation } from 'framer-motion'
import { 
  Activity, LineChart, Brain, Shield, DollarSign, Plug, 
  Key, Code, BarChart, Github, Twitter, Linkedin, MessageCircle,
  Menu, X, ArrowRight, Play, Check, Zap, Cloud, Database,
  Server, Globe, Package, Lock, TrendingUp, Clock, Users
} from 'lucide-react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'

// Animated number counter
function useCountUp(end: number, duration: number = 2000) {
  const [count, setCount] = useState(0)
  const countRef = useRef<number | null>(null)

  useEffect(() => {
    let startTime: number | null = null
    const animate = (currentTime: number) => {
      if (startTime === null) startTime = currentTime
      const progress = Math.min((currentTime - startTime) / duration, 1)
      setCount(Math.floor(progress * end))
      if (progress < 1) {
        countRef.current = requestAnimationFrame(animate)
      }
    }
    countRef.current = requestAnimationFrame(animate)
    return () => {
      if (countRef.current) cancelAnimationFrame(countRef.current)
    }
  }, [end, duration])

  return count
}

// Scroll animation hook
function useScrollAnimation() {
  const controls = useAnimation()
  const ref = useRef(null)
  const inView = useInView(ref, { once: true, margin: "-100px" })

  useEffect(() => {
    if (inView) {
      controls.start('visible')
    }
  }, [controls, inView])

  return { ref, controls }
}

// Animated Counter Component
function AnimatedCounter({ end, suffix = '', prefix = '' }: { end: number; suffix?: string; prefix?: string }) {
  const ref = useRef(null)
  const inView = useInView(ref, { once: true })
  const count = useCountUp(inView ? end : 0)

  return <span ref={ref}>{prefix}{count.toLocaleString()}{suffix}</span>
}

export default function LandingPage() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 50)
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  const techStack = [
    { name: 'Python', icon: '🐍' },
    { name: 'FastAPI', icon: '⚡' },
    { name: 'Next.js', icon: '▲' },
    { name: 'PostgreSQL', icon: '🐘' },
    { name: 'Redis', icon: '🔴' },
    { name: 'Docker', icon: '🐳' },
    { name: 'Kubernetes', icon: '☸️' },
    { name: 'AI/ML', icon: '🤖' },
    { name: 'Grafana', icon: '📊' },
    { name: 'Prometheus', icon: '🔥' },
    { name: 'Elasticsearch', icon: '🔍' },
    { name: 'AWS', icon: '☁️' },
  ]

  const features = [
    {
      icon: Activity,
      title: 'Distributed Tracing',
      description: 'Track every step of your AI agent workflows. Visualize LLM calls, tool executions, and memory operations.',
      color: '#8b5cf6'
    },
    {
      icon: LineChart,
      title: 'Real-Time Monitoring',
      description: 'Live dashboards with instant insights. Monitor latency, costs, token usage, and errors.',
      color: '#3b82f6'
    },
    {
      icon: Brain,
      title: 'AI-Powered Analysis',
      description: 'Automatic anomaly detection and insights. Let AI analyze your AI for performance issues.',
      color: '#a78bfa'
    },
    {
      icon: Shield,
      title: 'Security & Compliance',
      description: 'Built-in threat detection and audit logs. Track prompt injections, data leaks, and policy violations.',
      color: '#8b5cf6'
    },
    {
      icon: DollarSign,
      title: 'Cost Optimization',
      description: 'Track and reduce AI spending. Real-time cost analysis across all LLM providers.',
      color: '#10b981'
    },
    {
      icon: Plug,
      title: 'Easy Integration',
      description: 'Connect in minutes, not days. SDKs for Python, JavaScript, and REST API.',
      color: '#3b82f6'
    },
  ]

  const integrations = [
    ['OpenAI', 'Anthropic', 'Google AI', 'Cohere', 'Groq'],
    ['LangChain', 'LlamaIndex', 'AutoGPT', 'CrewAI', 'Haystack'],
    ['Python', 'Node.js', 'FastAPI', 'Next.js', 'Django'],
    ['PostgreSQL', 'Redis', 'MongoDB', 'Supabase', 'Pinecone'],
    ['Kubernetes', 'Docker', 'AWS', 'Vercel', 'Cloudflare'],
  ]

  const stats = [
    { value: 10000, suffix: '+', label: 'Active Developers' },
    { value: 1, suffix: 'M+', label: 'Traces Analyzed Daily' },
    { value: 99.9, suffix: '%', label: 'Uptime SLA' },
    { value: 50, suffix: 'ms', label: 'Avg Response Time' },
  ]

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white overflow-x-hidden">
      {/* Navigation */}
      <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled ? 'bg-[#0a0a0a]/95 backdrop-blur-lg border-b border-white/10' : 'bg-transparent'
      }`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <Link href="/" className="flex items-center gap-2 group">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-purple-500 to-blue-500 flex items-center justify-center group-hover:scale-110 transition-transform">
                <Zap className="w-5 h-5 text-white" />
              </div>
              <span className="font-bold text-xl">AgentLens</span>
            </Link>

            {/* Desktop Menu */}
            <div className="hidden md:flex items-center gap-6">
              <a href="#features" className="text-white/80 hover:text-white transition-colors">Features</a>
              <a href="#integrations" className="text-white/80 hover:text-white transition-colors">Integrations</a>
              <a href="#pricing" className="text-white/80 hover:text-white transition-colors">Pricing</a>
              <Link href="/login" className="text-white/80 hover:text-white transition-colors">Sign in</Link>
              <Link href="/login">
                <Button className="bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600">
                  Get Started
                </Button>
              </Link>
            </div>

            {/* Mobile Menu Button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 rounded-lg hover:bg-white/10"
            >
              {mobileMenuOpen ? <X /> : <Menu />}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="md:hidden bg-[#1a1a1a] border-t border-white/10"
          >
            <div className="px-4 py-4 space-y-3">
              <a href="#features" className="block px-4 py-2 rounded-lg hover:bg-white/10">Features</a>
              <a href="#integrations" className="block px-4 py-2 rounded-lg hover:bg-white/10">Integrations</a>
              <a href="#pricing" className="block px-4 py-2 rounded-lg hover:bg-white/10">Pricing</a>
              <Link href="/login" className="block px-4 py-2 rounded-lg hover:bg-white/10">Sign in</Link>
              <Link href="/login" className="block">
                <Button className="w-full bg-gradient-to-r from-purple-500 to-blue-500">Get Started</Button>
              </Link>
            </div>
          </motion.div>
        )}
      </nav>

      {/* SECTION 1: HERO */}
      <section className="relative min-h-screen flex items-center pt-16 overflow-hidden">
        {/* Animated Background */}
        <div className="absolute inset-0">
          <div className="absolute inset-0 bg-gradient-to-br from-purple-500/10 via-transparent to-blue-500/10" />
          <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-purple-500/20 rounded-full blur-3xl animate-pulse" />
          <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-blue-500/20 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />
        </div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
          <div className="grid lg:grid-cols-5 gap-12 items-center">
            {/* Left: Content */}
            <div className="lg:col-span-3 space-y-8">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8 }}
              >
                <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold leading-tight">
                  Whatever your AI stack,{' '}
                  <span className="bg-gradient-to-r from-purple-400 via-purple-500 to-blue-500 bg-clip-text text-transparent">
                    it runs on AgentLens 
                  </span>
                </h1>
              </motion.div>

              <motion.p
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.2 }}
                className="text-xl text-gray-400 max-w-2xl"
              >
                Monitor, analyze, and secure your agentic AI systems with real-time observability. 
                Get insights into performance, security threats, and system health.
              </motion.p>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.4 }}
                className="flex flex-col sm:flex-row gap-4"
              >
                <Link href="/login">
                  <Button className="px-8 py-6 text-lg bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600 group">
                    Get started for free
                    <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
                  </Button>
                </Link>
              </motion.div>
            </div>

            {/* Right: Tech Stack Grid */}
            <div className="lg:col-span-2">
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 1, delay: 0.6 }}
                className="grid grid-cols-3 gap-3"
              >
                {techStack.map((tech, i) => (
                  <motion.div
                    key={tech.name}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 0.1 * i }}
                    whileHover={{ scale: 1.05, y: -5 }}
                    className="group relative bg-[#1e1e2e] rounded-xl p-4 border border-purple-500/20 hover:border-purple-500/50 transition-all cursor-pointer"
                  >
                    <div className="absolute inset-0 bg-gradient-to-br from-purple-500/0 to-purple-500/0 group-hover:from-purple-500/10 group-hover:to-blue-500/10 rounded-xl transition-all" />
                    <div className="relative text-center">
                      <div className="text-3xl mb-2">{tech.icon}</div>
                      <div className="text-sm font-medium text-white/80 group-hover:text-white">{tech.name}</div>
                    </div>
                  </motion.div>
                ))}
              </motion.div>
            </div>
          </div>
        </div>
      </section>

      {/* SECTION 2: STATUS METRICS */}
      <section className="relative py-20 bg-gradient-to-b from-transparent to-[#0f0f0f]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-3 gap-8">
            {[
              { value: '99.9%', label: 'Uptime', desc: 'Guaranteed availability for your AI services', color: 'purple' },
              { value: '100ms', label: 'Response Time', desc: 'Average latency for threat detection', color: 'blue' },
              { value: '24/7', label: 'Monitoring', desc: 'Continuous security analysis and alerting', color: 'purple' },
            ].map((metric, i) => {
              const { ref, controls } = useScrollAnimation()
              return (
                <motion.div
                  key={i}
                  ref={ref}
                  initial="hidden"
                  animate={controls}
                  variants={{
                    hidden: { opacity: 0, y: 50 },
                    visible: { opacity: 1, y: 0, transition: { duration: 0.6, delay: i * 0.2 } }
                  }}
                  className="relative group"
                >
                  <div className="glass rounded-2xl p-8 border border-white/10 hover:border-purple-500/50 transition-all">
                    <div className={`absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-${metric.color}-500 to-blue-500 rounded-t-2xl`} />
                    <div className="text-5xl font-bold bg-gradient-to-br from-white to-gray-400 bg-clip-text text-transparent mb-2">
                      {metric.value}
                    </div>
                    <div className="text-xl font-semibold mb-3 text-white">{metric.label}</div>
                    <div className="text-gray-400">{metric.desc}</div>
                  </div>
                </motion.div>
              )
            })}
          </div>
        </div>
      </section>

      {/* SECTION 3: KEY FEATURES */}
      <section id="features" className="py-32 bg-[#0f0f0f]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl sm:text-5xl font-bold mb-4">
              Why <span className="bg-gradient-to-r from-purple-400 to-blue-500 bg-clip-text text-transparent">AgentLens</span>?
            </h2>
            <p className="text-xl text-gray-400 max-w-2xl mx-auto">
              Everything you need to observe, debug, and optimize your AI agents
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, i) => {
              const { ref, controls } = useScrollAnimation()
              const Icon = feature.icon
              return (
                <motion.div
                  key={i}
                  ref={ref}
                  initial="hidden"
                  animate={controls}
                  variants={{
                    hidden: { opacity: 0, y: 30 },
                    visible: { opacity: 1, y: 0, transition: { duration: 0.6, delay: i * 0.1 } }
                  }}
                  whileHover={{ y: -5 }}
                  className="group relative"
                >
                  <div className="glass rounded-2xl p-8 border border-white/10 hover:border-purple-500/50 transition-all h-full">
                    <div 
                      className="w-14 h-14 rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform"
                      style={{ backgroundColor: `${feature.color}20` }}
                    >
                      <Icon className="w-7 h-7" style={{ color: feature.color }} />
                    </div>
                    <h3 className="text-2xl font-semibold mb-3 text-white">{feature.title}</h3>
                    <p className="text-gray-400 leading-relaxed">{feature.description}</p>
                    
                    <div 
                      className="absolute inset-0 opacity-0 group-hover:opacity-100 rounded-2xl transition-opacity pointer-events-none"
                      style={{ boxShadow: `0 0 40px ${feature.color}30` }}
                    />
                  </div>
                </motion.div>
              )
            })}
          </div>
        </div>
      </section>

      {/* SECTION 4: INTEGRATION SHOWCASE */}
      <section id="integrations" className="py-32 bg-gradient-to-b from-[#0f0f0f] to-[#0a0a0a]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl sm:text-5xl font-bold mb-4">
              Integrate with <span className="bg-gradient-to-r from-purple-400 to-blue-500 bg-clip-text text-transparent">Your Stack</span>
            </h2>
            <p className="text-xl text-gray-400">
              Works with all major AI frameworks and platforms
            </p>
          </motion.div>

          <div className="space-y-6">
            {integrations.map((row, rowIndex) => (
              <motion.div
                key={rowIndex}
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: rowIndex * 0.1 }}
                className="flex flex-wrap justify-center gap-4"
              >
                {row.map((integration, i) => (
                  <motion.div
                    key={i}
                    whileHover={{ scale: 1.05 }}
                    className="glass rounded-xl px-6 py-4 border border-white/10 hover:border-purple-500/50 transition-all"
                  >
                    <span className="text-white/80 hover:text-white font-medium">{integration}</span>
                  </motion.div>
                ))}
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* SECTION 5: HOW IT WORKS */}
      <section className="py-32 bg-[#0a0a0a]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-20"
          >
            <h2 className="text-4xl sm:text-5xl font-bold mb-4">
              Get Started in <span className="bg-gradient-to-r from-purple-400 to-blue-500 bg-clip-text text-transparent">3 Simple Steps</span>
            </h2>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-8 relative">
            {/* Connecting Line */}
            <div className="hidden md:block absolute top-16 left-1/6 right-1/6 h-0.5 bg-gradient-to-r from-purple-500 via-blue-500 to-purple-500" />

            {[
              {
                number: '1',
                icon: Key,
                title: 'Get Your API Key',
                description: 'Sign up and generate your AgentLens API key in seconds',
                code: 'export AGENTLENS_KEY="als_xxxxx"'
              },
              {
                number: '2',
                icon: Code,
                title: 'Install SDK',
                description: 'Add our lightweight SDK to your project',
                code: 'pip install agentlens-sdk\n# or\nnpm install @agentlens/sdk'
              },
              {
                number: '3',
                icon: BarChart,
                title: 'Start Monitoring',
                description: 'See traces, metrics, and insights instantly',
                code: 'from agentlens import trace\n\n@trace()\ndef my_agent(query):\n    return llm.generate(query)'
              },
            ].map((step, i) => {
              const { ref, controls } = useScrollAnimation()
              const Icon = step.icon
              return (
                <motion.div
                  key={i}
                  ref={ref}
                  initial="hidden"
                  animate={controls}
                  variants={{
                    hidden: { opacity: 0, y: 40 },
                    visible: { opacity: 1, y: 0, transition: { duration: 0.6, delay: i * 0.2 } }
                  }}
                  className="relative"
                >
                  {/* Number Badge */}
                  <div className="absolute -top-6 left-1/2 -translate-x-1/2 w-12 h-12 rounded-full bg-gradient-to-br from-purple-500 to-blue-500 flex items-center justify-center text-white font-bold text-xl z-10 shadow-lg shadow-purple-500/50">
                    {step.number}
                  </div>

                  <div className="glass rounded-2xl p-8 border border-white/10 hover:border-purple-500/50 transition-all pt-12">
                    <Icon className="w-12 h-12 text-purple-400 mb-4 mx-auto" />
                    <h3 className="text-2xl font-semibold mb-3 text-center">{step.title}</h3>
                    <p className="text-gray-400 text-center mb-6">{step.description}</p>
                    
                    <div className="bg-black/50 rounded-lg p-4 border border-purple-500/20">
                      <pre className="text-sm text-gray-300 overflow-x-auto">
                        <code>{step.code}</code>
                      </pre>
                    </div>
                  </div>
                </motion.div>
              )
            })}
          </div>
        </div>
      </section>

      {/* SECTION 6: STATS */}
      <section className="py-20 bg-gradient-to-b from-[#0a0a0a] to-[#0f0f0f]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((stat, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, scale: 0.8 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: i * 0.1 }}
                className="text-center"
              >
                <div className="text-4xl sm:text-5xl font-bold bg-gradient-to-br from-purple-400 to-blue-500 bg-clip-text text-transparent mb-2">
                  <AnimatedCounter end={stat.value} suffix={stat.suffix} />
                </div>
                <div className="text-gray-400">{stat.label}</div>
                <div className="w-16 h-1 bg-gradient-to-r from-purple-500 to-blue-500 mx-auto mt-4 rounded-full" />
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* SECTION 7: CTA BANNER */}
      <section className="relative py-32 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-purple-500 via-purple-600 to-blue-600" />
        <div className="absolute inset-0">
          {[...Array(20)].map((_, i) => {
            // Use deterministic values based on index to avoid hydration mismatch
            const leftPos = (i * 5.3) % 100
            const topPos = (i * 7.9) % 100
            const duration = 3 + (i % 3)
            const delay = (i % 4) * 0.5
            
            return (
              <motion.div
                key={i}
                className="absolute w-2 h-2 bg-white/30 rounded-full"
                style={{
                  left: `${leftPos}%`,
                  top: `${topPos}%`,
                }}
                animate={{
                  y: [0, -30, 0],
                  opacity: [0.3, 0.6, 0.3],
                }}
                transition={{
                  duration,
                  repeat: Infinity,
                  delay,
                }}
              />
            )
          })}
        </div>

        <div className="relative max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-4xl sm:text-5xl font-bold mb-6"
          >
            Ready to secure your AI infrastructure?
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="text-xl text-white/90 mb-8"
          >
            Join thousands of developers who trust AgentLens for their production workloads.
          </motion.p>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
            className="flex flex-col sm:flex-row gap-4 justify-center"
          >
            <Link href="/login">
              <Button className="px-8 py-6 text-lg bg-white text-purple-600 hover:bg-gray-100">
                Start monitoring now
                <ArrowRight className="ml-2 w-5 h-5" />
              </Button>
            </Link>
            <Button variant="outline" className="px-8 py-6 text-lg border-white text-white hover:bg-white/10">
              <Play className="mr-2 w-5 h-5" />
              Watch demo
            </Button>
          </motion.div>
        </div>
      </section>

      {/* SECTION 8: FOOTER */}
      <footer className="bg-[#0f0f0f] border-t border-white/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="grid md:grid-cols-4 gap-12 mb-12">
            <div>
              <h3 className="text-white font-semibold mb-4">Product</h3>
              <div className="space-y-3">
                <a href="#features" className="block text-gray-400 hover:text-white transition-colors">Features</a>
                <a href="#pricing" className="block text-gray-400 hover:text-white transition-colors">Pricing</a>
                <a href="#" className="block text-gray-400 hover:text-white transition-colors">Documentation</a>
                <a href="#integrations" className="block text-gray-400 hover:text-white transition-colors">Integrations</a>
              </div>
            </div>

            <div>
              <h3 className="text-white font-semibold mb-4">Company</h3>
              <div className="space-y-3">
                <a href="#" className="block text-gray-400 hover:text-white transition-colors">About Us</a>
                <a href="#" className="block text-gray-400 hover:text-white transition-colors">Blog</a>
                <a href="#" className="block text-gray-400 hover:text-white transition-colors">Careers</a>
                <a href="#" className="block text-gray-400 hover:text-white transition-colors">Contact</a>
              </div>
            </div>

            <div>
              <h3 className="text-white font-semibold mb-4">Resources</h3>
              <div className="space-y-3">
                <a href="#" className="block text-gray-400 hover:text-white transition-colors">Documentation</a>
                <a href="#" className="block text-gray-400 hover:text-white transition-colors">API Reference</a>
                <a href="#" className="block text-gray-400 hover:text-white transition-colors">SDK Downloads</a>
                <a href="#" className="block text-gray-400 hover:text-white transition-colors">Status Page</a>
              </div>
            </div>

            <div>
              <h3 className="text-white font-semibold mb-4">Legal</h3>
              <div className="space-y-3">
                <a href="#" className="block text-gray-400 hover:text-white transition-colors">Privacy Policy</a>
                <a href="#" className="block text-gray-400 hover:text-white transition-colors">Terms of Service</a>
                <a href="#" className="block text-gray-400 hover:text-white transition-colors">Security</a>
                <a href="#" className="block text-gray-400 hover:text-white transition-colors">Compliance</a>
              </div>
            </div>
          </div>

          <div className="pt-8 border-t border-white/10 flex flex-col md:flex-row items-center justify-between gap-4">
            <p className="text-gray-400">© 2024 AgentLens. All rights reserved.</p>
            <div className="flex items-center gap-4">
              <a href="#" className="text-gray-400 hover:text-white transition-colors">
                <Github className="w-5 h-5" />
              </a>
              <a href="#" className="text-gray-400 hover:text-white transition-colors">
                <Twitter className="w-5 h-5" />
              </a>
              <a href="#" className="text-gray-400 hover:text-white transition-colors">
                <Linkedin className="w-5 h-5" />
              </a>
              <a href="#" className="text-gray-400 hover:text-white transition-colors">
                <MessageCircle className="w-5 h-5" />
              </a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}

