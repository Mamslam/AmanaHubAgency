'use client'
import { useState, useEffect, useRef } from 'react'
import { mockAgentLogs } from '@/lib/mock-data'
import type { AgentLog, AgentStatus } from '@/types'

const CARD = {
  background: 'rgba(255,255,255,0.03)',
  border: '1px solid rgba(255,255,255,0.07)',
  borderRadius: '10px',
  padding: '20px',
}

export default function AgentPage() {
  const [agentStatus, setAgentStatus] = useState<AgentStatus>('IDLE')
  const [logs, setLogs] = useState<AgentLog[]>(mockAgentLogs)
  const [autoSend, setAutoSend] = useState(true)
  const [dailyLimit, setDailyLimit] = useState(20)
  const [delay, setDelay] = useState(3)
  const [activeHoursFrom, setActiveHoursFrom] = useState('08:00')
  const [activeHoursTo, setActiveHoursTo] = useState('20:00')
  const [todayStats] = useState({ processed: 20, sent: 18, skipped: 2, replies: 1 })
  const logRef = useRef<HTMLDivElement>(null)

  // Auto-scroll log
  useEffect(() => {
    if (logRef.current) {
      logRef.current.scrollTop = logRef.current.scrollHeight
    }
  }, [logs])

  // Simulate agent running (demo)
  const startAgent = () => {
    setAgentStatus('RUNNING')
    const demoLogs: AgentLog[] = [
      { id: Date.now().toString(), message: '▶️  Agent session started by operator', level: 'info', createdAt: new Date().toISOString() },
      { id: (Date.now()+1).toString(), message: '📋 Loading lead queue: 12 leads pending', level: 'info', createdAt: new Date().toISOString() },
    ]
    setLogs(prev => [...prev, ...demoLogs])
  }

  const pauseAgent = () => {
    setAgentStatus('PAUSED')
    setLogs(prev => [...prev, { id: Date.now().toString(), message: '⏸ Agent paused by operator', level: 'warning', createdAt: new Date().toISOString() }])
  }

  const stopAgent = () => {
    setAgentStatus('IDLE')
    setLogs(prev => [...prev, { id: Date.now().toString(), message: '⏹ Agent stopped', level: 'info', createdAt: new Date().toISOString() }])
  }

  const statusConfig = {
    RUNNING: { color: '#4ade80', bg: 'rgba(22,163,74,0.08)', border: 'rgba(22,163,74,0.25)', dot: 'status-running', label: 'RUNNING', pulse: true },
    PAUSED:  { color: '#fbbf24', bg: 'rgba(217,119,6,0.08)', border: 'rgba(217,119,6,0.25)', dot: 'status-paused', label: 'PAUSED', pulse: false },
    IDLE:    { color: '#dc2626', bg: 'rgba(220,38,38,0.08)', border: 'rgba(220,38,38,0.2)', dot: 'status-idle', label: 'IDLE', pulse: false },
  }
  const sc = statusConfig[agentStatus]

  return (
    <div className="animate-fadeIn" style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
      {/* Main status + controls */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '16px' }}>
        {/* Status card */}
        <div style={{ ...CARD, background: sc.bg, border: `1px solid ${sc.border}`, textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '12px' }}>
          <div style={{ fontSize: '11px', color: 'rgba(242,237,228,0.4)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>Agent Status</div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <span className={`status-dot ${sc.dot} ${sc.pulse ? 'animate-pulse-gold' : ''}`} style={{ width: '14px', height: '14px' }} />
            <span style={{ fontSize: '28px', fontWeight: 800, color: sc.color, letterSpacing: '0.05em' }}>{sc.label}</span>
          </div>
          {agentStatus === 'RUNNING' && (
            <div className="animate-fadeIn" style={{ fontSize: '12px', color: 'rgba(242,237,228,0.5)', fontFamily: 'monospace' }}>
              Processing: halal-koeln.de...
            </div>
          )}
          {/* Today stats */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', width: '100%', marginTop: '4px' }}>
            {[
              { label: 'Processed', value: todayStats.processed, color: '#F2EDE4' },
              { label: 'Sent', value: todayStats.sent, color: '#4ade80' },
              { label: 'Skipped', value: todayStats.skipped, color: '#fbbf24' },
              { label: 'Replies', value: todayStats.replies, color: '#2DD4BF' },
            ].map(s => (
              <div key={s.label} style={{ background: 'rgba(255,255,255,0.04)', borderRadius: '6px', padding: '8px' }}>
                <div style={{ fontSize: '18px', fontWeight: 700, color: s.color }}>{s.value}</div>
                <div style={{ fontSize: '10px', color: 'rgba(242,237,228,0.35)', textTransform: 'uppercase' }}>{s.label}</div>
              </div>
            ))}
          </div>
          {/* Control buttons */}
          <div style={{ display: 'flex', gap: '8px', width: '100%' }}>
            <button onClick={startAgent} disabled={agentStatus === 'RUNNING'} style={{
              flex: 1, padding: '9px', fontSize: '13px', fontWeight: 700,
              background: agentStatus !== 'RUNNING' ? 'rgba(22,163,74,0.15)' : 'rgba(255,255,255,0.03)',
              color: agentStatus !== 'RUNNING' ? '#4ade80' : 'rgba(242,237,228,0.3)',
              border: '1px solid rgba(22,163,74,0.3)', borderRadius: '6px', cursor: agentStatus !== 'RUNNING' ? 'pointer' : 'not-allowed',
            }}>▶ Start</button>
            <button onClick={pauseAgent} disabled={agentStatus !== 'RUNNING'} style={{
              flex: 1, padding: '9px', fontSize: '13px', fontWeight: 700,
              background: agentStatus === 'RUNNING' ? 'rgba(217,119,6,0.12)' : 'rgba(255,255,255,0.03)',
              color: agentStatus === 'RUNNING' ? '#fbbf24' : 'rgba(242,237,228,0.3)',
              border: '1px solid rgba(217,119,6,0.25)', borderRadius: '6px', cursor: agentStatus === 'RUNNING' ? 'pointer' : 'not-allowed',
            }}>⏸ Pause</button>
            <button onClick={stopAgent} disabled={agentStatus === 'IDLE'} style={{
              flex: 1, padding: '9px', fontSize: '13px', fontWeight: 700,
              background: agentStatus !== 'IDLE' ? 'rgba(220,38,38,0.12)' : 'rgba(255,255,255,0.03)',
              color: agentStatus !== 'IDLE' ? '#f87171' : 'rgba(242,237,228,0.3)',
              border: '1px solid rgba(220,38,38,0.25)', borderRadius: '6px', cursor: agentStatus !== 'IDLE' ? 'pointer' : 'not-allowed',
            }}>⏹ Stop</button>
          </div>
        </div>

        {/* Config panel */}
        <div style={CARD}>
          <div style={{ fontSize: '12px', color: 'rgba(242,237,228,0.4)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '16px' }}>Agent Configuration</div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
            <div>
              <label style={{ fontSize: '12px', color: 'rgba(242,237,228,0.5)', display: 'block', marginBottom: '6px' }}>Daily send limit</label>
              <input type="number" value={dailyLimit} onChange={(e) => setDailyLimit(Number(e.target.value))} min={1} max={20} className="cc-input" />
            </div>
            <div>
              <label style={{ fontSize: '12px', color: 'rgba(242,237,228,0.5)', display: 'block', marginBottom: '6px' }}>Delay between emails (min)</label>
              <input type="number" value={delay} onChange={(e) => setDelay(Number(e.target.value))} min={3} className="cc-input" />
            </div>
            <div>
              <label style={{ fontSize: '12px', color: 'rgba(242,237,228,0.5)', display: 'block', marginBottom: '6px' }}>Active hours from</label>
              <input type="time" value={activeHoursFrom} onChange={(e) => setActiveHoursFrom(e.target.value)} className="cc-input" />
            </div>
            <div>
              <label style={{ fontSize: '12px', color: 'rgba(242,237,228,0.5)', display: 'block', marginBottom: '6px' }}>Active hours to</label>
              <input type="time" value={activeHoursTo} onChange={(e) => setActiveHoursTo(e.target.value)} className="cc-input" />
            </div>
          </div>

          {/* Auto-send toggle */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: '16px', padding: '12px 14px', background: 'rgba(255,255,255,0.03)', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.06)' }}>
            <div>
              <div style={{ fontSize: '13px', fontWeight: 600, color: '#F2EDE4' }}>Auto-send Mode</div>
              <div style={{ fontSize: '12px', color: 'rgba(242,237,228,0.4)', marginTop: '2px' }}>
                {autoSend ? 'Agent sends emails automatically' : 'Agent drafts — you approve each email'}
              </div>
            </div>
            <button onClick={() => setAutoSend(!autoSend)} style={{
              width: '44px', height: '24px', borderRadius: '12px', border: 'none', cursor: 'pointer',
              background: autoSend ? '#C9A84C' : 'rgba(255,255,255,0.15)',
              position: 'relative', transition: 'background 0.2s', flexShrink: 0,
            }}>
              <span style={{
                position: 'absolute', top: '2px', left: autoSend ? '22px' : '2px',
                width: '20px', height: '20px', borderRadius: '50%',
                background: '#fff', transition: 'left 0.2s',
              }} />
            </button>
          </div>

          {/* Language + niche priority */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px', marginTop: '14px' }}>
            <div>
              <label style={{ fontSize: '12px', color: 'rgba(242,237,228,0.5)', display: 'block', marginBottom: '6px' }}>Language priority</label>
              <div style={{ display: 'flex', gap: '4px', flexWrap: 'wrap' }}>
                {['DE', 'FR', 'AR', 'EN'].map((lang, i) => (
                  <span key={lang} className="cc-badge" style={{ background: 'rgba(201,168,76,0.1)', color: '#C9A84C', cursor: 'pointer' }}>
                    {i+1}. {lang}
                  </span>
                ))}
              </div>
            </div>
            <div>
              <label style={{ fontSize: '12px', color: 'rgba(242,237,228,0.5)', display: 'block', marginBottom: '6px' }}>Niche priority</label>
              <div style={{ display: 'flex', gap: '4px', flexWrap: 'wrap' }}>
                {['Restaurant', 'Artisan', 'Medical'].map((n, i) => (
                  <span key={n} className="cc-badge" style={{ background: 'rgba(45,212,191,0.08)', color: '#2DD4BF', cursor: 'pointer' }}>
                    {i+1}. {n}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Log terminal */}
      <div style={CARD}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span className={`status-dot ${agentStatus === 'RUNNING' ? 'status-running animate-blink' : 'status-idle'}`} />
            <span style={{ fontSize: '12px', color: 'rgba(242,237,228,0.4)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Agent Log</span>
          </div>
          <button onClick={() => setLogs([])} style={{ padding: '4px 10px', fontSize: '11px', fontWeight: 600, background: 'rgba(255,255,255,0.04)', color: 'rgba(242,237,228,0.4)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '4px', cursor: 'pointer' }}>
            Clear
          </button>
        </div>
        <div
          ref={logRef}
          className="log-terminal cc-scroll"
          style={{ height: '320px', overflowY: 'auto', padding: '14px' }}
        >
          {logs.map((log) => (
            <div key={log.id} className="animate-logEntry" style={{ display: 'flex', gap: '12px', marginBottom: '3px', lineHeight: 1.5 }}>
              <span style={{ color: 'rgba(242,237,228,0.25)', flexShrink: 0, fontSize: '11px' }}>
                [{new Date(log.createdAt).toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit', second: '2-digit' })}]
              </span>
              <span className={`log-${log.level}`}>{log.message}</span>
            </div>
          ))}
          {logs.length === 0 && (
            <div style={{ color: 'rgba(242,237,228,0.2)', fontStyle: 'italic', fontSize: '13px' }}>No logs yet. Start the agent to begin.</div>
          )}
          {agentStatus === 'RUNNING' && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'rgba(242,237,228,0.3)', fontSize: '12px', marginTop: '4px' }}>
              <span className="animate-spin" style={{ width: 10, height: 10, border: '1.5px solid currentColor', borderTopColor: 'transparent', borderRadius: '50%', display: 'inline-block', flexShrink: 0 }} />
              Running...
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
