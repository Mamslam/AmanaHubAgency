'use client'
import { useState } from 'react'
import { mockLeads } from '@/lib/mock-data'
import type { Lead } from '@/types'

const CARD = {
  background: 'rgba(255,255,255,0.03)',
  border: '1px solid rgba(255,255,255,0.07)',
  borderRadius: '10px',
  padding: '20px',
}

// Score ring component (SVG)
function ScoreRing({ score, label, color }: { score: number; label: string; color: string }) {
  const r = 28
  const circ = 2 * Math.PI * r
  const dash = (score / 100) * circ
  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px' }}>
      <svg width="72" height="72" style={{ transform: 'rotate(-90deg)' }}>
        <circle cx="36" cy="36" r={r} fill="none" stroke="rgba(255,255,255,0.08)" strokeWidth="5" />
        <circle cx="36" cy="36" r={r} fill="none" stroke={color} strokeWidth="5"
          strokeDasharray={`${dash} ${circ - dash}`} strokeLinecap="round"
          style={{ transition: 'stroke-dasharray 0.8s ease' }} />
        <text x="36" y="36" textAnchor="middle" dominantBaseline="middle"
          fill={color} fontSize="14" fontWeight="700" style={{ transform: 'rotate(90deg)', transformOrigin: '36px 36px' }}>
          {score}
        </text>
      </svg>
      <span style={{ fontSize: '11px', color: 'rgba(242,237,228,0.4)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{label}</span>
    </div>
  )
}

// Audit result view
function AuditResult({ domain }: { domain: string }) {
  const mockScores = { performance: 34, accessibility: 62, bestPractices: 78, seo: 41 }
  const mockIssues = [
    { id: '1', title: 'Page load time > 5s', severity: 'critical' as const, description: 'First Contentful Paint is 4.8s. Users abandon after 3s.' },
    { id: '2', title: 'Missing meta description', severity: 'critical' as const, description: 'No meta description found. Critical for SEO click-through.' },
    { id: '3', title: 'No SSL certificate', severity: 'critical' as const, description: 'Site served over HTTP. Google penalizes non-HTTPS sites.' },
    { id: '4', title: 'Images not optimized', severity: 'warning' as const, description: 'Images add 2.1MB of unnecessary load.' },
    { id: '5', title: 'Missing structured data', severity: 'info' as const, description: 'No Schema.org markup for local business.' },
  ]
  const grade = 'D'
  const gradeColor = '#dc2626'

  return (
    <div className="animate-fadeIn" style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
      {/* Grade + scores */}
      <div style={{ ...CARD, display: 'flex', alignItems: 'center', gap: '24px' }}>
        <div style={{ textAlign: 'center', padding: '8px 20px', border: `2px solid ${gradeColor}`, borderRadius: '10px', minWidth: '70px' }}>
          <div style={{ fontSize: '40px', fontWeight: 800, color: gradeColor, lineHeight: 1 }}>{grade}</div>
          <div style={{ fontSize: '11px', color: 'rgba(242,237,228,0.4)', marginTop: '2px' }}>Grade</div>
        </div>
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: '16px', fontWeight: 700, color: '#F2EDE4', marginBottom: '4px' }}>{domain}</div>
          <div style={{ fontSize: '13px', color: 'rgba(242,237,228,0.4)', marginBottom: '12px' }}>Audit completed · {new Date().toLocaleDateString('en-GB')}</div>
          <div style={{ display: 'flex', gap: '20px' }}>
            <ScoreRing score={mockScores.performance} label="Perf" color="#f87171" />
            <ScoreRing score={mockScores.accessibility} label="A11y" color="#fbbf24" />
            <ScoreRing score={mockScores.bestPractices} label="Best P." color="#4ade80" />
            <ScoreRing score={mockScores.seo} label="SEO" color="#f87171" />
          </div>
        </div>
        {/* ROI */}
        <div style={{ background: 'rgba(201,168,76,0.08)', border: '1px solid rgba(201,168,76,0.2)', borderRadius: '8px', padding: '16px', minWidth: '160px', textAlign: 'center' }}>
          <div style={{ fontSize: '11px', color: 'rgba(242,237,228,0.4)', marginBottom: '4px' }}>Est. Monthly Loss</div>
          <div style={{ fontSize: '24px', fontWeight: 700, color: '#C9A84C' }}>€2,100</div>
          <div style={{ fontSize: '11px', color: 'rgba(242,237,228,0.4)', marginTop: '4px' }}>from poor web presence</div>
        </div>
      </div>

      {/* Issues */}
      <div style={CARD}>
        <div style={{ fontSize: '12px', color: 'rgba(242,237,228,0.4)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '14px' }}>Issues Found ({mockIssues.length})</div>
        {mockIssues.map((issue) => {
          const sev = { critical: { color: '#f87171', bg: 'rgba(220,38,38,0.1)', label: 'Critical' }, warning: { color: '#fbbf24', bg: 'rgba(217,119,6,0.1)', label: 'Warning' }, info: { color: '#60a5fa', bg: 'rgba(96,165,250,0.1)', label: 'Info' } }[issue.severity]
          return (
            <div key={issue.id} style={{ display: 'flex', gap: '12px', padding: '10px 0', borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
              <span className="cc-badge" style={{ background: sev.bg, color: sev.color, flexShrink: 0, alignSelf: 'flex-start', marginTop: '1px' }}>{sev.label}</span>
              <div>
                <div style={{ fontSize: '13px', fontWeight: 600, color: '#F2EDE4', marginBottom: '2px' }}>{issue.title}</div>
                <div style={{ fontSize: '12px', color: 'rgba(242,237,228,0.4)' }}>{issue.description}</div>
              </div>
            </div>
          )
        })}
      </div>

      {/* Pricing + email */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
        <div style={CARD}>
          <div style={{ fontSize: '12px', color: 'rgba(242,237,228,0.4)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '14px' }}>Bundle Pricing</div>
          {['Website Redesign — €997', 'SEO Setup — €297', 'Google My Business — €197'].map((s, i) => (
            <div key={i} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', padding: '6px 0', borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
              <span style={{ color: 'rgba(242,237,228,0.7)' }}>{s.split(' — ')[0]}</span>
              <span style={{ color: '#C9A84C', fontWeight: 600 }}>{s.split(' — ')[1]}</span>
            </div>
          ))}
          <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '10px', paddingTop: '10px', borderTop: '1px solid rgba(201,168,76,0.2)', fontSize: '15px', fontWeight: 700 }}>
            <span style={{ color: 'rgba(242,237,228,0.5)' }}>Bundle (25% off)</span>
            <span style={{ color: '#C9A84C' }}>€1,497</span>
          </div>
        </div>
        <div style={CARD}>
          <div style={{ fontSize: '12px', color: 'rgba(242,237,228,0.4)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '14px' }}>Outreach Email (DE)</div>
          <div style={{ fontSize: '13px', color: 'rgba(242,237,228,0.6)', fontStyle: 'italic', lineHeight: 1.6 }}>
            "Ihr Webauftritt verliert täglich potenzielle Kunden..."
          </div>
          <div style={{ display: 'flex', gap: '8px', marginTop: '14px' }}>
            <button style={{ flex: 1, padding: '8px', fontSize: '12px', fontWeight: 600, background: 'rgba(201,168,76,0.12)', color: '#C9A84C', border: '1px solid rgba(201,168,76,0.3)', borderRadius: '6px', cursor: 'pointer' }}>
              📧 Send Email
            </button>
            <button style={{ flex: 1, padding: '8px', fontSize: '12px', fontWeight: 600, background: 'rgba(255,255,255,0.05)', color: '#F2EDE4', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '6px', cursor: 'pointer' }}>
              📄 Download PDF
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default function AuditPage() {
  const [activeTab, setActiveTab] = useState<'queue' | 'single' | 'batch'>('queue')
  const [runningAudit, setRunningAudit] = useState(false)
  const [auditDomain, setAuditDomain] = useState('')
  const [auditResult, setAuditResult] = useState<string | null>(null)
  const [batchProgress, setBatchProgress] = useState<{ current: number; total: number; running: boolean }>({ current: 0, total: 0, running: false })

  const pendingAudit = mockLeads.filter(l => l.status === 'PROSPECT' || l.status === 'AUDITED')

  const runAudit = () => {
    if (!auditDomain) return
    setRunningAudit(true)
    setAuditResult(null)
    setTimeout(() => {
      setRunningAudit(false)
      setAuditResult(auditDomain)
    }, 2000)
  }

  const runBatch = () => {
    const total = pendingAudit.length
    setBatchProgress({ current: 0, total, running: true })
    let current = 0
    const interval = setInterval(() => {
      current++
      setBatchProgress({ current, total, running: current < total })
      if (current >= total) clearInterval(interval)
    }, 600)
  }

  return (
    <div className="animate-fadeIn" style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
      {/* Tabs */}
      <div style={{ display: 'flex', gap: '4px', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: '8px', padding: '4px', width: 'fit-content' }}>
        {([['queue', '📋 Queue'], ['single', '🔍 Single Audit'], ['batch', '⚡ Batch Audit']] as const).map(([tab, label]) => (
          <button key={tab} onClick={() => setActiveTab(tab)} style={{
            padding: '8px 18px', fontSize: '13px', fontWeight: 600,
            background: activeTab === tab ? 'rgba(201,168,76,0.12)' : 'transparent',
            color: activeTab === tab ? '#C9A84C' : 'rgba(242,237,228,0.5)',
            border: `1px solid ${activeTab === tab ? 'rgba(201,168,76,0.3)' : 'transparent'}`,
            borderRadius: '6px', cursor: 'pointer', transition: 'all 0.15s',
          }}>{label}</button>
        ))}
      </div>

      {/* Queue Tab */}
      {activeTab === 'queue' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <p style={{ margin: 0, fontSize: '13px', color: 'rgba(242,237,228,0.4)' }}>{pendingAudit.length} leads pending audit</p>
            <button onClick={runBatch} style={{ padding: '9px 18px', fontSize: '13px', fontWeight: 600, background: 'rgba(201,168,76,0.12)', color: '#C9A84C', border: '1px solid rgba(201,168,76,0.3)', borderRadius: '6px', cursor: 'pointer' }}>
              ⚡ Run All ({pendingAudit.length})
            </button>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {pendingAudit.map((lead) => (
              <div key={lead.id} style={{ ...CARD, padding: '14px 16px', display: 'flex', alignItems: 'center', gap: '12px' }}>
                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                    <span style={{ fontWeight: 600, color: '#C9A84C', fontSize: '14px' }}>{lead.domain}</span>
                    {lead.niche && <span className="cc-badge" style={{ background: 'rgba(255,255,255,0.06)', color: 'rgba(242,237,228,0.6)', fontSize: '10px' }}>{lead.niche}</span>}
                  </div>
                  <div style={{ fontSize: '12px', color: 'rgba(242,237,228,0.4)' }}>{lead.aigencyIssues.slice(0, 2).join(' · ')}</div>
                </div>
                <button
                  onClick={() => { setActiveTab('single'); setAuditDomain(lead.domain) }}
                  style={{ padding: '7px 14px', fontSize: '12px', fontWeight: 600, background: 'rgba(45,212,191,0.1)', color: '#2DD4BF', border: '1px solid rgba(45,212,191,0.25)', borderRadius: '6px', cursor: 'pointer', flexShrink: 0 }}
                >🔍 Audit</button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Single Audit Tab */}
      {activeTab === 'single' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div style={CARD}>
            <div style={{ fontSize: '14px', fontWeight: 600, color: '#F2EDE4', marginBottom: '14px' }}>Run Single Audit</div>
            <div style={{ display: 'flex', gap: '10px', marginBottom: '14px' }}>
              <input
                value={auditDomain}
                onChange={(e) => setAuditDomain(e.target.value)}
                placeholder="domain.com"
                className="cc-input"
                style={{ flex: 1 }}
                onKeyDown={(e) => e.key === 'Enter' && runAudit()}
              />
              <select className="cc-select" style={{ width: '120px' }}>
                {['restaurant', 'artisan', 'medical', 'beauty', 'professional', 'trades'].map(n => (
                  <option key={n} value={n}>{n}</option>
                ))}
              </select>
              <select className="cc-select" style={{ width: '80px' }}>
                {['DE', 'FR', 'AR', 'EN'].map(l => <option key={l} value={l}>{l}</option>)}
              </select>
              <button
                onClick={runAudit}
                disabled={!auditDomain || runningAudit}
                style={{
                  padding: '8px 20px', fontSize: '13px', fontWeight: 700,
                  background: auditDomain && !runningAudit ? '#C9A84C' : 'rgba(201,168,76,0.3)',
                  color: auditDomain && !runningAudit ? '#0A0A0F' : 'rgba(201,168,76,0.5)',
                  border: 'none', borderRadius: '6px', cursor: auditDomain && !runningAudit ? 'pointer' : 'not-allowed',
                  display: 'flex', alignItems: 'center', gap: '6px', flexShrink: 0,
                }}
              >
                {runningAudit ? <><span className="animate-spin" style={{ width: 14, height: 14, border: '2px solid rgba(0,0,0,0.3)', borderTopColor: '#0A0A0F', borderRadius: '50%', display: 'inline-block' }} /> Auditing...</> : '▶ Run Audit'}
              </button>
            </div>
            {runningAudit && (
              <div style={{ background: 'rgba(0,0,0,0.4)', borderRadius: '6px', padding: '12px 16px', fontFamily: 'monospace', fontSize: '12px' }}>
                <div className="log-success animate-fadeIn">✅ Fetching PageSpeed for {auditDomain}...</div>
                <div className="log-info animate-fadeIn" style={{ animationDelay: '0.5s' }}>⏳ Waiting for response...</div>
              </div>
            )}
          </div>
          {auditResult && <AuditResult domain={auditResult} />}
        </div>
      )}

      {/* Batch Audit Tab */}
      {activeTab === 'batch' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div style={CARD}>
            <div style={{ fontSize: '14px', fontWeight: 600, color: '#F2EDE4', marginBottom: '8px' }}>Batch Audit</div>
            <p style={{ margin: '0 0 16px', fontSize: '13px', color: 'rgba(242,237,228,0.4)' }}>Run audits on up to 20 leads sequentially. Each audit is saved to the database and a PDF is generated.</p>
            <div style={{ display: 'flex', gap: '10px', marginBottom: '16px' }}>
              <div style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: '6px', padding: '10px 16px', flex: 1 }}>
                <div style={{ fontSize: '11px', color: 'rgba(242,237,228,0.4)', marginBottom: '4px' }}>In Queue</div>
                <div style={{ fontSize: '22px', fontWeight: 700, color: '#C9A84C' }}>{pendingAudit.length}</div>
              </div>
              <div style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: '6px', padding: '10px 16px', flex: 1 }}>
                <div style={{ fontSize: '11px', color: 'rgba(242,237,228,0.4)', marginBottom: '4px' }}>Batch Limit</div>
                <div style={{ fontSize: '22px', fontWeight: 700, color: '#2DD4BF' }}>20</div>
              </div>
              <div style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: '6px', padding: '10px 16px', flex: 1 }}>
                <div style={{ fontSize: '11px', color: 'rgba(242,237,228,0.4)', marginBottom: '4px' }}>Est. Time</div>
                <div style={{ fontSize: '22px', fontWeight: 700, color: '#4ade80' }}>~{pendingAudit.length * 2}m</div>
              </div>
            </div>

            {batchProgress.running || batchProgress.current > 0 ? (
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', color: 'rgba(242,237,228,0.6)', marginBottom: '8px' }}>
                  <span>{batchProgress.running ? `Auditing ${batchProgress.current + 1}/${batchProgress.total}...` : `Complete — ${batchProgress.current} audits done`}</span>
                  <span style={{ color: batchProgress.running ? '#fbbf24' : '#4ade80' }}>{batchProgress.running ? '⏳' : '✅'}</span>
                </div>
                <div style={{ height: '8px', background: 'rgba(255,255,255,0.06)', borderRadius: '4px', overflow: 'hidden' }}>
                  <div style={{
                    height: '100%',
                    width: `${(batchProgress.current / Math.max(batchProgress.total, 1)) * 100}%`,
                    background: batchProgress.running ? 'linear-gradient(90deg, #C9A84C, #E8C76A)' : '#4ade80',
                    borderRadius: '4px',
                    transition: 'width 0.4s ease',
                  }} />
                </div>
              </div>
            ) : (
              <button
                onClick={runBatch}
                style={{ padding: '11px 24px', fontSize: '14px', fontWeight: 700, background: '#C9A84C', color: '#0A0A0F', border: 'none', borderRadius: '6px', cursor: 'pointer' }}
              >
                ⚡ Start Batch Audit ({Math.min(pendingAudit.length, 20)} leads)
              </button>
            )}
          </div>

          {/* Batch queue list */}
          <div style={CARD}>
            <div style={{ fontSize: '12px', color: 'rgba(242,237,228,0.4)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '12px' }}>Audit Queue</div>
            {pendingAudit.slice(0, 20).map((lead, i) => (
              <div key={lead.id} style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '8px 0', borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
                <span style={{ fontSize: '12px', color: 'rgba(242,237,228,0.25)', width: '20px', textAlign: 'right', flexShrink: 0 }}>{i + 1}</span>
                <span style={{
                  fontSize: '12px',
                  color: batchProgress.current > i ? '#4ade80' : batchProgress.current === i && batchProgress.running ? '#fbbf24' : 'rgba(242,237,228,0.6)',
                }}>
                  {batchProgress.current > i ? '✅' : batchProgress.current === i && batchProgress.running ? '⏳' : '○'} {lead.domain}
                </span>
                {lead.niche && <span className="cc-badge" style={{ background: 'rgba(255,255,255,0.05)', color: 'rgba(242,237,228,0.4)', fontSize: '10px' }}>{lead.niche}</span>}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
