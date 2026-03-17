'use client'
import { useState } from 'react'
import { api } from '@/lib/command-api'
import type { ScrapedLead } from '@/types/scraper'

interface InsightsCardProps {
  leads: ScrapedLead[]
}

type Insight = {
  top3: Array<{ domain: string; reason: string }>
  bestNicheCity: string
  outreachAngle: string
}

export function InsightsCard({ leads }: InsightsCardProps) {
  const [insights, setInsights] = useState<Insight | null>(null)
  const [loading, setLoading] = useState(false)

  const generateInsights = async () => {
    setLoading(true)
    try {
      const payload = {
        leads: leads.slice(0, 20).map(l => ({
          domain: l.domain,
          businessName: l.businessName,
          niche: l.niche,
          city: l.city,
          score: l.score.score,
          priority: l.score.priority,
          reasoning: l.score.reasoning,
          topIssues: l.score.topIssues,
          estimatedDeal: l.score.estimatedDeal,
          contactQuality: l.score.contactQuality,
        })),
      }
      const result = await api.post<Insight>('/scraper/insights', payload)
      setInsights(result)
    } catch {
      // Fallback: generate from data locally
      const top3 = leads
        .filter(l => l.score.priority === 'high')
        .slice(0, 3)
        .map(l => ({ domain: l.domain, reason: l.score.reasoning }))

      setInsights({
        top3,
        bestNicheCity: `${leads[0]?.niche} in ${leads[0]?.city}`,
        outreachAngle: `Focus on ${leads.filter(l => l.audit && !l.audit.hasSSL).length} leads with no SSL — easiest entry point.`,
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{
      background: 'rgba(255,255,255,0.03)',
      border: '1px solid rgba(201,168,76,0.15)',
      borderRadius: '10px',
      padding: '20px',
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
        <div style={{ fontSize: '13px', fontWeight: 700, color: '#C9A84C' }}>🤖 Claude Insights</div>
        {!insights && (
          <button
            onClick={generateInsights}
            disabled={loading}
            style={{
              padding: '7px 14px', fontSize: '12px', fontWeight: 600,
              background: 'rgba(201,168,76,0.12)', color: '#C9A84C',
              border: '1px solid rgba(201,168,76,0.3)', borderRadius: '6px', cursor: loading ? 'not-allowed' : 'pointer',
              display: 'flex', alignItems: 'center', gap: '6px',
            }}
          >
            {loading ? (
              <><span style={{ width: 12, height: 12, border: '2px solid currentColor', borderTopColor: 'transparent', borderRadius: '50%', display: 'inline-block', animation: 'spin 0.8s linear infinite' }} /> Analyzing...</>
            ) : '✨ Generate Insights'}
          </button>
        )}
      </div>

      {!insights ? (
        <p style={{ margin: 0, fontSize: '13px', color: 'rgba(242,237,228,0.4)' }}>
          Click "Generate Insights" to get Claude's analysis of this batch — top leads to contact, best angles, market summary.
        </p>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          <div>
            <div style={{ fontSize: '11px', color: 'rgba(242,237,228,0.4)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '8px' }}>Top 3 Leads to Contact</div>
            {insights.top3.map((item, i) => (
              <div key={i} style={{ display: 'flex', gap: '10px', padding: '6px 0', borderBottom: '1px solid rgba(255,255,255,0.04)', fontSize: '13px' }}>
                <span style={{ color: '#C9A84C', fontFamily: 'monospace', flexShrink: 0 }}>{i + 1}. {item.domain}</span>
                <span style={{ color: 'rgba(242,237,228,0.6)' }}>{item.reason}</span>
              </div>
            ))}
          </div>
          <div>
            <div style={{ fontSize: '11px', color: 'rgba(242,237,228,0.4)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '6px' }}>Best Niche/City Combo</div>
            <div style={{ fontSize: '13px', color: '#4ade80' }}>{insights.bestNicheCity}</div>
          </div>
          <div>
            <div style={{ fontSize: '11px', color: 'rgba(242,237,228,0.4)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '6px' }}>Recommended Outreach Angle</div>
            <div style={{ fontSize: '13px', color: 'rgba(242,237,228,0.8)', lineHeight: 1.5 }}>{insights.outreachAngle}</div>
          </div>
        </div>
      )}
    </div>
  )
}
