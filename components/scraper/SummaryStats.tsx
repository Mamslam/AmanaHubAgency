'use client'
import type { ScrapedLead, ScraperSummary } from '@/types/scraper'

interface SummaryStatsProps {
  leads: ScrapedLead[]
  summary: ScraperSummary
}

export function SummaryStats({ leads, summary }: SummaryStatsProps) {
  const avgAiMsg = summary.avgAiScore < 30
    ? '"This market is AI-blind — huge opportunity"'
    : summary.avgAiScore < 60
    ? '"AI visibility is low — strong pitch angle"'
    : '"Market has moderate AI presence"'

  return (
    <div style={{
      background: 'rgba(255,255,255,0.03)',
      border: '1px solid rgba(255,255,255,0.07)',
      borderRadius: '10px',
      padding: '16px 20px',
    }}>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '24px', alignItems: 'center' }}>
        {[
          { label: 'Scraped', value: summary.total, color: '#F2EDE4' },
          { label: 'High Priority', value: summary.highPriority, color: '#4ade80' },
          { label: 'Emails', value: `${summary.withEmail} (${leads.length > 0 ? Math.round(summary.withEmail / leads.length * 100) : 0}%)`, color: '#C9A84C' },
          { label: 'WhatsApp', value: `${summary.withWhatsApp} (${leads.length > 0 ? Math.round(summary.withWhatsApp / leads.length * 100) : 0}%)`, color: '#2DD4BF' },
          { label: 'No SSL', value: summary.noSSL, color: '#f87171' },
          { label: 'Pipeline Value', value: `€${summary.estimatedPipelineValue.toLocaleString()}`, color: '#C9A84C' },
        ].map(({ label, value, color }) => (
          <div key={label} style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
            <span style={{ fontSize: '10px', color: 'rgba(242,237,228,0.4)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>{label}</span>
            <span style={{ fontSize: '18px', fontWeight: 700, color, lineHeight: 1 }}>{value}</span>
          </div>
        ))}
        <div style={{ marginLeft: 'auto', fontSize: '12px', color: 'rgba(242,237,228,0.5)', fontStyle: 'italic' }}>
          Avg AI Score: <span style={{ color: summary.avgAiScore < 30 ? '#f87171' : summary.avgAiScore < 60 ? '#fbbf24' : '#4ade80', fontWeight: 600 }}>{summary.avgAiScore}/100</span>
          {' '}{avgAiMsg}
        </div>
      </div>
    </div>
  )
}
