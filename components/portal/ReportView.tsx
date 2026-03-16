'use client'
import ScoreRing from './ScoreRing'
import OutreachEmail from './OutreachEmail'
import { AlertCircle, AlertTriangle, Info, CheckCircle } from 'lucide-react'

interface Issue { title: string; detail: string; severity: 'critical' | 'warning' | 'info'; category: string }
interface Service { name: string; price: string; reason: string }
interface Bundle { name: string; price: string; savings: string; includes: string[] }
interface OutreachData { subject: string; body: string }

export interface AnalysisResult {
  summary: string
  grade: string
  issues: Issue[]
  services: Service[]
  bundle: Bundle
  outreachFR: OutreachData
  outreachEN: OutreachData
  outreachDE: OutreachData
}

interface Props {
  domain: string
  scores: { performance: number; accessibility: number; bestPractices: number; seo: number }
  analysis: AnalysisResult
}

const gradeColor = (g: string) =>
  g === 'A' ? '#16a34a' : g === 'B' ? '#65a30d' : g === 'C' ? '#d97706' : g === 'D' ? '#ea580c' : '#dc2626'

const severityConfig = {
  critical: { icon: AlertCircle, color: 'text-red-400', bg: 'bg-red-400/10', badge: 'bg-red-400/20 text-red-300' },
  warning: { icon: AlertTriangle, color: 'text-amber-400', bg: 'bg-amber-400/10', badge: 'bg-amber-400/20 text-amber-300' },
  info: { icon: Info, color: 'text-blue-400', bg: 'bg-blue-400/10', badge: 'bg-blue-400/20 text-blue-300' },
}

export default function ReportView({ domain, scores, analysis }: Props) {
  const overallScore = Math.round((scores.performance + scores.accessibility + scores.bestPractices + scores.seo) / 4)
  void overallScore
  const sorted = [...analysis.issues].sort((a, b) => {
    const order = { critical: 0, warning: 1, info: 2 }
    return order[a.severity] - order[b.severity]
  })

  return (
    <div id="report" className="space-y-6">
      {/* Header card */}
      <div className="glass-card rounded-xl p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <div className="w-8 h-8 bg-[#C9A84C] rounded-lg flex items-center justify-center">
              <span className="font-bold text-xs text-[#0A0A0F]">AH</span>
            </div>
            <span className="text-[#F2EDE4]/60 text-sm">Website Audit Report</span>
          </div>
          <h2 className="font-playfair text-2xl font-bold text-[#F2EDE4]">{domain}</h2>
          <p className="text-[#F2EDE4]/40 text-xs mt-1">
            {new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })} —
            Confidential — Prepared by AmanaHub
          </p>
        </div>
        <div className="text-center">
          <div className="font-playfair text-6xl font-bold" style={{ color: gradeColor(analysis.grade) }}>
            {analysis.grade}
          </div>
          <div className="text-[#F2EDE4]/50 text-xs">Overall Grade</div>
        </div>
      </div>

      {/* Summary */}
      <div className="glass-card rounded-xl p-5">
        <h3 className="text-[#F2EDE4]/60 text-xs uppercase tracking-widest mb-3">Executive Summary</h3>
        <p className="text-[#F2EDE4] italic leading-relaxed">{analysis.summary}</p>
      </div>

      {/* Score rings */}
      <div className="glass-card rounded-xl p-6">
        <h3 className="text-[#F2EDE4]/60 text-xs uppercase tracking-widest mb-6">PageSpeed Scores (Mobile)</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          <ScoreRing score={scores.performance} label="Performance" />
          <ScoreRing score={scores.accessibility} label="Accessibility" />
          <ScoreRing score={scores.bestPractices} label="Best Practices" />
          <ScoreRing score={scores.seo} label="SEO" />
        </div>
      </div>

      {/* Issues */}
      <div className="glass-card rounded-xl p-6">
        <h3 className="text-[#F2EDE4]/60 text-xs uppercase tracking-widest mb-4">Issues Found</h3>
        <div className="space-y-3">
          {sorted.map((issue, i) => {
            const cfg = severityConfig[issue.severity]
            const Icon = cfg.icon
            return (
              <div key={i} className={`flex gap-3 p-3 rounded-lg ${cfg.bg}`}>
                <Icon size={18} className={`${cfg.color} flex-shrink-0 mt-0.5`} />
                <div className="flex-1 min-w-0">
                  <div className="flex flex-wrap items-center gap-2 mb-1">
                    <span className="text-[#F2EDE4] text-sm font-medium">{issue.title}</span>
                    <span className={`text-xs px-2 py-0.5 rounded-full ${cfg.badge}`}>{issue.severity}</span>
                    <span className="text-xs px-2 py-0.5 rounded-full bg-white/10 text-[#F2EDE4]/60">{issue.category}</span>
                  </div>
                  <p className="text-[#F2EDE4]/60 text-xs">{issue.detail}</p>
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {/* Services */}
      <div className="glass-card rounded-xl p-6">
        <h3 className="text-[#F2EDE4]/60 text-xs uppercase tracking-widest mb-4">Recommended Services</h3>
        <div className="grid sm:grid-cols-2 gap-4">
          {analysis.services.map((svc, i) => (
            <div key={i} className="bg-white/[0.03] rounded-lg p-4 border border-white/5">
              <div className="flex items-start justify-between gap-2 mb-2">
                <span className="text-[#F2EDE4] font-medium text-sm">{svc.name}</span>
                <span className="text-[#C9A84C] font-bold text-sm whitespace-nowrap">{svc.price}</span>
              </div>
              <p className="text-[#F2EDE4]/50 text-xs">{svc.reason}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Bundle */}
      <div className="rounded-xl p-6 border-2 border-[#C9A84C]" style={{ background: 'rgba(201,168,76,0.05)' }}>
        <div className="flex items-start justify-between gap-4 mb-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="bg-[#C9A84C] text-[#0A0A0F] text-xs font-bold px-2 py-0.5 rounded">BEST VALUE</span>
            </div>
            <h3 className="font-playfair text-xl font-bold text-[#F2EDE4]">{analysis.bundle.name}</h3>
            <p className="text-[#F2EDE4]/60 text-sm">{analysis.bundle.savings}</p>
          </div>
          <div className="text-right">
            <div className="font-playfair text-2xl font-bold text-[#C9A84C]">{analysis.bundle.price}</div>
          </div>
        </div>
        <div className="grid sm:grid-cols-2 gap-2 mb-4">
          {analysis.bundle.includes.map((item, i) => (
            <div key={i} className="flex items-center gap-2 text-sm text-[#F2EDE4]/70">
              <CheckCircle size={14} className="text-[#C9A84C] flex-shrink-0" />
              {item}
            </div>
          ))}
        </div>
        <button
          onClick={() => document.getElementById('outreach')?.scrollIntoView({ behavior: 'smooth' })}
          className="px-6 py-2 bg-[#C9A84C] text-[#0A0A0F] rounded-lg font-semibold text-sm hover:bg-[#C9A84C]/90 transition-colors"
        >
          Generate Proposal
        </button>
      </div>

      {/* Outreach */}
      <div id="outreach">
        <OutreachEmail
          outreachEN={analysis.outreachEN}
          outreachFR={analysis.outreachFR}
          outreachDE={analysis.outreachDE}
        />
      </div>
    </div>
  )
}
