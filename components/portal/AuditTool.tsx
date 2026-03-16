'use client'
import { useState } from 'react'
import { clearPortalToken } from '@/lib/portal-auth'
import { exportToPDF } from '@/lib/pdf-export'
import AuditHistory, { HistoryEntry } from './AuditHistory'
import ReportView, { AnalysisResult } from './ReportView'
import { Search, LogOut, Download, RefreshCw, Share2, Loader2, Menu, X } from 'lucide-react'

const HISTORY_KEY = 'ah_audit_history'

function loadHistory(): HistoryEntry[] {
  if (typeof window === 'undefined') return []
  try { return JSON.parse(localStorage.getItem(HISTORY_KEY) ?? '[]') } catch { return [] }
}

function saveHistory(entries: HistoryEntry[]) {
  localStorage.setItem(HISTORY_KEY, JSON.stringify(entries.slice(0, 10)))
}

type Phase = 'idle' | 'pagespeed' | 'claude' | 'done'

export default function AuditTool() {
  const [url, setUrl] = useState('')
  const [phase, setPhase] = useState<Phase>('idle')
  const [error, setError] = useState('')
  const [history, setHistory] = useState<HistoryEntry[]>(loadHistory)
  const [currentReport, setCurrentReport] = useState<{ domain: string; scores: HistoryEntry['scores']; analysis: AnalysisResult } | null>(null)
  const [sidebarOpen, setSidebarOpen] = useState(false)

  const signOut = () => { clearPortalToken(); window.location.reload() }

  const runAudit = async () => {
    setError('')
    let target = url.trim()
    if (!target.startsWith('http')) target = 'https://' + target
    const domain = new URL(target).hostname

    try {
      setPhase('pagespeed')
      const psRes = await fetch('/api/pagespeed', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url: target }),
      })
      const psData = await psRes.json()
      if (!psRes.ok || psData.error) throw new Error(psData.error ?? 'PageSpeed fetch failed')
      const { scores, failingAudits } = psData

      setPhase('claude')
      const res = await fetch('/api/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ domain, scores, failingAudits }),
      })
      if (!res.ok) throw new Error('Analysis failed')
      const analysis: AnalysisResult = await res.json()

      const overallScore = Math.round((scores.performance + scores.accessibility + scores.bestPractices + scores.seo) / 4)
      const entry: HistoryEntry = { domain, overallScore, grade: analysis.grade, date: new Date().toISOString(), scores, report: analysis }
      const newHistory = [entry, ...history.filter(h => h.domain !== domain)]
      setHistory(newHistory)
      saveHistory(newHistory)

      setCurrentReport({ domain, scores, analysis })
      setPhase('done')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error')
      setPhase('idle')
    }
  }

  const loadFromHistory = (entry: HistoryEntry) => {
    setCurrentReport({ domain: entry.domain, scores: entry.scores, analysis: entry.report as AnalysisResult })
    setPhase('done')
    setSidebarOpen(false)
  }

  const shareReport = () => {
    if (!currentReport) return
    const shareUrl = `${window.location.origin}/portal?domain=${encodeURIComponent(currentReport.domain)}`
    navigator.clipboard.writeText(shareUrl)
  }

  return (
    <div className="min-h-screen bg-[#0A0A0F] flex flex-col">
      {/* Top bar */}
      <header className="h-14 border-b border-white/10 flex items-center justify-between px-4 sm:px-6 flex-shrink-0">
        <div className="flex items-center gap-3">
          <button className="md:hidden text-[#F2EDE4]/60 mr-1" onClick={() => setSidebarOpen(!sidebarOpen)}>
            {sidebarOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
          <div className="w-8 h-8 bg-[#C9A84C] rounded-lg flex items-center justify-center">
            <span className="font-bold text-xs text-[#0A0A0F]">AH</span>
          </div>
          <span className="font-semibold text-[#F2EDE4] text-sm">Audit Portal</span>
          <span className="text-xs bg-white/10 text-[#F2EDE4]/60 px-2 py-0.5 rounded">Internal</span>
        </div>
        <button onClick={signOut} className="flex items-center gap-1.5 text-[#F2EDE4]/50 hover:text-[#F2EDE4] text-sm transition-colors">
          <LogOut size={14} /> Sign Out
        </button>
      </header>

      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar */}
        <aside className={`${sidebarOpen ? 'flex' : 'hidden'} md:flex flex-col w-60 border-r border-white/10 bg-[#0A0A0F] absolute md:relative z-30 h-full md:h-auto py-4`}>
          <AuditHistory history={history} onSelect={loadFromHistory} onClear={() => { setHistory([]); saveHistory([]) }} />
        </aside>

        {/* Main */}
        <main className="flex-1 overflow-y-auto p-4 sm:p-6">
          {/* URL input */}
          <div className="max-w-2xl mx-auto mb-8">
            <div className="flex gap-3">
              <div className="flex-1 flex items-center gap-2 px-4 py-3 glass-card rounded-xl">
                <Search size={16} className="text-[#F2EDE4]/40 flex-shrink-0" />
                <input
                  value={url}
                  onChange={e => setUrl(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && phase === 'idle' && runAudit()}
                  placeholder="Enter website URL to audit"
                  className="flex-1 bg-transparent text-[#F2EDE4] placeholder-white/30 focus:outline-none text-sm"
                />
              </div>
              <button
                onClick={runAudit}
                disabled={phase !== 'idle' || !url.trim()}
                className="px-5 py-3 bg-[#C9A84C] text-[#0A0A0F] rounded-xl font-semibold text-sm hover:bg-[#C9A84C]/90 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center gap-2 whitespace-nowrap"
              >
                {phase !== 'idle' && phase !== 'done' ? <Loader2 size={14} className="animate-spin" /> : null}
                Run Full Audit
              </button>
            </div>

            {/* Loading states */}
            {(phase === 'pagespeed' || phase === 'claude') && (
              <div className="mt-4 flex items-center gap-2 text-[#F2EDE4]/60 text-sm">
                <Loader2 size={14} className="animate-spin text-[#C9A84C]" />
                {phase === 'pagespeed' ? 'Fetching PageSpeed data...' : 'Claude is analyzing results...'}
              </div>
            )}
            {error && <p className="mt-3 text-red-400 text-sm">{error}</p>}
          </div>

          {/* Report */}
          {currentReport && phase === 'done' && (
            <div className="max-w-4xl mx-auto">
              <ReportView domain={currentReport.domain} scores={currentReport.scores} analysis={currentReport.analysis} />
            </div>
          )}

          {!currentReport && phase === 'idle' && (
            <div className="text-center py-20 text-[#F2EDE4]/30">
              <Search size={40} className="mx-auto mb-4 opacity-30" />
              <p>Enter a URL above to run a full audit</p>
            </div>
          )}
        </main>
      </div>

      {/* Sticky action bar */}
      {currentReport && phase === 'done' && (
        <div className="border-t border-white/10 px-4 sm:px-6 py-3 flex items-center gap-3 bg-[#0A0A0F] no-print">
          <button
            onClick={() => exportToPDF(currentReport.domain)}
            className="flex items-center gap-2 px-4 py-2 bg-white/5 hover:bg-white/10 text-[#F2EDE4] rounded-lg text-sm transition-colors"
          >
            <Download size={14} /> Download PDF
          </button>
          <button
            onClick={() => { setCurrentReport(null); setPhase('idle'); setUrl('') }}
            className="flex items-center gap-2 px-4 py-2 bg-[#C9A84C]/20 hover:bg-[#C9A84C]/30 text-[#C9A84C] rounded-lg text-sm transition-colors"
          >
            <RefreshCw size={14} /> Run New Audit
          </button>
          <button
            onClick={shareReport}
            className="flex items-center gap-2 px-4 py-2 bg-white/5 hover:bg-white/10 text-[#F2EDE4] rounded-lg text-sm transition-colors"
          >
            <Share2 size={14} /> Share Report
          </button>
        </div>
      )}
    </div>
  )
}
