import React from 'react'
import type { LeadStatus } from '@/types'

const STATUS_STYLES: Record<LeadStatus, { bg: string; color: string }> = {
  PROSPECT:    { bg: 'rgba(148,163,184,0.1)', color: '#94a3b8' },
  AUDITED:     { bg: 'rgba(45,212,191,0.1)',  color: '#2DD4BF' },
  EMAILED:     { bg: 'rgba(201,168,76,0.12)', color: '#C9A84C' },
  REPLIED:     { bg: 'rgba(22,163,74,0.12)',  color: '#4ade80' },
  NEGOTIATING: { bg: 'rgba(217,119,6,0.12)',  color: '#fbbf24' },
  CLOSED:      { bg: 'rgba(22,163,74,0.15)',  color: '#16a34a' },
  DELIVERED:   { bg: 'rgba(45,212,191,0.15)', color: '#2DD4BF' },
  COLD:        { bg: 'rgba(220,38,38,0.1)',   color: '#f87171' },
}

export function StatusBadge({ status }: { status: LeadStatus }) {
  const s = STATUS_STYLES[status]
  return (
    <span className="cc-badge" style={{ background: s.bg, color: s.color }}>
      {status.charAt(0) + status.slice(1).toLowerCase().replace('_', '-')}
    </span>
  )
}

export function NicheBadge({ niche }: { niche: string }) {
  const colors: Record<string, string> = {
    restaurant:   '#f97316',
    artisan:      '#a78bfa',
    professional: '#38bdf8',
    medical:      '#34d399',
    beauty:       '#f472b6',
    trades:       '#fbbf24',
    education:    '#60a5fa',
    retail:       '#fb923c',
    default:      '#94a3b8',
  }
  const color = colors[niche] ?? colors.default
  return (
    <span className="cc-badge" style={{ background: `${color}18`, color }}>
      {niche}
    </span>
  )
}

export function ScoreBadge({ score }: { score: number }) {
  const color = score >= 8 ? '#4ade80' : score >= 6 ? '#fbbf24' : '#f87171'
  return (
    <span className="cc-badge" style={{ background: `${color}15`, color, minWidth: '28px', textAlign: 'center' }}>
      {score}
    </span>
  )
}

export function LangFlag({ lang }: { lang: string }) {
  const flags: Record<string, string> = { FR: '🇫🇷', DE: '🇩🇪', AR: '🇸🇦', EN: '🇬🇧' }
  return <span title={lang} style={{ fontSize: '16px' }}>{flags[lang] ?? '🌐'}</span>
}
