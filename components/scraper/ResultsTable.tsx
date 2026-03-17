'use client'
import { useState } from 'react'
import type { ScrapedLead } from '@/types/scraper'
import { ContactBadge } from './ContactBadge'
import { IssuesSummary } from './IssuesSummary'

function ScoreCell({ score, priority }: { score: number; priority: string }) {
  const color = score >= 8 ? '#4ade80' : score >= 5 ? '#fbbf24' : '#f87171'
  return (
    <span style={{ fontWeight: 700, color, fontFamily: 'monospace', fontSize: '13px' }}>
      {score}<span style={{ fontSize: '10px', color: 'rgba(242,237,228,0.3)' }}>/10</span>
    </span>
  )
}

function AiScoreCell({ score }: { score: number | undefined }) {
  if (score === undefined || score === null) return <span style={{ color: 'rgba(242,237,228,0.2)' }}>—</span>
  const color = score < 30 ? '#f87171' : score < 60 ? '#fbbf24' : '#4ade80'
  return (
    <span style={{ color, fontFamily: 'monospace', fontSize: '12px' }}>
      {score}<span style={{ fontSize: '10px', color: 'rgba(242,237,228,0.3)' }}>/100</span>
    </span>
  )
}

function PerfCell({ score }: { score: number | undefined }) {
  if (score === undefined || score === null) return <span style={{ color: 'rgba(242,237,228,0.2)' }}>—</span>
  const color = score >= 90 ? '#4ade80' : score >= 50 ? '#fbbf24' : '#f87171'
  return <span style={{ color, fontFamily: 'monospace', fontSize: '12px' }}>{score}</span>
}

interface IssueTooltipProps {
  issues: ScrapedLead['issues']
}

