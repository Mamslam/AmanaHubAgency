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

const LANG_FLAGS: Record<string, string> = { FR: '🇫🇷', DE: '🇩🇪', AR: '🇸🇦', EN: '🇬🇧' }

// Mock email content per language
const EMAIL_TEMPLATES: Record<string, { subject: string; body: string }> = {
  DE: {
    subject: 'Ihr Webauftritt verliert täglich Kunden — kostenlose Analyse',
    body: `Sehr geehrte/r {{contactName}},

bei einer Analyse Ihrer Website {{domain}} haben wir mehrere kritische Probleme festgestellt, die Sie monatlich schätzungsweise €{{monthlyLoss}} an potenziellen Kunden kosten.

Ihr aktueller Webauftritt:
• Ladezeit: 4.8 Sekunden (Branchendurchschnitt: 2.1s)
• SEO-Score: 41/100 — kaum bei Google sichtbar
• Nicht mobiloptimiert — 65% Ihrer Besucher springen ab

Wir haben einen detaillierten Bericht erstellt, der zeigt, wie wir diese Probleme in 30 Tagen beheben können.

Komplettpaket: Website + SEO + Google Maps = €1,497 (statt €1,491)
→ Bericht im Anhang

Mit freundlichen Grüßen,
Hassan Al-Amin
AmanaHub — Digitalagentur`,
  },
  FR: {
    subject: 'Votre site perd des clients chaque jour — analyse gratuite',
    body: `Bonjour {{contactName}},

En analysant votre site {{domain}}, nous avons identifié plusieurs problèmes critiques qui vous coûtent environ €{{monthlyLoss}} par mois en clients perdus.

Votre présence en ligne actuelle :
• Temps de chargement : 4.8 secondes (moyenne du secteur : 2.1s)
• Score SEO : 41/100 — peu visible sur Google
• Non optimisé mobile — 65% de vos visiteurs repartent

Nous avons préparé un rapport détaillé montrant comment résoudre ces problèmes en 30 jours.

Pack complet : Site + SEO + Google Maps = €1,497
→ Rapport en pièce jointe

Cordialement,
Hassan Al-Amin
AmanaHub — Agence Digitale`,
  },
  EN: {
    subject: 'Your website is losing customers daily — free analysis inside',
    body: `Hello {{contactName}},

After analyzing your website {{domain}}, we identified several critical issues costing you approximately €{{monthlyLoss}} per month in lost customers.

Your current web presence:
• Load time: 4.8 seconds (industry average: 2.1s)
• SEO score: 41/100 — barely visible on Google
• Not mobile-optimized — 65% of visitors leave immediately

We've prepared a detailed report showing how we can fix these issues within 30 days.

Complete package: Website + SEO + Google Maps = €1,497
→ Report attached

Best regards,
Hassan Al-Amin
AmanaHub — Digital Agency`,
  },
  AR: {
    subject: 'موقعك الإلكتروني يخسر عملاء يومياً — تحليل مجاني',
    body: `مرحباً {{contactName}}،

بعد تحليل موقعك {{domain}}، وجدنا مشاكل حرجة تكلّفك حوالي €{{monthlyLoss}} شهرياً من العملاء المفقودين.

وضع موقعك الحالي:
• وقت التحميل: 4.8 ثانية (المتوسط: 2.1 ثانية)
• نتيجة SEO: 41/100 — غير مرئي على Google
• غير محسّن للجوال — 65% من الزوار يغادرون فوراً

أعددنا تقريراً تفصيلياً يوضح كيف يمكننا حل هذه المشاكل خلال 30 يوماً.

الباقة الكاملة: موقع + SEO + خرائط Google = €1,497
← التقرير مرفق

مع التحية،
حسن الأمين
AmanaHub — وكالة رقمية`,
  },
}

