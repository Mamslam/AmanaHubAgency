'use client'
import { useState } from 'react'
import { mockLeads } from '@/lib/mock-data'
import type { Lead, LeadStatus } from '@/types'

const COLUMNS: { status: LeadStatus; label: string; color: string; icon: string }[] = [
  { status: 'PROSPECT',    label: 'Prospect',     color: '#94a3b8', icon: '👁' },
  { status: 'AUDITED',     label: 'Audited',      color: '#2DD4BF', icon: '🔍' },
  { status: 'EMAILED',     label: 'Emailed',      color: '#C9A84C', icon: '📧' },
  { status: 'REPLIED',     label: 'Replied',      color: '#4ade80', icon: '↩️' },
  { status: 'NEGOTIATING', label: 'Negotiating',  color: '#fbbf24', icon: '🤝' },
  { status: 'CLOSED',      label: 'Closed',       color: '#16a34a', icon: '✅' },
  { status: 'DELIVERED',   label: 'Delivered',    color: '#38bdf8', icon: '🚀' },
]

const NICHE_COLORS: Record<string, string> = {
  restaurant: '#f97316', artisan: '#a78bfa', professional: '#38bdf8',
  medical: '#34d399', beauty: '#f472b6', trades: '#fbbf24', education: '#60a5fa', default: '#94a3b8',
}
const LANG_FLAGS: Record<string, string> = { FR: '🇫🇷', DE: '🇩🇪', AR: '🇸🇦', EN: '🇬🇧' }

function LeadCard({ lead, color }: { lead: Lead; color: string }) {
  const daysSinceUpdate = Math.floor((Date.now() - new Date(lead.updatedAt).getTime()) / 86400000)
  const estimatedValue = lead.leadScore ? lead.leadScore * 200 : 1200

  return (
    <div style={{
      background: 'rgba(255,255,255,0.03)',
      border: `1px solid rgba(255,255,255,0.07)`,
      borderLeft: `3px solid ${color}`,
      borderRadius: '8px',
      padding: '12px',
      cursor: 'pointer',
      transition: 'all 0.15s',
      marginBottom: '8px',
    }}
    onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.borderColor = `${color}55`; (e.currentTarget as HTMLElement).style.background = 'rgba(255,255,255,0.05)' }}
    onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.borderColor = 'rgba(255,255,255,0.07)'; (e.currentTarget as HTMLElement).style.borderLeftColor = color; (e.currentTarget as HTMLElement).style.background = 'rgba(255,255,255,0.03)' }}
    >
      {/* Domain + lang */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '6px' }}>
        <span style={{ fontSize: '13px', fontWeight: 600, color: '#F2EDE4', wordBreak: 'break-all' }}>{lead.businessName || lead.domain}</span>
        <span style={{ fontSize: '14px', flexShrink: 0, marginLeft: '4px' }}>{LANG_FLAGS[lead.language] || '🌐'}</span>
      </div>
      <div style={{ fontSize: '11px', color: 'rgba(242,237,228,0.4)', marginBottom: '8px' }}>{lead.domain}</div>

      {/* Badges */}
      <div style={{ display: 'flex', gap: '4px', flexWrap: 'wrap', marginBottom: '8px' }}>
        {lead.niche && (
          <span className="cc-badge" style={{ background: `${NICHE_COLORS[lead.niche] || NICHE_COLORS.default}18`, color: NICHE_COLORS[lead.niche] || NICHE_COLORS.default, fontSize: '10px' }}>
            {lead.niche}
          </span>
        )}
        {lead.leadScore && (
          <span className="cc-badge" style={{
            background: lead.leadScore >= 8 ? 'rgba(22,163,74,0.12)' : 'rgba(217,119,6,0.12)',
            color: lead.leadScore >= 8 ? '#4ade80' : '#fbbf24',
            fontSize: '10px',
          }}>★ {lead.leadScore}</span>
        )}
      </div>

      {/* Value + days */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '11px' }}>
        <span style={{ color: '#C9A84C', fontWeight: 600 }}>~€{estimatedValue.toLocaleString()}</span>
        <span style={{ color: daysSinceUpdate > 7 ? '#f87171' : 'rgba(242,237,228,0.3)' }}>{daysSinceUpdate}d ago</span>
      </div>

      {/* Quick actions */}
      <div style={{ display: 'flex', gap: '4px', marginTop: '8px', borderTop: '1px solid rgba(255,255,255,0.04)', paddingTop: '8px' }}>
        {['✉️', '📄', '📞', '✅'].map(icon => (
          <button key={icon} title={icon} onClick={(e) => e.stopPropagation()} style={{
            flex: 1, fontSize: '12px', background: 'rgba(255,255,255,0.04)',
            border: '1px solid rgba(255,255,255,0.07)', borderRadius: '4px',
            padding: '3px', cursor: 'pointer',
          }}>{icon}</button>
        ))}
      </div>
    </div>
  )
}

