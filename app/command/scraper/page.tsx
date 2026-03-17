'use client'
import { useState, useEffect, useRef } from 'react'
import { api } from '@/lib/command-api'
import { getAgentWS } from '@/lib/websocket'
import { SearchForm } from '@/components/scraper/SearchForm'
import { ProgressDisplay } from '@/components/scraper/ProgressDisplay'
import { ResultsTable } from '@/components/scraper/ResultsTable'
import { SummaryStats } from '@/components/scraper/SummaryStats'
import { InsightsCard } from '@/components/scraper/InsightsCard'
import type { ScraperInput, ScrapedLead, ProgressEvent, ScraperSummary, ScraperJob } from '@/types/scraper'

function LeadDetailPanel({ lead, onClose, onImport }: { lead: ScrapedLead; onClose: () => void; onImport: () => void }) {
  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 100,
      background: 'rgba(0,0,0,0.6)',
      display: 'flex', justifyContent: 'flex-end',
    }} onClick={onClose}>
      <div className="cc-scroll animate-slideIn" style={{
        width: '480px', height: '100vh', background: '#0f0f1a',
        border: '1px solid rgba(255,255,255,0.08)',
        overflowY: 'auto', padding: '24px',
      }} onClick={e => e.stopPropagation()}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '20px' }}>
          <div>
            <h2 style={{ margin: '0 0 4px', fontSize: '18px', fontWeight: 700, color: '#F2EDE4' }}>{lead.businessName}</h2>
            {lead.domain && <a href={`https://${lead.domain}`} target="_blank" rel="noopener" style={{ fontSize: '13px', color: '#C9A84C' }}>{lead.domain}</a>}
          </div>
          <button onClick={onClose} style={{ background: 'none', border: 'none', color: 'rgba(242,237,228,0.4)', fontSize: '20px', cursor: 'pointer' }}>✕</button>
        </div>

        {/* Score */}
        <div style={{ display: 'flex', gap: '8px', marginBottom: '16px', flexWrap: 'wrap' }}>
          <span style={{
            padding: '4px 10px', borderRadius: '6px', fontSize: '12px', fontWeight: 700,
            background: lead.score.priority === 'high' ? 'rgba(74,222,128,0.15)' : lead.score.priority === 'med' ? 'rgba(251,191,36,0.12)' : 'rgba(220,38,38,0.1)',
            color: lead.score.priority === 'high' ? '#4ade80' : lead.score.priority === 'med' ? '#fbbf24' : '#f87171',
          }}>★ {lead.score.score}/10 · {lead.score.priority.toUpperCase()}</span>
          <span style={{ padding: '4px 10px', borderRadius: '6px', fontSize: '12px', background: 'rgba(255,255,255,0.05)', color: 'rgba(242,237,228,0.6)' }}>€{lead.score.estimatedDeal.toLocaleString()} est. deal</span>
        </div>

        <div style={{ fontSize: '12px', color: 'rgba(242,237,228,0.5)', marginBottom: '16px', fontStyle: 'italic' }}>{lead.score.reasoning}</div>

        {/* Contact */}
        <div style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: '8px', padding: '14px', marginBottom: '14px' }}>
          <div style={{ fontSize: '11px', color: 'rgba(242,237,228,0.4)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '10px' }}>Contact</div>
          {[
            { label: 'Name', value: lead.contact.contactName },
            { label: 'Email', value: lead.contact.email ? `${lead.contact.email} (${lead.contact.emailConfidence}%)` : null },
            { label: 'Phone', value: lead.contact.phone },
            { label: 'WhatsApp', value: lead.contact.whatsappActive ? lead.contact.whatsapp + ' ✓' : lead.contact.whatsapp || null },
            { label: 'LinkedIn', value: lead.contact.linkedin },
          ].filter(r => r.value).map(({ label, value }) => (
            <div key={label} style={{ display: 'flex', gap: '8px', marginBottom: '5px', fontSize: '12px' }}>
              <span style={{ color: 'rgba(242,237,228,0.4)', width: '60px', flexShrink: 0 }}>{label}</span>
              <span style={{ color: '#F2EDE4' }}>{value}</span>
            </div>
          ))}
        </div>

        {/* Audit scores */}
        {lead.audit && (
          <div style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: '8px', padding: '14px', marginBottom: '14px' }}>
            <div style={{ fontSize: '11px', color: 'rgba(242,237,228,0.4)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '10px' }}>Technical Scores</div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '8px' }}>
              {[
                { label: 'Perf', value: lead.audit.scores.performance },
                { label: 'SEO', value: lead.audit.scores.seo },
                { label: 'A11y', value: lead.audit.scores.accessibility },
                { label: 'AI Vis', value: lead.audit.aiVisibilityScore },
              ].map(({ label, value }) => {
                const color = value >= 90 ? '#4ade80' : value >= 50 ? '#fbbf24' : '#f87171'
                return (
                  <div key={label} style={{ textAlign: 'center', background: 'rgba(255,255,255,0.03)', borderRadius: '6px', padding: '8px' }}>
                    <div style={{ fontSize: '18px', fontWeight: 700, color, lineHeight: 1 }}>{value}</div>
                    <div style={{ fontSize: '10px', color: 'rgba(242,237,228,0.4)', marginTop: '2px' }}>{label}</div>
                  </div>
                )
              })}
            </div>
            <div style={{ display: 'flex', gap: '8px', marginTop: '10px', flexWrap: 'wrap' }}>
              {[
                { label: 'SSL', value: lead.audit.hasSSL },
                { label: 'Mobile', value: lead.audit.hasMobileMenu },
                { label: 'Analytics', value: lead.audit.hasAnalytics },
                { label: 'Schema', value: lead.audit.hasStructuredData },
                { label: 'OG Tags', value: lead.audit.hasOpenGraph },
              ].map(({ label, value }) => (
                <span key={label} style={{ fontSize: '11px', padding: '2px 8px', borderRadius: '4px', background: value ? 'rgba(74,222,128,0.12)' : 'rgba(220,38,38,0.1)', color: value ? '#4ade80' : '#f87171' }}>
                  {value ? '✓' : '✕'} {label}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Issues */}
        {lead.issues.length > 0 && (
          <div style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: '8px', padding: '14px', marginBottom: '14px' }}>
            <div style={{ fontSize: '11px', color: 'rgba(242,237,228,0.4)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '10px' }}>Issues ({lead.issues.length})</div>
            {lead.issues.slice(0, 8).map(issue => {
              const color = issue.severity === 'critical' ? '#f87171' : issue.severity === 'warning' ? '#fbbf24' : '#60a5fa'
              return (
                <div key={issue.key} style={{ display: 'flex', gap: '8px', padding: '6px 0', borderBottom: '1px solid rgba(255,255,255,0.04)', fontSize: '12px' }}>
                  <span style={{ color, width: '55px', flexShrink: 0 }}>{issue.severity}</span>
                  <div>
                    <div style={{ color: '#F2EDE4', marginBottom: '1px' }}>{issue.title}</div>
                    <div style={{ color: 'rgba(242,237,228,0.4)', fontSize: '11px' }}>{issue.detail}</div>
                  </div>
                  {issue.price > 0 && <span style={{ marginLeft: 'auto', color: '#C9A84C', fontWeight: 600, flexShrink: 0 }}>€{issue.price}</span>}
                </div>
              )
            })}
            <div style={{ marginTop: '10px', display: 'flex', justifyContent: 'space-between', fontSize: '13px', fontWeight: 700 }}>
              <span style={{ color: 'rgba(242,237,228,0.5)' }}>Total value</span>
              <span style={{ color: '#C9A84C' }}>€{lead.totalIssueValue.toLocaleString()}</span>
            </div>
          </div>
        )}

        <button
          onClick={onImport}
          style={{ width: '100%', padding: '10px', fontSize: '13px', fontWeight: 700, background: '#C9A84C', color: '#0A0A0F', border: 'none', borderRadius: '7px', cursor: 'pointer' }}
        >📥 Import to Pipeline</button>
      </div>
    </div>
  )
}

export default function ScraperPage() {
  const [running, setRunning] = useState(false)
  const [currentJobId, setCurrentJobId] = useState<string | null>(null)
  const [leads, setLeads] = useState<ScrapedLead[]>([])
  const [progressEvents, setProgressEvents] = useState<ProgressEvent[]>([])
  const [phase, setPhase] = useState<1 | 2 | 3 | 4>(1)
  const [progressCurrent, setProgressCurrent] = useState(0)
  const [progressTotal, setProgressTotal] = useState(0)
  const [progressLabel, setProgressLabel] = useState('')
  const [summary, setSummary] = useState<ScraperSummary | null>(null)
  const [selected, setSelected] = useState<Set<string>>(new Set())
  const [activeTab, setActiveTab] = useState<'results' | 'history'>('results')
  const [activeLead, setActiveLead] = useState<ScrapedLead | null>(null)
  const [jobs, setJobs] = useState<ScraperJob[]>([])
  const [importing, setImporting] = useState(false)
  const wsRef = useRef<ReturnType<typeof getAgentWS> | null>(null)

  // Load job history
  useEffect(() => {
    api.get<ScraperJob[]>('/scraper/jobs').then(setJobs).catch(() => {})
  }, [])

  // WebSocket for progress
  useEffect(() => {
    const ws = getAgentWS()
    wsRef.current = ws
    ws.connect()

    // Listen for scraper progress events via the existing websocket
    const handleMessage = (event: MessageEvent) => {
      try {
        const data = JSON.parse(event.data)
        if (data.type === 'scraper_progress' && data.jobId === currentJobId) {
          const ev: ProgressEvent = data
          setProgressEvents(prev => [...prev, ev])
          setPhase(ev.phase)
          setProgressCurrent(ev.current)
          setProgressTotal(ev.total)
          setProgressLabel(ev.label)

          if (ev.done && ev.leads) {
            setLeads(ev.leads)
            setSummary(ev.summary || null)
            setRunning(false)
            // Refresh jobs
            api.get<ScraperJob[]>('/scraper/jobs').then(setJobs).catch(() => {})
          }
        }
      } catch { /* ignore parse errors */ }
    }

    return () => {}
  }, [currentJobId])

  // Poll for job completion (fallback since WS may not forward scraper events)
  useEffect(() => {
    if (!currentJobId || !running) return
    const interval = setInterval(async () => {
      try {
        const job = await api.get<any>(`/scraper/jobs/${currentJobId}`)
        if (job.status === 'done' && job.leads) {
          setLeads(job.leads)
          setSummary(job.summary || null)
          setRunning(false)
          setPhase(4)
          setProgressLabel(`Complete — ${job.leads.length} leads found`)
          clearInterval(interval)
          api.get<ScraperJob[]>('/scraper/jobs').then(setJobs).catch(() => {})
        } else if (job.status === 'error') {
          setRunning(false)
          setProgressLabel(`Error: ${job.error}`)
          clearInterval(interval)
        }
      } catch { /* ignore */ }
    }, 3000)
    return () => clearInterval(interval)
  }, [currentJobId, running])

  const handleStart = async (input: ScraperInput) => {
    setRunning(true)
    setLeads([])
    setSummary(null)
    setSelected(new Set())
    setProgressEvents([])
    setPhase(1)
    setProgressCurrent(0)
    setProgressTotal(input.limit)
    setProgressLabel(`Searching for ${input.niche} in ${input.city}...`)

    try {
      const { jobId } = await api.post<{ jobId: string }>('/scraper/run', input)
      setCurrentJobId(jobId)
    } catch (e: any) {
      setRunning(false)
      setProgressLabel(`Failed to start: ${e.message}`)
    }
  }

  const handleSelect = (domain: string) => {
    const next = new Set(selected)
    next.has(domain) ? next.delete(domain) : next.add(domain)
    setSelected(next)
  }

  const allSelected = leads.length > 0 && leads.every(l => selected.has(l.domain))
  const toggleSelectAll = () => {
    if (allSelected) setSelected(new Set())
    else setSelected(new Set(leads.map(l => l.domain)))
  }

  const selectByFilter = (filter: 'all' | 'high' | 'email' | 'whatsapp') => {
    if (filter === 'all') setSelected(new Set(leads.map(l => l.domain)))
    else if (filter === 'high') setSelected(new Set(leads.filter(l => l.score.priority === 'high').map(l => l.domain)))
    else if (filter === 'email') setSelected(new Set(leads.filter(l => l.contact.email).map(l => l.domain)))
    else if (filter === 'whatsapp') setSelected(new Set(leads.filter(l => l.contact.whatsappActive).map(l => l.domain)))
  }

  const importSelected = async () => {
    if (!currentJobId || selected.size === 0) return
    setImporting(true)
    try {
      const result = await api.post<{ imported: number }>('/scraper/import', {
        jobId: currentJobId,
        leadIds: Array.from(selected),
      })
      alert(`✅ Imported ${result.imported} leads to pipeline`)
      setSelected(new Set())
    } catch (e: any) {
      alert('Import failed: ' + e.message)
    } finally {
      setImporting(false)
    }
  }

  const exportCSV = () => {
    const toExport = selected.size > 0 ? leads.filter(l => selected.has(l.domain)) : leads
    const headers = ['Business', 'Domain', 'City', 'Score', 'Priority', 'Email', 'Phone', 'WhatsApp', 'Issues', 'Est. Deal', 'AI Score']
    const rows = toExport.map(l => [
      l.businessName,
      l.domain,
      l.city,
      l.score.score,
      l.score.priority,
      l.contact.email || '',
      l.contact.phone || '',
      l.contact.whatsappActive ? l.contact.whatsapp : '',
      l.issues.length,
      l.score.estimatedDeal,
      l.audit?.aiVisibilityScore ?? '',
    ])
    const csv = [headers, ...rows].map(r => r.map(v => `"${v}"`).join(',')).join('\n')
    const blob = new Blob([csv], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `scraper-${new Date().toISOString().slice(0, 10)}.csv`
    a.click()
    URL.revokeObjectURL(url)
  }

  return (
    <div className="animate-fadeIn" style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h2 style={{ margin: '0 0 4px', fontSize: '20px', fontWeight: 700, color: '#F2EDE4' }}>Smart Scraper</h2>
          <p style={{ margin: 0, fontSize: '13px', color: 'rgba(242,237,228,0.4)' }}>
            Find, audit, score and import leads automatically
          </p>
        </div>
        <div style={{ display: 'flex', gap: '4px' }}>
          {(['results', 'history'] as const).map(tab => (
            <button key={tab} onClick={() => setActiveTab(tab)} style={{
              padding: '7px 14px', fontSize: '12px', fontWeight: 600,
              background: activeTab === tab ? 'rgba(201,168,76,0.12)' : 'rgba(255,255,255,0.04)',
              color: activeTab === tab ? '#C9A84C' : 'rgba(242,237,228,0.5)',
              border: `1px solid ${activeTab === tab ? 'rgba(201,168,76,0.3)' : 'transparent'}`,
              borderRadius: '6px', cursor: 'pointer', textTransform: 'capitalize',
            }}>{tab}</button>
          ))}
        </div>
      </div>

      {activeTab === 'results' && (
        <>
          <SearchForm onStart={handleStart} running={running} />

          {(running || progressLabel) && (
            <ProgressDisplay
              events={progressEvents}
              latestLeads={leads}
              currentPhase={phase}
              current={progressCurrent}
              total={progressTotal}
              label={progressLabel}
            />
          )}

          {leads.length > 0 && summary && (
            <SummaryStats leads={leads} summary={summary} />
          )}

          {leads.length > 0 && (
            <>
              <ResultsTable
                leads={leads}
                selected={selected}
                onSelect={handleSelect}
                onSelectAll={toggleSelectAll}
                allSelected={allSelected}
                onRowClick={setActiveLead}
              />

              {/* Bulk action bar */}
              <div style={{
                position: 'sticky', bottom: '16px',
                background: '#0f0f1a',
                border: '1px solid rgba(255,255,255,0.1)',
                borderRadius: '10px',
                padding: '12px 16px',
                display: 'flex', gap: '10px', alignItems: 'center',
                boxShadow: '0 8px 32px rgba(0,0,0,0.6)',
              }}>
                <span style={{ fontSize: '12px', color: 'rgba(242,237,228,0.5)', marginRight: '4px' }}>Select:</span>
                {[
                  { label: 'All', filter: 'all' as const },
                  { label: `Score 8+ (${leads.filter(l => l.score.score >= 8).length})`, filter: 'high' as const },
                  { label: `Email (${leads.filter(l => l.contact.email).length})`, filter: 'email' as const },
                  { label: `WA (${leads.filter(l => l.contact.whatsappActive).length})`, filter: 'whatsapp' as const },
                ].map(({ label, filter }) => (
                  <button key={filter} onClick={() => selectByFilter(filter)} style={{
                    padding: '5px 10px', fontSize: '11px', fontWeight: 600,
                    background: 'rgba(255,255,255,0.05)', color: 'rgba(242,237,228,0.7)',
                    border: '1px solid rgba(255,255,255,0.1)', borderRadius: '5px', cursor: 'pointer',
                  }}>{label}</button>
                ))}
                <div style={{ marginLeft: 'auto', display: 'flex', gap: '8px', alignItems: 'center' }}>
                  {selected.size > 0 && (
                    <span style={{ fontSize: '12px', color: '#C9A84C' }}>{selected.size} selected</span>
                  )}
                  <button
                    onClick={importSelected}
                    disabled={selected.size === 0 || importing}
                    style={{
                      padding: '7px 14px', fontSize: '12px', fontWeight: 600,
                      background: selected.size > 0 ? 'rgba(201,168,76,0.15)' : 'rgba(255,255,255,0.03)',
                      color: selected.size > 0 ? '#C9A84C' : 'rgba(242,237,228,0.3)',
                      border: `1px solid ${selected.size > 0 ? 'rgba(201,168,76,0.3)' : 'rgba(255,255,255,0.06)'}`,
                      borderRadius: '6px', cursor: selected.size > 0 ? 'pointer' : 'not-allowed',
                    }}
                  >{importing ? 'Importing...' : '📥 Import to Pipeline'}</button>
                  <button onClick={exportCSV} style={{ padding: '7px 14px', fontSize: '12px', fontWeight: 600, background: 'rgba(45,212,191,0.1)', color: '#2DD4BF', border: '1px solid rgba(45,212,191,0.25)', borderRadius: '6px', cursor: 'pointer' }}>
                    💾 Export CSV
                  </button>
                </div>
              </div>

              <InsightsCard leads={leads} />
            </>
          )}

          {!running && leads.length === 0 && !progressLabel && (
            <div style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.05)', borderRadius: '10px', padding: '60px', textAlign: 'center' }}>
              <div style={{ fontSize: '32px', marginBottom: '12px' }}>🔍</div>
              <div style={{ fontSize: '16px', fontWeight: 600, color: 'rgba(242,237,228,0.6)', marginBottom: '6px' }}>No scrape results yet</div>
              <div style={{ fontSize: '13px', color: 'rgba(242,237,228,0.3)' }}>Fill in the form above and click Start Scraping</div>
            </div>
          )}
        </>
      )}

      {activeTab === 'history' && (
        <div style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: '10px', overflow: 'hidden' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.07)' }}>
                {['Date', 'Status', 'Leads', 'High Priority', 'Emails', 'WA', 'Est. Value'].map(h => (
                  <th key={h} style={{ padding: '12px 14px', textAlign: 'left', color: 'rgba(242,237,228,0.4)', fontWeight: 600, fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {jobs.length === 0 ? (
                <tr><td colSpan={7} style={{ padding: '40px', textAlign: 'center', color: 'rgba(242,237,228,0.3)' }}>No scraping jobs yet</td></tr>
              ) : jobs.map(job => (
                <tr key={job.jobId} style={{ borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
                  <td style={{ padding: '10px 14px', color: 'rgba(242,237,228,0.6)', fontSize: '12px' }}>
                    {new Date(job.startedAt).toLocaleString('en-GB', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}
                  </td>
                  <td style={{ padding: '10px 14px' }}>
                    <span style={{ fontSize: '12px', padding: '2px 8px', borderRadius: '4px', background: job.status === 'done' ? 'rgba(74,222,128,0.12)' : job.status === 'error' ? 'rgba(220,38,38,0.1)' : 'rgba(251,191,36,0.12)', color: job.status === 'done' ? '#4ade80' : job.status === 'error' ? '#f87171' : '#fbbf24' }}>
                      {job.status}
                    </span>
                  </td>
                  <td style={{ padding: '10px 14px', color: '#F2EDE4', fontWeight: 600 }}>{job.leadCount}</td>
                  <td style={{ padding: '10px 14px', color: '#4ade80' }}>{job.summary?.highPriority ?? '—'}</td>
                  <td style={{ padding: '10px 14px', color: '#C9A84C' }}>{job.summary?.withEmail ?? '—'}</td>
                  <td style={{ padding: '10px 14px', color: '#2DD4BF' }}>{job.summary?.withWhatsApp ?? '—'}</td>
                  <td style={{ padding: '10px 14px', color: '#C9A84C', fontWeight: 600 }}>
                    {job.summary ? `€${job.summary.estimatedPipelineValue.toLocaleString()}` : '—'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {activeLead && (
        <LeadDetailPanel
          lead={activeLead}
          onClose={() => setActiveLead(null)}
          onImport={async () => {
            if (!currentJobId) return
            try {
              await api.post('/scraper/import', { jobId: currentJobId, leadIds: [activeLead.domain] })
              alert('✅ Imported to pipeline')
              setActiveLead(null)
            } catch (e: any) { alert('Failed: ' + e.message) }
          }}
        />
      )}
    </div>
  )
}
