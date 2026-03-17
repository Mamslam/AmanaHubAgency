'use client'
import { useState } from 'react'
import { mockNotifications, mockKPIs } from '@/lib/mock-data'

export default function TopBar({ title }: { title: string }) {
  const [notifOpen, setNotifOpen] = useState(false)
  const unread = mockNotifications.filter((n) => !n.read).length
  const today = new Date().toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })

  return (
    <header style={{
      height: '60px',
      borderBottom: '1px solid rgba(255,255,255,0.07)',
      background: 'rgba(10,10,15,0.95)',
      backdropFilter: 'blur(12px)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: '0 24px',
      position: 'sticky',
      top: 0,
      zIndex: 30,
    }}>
      {/* Left: title */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
        <h1 style={{ fontSize: '18px', fontWeight: 700, color: '#F2EDE4', margin: 0, fontFamily: 'var(--font-dm-sans)' }}>{title}</h1>
        <span style={{ fontSize: '12px', color: 'rgba(242,237,228,0.3)' }}>{today}</span>
      </div>

      {/* Right: quick stats + notifications */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
        {/* Quick stats */}
        <div style={{ display: 'flex', gap: '8px' }}>
          {[
            { label: `${mockKPIs.leadsThisMonth} leads`,                     color: '#2DD4BF' },
            { label: `${mockKPIs.emailsSentThisMonth} emails`,               color: '#C9A84C' },
            { label: `${mockKPIs.replyRate}% replies`,                       color: '#16a34a' },
            { label: `€${mockKPIs.revenueThisMonth.toLocaleString()}`,       color: '#C9A84C' },
          ].map((stat) => (
            <span key={stat.label} className="cc-badge" style={{ background: 'rgba(255,255,255,0.05)', color: stat.color, border: `1px solid ${stat.color}22` }}>
              {stat.label}
            </span>
          ))}
        </div>

        {/* Notification bell */}
        <div style={{ position: 'relative' }}>
          <button
            onClick={() => setNotifOpen(!notifOpen)}
            style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '18px', position: 'relative', padding: '4px' }}
          >
            🔔
            {unread > 0 && (
              <span style={{ position: 'absolute', top: 0, right: 0, background: '#dc2626', color: 'white', borderRadius: '50%', width: '16px', height: '16px', fontSize: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700 }}>
                {unread}
              </span>
            )}
          </button>

          {notifOpen && (
            <div
              className="animate-fadeIn"
              style={{
                position: 'absolute', right: 0, top: '100%', marginTop: '8px',
                width: '320px', background: '#0f0f1a', border: '1px solid rgba(255,255,255,0.1)',
                borderRadius: '10px', overflow: 'hidden', zIndex: 50,
                boxShadow: '0 20px 60px rgba(0,0,0,0.5)',
              }}
            >
              <div style={{ padding: '12px 16px', borderBottom: '1px solid rgba(255,255,255,0.07)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: '13px', fontWeight: 600, color: '#F2EDE4' }}>Notifications</span>
                {unread > 0 && <span style={{ fontSize: '12px', color: '#C9A84C', cursor: 'pointer' }}>Mark all read</span>}
              </div>
              <div style={{ maxHeight: '280px', overflowY: 'auto' }} className="cc-scroll">
                {mockNotifications.map((n) => (
                  <div
                    key={n.id}
                    style={{
                      padding: '12px 16px',
                      borderBottom: '1px solid rgba(255,255,255,0.04)',
                      background: n.read ? 'transparent' : 'rgba(201,168,76,0.04)',
                      display: 'flex', gap: '10px',
                    }}
                  >
                    <span style={{ fontSize: '16px', flexShrink: 0 }}>
                      {n.type === 'reply' ? '🔔' : n.type === 'deal' ? '💼' : n.type === 'payment' ? '💳' : n.type === 'agent' ? '🤖' : '📥'}
                    </span>
                    <div>
                      <div style={{ fontSize: '13px', color: '#F2EDE4', lineHeight: 1.4 }}>{n.message}</div>
                      <div style={{ fontSize: '11px', color: 'rgba(242,237,228,0.3)', marginTop: '2px' }}>
                        {new Date(n.createdAt).toLocaleString('en-GB', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  )
}
