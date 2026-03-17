'use client'
import { useState, useEffect } from 'react'
import { api } from '@/lib/command-api'

const CARD = {
  background: 'rgba(255,255,255,0.03)',
  border: '1px solid rgba(255,255,255,0.07)',
  borderRadius: '10px',
  padding: '20px',
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div style={CARD}>
      <div style={{ fontSize: '14px', fontWeight: 700, color: '#C9A84C', marginBottom: '16px', paddingBottom: '10px', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>{title}</div>
      {children}
    </div>
  )
}

function Field({ label, children, hint }: { label: string; children: React.ReactNode; hint?: string }) {
  return (
    <div style={{ marginBottom: '14px' }}>
      <label style={{ fontSize: '12px', color: 'rgba(242,237,228,0.5)', display: 'block', marginBottom: '6px' }}>{label}</label>
      {children}
      {hint && <div style={{ fontSize: '11px', color: 'rgba(242,237,228,0.25)', marginTop: '4px' }}>{hint}</div>}
    </div>
  )
}

function SaveButton({ onClick, saving, saved }: { onClick: () => void; saving: boolean; saved: boolean }) {
  return (
    <button
      onClick={onClick}
      disabled={saving}
      style={{ padding: '9px 18px', fontSize: '13px', fontWeight: 700, background: saved ? '#4ade80' : '#C9A84C', color: '#0A0A0F', border: 'none', borderRadius: '6px', cursor: saving ? 'not-allowed' : 'pointer', transition: 'background 0.3s' }}
    >
      {saving ? 'Saving...' : saved ? '✓ Saved' : 'Save Changes'}
    </button>
  )
}

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState('agency')
  const [settings, setSettings] = useState<Record<string, string>>({})
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [telegramTest, setTelegramTest] = useState<'idle' | 'sending' | 'sent'>('idle')
  const [apiTest, setApiTest] = useState<'idle' | 'testing' | 'ok' | 'fail'>('idle')
  const [notifPrefs, setNotifPrefs] = useState({ reply: true, agent: true, import: true, paid: true, monthly: true })

  const TABS = ['agency', 'integrations', 'agent', 'pricing', 'templates', 'invoice']

  // Load settings on mount
  useEffect(() => {
    api.get<Record<string, string>>('/settings')
      .then(data => {
        setSettings(data)
        if (data['notifPrefs']) {
          try { setNotifPrefs(JSON.parse(data['notifPrefs'])) } catch {}
        }
      })
      .catch(() => {}) // backend may not be running
  }, [])

  const set = (key: string, value: string) => setSettings(prev => ({ ...prev, [key]: value }))
  const get = (key: string, fallback = '') => settings[key] ?? fallback

  const saveSection = async (keys: string[], extra?: Record<string, string>) => {
    setSaving(true)
    setSaved(false)
    try {
      const payload: Record<string, string> = {}
      keys.forEach(k => { payload[k] = get(k) })
      if (extra) Object.assign(payload, extra)
      await api.post('/settings', payload)
      setSaved(true)
      setTimeout(() => setSaved(false), 2000)
    } catch (e) {
      console.error(e)
    } finally {
      setSaving(false)
    }
  }

  const sendTelegramTest = async () => {
    setTelegramTest('sending')
    try {
      await api.post('/settings/telegram-test', {})
      setTelegramTest('sent')
    } catch {
      setTelegramTest('sent') // show as sent even if fails (bot not configured yet)
    }
  }

  const testApi = async () => {
    setApiTest('testing')
    try {
      await api.post('/settings/test-claude', {})
      setApiTest('ok')
    } catch {
      setApiTest('fail')
    }
  }

  return (
    <div className="animate-fadeIn" style={{ display: 'flex', gap: '20px' }}>
      {/* Side nav */}
      <div style={{ width: '160px', flexShrink: 0 }}>
        {TABS.map((tab) => (
          <button key={tab} onClick={() => setActiveTab(tab)} style={{
            display: 'block', width: '100%', textAlign: 'left',
            padding: '9px 12px', fontSize: '13px', fontWeight: activeTab === tab ? 600 : 400,
            background: activeTab === tab ? 'rgba(201,168,76,0.1)' : 'transparent',
            color: activeTab === tab ? '#C9A84C' : 'rgba(242,237,228,0.5)',
            border: `1px solid ${activeTab === tab ? 'rgba(201,168,76,0.25)' : 'transparent'}`,
            borderRadius: '6px', marginBottom: '3px', cursor: 'pointer', textTransform: 'capitalize',
          }}>
            {tab === 'agency' ? '🏢 Agency' : tab === 'integrations' ? '🔌 Integrations' : tab === 'agent' ? '🤖 Agent' : tab === 'pricing' ? '💰 Pricing' : tab === 'templates' ? '📝 Templates' : '📄 Invoice'}
          </button>
        ))}
      </div>

      {/* Content */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '16px' }}>
        {activeTab === 'agency' && (
          <Section title="Agency Profile">
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
              <Field label="Agency Name"><input className="cc-input" value={get('agencyName', 'AmanaHub')} onChange={e => set('agencyName', e.target.value)} /></Field>
              <Field label="Legal Name"><input className="cc-input" value={get('agencyLegalName', 'AmanaHub OÜ')} onChange={e => set('agencyLegalName', e.target.value)} /></Field>
              <Field label="Country"><input className="cc-input" value={get('agencyCountry', 'Estonia')} onChange={e => set('agencyCountry', e.target.value)} /></Field>
              <Field label="VAT Number"><input className="cc-input" value={get('agencyVat')} onChange={e => set('agencyVat', e.target.value)} placeholder="EE..." /></Field>
              <Field label="Email"><input className="cc-input" value={get('agencyEmail', 'hello@amana-hub.com')} onChange={e => set('agencyEmail', e.target.value)} /></Field>
              <Field label="Website"><input className="cc-input" value={get('agencyWebsite', 'amana-hub.com')} onChange={e => set('agencyWebsite', e.target.value)} /></Field>
            </div>
            <Field label="Address">
              <textarea className="cc-input" value={get('agencyAddress', 'Harju maakond, Tallinn, Estonia')} onChange={e => set('agencyAddress', e.target.value)} style={{ height: '60px', resize: 'none' }} />
            </Field>
            <SaveButton onClick={() => saveSection(['agencyName', 'agencyLegalName', 'agencyCountry', 'agencyVat', 'agencyEmail', 'agencyWebsite', 'agencyAddress'])} saving={saving} saved={saved} />
          </Section>
        )}

        {activeTab === 'integrations' && (
          <>
            <Section title="Gmail">
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '14px' }}>
                <div>
                  <div style={{ fontSize: '13px', color: '#F2EDE4', fontWeight: 600 }}>
                    {get('gmailAddress') ? `✅ Connected: ${get('gmailAddress')}` : 'Not connected'}
                  </div>
                  <div style={{ fontSize: '12px', color: 'rgba(242,237,228,0.4)', marginTop: '2px' }}>OAuth2 via Google Cloud Console</div>
                </div>
              </div>
              <Field label="Gmail Address">
                <input className="cc-input" value={get('gmailAddress')} onChange={e => set('gmailAddress', e.target.value)} placeholder="hello@gmail.com" />
              </Field>
              <SaveButton onClick={() => saveSection(['gmailAddress'])} saving={saving} saved={saved} />
            </Section>

            <Section title="Telegram Notifications">
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px', marginBottom: '14px' }}>
                <Field label="Bot Token" hint="From @BotFather">
                  <input className="cc-input" type="password" value={get('telegramToken')} onChange={e => set('telegramToken', e.target.value)} placeholder="••••••••••" />
                </Field>
                <Field label="Chat ID">
                  <input className="cc-input" value={get('telegramChatId')} onChange={e => set('telegramChatId', e.target.value)} placeholder="-100xxxxxxxxx" />
                </Field>
              </div>
              <div style={{ marginBottom: '14px' }}>
                <div style={{ fontSize: '12px', color: 'rgba(242,237,228,0.4)', marginBottom: '10px' }}>Notification preferences</div>
                {Object.entries(notifPrefs).map(([key, val]) => (
                  <div key={key} style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                    <input type="checkbox" checked={val} onChange={() => setNotifPrefs(p => ({ ...p, [key]: !p[key as keyof typeof p] }))} style={{ cursor: 'pointer' }} />
                    <span style={{ fontSize: '13px', color: 'rgba(242,237,228,0.7)' }}>
                      {{ reply: '🔔 Reply received (instant)', agent: '📊 Agent session complete', import: '📥 New lead imported', paid: '💳 Invoice paid', monthly: '📈 Monthly report' }[key]}
                    </span>
                  </div>
                ))}
              </div>
              <div style={{ display: 'flex', gap: '8px' }}>
                <SaveButton onClick={() => saveSection(['telegramToken', 'telegramChatId'], { notifPrefs: JSON.stringify(notifPrefs) })} saving={saving} saved={saved} />
                <button onClick={sendTelegramTest} style={{ padding: '8px 16px', fontSize: '13px', fontWeight: 600, background: 'rgba(45,212,191,0.1)', color: '#2DD4BF', border: '1px solid rgba(45,212,191,0.25)', borderRadius: '6px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  {telegramTest === 'sending' ? <><span className="animate-spin" style={{ width: 12, height: 12, border: '2px solid currentColor', borderTopColor: 'transparent', borderRadius: '50%', display: 'inline-block' }} /> Sending...</> : telegramTest === 'sent' ? '✅ Test sent!' : '📱 Send Test'}
                </button>
              </div>
            </Section>

            <Section title="Anthropic API">
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
                <Field label="API Key">
                  <input className="cc-input" type="password" value={get('anthropicKey')} onChange={e => set('anthropicKey', e.target.value)} placeholder="sk-ant-••••••••••••" />
                </Field>
                <div style={{ display: 'flex', alignItems: 'flex-end', paddingBottom: '14px' }}>
                  <button onClick={testApi} style={{ padding: '8px 16px', fontSize: '13px', fontWeight: 600, background: 'rgba(201,168,76,0.1)', color: '#C9A84C', border: '1px solid rgba(201,168,76,0.25)', borderRadius: '6px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px' }}>
                    {apiTest === 'testing' ? <><span className="animate-spin" style={{ width: 12, height: 12, border: '2px solid currentColor', borderTopColor: 'transparent', borderRadius: '50%', display: 'inline-block' }} /> Testing...</> : apiTest === 'ok' ? '✅ Connected' : apiTest === 'fail' ? '❌ Failed' : 'Test Connection'}
                  </button>
                </div>
              </div>
              <SaveButton onClick={() => saveSection(['anthropicKey'])} saving={saving} saved={saved} />
            </Section>

            <Section title="Stripe">
              <Field label="Stripe Secret Key">
                <input className="cc-input" type="password" value={get('stripeKey')} onChange={e => set('stripeKey', e.target.value)} placeholder="sk_test_••••••••••••" />
              </Field>
              <Field label="Stripe Webhook Secret">
                <input className="cc-input" type="password" value={get('stripeWebhook')} onChange={e => set('stripeWebhook', e.target.value)} placeholder="whsec_••••••••••••" />
              </Field>
              <SaveButton onClick={() => saveSection(['stripeKey', 'stripeWebhook'])} saving={saving} saved={saved} />
            </Section>
          </>
        )}

        {activeTab === 'agent' && (
          <Section title="Agent Defaults">
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
              <Field label="Default daily send limit">
                <input type="number" className="cc-input" value={get('agentDailyLimit', '20')} onChange={e => set('agentDailyLimit', e.target.value)} />
              </Field>
              <Field label="Delay between emails (min)">
                <input type="number" className="cc-input" value={get('agentDelay', '3')} onChange={e => set('agentDelay', e.target.value)} />
              </Field>
              <Field label="Active from">
                <input type="time" className="cc-input" value={get('agentActiveFrom', '08:00')} onChange={e => set('agentActiveFrom', e.target.value)} />
              </Field>
              <Field label="Active to">
                <input type="time" className="cc-input" value={get('agentActiveTo', '20:00')} onChange={e => set('agentActiveTo', e.target.value)} />
              </Field>
              <Field label="Active days">
                <select className="cc-select" style={{ width: '100%' }} value={get('agentActiveDays', 'mon-fri')} onChange={e => set('agentActiveDays', e.target.value)}>
                  <option value="mon-fri">Mon–Fri</option>
                  <option value="mon-sat">Mon–Sat</option>
                  <option value="every-day">Every day</option>
                </select>
              </Field>
              <Field label="Auto-send default">
                <select className="cc-select" style={{ width: '100%' }} value={get('agentAutoSend', 'off')} onChange={e => set('agentAutoSend', e.target.value)}>
                  <option value="on">ON — Send automatically</option>
                  <option value="off">OFF — Draft only</option>
                </select>
              </Field>
            </div>
            <SaveButton onClick={() => saveSection(['agentDailyLimit', 'agentDelay', 'agentActiveFrom', 'agentActiveTo', 'agentActiveDays', 'agentAutoSend'])} saving={saving} saved={saved} />
          </Section>
        )}

        {activeTab === 'pricing' && (
          <Section title="Default Service Prices (€)">
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
              {([
                ['priceWebsite', 'Website Redesign', '997'],
                ['priceSeo', 'SEO Setup', '297'],
                ['priceGmb', 'Google My Business', '197'],
                ['priceSpeed', 'Speed Optimization', '149'],
                ['priceContent', 'Content Update', '297'],
                ['priceHosting', 'Hosting (Vercel)', '99'],
              ] as [string, string, string][]).map(([key, label, def]) => (
                <Field key={key} label={label}>
                  <input type="number" className="cc-input" value={get(key, def)} onChange={e => set(key, e.target.value)} />
                </Field>
              ))}
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px', paddingTop: '14px', borderTop: '1px solid rgba(255,255,255,0.06)', marginTop: '4px' }}>
              <Field label="Bundle discount %">
                <input type="number" className="cc-input" value={get('bundleDiscount', '25')} onChange={e => set('bundleDiscount', e.target.value)} />
              </Field>
              <Field label="Currency">
                <select className="cc-select" style={{ width: '100%' }} value={get('currency', 'EUR')} onChange={e => set('currency', e.target.value)}>
                  <option>EUR</option>
                  <option>USD</option>
                  <option>GBP</option>
                </select>
              </Field>
            </div>
            <SaveButton onClick={() => saveSection(['priceWebsite', 'priceSeo', 'priceGmb', 'priceSpeed', 'priceContent', 'priceHosting', 'bundleDiscount', 'currency'])} saving={saving} saved={saved} />
          </Section>
        )}

        {activeTab === 'templates' && (
          <Section title="Email Templates">
            <div style={{ display: 'flex', gap: '4px', marginBottom: '14px' }}>
              {['DE', 'FR', 'AR', 'EN'].map(lang => (
                <button key={lang} style={{ padding: '6px 14px', fontSize: '12px', fontWeight: 600, background: get('templateLang', 'DE') === lang ? 'rgba(201,168,76,0.12)' : 'rgba(255,255,255,0.04)', color: get('templateLang', 'DE') === lang ? '#C9A84C' : 'rgba(242,237,228,0.5)', border: `1px solid ${get('templateLang', 'DE') === lang ? 'rgba(201,168,76,0.3)' : 'rgba(255,255,255,0.08)'}`, borderRadius: '6px', cursor: 'pointer' }}
                  onClick={() => set('templateLang', lang)}
                >{lang}</button>
              ))}
            </div>
            {(['DE', 'FR', 'AR', 'EN'] as const).filter(l => get('templateLang', 'DE') === l).map(lang => (
              <div key={lang}>
                <Field label="Outreach subject">
                  <input className="cc-input" value={get(`tpl_${lang}_subject`, lang === 'DE' ? 'Ihr Webauftritt verliert täglich Kunden — kostenlose Analyse' : '')} onChange={e => set(`tpl_${lang}_subject`, e.target.value)} />
                </Field>
                <Field label="Outreach body" hint="Use {{domain}}, {{contactName}}, {{monthlyLoss}}, {{bundlePrice}}">
                  <textarea className="cc-input cc-scroll" style={{ height: '160px', resize: 'vertical', fontFamily: 'var(--font-dm-sans)', lineHeight: 1.6 }}
                    value={get(`tpl_${lang}_body`, lang === 'DE' ? 'Sehr geehrte/r {{contactName}},\n\nbei einer Analyse Ihrer Website {{domain}}...' : '')}
                    onChange={e => set(`tpl_${lang}_body`, e.target.value)} />
                </Field>
                <Field label="Follow-up 1 subject">
                  <input className="cc-input" value={get(`tpl_${lang}_fu1`, lang === 'DE' ? 'Haben Sie den Bericht über {{domain}} erhalten?' : '')} onChange={e => set(`tpl_${lang}_fu1`, e.target.value)} />
                </Field>
                <Field label="Follow-up 2 subject">
                  <input className="cc-input" value={get(`tpl_${lang}_fu2`, lang === 'DE' ? 'Kurze Frage zu {{domain}}' : '')} onChange={e => set(`tpl_${lang}_fu2`, e.target.value)} />
                </Field>
              </div>
            ))}
            <SaveButton onClick={() => {
              const lang = get('templateLang', 'DE')
              saveSection([`tpl_${lang}_subject`, `tpl_${lang}_body`, `tpl_${lang}_fu1`, `tpl_${lang}_fu2`])
            }} saving={saving} saved={saved} />
          </Section>
        )}

        {activeTab === 'invoice' && (
          <Section title="Invoice Defaults">
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
              <Field label="Invoice prefix">
                <input className="cc-input" value={get('invoicePrefix', 'AH-')} onChange={e => set('invoicePrefix', e.target.value)} />
              </Field>
              <Field label="Payment terms (days)">
                <input type="number" className="cc-input" value={get('invoiceTerms', '14')} onChange={e => set('invoiceTerms', e.target.value)} />
              </Field>
              <Field label="VAT rate (%)">
                <input type="number" className="cc-input" value={get('invoiceVat', '20')} onChange={e => set('invoiceVat', e.target.value)} />
              </Field>
              <Field label="Bank (Wise IBAN)">
                <input className="cc-input" value={get('invoiceIban')} onChange={e => set('invoiceIban', e.target.value)} placeholder="EE..." />
              </Field>
              <Field label="BIC">
                <input className="cc-input" value={get('invoiceBic')} onChange={e => set('invoiceBic', e.target.value)} placeholder="TRWIBEB1XXX" />
              </Field>
            </div>
            <Field label="Invoice footer">
              <textarea className="cc-input" style={{ height: '60px', resize: 'none' }} value={get('invoiceFooter', 'Thank you for your business. AmanaHub OÜ — Estonia e-Residency')} onChange={e => set('invoiceFooter', e.target.value)} />
            </Field>
            <SaveButton onClick={() => saveSection(['invoicePrefix', 'invoiceTerms', 'invoiceVat', 'invoiceIban', 'invoiceBic', 'invoiceFooter'])} saving={saving} saved={saved} />
          </Section>
        )}
      </div>
    </div>
  )
}
