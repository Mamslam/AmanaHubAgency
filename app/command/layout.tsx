'use client'
import { useEffect } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import { isAuthenticated } from '@/lib/command-auth'
import Sidebar from '@/components/command/layout/Sidebar'
import TopBar from '@/components/command/layout/TopBar'

const pageTitles: Record<string, string> = {
  '/command/dashboard': 'Dashboard',
  '/command/leads':     'Leads',
  '/command/audit':     'Audit Engine',
  '/command/outreach':  'Outreach',
  '/command/agent':     'AI Agent',
  '/command/pipeline':  'Pipeline CRM',
  '/command/delivery':  'Delivery Tracker',
  '/command/billing':   'Billing',
  '/command/analytics': 'Analytics',
  '/command/settings':  'Settings',
}

export default function CommandLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter()
  const pathname = usePathname()
  const isLoginPage = pathname === '/command/login'

  useEffect(() => {
    if (!isLoginPage && !isAuthenticated()) {
      router.replace('/command/login')
    }
  }, [isLoginPage, router])

  if (isLoginPage) return <>{children}</>

  const title = Object.entries(pageTitles).find(([key]) => pathname.startsWith(key))?.[1] || 'Command Center'

  return (
    <div style={{ display: 'flex', minHeight: '100vh' }}>
      <Sidebar agentStatus="IDLE" />
      <div style={{ marginLeft: '220px', flex: 1, display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
        <TopBar title={title} />
        <main style={{ flex: 1, padding: '24px', overflowY: 'auto' }} className="animate-fadeIn">
          {children}
        </main>
      </div>
    </div>
  )
}
