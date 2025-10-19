'use client'

import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import { auth } from '@/lib/supabase'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Home, Zap, Activity, Menu, X, LogOut, Settings } from 'lucide-react'

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter()
  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  useEffect(() => {
    auth.getUser().then(({ data: { user } }) => {
      if (!user) {
        router.push('/login')
      } else {
        setUser(user)
        setLoading(false)
      }
    })
  }, [router])

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-pulse-glow w-16 h-16 rounded-full bg-purple-500/20" />
      </div>
    )
  }

  const navItems = [
    { href: '/dashboard', label: 'Dashboard', icon: Home },
    { href: '/dashboard/agents', label: 'Agents', icon: Zap },
    { href: '/dashboard/traces', label: 'Traces', icon: Activity },
    { href: '/dashboard/settings', label: 'Settings', icon: Settings },
  ]

  return (
    <div className="min-h-screen">
      {/* Mobile Header */}
      <header className="lg:hidden fixed top-0 left-0 right-0 z-50 glass border-b border-white/10 px-4 py-3 flex items-center justify-between">
        <h1 className="text-lg font-bold gradient-text">Observability AI</h1>
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="text-white"
        >
          {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </Button>
      </header>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div
          className="lg:hidden fixed inset-0 z-40 bg-black/60 backdrop-blur-sm"
          onClick={() => setMobileMenuOpen(false)}
        >
          <aside
            className="fixed left-0 top-0 bottom-0 w-64 glass border-r border-white/10 p-6 space-y-6 animate-slide-in-left"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="space-y-2">
              <h1 className="text-2xl font-bold gradient-text">Observability AI</h1>
              <p className="text-xs text-white/40 truncate">{user?.email}</p>
            </div>

            <nav className="space-y-2">
              {navItems.map((item) => {
                const Icon = item.icon
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setMobileMenuOpen(false)}
                    className="flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-white/10 transition-colors"
                  >
                    <Icon className="w-5 h-5 text-white/60" />
                    <span className="text-white/80 hover:text-white">{item.label}</span>
                  </Link>
                )
              })}
            </nav>

            <div className="absolute bottom-6 left-6 right-6">
              <Button
                onClick={() => {
                  auth.signOut().then(() => router.push('/login'))
                  setMobileMenuOpen(false)
                }}
                variant="outline"
                className="w-full border-white/10 text-white/60 hover:text-white hover:border-white/20"
              >
                <LogOut className="w-4 h-4 mr-2" />
                Sign Out
              </Button>
            </div>
          </aside>
        </div>
      )}

      {/* Desktop Sidebar */}
      <aside className="hidden lg:block fixed left-0 top-0 h-full w-64 glass border-r border-white/10 p-6 space-y-6">
        <div className="space-y-2">
          <h1 className="text-2xl font-bold gradient-text">Observability AI</h1>
          <p className="text-xs text-white/40 truncate">{user?.email}</p>
        </div>

        <nav className="space-y-2">
          {navItems.map((item) => {
            const Icon = item.icon
            return (
              <Link
                key={item.href}
                href={item.href}
                className="flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-white/10 transition-colors"
              >
                <Icon className="w-5 h-5 text-white/60" />
                <span className="text-white/80 hover:text-white">{item.label}</span>
              </Link>
            )
          })}
        </nav>

        <div className="absolute bottom-6 left-6 right-6">
          <Button
            onClick={() => auth.signOut().then(() => router.push('/login'))}
            variant="outline"
            className="w-full border-white/10 text-white/60 hover:text-white hover:border-white/20"
          >
            <LogOut className="w-4 h-4 mr-2" />
            Sign Out
          </Button>
        </div>
      </aside>

      {/* Mobile Bottom Navigation */}
      <nav className="lg:hidden fixed bottom-0 left-0 right-0 z-40 glass border-t border-white/10 px-2 py-2 flex items-center justify-around">
        {navItems.map((item) => {
          const Icon = item.icon
          return (
            <Link
              key={item.href}
              href={item.href}
              className="flex flex-col items-center gap-1 px-4 py-2 rounded-lg hover:bg-white/10 transition-colors"
            >
              <Icon className="w-5 h-5 text-white/60" />
              <span className="text-xs text-white/60">{item.label}</span>
            </Link>
          )
        })}
      </nav>

      {/* Main content - Responsive padding */}
      <main className="pt-16 pb-20 lg:pt-0 lg:pb-0 lg:ml-64 p-4 sm:p-6 lg:p-8">
        {children}
      </main>
    </div>
  )
}