function IssueTooltip({ issues }: IssueTooltipProps) {
  const [show, setShow] = useState(false)
  return (
    <div
      style={{ position: 'relative', display: 'inline-block' }}
      onMouseEnter={() => setShow(true)}
      onMouseLeave={() => setShow(false)}
    >
      <IssuesSummary issues={issues} />
      {show && issues.length > 0 && (
        <div style={{
          position: 'absolute', left: 0, top: '100%', zIndex: 50,
          background: '#0f0f1a', border: '1px solid rgba(255,255,255,0.12)',
          borderRadius: '8px', padding: '10px 12px', minWidth: '280px',
          boxShadow: '0 8px 32px rgba(0,0,0,0.5)',
        }}>
          {issues.slice(0, 6).map(issue => {
            const color = issue.severity === 'critical' ? '#f87171' : issue.severity === 'warning' ? '#fbbf24' : '#60a5fa'
            return (
              <div key={issue.key} style={{ display: 'flex', gap: '8px', padding: '4px 0', borderBottom: '1px solid rgba(255,255,255,0.04)', fontSize: '12px' }}>
                <span style={{ color, flexShrink: 0, width: '50px' }}>{issue.severity}</span>
                <span style={{ color: 'rgba(242,237,228,0.7)' }}>{issue.title}</span>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}

interface ResultsTableProps {
  leads: ScrapedLead[]
  selected: Set<string>
  onSelect: (domain: string) => void
  onSelectAll: () => void
  allSelected: boolean
  onRowClick: (lead: ScrapedLead) => void
}

export function ResultsTable({ leads, selected, onSelect, onSelectAll, allSelected, onRowClick }: ResultsTableProps) {
  if (leads.length === 0) return null

  return (
    <div style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: '10px', overflow: 'hidden' }}>
      <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px' }}>
        <thead>
          <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.07)' }}>
            <th style={{ padding: '11px 14px', width: '36px' }}>
              <input type="checkbox" checked={allSelected} onChange={onSelectAll} style={{ cursor: 'pointer' }} />
            </th>
            {['#', 'Business', 'Domain', 'City', 'Score', 'Issues', 'Contact', 'Perf', 'SEO', 'AI Vis', 'Reviews'].map(h => (
              <th key={h} style={{ padding: '11px 10px', textAlign: 'left', color: 'rgba(242,237,228,0.4)', fontWeight: 600, fontSize: '10px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{h}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {leads.map((lead, i) => {
            const rowColor = lead.score.score >= 8
              ? 'rgba(74,222,128,0.04)'
              : lead.score.score <= 4
              ? 'rgba(255,255,255,0.01)'
              : 'transparent'
            const leftBorder = lead.score.score >= 8 ? '2px solid rgba(74,222,128,0.4)' : lead.score.score <= 4 ? 'none' : 'none'

            return (
              <tr
                key={lead.domain || i}
                className="animate-fadeIn"
                style={{
                  borderBottom: '1px solid rgba(255,255,255,0.04)',
                  background: selected.has(lead.domain) ? 'rgba(201,168,76,0.05)' : rowColor,
                  borderLeft: leftBorder,
                  cursor: 'pointer',
                  opacity: lead.score.score <= 4 ? 0.6 : 1,
                  transition: 'background 0.15s',
                  animationDelay: `${i * 0.02}s`,
                }}
                onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = 'rgba(255,255,255,0.04)' }}
                onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = selected.has(lead.domain) ? 'rgba(201,168,76,0.05)' : rowColor }}
              >
                <td style={{ padding: '10px 14px' }} onClick={e => { e.stopPropagation(); onSelect(lead.domain) }}>
                  <input type="checkbox" checked={selected.has(lead.domain)} onChange={() => onSelect(lead.domain)} style={{ cursor: 'pointer' }} />
                </td>
                <td style={{ padding: '10px 10px', color: 'rgba(242,237,228,0.3)', fontSize: '11px' }}>{i + 1}</td>
                <td style={{ padding: '10px 10px', color: '#F2EDE4', fontWeight: 500, maxWidth: '160px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }} onClick={() => onRowClick(lead)}>
                  {lead.businessName}
                </td>
                <td style={{ padding: '10px 10px' }} onClick={() => onRowClick(lead)}>
                  <span style={{ color: '#C9A84C', fontFamily: 'monospace', fontSize: '12px' }}>{lead.domain || '—'}</span>
                </td>
                <td style={{ padding: '10px 10px', color: 'rgba(242,237,228,0.5)', fontSize: '12px' }} onClick={() => onRowClick(lead)}>{lead.city}</td>
                <td style={{ padding: '10px 10px' }} onClick={() => onRowClick(lead)}>
                  <ScoreCell score={lead.score.score} priority={lead.score.priority} />
                </td>
                <td style={{ padding: '10px 10px' }} onClick={() => onRowClick(lead)}>
                  <IssueTooltip issues={lead.issues} />
                </td>
                <td style={{ padding: '10px 10px' }} onClick={() => onRowClick(lead)}>
                  <ContactBadge contact={lead.contact} />
                </td>
                <td style={{ padding: '10px 10px' }} onClick={() => onRowClick(lead)}>
                  <PerfCell score={lead.audit?.scores.performance} />
                </td>
                <td style={{ padding: '10px 10px' }} onClick={() => onRowClick(lead)}>
                  <PerfCell score={lead.audit?.scores.seo} />
                </td>
                <td style={{ padding: '10px 10px' }} onClick={() => onRowClick(lead)}>
                  <AiScoreCell score={lead.audit?.aiVisibilityScore} />
                </td>
                <td style={{ padding: '10px 10px', color: 'rgba(242,237,228,0.5)', fontSize: '12px' }} onClick={() => onRowClick(lead)}>
                  {lead.place.rating != null ? (
                    <span>
                      <span style={{ color: '#fbbf24' }}>★</span> {lead.place.rating.toFixed(1)}
                      <span style={{ color: 'rgba(242,237,228,0.3)', fontSize: '11px' }}> ({lead.place.reviewCount ?? 0})</span>
                    </span>
                  ) : '—'}
                </td>
              </tr>
            )
          })}
        </tbody>
      </table>
    </div>
  )
}
