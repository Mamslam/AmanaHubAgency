'use client'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { clearToken } from '@/lib/command-auth'
import { useRouter } from 'next/navigation'
import LionLogo from './LionLogo'

const navItems = [
  { href: '/command/dashboard', icon: '🏠', label: 'Dashboard' },
  { href: '/command/leads',     icon: '📥', label: 'Leads' },
  { href: '/command/audit',     icon: '🔍', label: 'Audit' },
  { href: '/command/scraper',   icon: '🌐', label: 'Scraper' },
  { href: '/command/outreach',  icon: '📧', label: 'Outreach' },
  { href: '/command/agent',     icon: '🤖', label: 'Agent' },
  { href: '/command/pipeline',  icon: '💼', label: 'Pipeline' },
  { href: '/command/delivery',  icon: '🚀', label: 'Delivery' },
  { href: '/command/billing',   icon: '💰', label: 'Billing' },
  { href: '/command/analytics', icon: '📊', label: 'Analytics' },
  { href: '/command/settings',  icon: '⚙️', label: 'Settings' },
]

export default function Sidebar({ agentStatus = 'IDLE' }: { agentStatus?: 'RUNNING' | 'PAUSED' | 'IDLE' }) {
  const pathname = usePathname()
  const router = useRouter()

  const handleSignOut = () => {
    clearToken()
    router.push('/command/login')
  }

  const statusDot = agentStatus === 'RUNNING' ? 'status-running' : agentStatus === 'PAUSED' ? 'status-paused' : 'status-idle'
  const statusLabel = agentStatus === 'RUNNING' ? 'Running' : agentStatus === 'PAUSED' ? 'Paused' : 'Stopped'
  const statusColor = agentStatus === 'RUNNING' ? '#16a34a' : agentStatus === 'PAUSED' ? '#d97706' : '#dc2626'

  return (
    <aside style={{
      width: '220px',
      minHeight: '100vh',
      background: 'rgba(255,255,255,0.02)',
      borderRight: '1px solid rgba(255,255,255,0.07)',
      display: 'flex',
      flexDirection: 'column',
      position: 'fixed',
      left: 0,
      top: 0,
      zIndex: 40,
    }}>
      {/* Logo */}
      <div style={{ padding: '20px 16px', borderBottom: '1px solid rgba(255,255,255,0.06)', display: 'flex', alignItems: 'center', gap: '10px' }}>
        <LionLogo size={32} />
        <div>
          <div style={{ fontSize: '14px', fontWeight: 700, color: '#C9A84C', lineHeight: 1 }}>AmanaHub</div>
          <div style={{ fontSize: '10px', color: 'rgba(242,237,228,0.4)', letterSpacing: '0.08em' }}>Command Center</div>
        </div>
      </div>

      {/* Nav */}
      <nav style={{ flex: 1, padding: '12px 8px', overflowY: 'auto' }} className="cc-scroll">
        {navItems.map((item) => {
          const active = pathname.startsWith(item.href)
          return (
            <Link
              key={item.href}
              href={item.href}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '10px',
                padding: '9px 10px',
                borderRadius: '8px',
                marginBottom: '2px',
                textDecoration: 'none',
                fontSize: '14px',
                fontWeight: active ? 600 : 400,
                color: active ? '#C9A84C' : '#F2EDE4',
                background: active ? 'rgba(201,168,76,0.1)' : 'transparent',
                borderLeft: active ? '2px solid #C9A84C' : '2px solid transparent',
                transition: 'all 0.15s',
              }}
              onMouseEnter={(e) => { if (!active) (e.currentTarget as HTMLElement).style.background = 'rgba(255,255,255,0.04)' }}
              onMouseLeave={(e) => { if (!active) (e.currentTarget as HTMLElement).style.background = 'transparent' }}
            >
              <span style={{ fontSize: '16px', width: '20px', textAlign: 'center' }}>{item.icon}</span>
              <span>{item.label}</span>
            </Link>
          )
        })}
      </nav>

      {/* Bottom */}
      <div style={{ padding: '12px 8px', borderTop: '1px solid rgba(255,255,255,0.06)' }}>
        {/* Agent status */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '8px 10px', marginBottom: '4px' }}>
          <span className={`status-dot ${statusDot}`} />
          <span style={{ fontSize: '13px', color: statusColor, fontWeight: 500 }}>Agent {statusLabel}</span>
        </div>
        {/* Sign out */}
        <button
          onClick={handleSignOut}
          style={{
            width: '100%',
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            padding: '9px 10px',
            borderRadius: '8px',
            border: 'none',
            background: 'transparent',
            color: 'rgba(242,237,228,0.5)',
            fontSize: '14px',
            cursor: 'pointer',
            transition: 'all 0.15s',
          }}
          onMouseEnter={(e) => {
            ;(e.currentTarget as HTMLElement).style.background = 'rgba(255,255,255,0.04)'
            ;(e.currentTarget as HTMLElement).style.color = '#F2EDE4'
          }}
          onMouseLeave={(e) => {
            ;(e.currentTarget as HTMLElement).style.background = 'transparent'
            ;(e.currentTarget as HTMLElement).style.color = 'rgba(242,237,228,0.5)'
          }}
        >
          <span style={{ fontSize: '16px', width: '20px', textAlign: 'center' }}>🚪</span>
          <span>Sign Out</span>
        </button>
      </div>
    </aside>
  )
}