// Scheduled email queue mock
const MOCK_QUEUE = [
  { id: '1', domain: 'restaurant-berlin.de', lang: 'DE', status: 'sent', sentAt: '2026-03-17T08:00:00Z', type: 'OUTREACH' },
  { id: '2', domain: 'halal-koeln.de', lang: 'DE', status: 'sent', sentAt: '2026-03-17T08:03:00Z', type: 'OUTREACH' },
  { id: '3', domain: 'boulangerie-paris.fr', lang: 'FR', status: 'replied', sentAt: '2026-03-16T09:00:00Z', type: 'OUTREACH' },
  { id: '4', domain: 'avocat-lyon.fr', lang: 'FR', status: 'pending', sentAt: '', type: 'FOLLOWUP_1' },
  { id: '5', domain: 'electricien-toulouse.fr', lang: 'FR', status: 'pending', sentAt: '', type: 'OUTREACH' },
  { id: '6', domain: 'pharmacie-nice.fr', lang: 'FR', status: 'failed', sentAt: '2026-03-15T10:00:00Z', type: 'OUTREACH' },
]

export default function OutreachPage() {
  const [activeTab, setActiveTab] = useState<'compose' | 'queue' | 'followup'>('compose')
  const [selectedLead, setSelectedLead] = useState<Lead>(mockLeads[1])
  const [activeLang, setActiveLang] = useState('DE')
  const [subject, setSubject] = useState(EMAIL_TEMPLATES.DE.subject)
  const [body, setBody] = useState(EMAIL_TEMPLATES.DE.body)
  const [scheduled, setScheduled] = useState('')

  const handleLangChange = (lang: string) => {
    setActiveLang(lang)
    const tmpl = EMAIL_TEMPLATES[lang] || EMAIL_TEMPLATES.EN
    setSubject(tmpl.subject)
    setBody(tmpl.body.replace('{{contactName}}', selectedLead.contactName || 'Sir/Madam').replace('{{domain}}', selectedLead.domain).replace('{{monthlyLoss}}', '2,100'))
  }

  const statusStyle: Record<string, { color: string; bg: string }> = {
    sent:    { color: '#4ade80', bg: 'rgba(22,163,74,0.1)' },
    replied: { color: '#2DD4BF', bg: 'rgba(45,212,191,0.1)' },
    pending: { color: '#fbbf24', bg: 'rgba(217,119,6,0.1)' },
    failed:  { color: '#f87171', bg: 'rgba(220,38,38,0.1)' },
  }

  return (
    <div className="animate-fadeIn" style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
      {/* Tabs */}
      <div style={{ display: 'flex', gap: '4px', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: '8px', padding: '4px', width: 'fit-content' }}>
        {([['compose', '✍️ Compose'], ['queue', '📬 Queue'], ['followup', '🔄 Follow-up']] as const).map(([tab, label]) => (
          <button key={tab} onClick={() => setActiveTab(tab)} style={{
            padding: '8px 18px', fontSize: '13px', fontWeight: 600,
            background: activeTab === tab ? 'rgba(201,168,76,0.12)' : 'transparent',
            color: activeTab === tab ? '#C9A84C' : 'rgba(242,237,228,0.5)',
            border: `1px solid ${activeTab === tab ? 'rgba(201,168,76,0.3)' : 'transparent'}`,
            borderRadius: '6px', cursor: 'pointer', transition: 'all 0.15s',
          }}>{label}</button>
        ))}
      </div>

      {/* Compose */}
      {activeTab === 'compose' && (
        <div style={{ display: 'grid', gridTemplateColumns: '260px 1fr', gap: '16px' }}>
          {/* Lead selector */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <div style={{ fontSize: '11px', color: 'rgba(242,237,228,0.4)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '4px' }}>Select Lead</div>
            {mockLeads.filter(l => l.status === 'AUDITED' || l.status === 'PROSPECT').map((lead) => (
              <div key={lead.id} onClick={() => { setSelectedLead(lead); handleLangChange(lead.language) }}
                style={{
                  padding: '10px 12px',
                  background: selectedLead.id === lead.id ? 'rgba(201,168,76,0.08)' : 'rgba(255,255,255,0.02)',
                  border: `1px solid ${selectedLead.id === lead.id ? 'rgba(201,168,76,0.3)' : 'rgba(255,255,255,0.06)'}`,
                  borderRadius: '8px',
                  cursor: 'pointer',
                  transition: 'all 0.15s',
                }}
              >
                <div style={{ fontSize: '13px', fontWeight: 600, color: selectedLead.id === lead.id ? '#C9A84C' : '#F2EDE4' }}>{lead.domain}</div>
                <div style={{ fontSize: '11px', color: 'rgba(242,237,228,0.4)', marginTop: '2px' }}>{lead.businessName || 'Unknown'} · {LANG_FLAGS[lead.language]}</div>
              </div>
            ))}
          </div>

          {/* Email composer */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {/* Lead info bar */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: '8px', padding: '10px 14px' }}>
              <span style={{ fontSize: '13px', fontWeight: 600, color: '#C9A84C' }}>{selectedLead.domain}</span>
              <span style={{ fontSize: '13px', color: 'rgba(242,237,228,0.5)' }}>→</span>
              <span style={{ fontSize: '13px', color: '#F2EDE4' }}>{selectedLead.contactEmail || 'No email found'}</span>
              <span style={{ marginLeft: 'auto', fontSize: '11px', color: '#4ade80' }}>📎 Audit PDF attached</span>
            </div>

            {/* Lang switcher */}
            <div style={{ display: 'flex', gap: '4px' }}>
              {['DE', 'FR', 'AR', 'EN'].map(lang => (
                <button key={lang} onClick={() => handleLangChange(lang)} style={{
                  padding: '6px 14px', fontSize: '12px', fontWeight: 600,
                  background: activeLang === lang ? 'rgba(201,168,76,0.12)' : 'rgba(255,255,255,0.04)',
                  color: activeLang === lang ? '#C9A84C' : 'rgba(242,237,228,0.5)',
                  border: `1px solid ${activeLang === lang ? 'rgba(201,168,76,0.3)' : 'rgba(255,255,255,0.08)'}`,
                  borderRadius: '6px', cursor: 'pointer',
                }}>{LANG_FLAGS[lang]} {lang}</button>
              ))}
            </div>

            {/* Subject */}
            <input value={subject} onChange={(e) => setSubject(e.target.value)} className="cc-input" placeholder="Subject line" />

            {/* Body */}
            <textarea
              value={body}
              onChange={(e) => setBody(e.target.value)}
              className="cc-input cc-scroll"
              style={{ height: '280px', resize: 'vertical', fontFamily: 'var(--font-dm-sans), sans-serif', lineHeight: 1.6 }}
            />

            {/* Actions */}
            <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
              <button style={{ padding: '10px 20px', fontSize: '13px', fontWeight: 700, background: '#C9A84C', color: '#0A0A0F', border: 'none', borderRadius: '6px', cursor: 'pointer' }}>
                📤 Send Now
              </button>
              <input
                type="datetime-local"
                value={scheduled}
                onChange={(e) => setScheduled(e.target.value)}
                className="cc-input"
                style={{ width: '200px' }}
              />
              <button style={{ padding: '10px 16px', fontSize: '13px', fontWeight: 600, background: 'rgba(255,255,255,0.05)', color: '#F2EDE4', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '6px', cursor: 'pointer' }}>
                ⏰ Schedule
              </button>
              <button style={{ padding: '10px 16px', fontSize: '13px', fontWeight: 600, background: 'rgba(45,212,191,0.1)', color: '#2DD4BF', border: '1px solid rgba(45,212,191,0.25)', borderRadius: '6px', cursor: 'pointer' }}>
                + Add to Queue
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Queue */}
      {activeTab === 'queue' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
            <p style={{ margin: 0, fontSize: '13px', color: 'rgba(242,237,228,0.4)' }}>{MOCK_QUEUE.length} emails in queue</p>
            <button style={{ padding: '7px 14px', fontSize: '12px', fontWeight: 600, background: 'rgba(220,38,38,0.1)', color: '#f87171', border: '1px solid rgba(220,38,38,0.25)', borderRadius: '6px', cursor: 'pointer' }}>
              🔄 Retry Failed
            </button>
          </div>
          {MOCK_QUEUE.map((email) => {
            const s = statusStyle[email.status] || { color: '#94a3b8', bg: 'rgba(148,163,184,0.1)' }
            return (
              <div key={email.id} style={{ ...CARD, padding: '14px 16px', display: 'flex', alignItems: 'center', gap: '12px' }}>
                <span style={{ fontSize: '14px' }}>{LANG_FLAGS[email.lang] || '🌐'}</span>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: '13px', fontWeight: 600, color: '#C9A84C' }}>{email.domain}</div>
                  <div style={{ fontSize: '11px', color: 'rgba(242,237,228,0.4)', marginTop: '2px' }}>
                    {email.type === 'OUTREACH' ? 'Initial outreach' : 'Follow-up 1'}
                    {email.sentAt ? ` · Sent ${new Date(email.sentAt).toLocaleString('en-GB', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}` : ' · Scheduled'}
                  </div>
                </div>
                <span className="cc-badge" style={{ background: s.bg, color: s.color }}>{email.status}</span>
                {email.status === 'failed' && (
                  <button style={{ padding: '5px 10px', fontSize: '11px', fontWeight: 600, background: 'rgba(220,38,38,0.1)', color: '#f87171', border: '1px solid rgba(220,38,38,0.25)', borderRadius: '4px', cursor: 'pointer' }}>
                    Retry
                  </button>
                )}
              </div>
            )
          })}
        </div>
      )}

      {/* Follow-up Engine */}
      {activeTab === 'followup' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div style={CARD}>
            <div style={{ fontSize: '14px', fontWeight: 600, color: '#F2EDE4', marginBottom: '12px' }}>Follow-up Schedule</div>
            <div style={{ display: 'flex', gap: '16px', marginBottom: '20px' }}>
              {[
                { day: 'Day 3', label: 'Follow-up 1', desc: '"Did you get a chance to look at the report?"', color: '#C9A84C' },
                { day: 'Day 7', label: 'Follow-up 2', desc: '"Quick question about [domain]..."', color: '#2DD4BF' },
                { day: 'Day 14', label: 'Mark Cold', desc: 'Stop sequence, archive lead', color: '#94a3b8' },
              ].map((step) => (
                <div key={step.day} style={{ flex: 1, background: 'rgba(255,255,255,0.03)', border: `1px solid ${step.color}22`, borderRadius: '8px', padding: '14px' }}>
                  <div style={{ fontSize: '11px', color: step.color, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '4px' }}>{step.day}</div>
                  <div style={{ fontSize: '13px', fontWeight: 600, color: '#F2EDE4', marginBottom: '6px' }}>{step.label}</div>
                  <div style={{ fontSize: '12px', color: 'rgba(242,237,228,0.4)', fontStyle: 'italic' }}>{step.desc}</div>
                </div>
              ))}
            </div>
          </div>

          <div style={CARD}>
            <div style={{ fontSize: '12px', color: 'rgba(242,237,228,0.4)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '14px' }}>Pending Follow-ups</div>
            {mockLeads.filter(l => l.status === 'EMAILED').map((lead) => (
              <div key={lead.id} style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '10px 0', borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
                <span style={{ fontSize: '14px' }}>{LANG_FLAGS[lead.language] || '🌐'}</span>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: '13px', fontWeight: 600, color: '#C9A84C' }}>{lead.domain}</div>
                  <div style={{ fontSize: '11px', color: 'rgba(242,237,228,0.4)' }}>Follow-up 1 due in 2 days</div>
                </div>
                <span className="cc-badge" style={{ background: 'rgba(217,119,6,0.1)', color: '#fbbf24' }}>Day 1</span>
                <button style={{ padding: '6px 12px', fontSize: '12px', fontWeight: 600, background: 'rgba(201,168,76,0.1)', color: '#C9A84C', border: '1px solid rgba(201,168,76,0.25)', borderRadius: '6px', cursor: 'pointer' }}>
                  Send Now
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
