'use client'
import { useEffect, useState, useRef } from 'react'
import { mockKPIs, mockRevenueData, mockFunnelData } from '@/lib/mock-data'
import { api } from '@/lib/command-api'
import { getAgentWS } from '@/lib/websocket'
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts'
import type { LeadStatus } from '@/types'

type AgentStatus = 'IDLE' | 'RUNNING' | 'PAUSED'
type Log = { id: string; message: string; level: string; createdAt: string }

const PIPELINE_STAGES: { status: LeadStatus; label: string; color: string }[] = [
  { status: 'PROSPECT',    label: 'Prospect',     color: '#94a3b8' },
  { status: 'AUDITED',     label: 'Audited',      color: '#2DD4BF' },
  { status: 'EMAILED',     label: 'Emailed',      color: '#C9A84C' },
  { status: 'REPLIED',     label: 'Replied',      color: '#4ade80' },
  { status: 'NEGOTIATING', label: 'Negotiating',  color: '#fbbf24' },
  { status: 'CLOSED',      label: 'Closed',       color: '#16a34a' },
  { status: 'DELIVERED',   label: 'Delivered',    color: '#38bdf8' },
]

const STATUS_COLOR: Record<AgentStatus, string> = {
  IDLE: '#dc2626',
  RUNNING: '#4ade80',
  PAUSED: '#fbbf24',
}

const CARD_STYLE = {
  background: 'rgba(255,255,255,0.03)',
  border: '1px solid rgba(255,255,255,0.07)',
  borderRadius: '10px',
  padding: '20px',
}

