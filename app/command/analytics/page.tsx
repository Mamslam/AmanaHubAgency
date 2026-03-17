'use client'
import { mockRevenueData, mockFunnelData } from '@/lib/mock-data'
import {
  LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, Legend, PieChart, Pie, Cell,
} from 'recharts'

const CARD_STYLE = {
  background: 'rgba(255,255,255,0.03)',
  border: '1px solid rgba(255,255,255,0.07)',
  borderRadius: '10px',
  padding: '20px',
}

const TOOLTIP_STYLE = {
  backgroundColor: '#0f0f1a',
  border: '1px solid rgba(255,255,255,0.1)',
  borderRadius: '8px',
  color: '#F2EDE4',
  fontSize: '13px',
}

// Mock analytics data
const weeklyEmails = [
  { week: 'W1 Mar', sent: 62, replied: 3 },
  { week: 'W2 Mar', sent: 78, replied: 4 },
  { week: 'W3 Mar', sent: 91, replied: 5 },
  { week: 'W4 Mar', sent: 81, replied: 3 },
]

const byLanguage = [
  { lang: 'FR', rate: 5.1, sent: 145 },
  { lang: 'DE', rate: 3.8, sent: 118 },
  { lang: 'AR', rate: 6.2, sent: 29 },
  { lang: 'EN', rate: 2.1, sent: 20 },
]

const byNiche = [
  { niche: 'Restaurant', rate: 5.5, deals: 4 },
  { niche: 'Artisan', rate: 4.1, deals: 2 },
  { niche: 'Medical', rate: 3.8, deals: 1 },
  { niche: 'Beauty', rate: 6.0, deals: 1 },
  { niche: 'Trades', rate: 4.8, deals: 0 },
]

const mrrData = [
  { month: 'Oct', mrr: 300 },
  { month: 'Nov', mrr: 400 },
  { month: 'Dec', mrr: 500 },
  { month: 'Jan', mrr: 600 },
  { month: 'Feb', mrr: 700 },
  { month: 'Mar', mrr: 750 },
]

const pieData = [
  { name: 'One-time', value: 3500 },
  { name: 'Recurring', value: 750 },
]
const PIE_COLORS = ['#C9A84C', '#2DD4BF']

const auditScores = [
  { niche: 'Restaurant', performance: 38, seo: 45, accessibility: 62 },
  { niche: 'Artisan', performance: 51, seo: 52, accessibility: 68 },
  { niche: 'Medical', performance: 62, seo: 58, accessibility: 74 },
  { niche: 'Beauty', performance: 44, seo: 49, accessibility: 65 },
  { niche: 'Trades', performance: 29, seo: 35, accessibility: 54 },
]

const commonIssues = [
  { issue: 'No mobile opt.', count: 28 },
  { issue: 'Missing meta tags', count: 24 },
  { issue: 'No SSL', count: 19 },
  { issue: 'Slow loading', count: 35 },
  { issue: 'No GMB listing', count: 22 },
  { issue: 'Poor SEO', count: 31 },
]

