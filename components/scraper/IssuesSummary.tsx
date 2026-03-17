'use client'
import type { ScraperIssue } from '@/types/scraper'

export function IssuesSummary({ issues }: { issues: ScraperIssue[] }) {
  const critical = issues.filter(i => i.severity === 'critical').length
  const warning = issues.filter(i => i.severity === 'warning').length
  const color = critical > 0 ? '#f87171' : warning > 0 ? '#fbbf24' : '#4ade80'

  return (
    <div style={{ position: 'relative', display: 'inline-block' }}>
      <span style={{ fontSize: '12px', fontWeight: 600, color }}>
        ⚠️ {issues.length}
        {critical > 0 && <span style={{ color: '#f87171', marginLeft: '4px', fontSize: '11px' }}>{critical}c</span>}
        {warning > 0 && <span style={{ color: '#fbbf24', marginLeft: '2px', fontSize: '11px' }}>{warning}w</span>}
      </span>
    </div>
  )
}