export default function DashboardPage() {
  const [agentStatus, setAgentStatus] = useState<AgentStatus>('IDLE')
  const [logs, setLogs] = useState<Log[]>([])
  const [leads, setLeads] = useState<{ status: LeadStatus }[]>([])
  const [agentLoading, setAgentLoading] = useState(false)
  const logsEndRef = useRef<HTMLDivElement>(null)

  // Fetch initial data
  useEffect(() => {
    api.get<{ status: AgentStatus }>('/agent/status')
      .then(r => setAgentStatus(r.status))
      .catch(() => {}) // backend may not be running

    api.get<Log[]>('/agent/logs')
      .then(setLogs)
      .catch(() => {})

    api.get<{ leads: { status: LeadStatus }[] }>('/leads')
      .then(r => setLeads(r.leads))
      .catch(() => {})
  }, [])

  // WebSocket for real-time logs + status
  useEffect(() => {
    const ws = getAgentWS()
    ws.connect()

    const unsubLog = ws.onLog((msg) => {
      setLogs(prev => [...prev.slice(-99), {
        id: String(Date.now()),
        message: msg.message,
        level: msg.level,
        createdAt: msg.ts,
      }])
    })

    const unsubStatus = ws.onStatus((status) => {
      setAgentStatus(status as AgentStatus)
    })

    return () => {
      unsubLog()
      unsubStatus()
    }
  }, [])

  // Auto-scroll logs
  useEffect(() => {
    logsEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [logs])

  const handleAgent = async (action: 'start' | 'pause' | 'stop') => {
    setAgentLoading(true)
    try {
      const res = await api.post<{ status: AgentStatus }>(`/agent/${action}`, {})
      setAgentStatus(res.status)
    } catch (e: any) {
      console.error(e)
    } finally {
      setAgentLoading(false)
    }
  }

  const leadsByStatus = PIPELINE_STAGES.map(s => ({
    ...s,
    count: leads.filter(l => l.status === s.status).length,
  }))

  const trendLeads = ((mockKPIs.leadsThisMonth - mockKPIs.leadsLastMonth) / mockKPIs.leadsLastMonth * 100)

  const chartTooltipStyle = {
    backgroundColor: '#0f0f1a',
    border: '1px solid rgba(255,255,255,0.1)',
    borderRadius: '8px',
    color: '#F2EDE4',
    fontSize: '13px',
  }

  const statusColor = STATUS_COLOR[agentStatus]

  return (
    <div className="animate-fadeIn" style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      {/* KPI Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '16px' }}>
        {[
          { label: 'Leads This Month', value: leads.length || mockKPIs.leadsThisMonth, sub: `vs ${mockKPIs.leadsLastMonth} last month`, trend: trendLeads, icon: '📥', color: '#2DD4BF' },
          { label: 'Emails Sent', value: mockKPIs.emailsSentThisMonth, sub: 'this month', icon: '📧', color: '#C9A84C' },
          { label: 'Reply Rate', value: `${mockKPIs.replyRate}%`, sub: 'of emails sent', icon: '↩️', color: '#4ade80' },
          { label: 'Revenue This Month', value: `€${mockKPIs.revenueThisMonth.toLocaleString()}`, sub: '+ €750 recurring', icon: '💰', color: '#C9A84C' },
        ].map((kpi) => (
          <div key={kpi.label} style={CARD_STYLE}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px' }}>
              <span style={{ fontSize: '11px', color: 'rgba(242,237,228,0.5)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>{kpi.label}</span>
              <span style={{ fontSize: '20px' }}>{kpi.icon}</span>
            </div>
            <div style={{ fontSize: '30px', fontWeight: 700, color: kpi.color, lineHeight: 1 }}>{kpi.value}</div>
            <div style={{ marginTop: '8px', display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px' }}>
              {kpi.trend !== undefined && (
                <span style={{ color: kpi.trend >= 0 ? '#4ade80' : '#f87171', fontWeight: 600 }}>
                  {kpi.trend >= 0 ? '↑' : '↓'} {Math.abs(kpi.trend).toFixed(1)}%
                </span>
              )}
              <span style={{ color: 'rgba(242,237,228,0.35)' }}>{kpi.sub}</span>
            </div>
          </div>
        ))}
      </div>

      {/* Row 2: Agent status + Pipeline summary */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '16px' }}>
        {/* Agent Status */}
        <div style={{ ...CARD_STYLE, border: `1px solid ${statusColor}44`, position: 'relative', overflow: 'hidden' }}>
          <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '2px', background: `linear-gradient(90deg, ${statusColor}, transparent)` }} />
          <div style={{ fontSize: '12px', color: 'rgba(242,237,228,0.5)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '16px' }}>Agent Status</div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
            <span
              style={{
                width: '12px', height: '12px', borderRadius: '50%',
                background: statusColor,
                boxShadow: agentStatus === 'RUNNING' ? `0 0 8px ${statusColor}` : 'none',
                animation: agentStatus === 'RUNNING' ? 'pulse 1.5s infinite' : 'none',
              }}
            />
            <span style={{ fontSize: '22px', fontWeight: 700, color: statusColor }}>{agentStatus}</span>
          </div>
          <div style={{ fontSize: '13px', color: 'rgba(242,237,228,0.5)', marginBottom: '4px' }}>
            Queue: <span style={{ color: '#C9A84C', fontWeight: 600 }}>{leads.filter(l => l.status === 'PROSPECT').length} leads</span>
          </div>
          <div style={{ fontSize: '13px', color: 'rgba(242,237,228,0.5)', marginBottom: '20px' }}>
            Total: <span style={{ color: '#F2EDE4', fontWeight: 600 }}>{leads.length} in CRM</span>
          </div>
          <div style={{ display: 'flex', gap: '8px' }}>
            {[
              { label: '▶ Start', action: 'start' as const, bg: 'rgba(22,163,74,0.15)', color: '#4ade80', border: 'rgba(22,163,74,0.3)', disabled: agentStatus === 'RUNNING' },
              { label: '⏸ Pause', action: 'pause' as const, bg: 'rgba(217,119,6,0.12)', color: '#fbbf24', border: 'rgba(217,119,6,0.3)', disabled: agentStatus !== 'RUNNING' },
              { label: '⏹ Stop', action: 'stop' as const, bg: 'rgba(220,38,38,0.12)', color: '#f87171', border: 'rgba(220,38,38,0.3)', disabled: agentStatus === 'IDLE' },
            ].map((btn) => (
              <button
                key={btn.label}
                disabled={btn.disabled || agentLoading}
                onClick={() => handleAgent(btn.action)}
                style={{
                  flex: 1, padding: '7px 4px', fontSize: '12px', fontWeight: 600,
                  background: btn.bg, color: btn.color, border: `1px solid ${btn.border}`,
                  borderRadius: '6px', cursor: btn.disabled ? 'not-allowed' : 'pointer',
                  opacity: btn.disabled ? 0.4 : 1,
                  transition: 'opacity 0.2s',
                }}
              >{btn.label}</button>
            ))}
          </div>
        </div>

        {/* Pipeline Summary */}
        <div style={CARD_STYLE}>
          <div style={{ fontSize: '12px', color: 'rgba(242,237,228,0.5)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '16px' }}>Pipeline Overview</div>
          <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
            {leadsByStatus.map((s) => (
              <div key={s.status} style={{
                flex: '1 1 calc(14% - 8px)',
                background: 'rgba(255,255,255,0.03)',
                border: `1px solid ${s.color}22`,
                borderRadius: '8px',
                padding: '12px 8px',
                textAlign: 'center',
                minWidth: '80px',
              }}>
                <div style={{ fontSize: '24px', fontWeight: 700, color: s.color, lineHeight: 1 }}>{s.count}</div>
                <div style={{ fontSize: '11px', color: 'rgba(242,237,228,0.45)', marginTop: '4px' }}>{s.label}</div>
              </div>
            ))}
          </div>
          <div style={{ marginTop: '16px' }}>
            <div style={{ display: 'flex', height: '6px', borderRadius: '3px', overflow: 'hidden', gap: '1px' }}>
              {leadsByStatus.map((s) => {
                const pct = leads.length ? (s.count / leads.length) * 100 : 0
                return pct > 0 ? (
                  <div key={s.status} style={{ flex: pct, background: s.color, opacity: 0.8, minWidth: '2px' }} title={`${s.label}: ${s.count}`} />
                ) : null
              })}
            </div>
          </div>
        </div>
      </div>

      {/* Row 3: Charts */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
        <div style={CARD_STYLE}>
          <div style={{ fontSize: '12px', color: 'rgba(242,237,228,0.5)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '16px' }}>Revenue (last 6 months)</div>
          <ResponsiveContainer width="100%" height={200}>
            <LineChart data={mockRevenueData}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
              <XAxis dataKey="month" tick={{ fill: 'rgba(242,237,228,0.4)', fontSize: 11 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: 'rgba(242,237,228,0.4)', fontSize: 11 }} axisLine={false} tickLine={false} tickFormatter={(v) => `€${v}`} />
              <Tooltip contentStyle={chartTooltipStyle} formatter={(v) => [`€${v}`, ""]} />
              <Legend wrapperStyle={{ fontSize: '12px', color: 'rgba(242,237,228,0.5)' }} />
              <Line type="monotone" dataKey="oneTime" stroke="#C9A84C" strokeWidth={2} dot={{ fill: '#C9A84C', r: 3 }} name="One-time" />
              <Line type="monotone" dataKey="recurring" stroke="#2DD4BF" strokeWidth={2} dot={{ fill: '#2DD4BF', r: 3 }} name="Recurring" />
            </LineChart>
          </ResponsiveContainer>
        </div>

        <div style={CARD_STYLE}>
          <div style={{ fontSize: '12px', color: 'rgba(242,237,228,0.5)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '16px' }}>Conversion Funnel</div>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={mockFunnelData} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" horizontal={false} />
              <XAxis type="number" tick={{ fill: 'rgba(242,237,228,0.4)', fontSize: 11 }} axisLine={false} tickLine={false} />
              <YAxis type="category" dataKey="stage" tick={{ fill: 'rgba(242,237,228,0.5)', fontSize: 11 }} axisLine={false} tickLine={false} width={80} />
              <Tooltip contentStyle={chartTooltipStyle} />
              <Bar dataKey="count" fill="#C9A84C" opacity={0.8} radius={[0, 4, 4, 0]} name="Leads" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Row 4: Live Agent Logs */}
      <div style={CARD_STYLE}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
          <div style={{ fontSize: '12px', color: 'rgba(242,237,228,0.5)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
            Agent Logs
            {agentStatus === 'RUNNING' && (
              <span style={{ marginLeft: '8px', fontSize: '10px', color: '#4ade80', background: 'rgba(22,163,74,0.15)', padding: '2px 6px', borderRadius: '4px' }}>LIVE</span>
            )}
          </div>
          <span style={{ fontSize: '11px', color: 'rgba(242,237,228,0.3)' }}>{logs.length} entries</span>
        </div>
        <div className="cc-scroll" style={{ maxHeight: '280px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '2px' }}>
          {logs.length === 0 ? (
            <div style={{ padding: '20px', textAlign: 'center', color: 'rgba(242,237,228,0.25)', fontSize: '13px' }}>
              No logs yet. Start the agent to see activity.
            </div>
          ) : (
            logs.slice(-50).map((log, i) => (
              <div
                key={log.id}
                className="animate-fadeIn"
                style={{
                  display: 'flex',
                  alignItems: 'flex-start',
                  gap: '12px',
                  padding: '8px 10px',
                  borderRadius: '6px',
                  animationDelay: `${i * 0.02}s`,
                }}
                onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.background = 'rgba(255,255,255,0.03)' }}
                onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.background = 'transparent' }}
              >
                <span style={{ fontSize: '11px', color: 'rgba(242,237,228,0.3)', flexShrink: 0, fontFamily: 'monospace', paddingTop: '1px' }}>
                  {new Date(log.createdAt).toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                </span>
                <span className={`log-${log.level}`} style={{ fontSize: '13px', lineHeight: 1.4, fontFamily: 'monospace' }}>{log.message}</span>
              </div>
            ))
          )}
          <div ref={logsEndRef} />
        </div>
      </div>
    </div>
  )
}
