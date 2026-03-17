'use client'
import { useState, useEffect, useCallback } from 'react'
import { api } from '@/lib/command-api'
import type { Lead, Audit } from '@/types'

const CARD = {
  background: 'rgba(255,255,255,0.03)',
  border: '1px solid rgba(255,255,255,0.07)',
  borderRadius: '10px',
  padding: '20px',
}

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

function scoreColor(s: number) {
  if (s >= 90) return '#4ade80'
  if (s >= 50) return '#fbbf24'
  return '#f87171'
}

function grade(avg: number) {
  if (avg >= 90) return { g: 'A', c: '#4ade80' }
  if (avg >= 75) return { g: 'B', c: '#86efac' }
  if (avg >= 60) return { g: 'C', c: '#fbbf24' }
  if (avg >= 40) return { g: 'D', c: '#f97316' }
  return { g: 'F', c: '#dc2626' }
}

function AuditResult({ result }: { result: { audit: Audit; pageSpeed: any; analysis: any } }) {
  const { audit, analysis } = result
  const scores = audit.scores as any
  const avg = Math.round((scores.performance + scores.accessibility + scores.bestPractices + scores.seo) / 4)
  const { g, c } = grade(avg)
  const roi = audit.roiAnalysis as any
  const pricing = audit.dynamicPricing as any
  const emails = audit.outreachEmails as any
  const issues = (audit.issues as any[]) || []

  return (
    <div className="animate-fadeIn" style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
      <div style={{ ...CARD, display: 'flex', alignItems: 'center', gap: '24px' }}>
        <div style={{ textAlign: 'center', padding: '8px 20px', border: `2px solid ${c}`, borderRadius: '10px', minWidth: '70px' }}>
          <div style={{ fontSize: '40px', fontWeight: 800, color: c, lineHeight: 1 }}>{g}</div>
          <div style={{ fontSize: '11px', color: 'rgba(242,237,228,0.4)', marginTop: '2px' }}>Grade</div>
        </div>
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: '13px', color: 'rgba(242,237,228,0.4)', marginBottom: '12px' }}>Audit completed · {new Date(audit.createdAt).toLocaleDateString('en-GB')}</div>
          <div style={{ display: 'flex', gap: '20px' }}>
            <ScoreRing score={scores.performance} label="Perf" color={scoreColor(scores.performance)} />
            <ScoreRing score={scores.accessibility} label="A11y" color={scoreColor(scores.accessibility)} />
            <ScoreRing score={scores.bestPractices} label="Best P." color={scoreColor(scores.bestPractices)} />
            <ScoreRing score={scores.seo} label="SEO" color={scoreColor(scores.seo)} />
          </div>
        </div>
        {roi && (
          <div style={{ background: 'rgba(201,168,76,0.08)', border: '1px solid rgba(201,168,76,0.2)', borderRadius: '8px', padding: '16px', minWidth: '160px', textAlign: 'center' }}>
            <div style={{ fontSize: '11px', color: 'rgba(242,237,228,0.4)', marginBottom: '4px' }}>Est. Monthly Loss</div>
            <div style={{ fontSize: '24px', fontWeight: 700, color: '#C9A84C' }}>€{roi.monthlyLoss?.toLocaleString() || '—'}</div>
            <div style={{ fontSize: '11px', color: 'rgba(242,237,228,0.4)', marginTop: '4px' }}>from poor web presence</div>
          </div>
        )}
      </div>

      {issues.length > 0 && (
        <div style={CARD}>
          <div style={{ fontSize: '12px', color: 'rgba(242,237,228,0.4)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '14px' }}>Issues Found ({issues.length})</div>
          {issues.map((issue: any) => {
            const sev = ({ critical: { color: '#f87171', bg: 'rgba(220,38,38,0.1)', label: 'Critical' }, warning: { color: '#fbbf24', bg: 'rgba(217,119,6,0.1)', label: 'Warning' }, info: { color: '#60a5fa', bg: 'rgba(96,165,250,0.1)', label: 'Info' } } as any)[issue.severity] || { color: '#94a3b8', bg: 'rgba(148,163,184,0.1)', label: issue.severity }
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
      )}

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
        {pricing?.services && (
          <div style={CARD}>
            <div style={{ fontSize: '12px', color: 'rgba(242,237,228,0.4)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '14px' }}>Bundle Pricing</div>
            {pricing.services.filter((s: any) => s.included).map((s: any, i: number) => (
              <div key={i} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', padding: '6px 0', borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
                <span style={{ color: 'rgba(242,237,228,0.7)' }}>{s.name}</span>
                <span style={{ color: '#C9A84C', fontWeight: 600 }}>€{s.price}</span>
              </div>
            ))}
            <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '10px', paddingTop: '10px', borderTop: '1px solid rgba(201,168,76,0.2)', fontSize: '15px', fontWeight: 700 }}>
              <span style={{ color: 'rgba(242,237,228,0.5)' }}>Bundle ({pricing.bundleDiscount}% off)</span>
              <span style={{ color: '#C9A84C' }}>€{pricing.bundlePrice}</span>
            </div>
          </div>
        )}

        {emails && Object.keys(emails).length > 0 && (
          <div style={CARD}>
            <div style={{ fontSize: '12px', color: 'rgba(242,237,228,0.4)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '14px' }}>
              Outreach Email ({Object.keys(emails)[0]})
            </div>
            {(() => {
              const lang = Object.keys(emails)[0]
              const email = emails[lang]
              return (
                <>
                  <div style={{ fontSize: '12px', fontWeight: 600, color: '#F2EDE4', marginBottom: '6px' }}>{email.subject}</div>
                  <div style={{ fontSize: '12px', color: 'rgba(242,237,228,0.5)', fontStyle: 'italic', lineHeight: 1.6, maxHeight: '80px', overflow: 'hidden' }}>
                    {email.body.slice(0, 180)}...
                  </div>
                  <div style={{ display: 'flex', gap: '8px', marginTop: '14px' }}>
                    <button style={{ flex: 1, padding: '8px', fontSize: '12px', fontWeight: 600, background: 'rgba(201,168,76,0.12)', color: '#C9A84C', border: '1px solid rgba(201,168,76,0.3)', borderRadius: '6px', cursor: 'pointer' }}>📧 Send Email</button>
                    <button style={{ flex: 1, padding: '8px', fontSize: '12px', fontWeight: 600, background: 'rgba(255,255,255,0.05)', color: '#F2EDE4', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '6px', cursor: 'pointer' }}>📄 Copy</button>
                  </div>
                </>
              )
            })()}
          </div>
        )}
      </div>
    </div>
  )
}

export default function AuditPage() {
  const [activeTab, setActiveTab] = useState<'queue' | 'single' | 'batch'>('queue')
  const [runningAudit, setRunningAudit] = useState(false)
  const [auditDomain, setAuditDomain] = useState('')
  const [auditNiche, setAuditNiche] = useState('restaurant')
  const [auditLang, setAuditLang] = useState('DE')
  const [auditResult, setAuditResult] = useState<any>(null)
  const [auditError, setAuditError] = useState('')
  const [auditLog, setAuditLog] = useState<string[]>([])
  const [pendingLeads, setPendingLeads] = useState<Lead[]>([])
  const [batchProgress, setBatchProgress] = useState<{ current: number; total: number; running: boolean; done: Set<string> }>({ current: 0, total: 0, running: false, done: new Set() })

  const fetchPending = useCallback(async () => {
    try {
      const res = await api.get<{ leads: Lead[] }>('/leads?status=PROSPECT&limit=50')
      setPendingLeads(res.leads)
    } catch {
      // backend may not be running
    }
  }, [])

  useEffect(() => { fetchPending() }, [fetchPending])

  const runAudit = async () => {
    if (!auditDomain) return
    setRunningAudit(true)
    setAuditResult(null)
    setAuditError('')
    setAuditLog(['Fetching PageSpeed scores...'])
    try {
      setAuditLog(prev => [...prev, 'Running Claude analysis...'])
      const result = await api.post<any>('/audit/run', { domain: auditDomain, niche: auditNiche, language: auditLang })
      setAuditLog(prev => [...prev, '✅ Audit complete, saved to database.'])
      setAuditResult(result)
    } catch (e: any) {
      setAuditError(e.message)
      setAuditLog(prev => [...prev, `❌ Error: ${e.message}`])
    } finally {
      setRunningAudit(false)
    }
  }

  const runBatch = async () => {
    const toAudit = pendingLeads.slice(0, 20)
    setBatchProgress({ current: 0, total: toAudit.length, running: true, done: new Set() })
    for (let i = 0; i < toAudit.length; i++) {
      const lead = toAudit[i]
      try {
        await api.post('/audit/run', { leadId: lead.id, domain: lead.domain, niche: lead.niche, language: lead.language })
      } catch {
        // continue on error
      }
      setBatchProgress(prev => ({ ...prev, current: i + 1, done: new Set([...prev.done, lead.id]) }))
    }
    setBatchProgress(prev => ({ ...prev, running: false }))
    fetchPending()
  }

  return (
    <div className="animate-fadeIn" style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
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
            <p style={{ margin: 0, fontSize: '13px', color: 'rgba(242,237,228,0.4)' }}>{pendingLeads.length} leads pending audit</p>
            <button
              onClick={() => { setActiveTab('batch') }}
              style={{ padding: '9px 18px', fontSize: '13px', fontWeight: 600, background: 'rgba(201,168,76,0.12)', color: '#C9A84C', border: '1px solid rgba(201,168,76,0.3)', borderRadius: '6px', cursor: 'pointer' }}
            >⚡ Run All ({pendingLeads.length})</button>
          </div>
          {pendingLeads.length === 0 ? (
            <div style={{ ...CARD, textAlign: 'center', color: 'rgba(242,237,228,0.3)', fontSize: '13px', padding: '40px' }}>
              No leads pending audit. Add leads first.
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {pendingLeads.map((lead) => (
                <div key={lead.id} style={{ ...CARD, padding: '14px 16px', display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                      <span style={{ fontWeight: 600, color: '#C9A84C', fontSize: '14px' }}>{lead.domain}</span>
                      {lead.niche && <span className="cc-badge" style={{ background: 'rgba(255,255,255,0.06)', color: 'rgba(242,237,228,0.6)', fontSize: '10px' }}>{lead.niche}</span>}
                    </div>
                    <div style={{ fontSize: '12px', color: 'rgba(242,237,228,0.4)' }}>{lead.aigencyIssues.slice(0, 2).join(' · ')}</div>
                  </div>
                  <button
                    onClick={() => { setActiveTab('single'); setAuditDomain(lead.domain); setAuditNiche(lead.niche || 'restaurant'); setAuditLang(lead.language || 'DE') }}
                    style={{ padding: '7px 14px', fontSize: '12px', fontWeight: 600, background: 'rgba(45,212,191,0.1)', color: '#2DD4BF', border: '1px solid rgba(45,212,191,0.25)', borderRadius: '6px', cursor: 'pointer', flexShrink: 0 }}
                  >🔍 Audit</button>
                </div>
              ))}
            </div>
          )}
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
              <select className="cc-select" style={{ width: '120px' }} value={auditNiche} onChange={e => setAuditNiche(e.target.value)}>
                {['restaurant', 'artisan', 'medical', 'beauty', 'professional', 'trades'].map(n => (
                  <option key={n} value={n}>{n}</option>
                ))}
              </select>
              <select className="cc-select" style={{ width: '80px' }} value={auditLang} onChange={e => setAuditLang(e.target.value)}>
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
                {runningAudit
                  ? <><span className="animate-spin" style={{ width: 14, height: 14, border: '2px solid rgba(0,0,0,0.3)', borderTopColor: '#0A0A0F', borderRadius: '50%', display: 'inline-block' }} /> Auditing...</>
                  : '▶ Run Audit'}
              </button>
            </div>
            {(runningAudit || auditLog.length > 0) && (
              <div style={{ background: 'rgba(0,0,0,0.4)', borderRadius: '6px', padding: '12px 16px', fontFamily: 'monospace', fontSize: '12px', display: 'flex', flexDirection: 'column', gap: '4px' }}>
                {auditLog.map((line, i) => (
                  <div key={i} className="animate-fadeIn" style={{ color: line.startsWith('❌') ? '#f87171' : line.startsWith('✅') ? '#4ade80' : 'rgba(242,237,228,0.6)' }}>
                    {line}
                  </div>
                ))}
              </div>
            )}
            {auditError && (
              <div style={{ marginTop: '8px', fontSize: '13px', color: '#f87171' }}>❌ {auditError}</div>
            )}
          </div>
          {auditResult && <AuditResult result={auditResult} />}
        </div>
      )}

      {/* Batch Audit Tab */}
      {activeTab === 'batch' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div style={CARD}>
            <div style={{ fontSize: '14px', fontWeight: 600, color: '#F2EDE4', marginBottom: '8px' }}>Batch Audit</div>
            <p style={{ margin: '0 0 16px', fontSize: '13px', color: 'rgba(242,237,228,0.4)' }}>Run real audits on up to 20 leads. Each audit hits Google PageSpeed + Claude and is saved to the database.</p>
            <div style={{ display: 'flex', gap: '10px', marginBottom: '16px' }}>
              {[
                { label: 'In Queue', value: pendingLeads.length, color: '#C9A84C' },
                { label: 'Batch Limit', value: 20, color: '#2DD4BF' },
                { label: 'Est. Time', value: `~${pendingLeads.length * 2}m`, color: '#4ade80' },
              ].map(({ label, value, color }) => (
                <div key={label} style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: '6px', padding: '10px 16px', flex: 1 }}>
                  <div style={{ fontSize: '11px', color: 'rgba(242,237,228,0.4)', marginBottom: '4px' }}>{label}</div>
                  <div style={{ fontSize: '22px', fontWeight: 700, color }}>{value}</div>
                </div>
              ))}
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
                    borderRadius: '4px', transition: 'width 0.4s ease',
                  }} />
                </div>
              </div>
            ) : (
              <button
                onClick={runBatch}
                disabled={pendingLeads.length === 0}
                style={{ padding: '11px 24px', fontSize: '14px', fontWeight: 700, background: pendingLeads.length > 0 ? '#C9A84C' : 'rgba(201,168,76,0.3)', color: pendingLeads.length > 0 ? '#0A0A0F' : 'rgba(201,168,76,0.5)', border: 'none', borderRadius: '6px', cursor: pendingLeads.length > 0 ? 'pointer' : 'not-allowed' }}
              >⚡ Start Batch Audit ({Math.min(pendingLeads.length, 20)} leads)</button>
            )}
          </div>

          <div style={CARD}>
            <div style={{ fontSize: '12px', color: 'rgba(242,237,228,0.4)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '12px' }}>Audit Queue</div>
            {pendingLeads.length === 0 ? (
              <div style={{ textAlign: 'center', color: 'rgba(242,237,228,0.3)', fontSize: '13px', padding: '20px' }}>No leads in queue</div>
            ) : pendingLeads.slice(0, 20).map((lead, i) => (
              <div key={lead.id} style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '8px 0', borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
                <span style={{ fontSize: '12px', color: 'rgba(242,237,228,0.25)', width: '20px', textAlign: 'right', flexShrink: 0 }}>{i + 1}</span>
                <span style={{
                  fontSize: '12px',
                  color: batchProgress.done.has(lead.id) ? '#4ade80' : batchProgress.running && batchProgress.current === i ? '#fbbf24' : 'rgba(242,237,228,0.6)',
                }}>
                  {batchProgress.done.has(lead.id) ? '✅' : batchProgress.running && batchProgress.current === i ? '⏳' : '○'} {lead.domain}
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
