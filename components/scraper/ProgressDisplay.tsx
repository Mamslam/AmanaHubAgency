'use client'
import type { ProgressEvent, ScrapedLead } from '@/types/scraper'

const PHASE_LABELS = ['Find', 'Analyze', 'Score', 'Done']

interface ProgressDisplayProps {
  events: ProgressEvent[]
  latestLeads: ScrapedLead[]
  currentPhase: 1 | 2 | 3 | 4
  current: number
  total: number
  label: string
}

export function ProgressDisplay({ events, latestLeads, currentPhase, current, total, label }: ProgressDisplayProps) {
  const pct = total > 0 ? Math.round((current / total) * 100) : 0

  return (
    <div style={{
      background: 'rgba(255,255,255,0.03)',
      border: '1px solid rgba(255,255,255,0.07)',
      borderRadius: '10px',
      padding: '20px',
    }}>
      {/* Phase indicators */}
      <div style={{ display: 'flex', gap: '4px', marginBottom: '16px' }}>
        {PHASE_LABELS.map((label, i) => {
          const phase = (i + 1) as 1 | 2 | 3 | 4
          const isActive = phase === currentPhase
          const isDone = phase < currentPhase
          return (
            <div key={label} style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
              <div style={{
                padding: '5px 14px', fontSize: '12px', fontWeight: 600, borderRadius: '6px',
                background: isDone ? 'rgba(74,222,128,0.12)' : isActive ? 'rgba(201,168,76,0.15)' : 'rgba(255,255,255,0.04)',
                color: isDone ? '#4ade80' : isActive ? '#C9A84C' : 'rgba(242,237,228,0.3)',
                border: `1px solid ${isDone ? 'rgba(74,222,128,0.25)' : isActive ? 'rgba(201,168,76,0.3)' : 'transparent'}`,
              }}>
                {isDone ? '✓ ' : isActive ? '⏳ ' : ''}{label}
              </div>
              {i < 3 && <span style={{ color: 'rgba(255,255,255,0.2)', fontSize: '12px' }}>→</span>}
            </div>
          )
        })}
      </div>

      {/* Current action */}
      <div style={{ fontSize: '13px', color: 'rgba(242,237,228,0.7)', marginBottom: '10px', fontFamily: 'monospace' }}>
        {label}
      </div>

      {/* Progress bar */}
      <div style={{ height: '6px', background: 'rgba(255,255,255,0.06)', borderRadius: '3px', overflow: 'hidden', marginBottom: '8px' }}>
        <div style={{
          height: '100%',
          width: `${pct}%`,
          background: currentPhase === 4 ? '#4ade80' : 'linear-gradient(90deg, #C9A84C, #E8C76A)',
          borderRadius: '3px',
          transition: 'width 0.3s ease',
        }} />
      </div>
      <div style={{ fontSize: '11px', color: 'rgba(242,237,228,0.4)' }}>{current} / {total || '?'} ({pct}%)</div>

      {/* Live lead previews */}
      {latestLeads.length > 0 && (
        <div style={{ marginTop: '12px', display: 'flex', flexDirection: 'column', gap: '4px', maxHeight: '120px', overflowY: 'auto' }}>
          {latestLeads.slice(-5).map((lead, i) => (
            <div key={i} style={{ display: 'flex', gap: '10px', alignItems: 'center', padding: '4px 8px', background: 'rgba(255,255,255,0.02)', borderRadius: '4px', fontSize: '12px' }}>
              <span style={{ color: '#C9A84C', fontFamily: 'monospace' }}>{lead.domain || lead.businessName}</span>
              <span style={{
                color: lead.score.priority === 'high' ? '#4ade80' : lead.score.priority === 'med' ? '#fbbf24' : 'rgba(242,237,228,0.4)',
                fontWeight: 600,
              }}>★ {lead.score.score}/10</span>
              <span style={{ color: 'rgba(242,237,228,0.35)' }}>⚠️ {lead.issues.length}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