export default function PipelinePage() {
  const [leads] = useState<Lead[]>(mockLeads)
  const [filterLang, setFilterLang] = useState('all')
  const [filterNiche, setFilterNiche] = useState('all')
  const [view, setView] = useState<'kanban' | 'list'>('kanban')

  const totalValue = leads.reduce((sum, l) => sum + (l.leadScore ? l.leadScore * 200 : 1200), 0)
  const closed = leads.filter(l => l.status === 'CLOSED' || l.status === 'DELIVERED')
  const winRate = leads.length ? ((closed.length / leads.length) * 100).toFixed(1) : '0'

  const filteredLeads = leads.filter(l => {
    if (filterLang !== 'all' && l.language !== filterLang) return false
    if (filterNiche !== 'all' && l.niche !== filterNiche) return false
    return true
  })

  return (
    <div className="animate-fadeIn" style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h2 style={{ margin: '0 0 4px', fontSize: '20px', fontWeight: 700, color: '#F2EDE4' }}>Pipeline CRM</h2>
          <p style={{ margin: 0, fontSize: '13px', color: 'rgba(242,237,228,0.4)' }}>{leads.length} leads in pipeline</p>
        </div>
        <div style={{ display: 'flex', gap: '6px' }}>
          {(['kanban', 'list'] as const).map(v => (
            <button key={v} onClick={() => setView(v)} style={{
              padding: '7px 14px', fontSize: '12px', fontWeight: 600,
              background: view === v ? 'rgba(201,168,76,0.12)' : 'rgba(255,255,255,0.04)',
              color: view === v ? '#C9A84C' : 'rgba(242,237,228,0.5)',
              border: `1px solid ${view === v ? 'rgba(201,168,76,0.3)' : 'rgba(255,255,255,0.08)'}`,
              borderRadius: '6px', cursor: 'pointer',
            }}>{v === 'kanban' ? '⬜ Kanban' : '☰ List'}</button>
          ))}
        </div>
      </div>

      {/* Metrics bar */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '12px' }}>
        {[
          { label: 'Pipeline Value', value: `€${totalValue.toLocaleString()}`, color: '#C9A84C' },
          { label: 'Avg Deal Size', value: `€${Math.round(totalValue / leads.length).toLocaleString()}`, color: '#2DD4BF' },
          { label: 'Win Rate', value: `${winRate}%`, color: '#4ade80' },
          { label: 'Closed Deals', value: closed.length, color: '#16a34a' },
        ].map(m => (
          <div key={m.label} style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: '8px', padding: '14px 16px' }}>
            <div style={{ fontSize: '11px', color: 'rgba(242,237,228,0.4)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '6px' }}>{m.label}</div>
            <div style={{ fontSize: '22px', fontWeight: 700, color: m.color }}>{m.value}</div>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div style={{ display: 'flex', gap: '8px' }}>
        <select value={filterLang} onChange={(e) => setFilterLang(e.target.value)} className="cc-select">
          {['all', 'FR', 'DE', 'AR', 'EN'].map(o => <option key={o} value={o}>{o === 'all' ? 'All Languages' : o}</option>)}
        </select>
        <select value={filterNiche} onChange={(e) => setFilterNiche(e.target.value)} className="cc-select">
          {['all', 'restaurant', 'artisan', 'professional', 'medical', 'beauty', 'trades'].map(o => <option key={o} value={o}>{o === 'all' ? 'All Niches' : o}</option>)}
        </select>
      </div>

      {/* Kanban Board */}
      {view === 'kanban' && (
        <div style={{ display: 'flex', gap: '12px', overflowX: 'auto', paddingBottom: '16px' }} className="cc-scroll">
          {COLUMNS.map((col) => {
            const colLeads = filteredLeads.filter(l => l.status === col.status)
            const colValue = colLeads.reduce((sum, l) => sum + (l.leadScore ? l.leadScore * 200 : 1200), 0)
            return (
              <div key={col.status} className="kanban-col" style={{ minWidth: '220px', maxWidth: '220px', padding: '12px', flexShrink: 0 }}>
                {/* Column header */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px', paddingBottom: '10px', borderBottom: `1px solid ${col.color}22` }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <span>{col.icon}</span>
                    <span style={{ fontSize: '12px', fontWeight: 700, color: col.color, textTransform: 'uppercase', letterSpacing: '0.04em' }}>{col.label}</span>
                  </div>
                  <span className="cc-badge" style={{ background: `${col.color}18`, color: col.color, fontSize: '10px' }}>{colLeads.length}</span>
                </div>
                {colValue > 0 && (
                  <div style={{ fontSize: '11px', color: 'rgba(242,237,228,0.3)', marginBottom: '10px' }}>~€{colValue.toLocaleString()}</div>
                )}

                {/* Cards */}
                <div style={{ minHeight: '100px' }}>
                  {colLeads.map(lead => (
                    <LeadCard key={lead.id} lead={lead} color={col.color} />
                  ))}
                  {colLeads.length === 0 && (
                    <div style={{ padding: '20px', textAlign: 'center', color: 'rgba(242,237,228,0.2)', fontSize: '12px', borderRadius: '6px', border: '1px dashed rgba(255,255,255,0.06)' }}>
                      Empty
                    </div>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      )}

      {/* List View */}
      {view === 'list' && (
        <div style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: '10px', overflow: 'hidden' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.07)' }}>
                {['Domain', 'Business', 'Niche', 'Score', 'Status', 'Est. Value', 'Last Update'].map(h => (
                  <th key={h} style={{ padding: '12px 14px', textAlign: 'left', color: 'rgba(242,237,228,0.45)', fontWeight: 600, fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filteredLeads.map((lead) => {
                const col = COLUMNS.find(c => c.status === lead.status)
                return (
                  <tr key={lead.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.04)', cursor: 'pointer' }}
                    onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.background = 'rgba(255,255,255,0.03)' }}
                    onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.background = 'transparent' }}
                  >
                    <td style={{ padding: '10px 14px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <span>{LANG_FLAGS[lead.language] || '🌐'}</span>
                        <span style={{ color: '#C9A84C', fontWeight: 500 }}>{lead.domain}</span>
                      </div>
                    </td>
                    <td style={{ padding: '10px 14px', color: '#F2EDE4' }}>{lead.businessName || '—'}</td>
                    <td style={{ padding: '10px 14px' }}>
                      {lead.niche && <span className="cc-badge" style={{ background: `${NICHE_COLORS[lead.niche] || NICHE_COLORS.default}18`, color: NICHE_COLORS[lead.niche] || NICHE_COLORS.default }}>{lead.niche}</span>}
                    </td>
                    <td style={{ padding: '10px 14px' }}>
                      {lead.leadScore && <span style={{ color: lead.leadScore >= 8 ? '#4ade80' : '#fbbf24', fontWeight: 600 }}>{lead.leadScore}/10</span>}
                    </td>
                    <td style={{ padding: '10px 14px' }}>
                      {col && <span className="cc-badge" style={{ background: `${col.color}18`, color: col.color }}>{col.label}</span>}
                    </td>
                    <td style={{ padding: '10px 14px', color: '#C9A84C', fontWeight: 600 }}>~€{((lead.leadScore || 6) * 200).toLocaleString()}</td>
                    <td style={{ padding: '10px 14px', color: 'rgba(242,237,228,0.4)', fontSize: '12px' }}>
                      {new Date(lead.updatedAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })}
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