export default function AnalyticsPage() {
  return (
    <div className="animate-fadeIn" style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h2 style={{ margin: 0, fontSize: '20px', fontWeight: 700, color: '#F2EDE4' }}>Analytics</h2>
          <p style={{ margin: 0, fontSize: '13px', color: 'rgba(242,237,228,0.45)' }}>March 2026 · All time data</p>
        </div>
        <div style={{ display: 'flex', gap: '8px' }}>
          {['Export CSV', 'Export PNG'].map(label => (
            <button key={label} style={{
              padding: '7px 14px', fontSize: '12px', fontWeight: 600,
              background: 'rgba(255,255,255,0.05)', color: '#F2EDE4',
              border: '1px solid rgba(255,255,255,0.1)', borderRadius: '6px', cursor: 'pointer',
            }}>{label}</button>
          ))}
        </div>
      </div>

      {/* Outreach performance */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
        <div style={CARD_STYLE}>
          <div style={{ fontSize: '12px', color: 'rgba(242,237,228,0.5)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '16px' }}>Emails Sent Per Week</div>
          <ResponsiveContainer width="100%" height={180}>
            <BarChart data={weeklyEmails}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
              <XAxis dataKey="week" tick={{ fill: 'rgba(242,237,228,0.4)', fontSize: 11 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: 'rgba(242,237,228,0.4)', fontSize: 11 }} axisLine={false} tickLine={false} />
              <Tooltip contentStyle={TOOLTIP_STYLE} />
              <Bar dataKey="sent" fill="#C9A84C" opacity={0.8} radius={[3, 3, 0, 0]} name="Sent" />
              <Bar dataKey="replied" fill="#4ade80" opacity={0.8} radius={[3, 3, 0, 0]} name="Replied" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div style={CARD_STYLE}>
          <div style={{ fontSize: '12px', color: 'rgba(242,237,228,0.5)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '16px' }}>Reply Rate By Language</div>
          <ResponsiveContainer width="100%" height={180}>
            <BarChart data={byLanguage}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
              <XAxis dataKey="lang" tick={{ fill: 'rgba(242,237,228,0.4)', fontSize: 12 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: 'rgba(242,237,228,0.4)', fontSize: 11 }} axisLine={false} tickLine={false} tickFormatter={(v) => `${v}%`} />
              <Tooltip contentStyle={TOOLTIP_STYLE} formatter={(v) => [`${v}%`, "Reply Rate"]} />
              <Bar dataKey="rate" fill="#2DD4BF" opacity={0.8} radius={[3, 3, 0, 0]} name="Reply %" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Niche performance + funnel */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
        <div style={CARD_STYLE}>
          <div style={{ fontSize: '12px', color: 'rgba(242,237,228,0.5)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '16px' }}>Reply Rate By Niche</div>
          <ResponsiveContainer width="100%" height={180}>
            <BarChart data={byNiche} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" horizontal={false} />
              <XAxis type="number" tick={{ fill: 'rgba(242,237,228,0.4)', fontSize: 11 }} axisLine={false} tickLine={false} tickFormatter={(v) => `${v}%`} />
              <YAxis type="category" dataKey="niche" tick={{ fill: 'rgba(242,237,228,0.5)', fontSize: 11 }} axisLine={false} tickLine={false} width={70} />
              <Tooltip contentStyle={TOOLTIP_STYLE} formatter={(v) => [`${v}%`, "Reply Rate"]} />
              <Bar dataKey="rate" fill="#C9A84C" opacity={0.8} radius={[0, 4, 4, 0]} name="Reply %" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div style={CARD_STYLE}>
          <div style={{ fontSize: '12px', color: 'rgba(242,237,228,0.5)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '16px' }}>Conversion Funnel</div>
          {mockFunnelData.map((stage, i) => (
            <div key={stage.stage} style={{ marginBottom: '8px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', marginBottom: '3px' }}>
                <span style={{ color: 'rgba(242,237,228,0.6)' }}>{stage.stage}</span>
                <span style={{ color: '#C9A84C' }}>{stage.count} ({stage.rate}%)</span>
              </div>
              <div style={{ height: '6px', background: 'rgba(255,255,255,0.06)', borderRadius: '3px', overflow: 'hidden' }}>
                <div style={{
                  height: '100%',
                  width: `${stage.rate}%`,
                  background: 'linear-gradient(90deg, #C9A84C, #2DD4BF)',
                  borderRadius: '3px',
                  opacity: 1 - i * 0.12,
                }} />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Revenue metrics */}
      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr', gap: '16px' }}>
        <div style={CARD_STYLE}>
          <div style={{ fontSize: '12px', color: 'rgba(242,237,228,0.5)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '16px' }}>Monthly Revenue</div>
          <ResponsiveContainer width="100%" height={180}>
            <LineChart data={mockRevenueData}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
              <XAxis dataKey="month" tick={{ fill: 'rgba(242,237,228,0.4)', fontSize: 11 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: 'rgba(242,237,228,0.4)', fontSize: 11 }} axisLine={false} tickLine={false} tickFormatter={(v) => `€${v}`} />
              <Tooltip contentStyle={TOOLTIP_STYLE} formatter={(v) => [`€${v}`, ""]} />
              <Legend wrapperStyle={{ fontSize: '12px', color: 'rgba(242,237,228,0.5)' }} />
              <Line type="monotone" dataKey="oneTime" stroke="#C9A84C" strokeWidth={2} dot={{ r: 3 }} name="One-time" />
              <Line type="monotone" dataKey="recurring" stroke="#2DD4BF" strokeWidth={2} dot={{ r: 3 }} name="Recurring" />
            </LineChart>
          </ResponsiveContainer>
        </div>

        <div style={CARD_STYLE}>
          <div style={{ fontSize: '12px', color: 'rgba(242,237,228,0.5)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '16px' }}>MRR Growth</div>
          <ResponsiveContainer width="100%" height={180}>
            <LineChart data={mrrData}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
              <XAxis dataKey="month" tick={{ fill: 'rgba(242,237,228,0.4)', fontSize: 10 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: 'rgba(242,237,228,0.4)', fontSize: 10 }} axisLine={false} tickLine={false} tickFormatter={(v) => `€${v}`} />
              <Tooltip contentStyle={TOOLTIP_STYLE} formatter={(v) => [`€${v}`, "MRR"]} />
              <Line type="monotone" dataKey="mrr" stroke="#2DD4BF" strokeWidth={2} dot={{ r: 3 }} />
            </LineChart>
          </ResponsiveContainer>
        </div>

        <div style={CARD_STYLE}>
          <div style={{ fontSize: '12px', color: 'rgba(242,237,228,0.5)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '16px' }}>Revenue Split</div>
          <ResponsiveContainer width="100%" height={140}>
            <PieChart>
              <Pie data={pieData} cx="50%" cy="50%" innerRadius={40} outerRadius={65} dataKey="value">
                {pieData.map((_, i) => (
                  <Cell key={i} fill={PIE_COLORS[i]} opacity={0.85} />
                ))}
              </Pie>
              <Tooltip contentStyle={TOOLTIP_STYLE} formatter={(v) => [`€${v}`, ""]} />
            </PieChart>
          </ResponsiveContainer>
          <div style={{ display: 'flex', justifyContent: 'center', gap: '12px' }}>
            {pieData.map((d, i) => (
              <div key={d.name} style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '11px', color: 'rgba(242,237,228,0.5)' }}>
                <span style={{ width: 8, height: 8, borderRadius: '50%', background: PIE_COLORS[i], display: 'inline-block' }} />
                {d.name}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Audit Insights */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
        <div style={CARD_STYLE}>
          <div style={{ fontSize: '12px', color: 'rgba(242,237,228,0.5)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '16px' }}>Avg Scores By Niche</div>
          <ResponsiveContainer width="100%" height={180}>
            <BarChart data={auditScores}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
              <XAxis dataKey="niche" tick={{ fill: 'rgba(242,237,228,0.4)', fontSize: 10 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: 'rgba(242,237,228,0.4)', fontSize: 11 }} axisLine={false} tickLine={false} domain={[0, 100]} />
              <Tooltip contentStyle={TOOLTIP_STYLE} />
              <Legend wrapperStyle={{ fontSize: '11px', color: 'rgba(242,237,228,0.5)' }} />
              <Bar dataKey="performance" fill="#C9A84C" opacity={0.8} radius={[2, 2, 0, 0]} name="Perf" />
              <Bar dataKey="seo" fill="#2DD4BF" opacity={0.8} radius={[2, 2, 0, 0]} name="SEO" />
              <Bar dataKey="accessibility" fill="#a78bfa" opacity={0.8} radius={[2, 2, 0, 0]} name="A11y" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div style={CARD_STYLE}>
          <div style={{ fontSize: '12px', color: 'rgba(242,237,228,0.5)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '16px' }}>Most Common Issues</div>
          {commonIssues.map((issue) => (
            <div key={issue.issue} style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px' }}>
              <span style={{ fontSize: '12px', color: 'rgba(242,237,228,0.6)', width: '120px', flexShrink: 0 }}>{issue.issue}</span>
              <div style={{ flex: 1, height: '6px', background: 'rgba(255,255,255,0.06)', borderRadius: '3px', overflow: 'hidden' }}>
                <div style={{ height: '100%', width: `${(issue.count / 40) * 100}%`, background: '#C9A84C', borderRadius: '3px', opacity: 0.8 }} />
              </div>
              <span style={{ fontSize: '12px', color: '#C9A84C', fontWeight: 600, width: '28px', textAlign: 'right' }}>{issue.count}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
