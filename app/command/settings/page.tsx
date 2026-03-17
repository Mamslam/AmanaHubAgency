'use client'
import { useState } from 'react'

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

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState('agency')
  const [gmailConnected, setGmailConnected] = useState(false)
  const [stripeConnected, setStripeConnected] = useState(false)
  const [telegramTest, setTelegramTest] = useState<'idle' | 'sending' | 'sent'>('idle')
  const [apiTest, setApiTest] = useState<'idle' | 'testing' | 'ok' | 'fail'>('idle')
  const [notifPrefs, setNotifPrefs] = useState({ reply: true, agent: true, import: true, paid: true, monthly: true })

  const TABS = ['agency', 'integrations', 'agent', 'pricing', 'templates', 'invoice']

  const sendTelegramTest = () => {
    setTelegramTest('sending')
    setTimeout(() => setTelegramTest('sent'), 1500)
  }

  const testApi = () => {
    setApiTest('testing')
    setTimeout(() => setApiTest('ok'), 1200)
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
            borderRadius: '6px', marginBottom: '3px', cursor: 'pointer',
            textTransform: 'capitalize',
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
              <Field label="Agency Name"><input className="cc-input" defaultValue="AmanaHub" /></Field>
              <Field label="Legal Name"><input className="cc-input" defaultValue="AmanaHub OÜ" /></Field>
              <Field label="Country"><input className="cc-input" defaultValue="Estonia" /></Field>
              <Field label="VAT Number"><input className="cc-input" placeholder="EE..." /></Field>
              <Field label="Email"><input className="cc-input" defaultValue="hello@amana-hub.com" /></Field>
              <Field label="Website"><input className="cc-input" defaultValue="amana-hub.com" /></Field>
            </div>
            <Field label="Address">
              <textarea className="cc-input" defaultValue="Harju maakond, Tallinn, Estonia" style={{ height: '60px', resize: 'none' }} />
            </Field>
            <button style={{ padding: '9px 18px', fontSize: '13px', fontWeight: 700, background: '#C9A84C', color: '#0A0A0F', border: 'none', borderRadius: '6px', cursor: 'pointer' }}>
              Save Changes
            </button>
          </Section>
        )}

        {activeTab === 'integrations' && (
          <>
            <Section title="Gmail">
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '14px' }}>
                <div>
                  <div style={{ fontSize: '13px', color: '#F2EDE4', fontWeight: 600 }}>
                    {gmailConnected ? '✅ Connected: hello@amana-hub.com' : 'Not connected'}
                  </div>
                  <div style={{ fontSize: '12px', color: 'rgba(242,237,228,0.4)', marginTop: '2px' }}>OAuth2 via Google Cloud Console</div>
                </div>
                <button onClick={() => setGmailConnected(!gmailConnected)} style={{
                  padding: '8px 16px', fontSize: '13px', fontWeight: 600, cursor: 'pointer', borderRadius: '6px',
                  background: gmailConnected ? 'rgba(220,38,38,0.1)' : 'rgba(201,168,76,0.12)',
                  color: gmailConnected ? '#f87171' : '#C9A84C',
                  border: `1px solid ${gmailConnected ? 'rgba(220,38,38,0.25)' : 'rgba(201,168,76,0.3)'}`,
                }}>
                  {gmailConnected ? 'Disconnect' : '🔗 Connect Gmail'}
                </button>
              </div>
            </Section>

            <Section title="Telegram Notifications">
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px', marginBottom: '14px' }}>
                <Field label="Bot Token" hint="From @BotFather"><input className="cc-input" type="password" placeholder="••••••••••" /></Field>
                <Field label="Chat ID"><input className="cc-input" placeholder="-100xxxxxxxxx" /></Field>
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
              <button onClick={sendTelegramTest} style={{ padding: '8px 16px', fontSize: '13px', fontWeight: 600, background: 'rgba(45,212,191,0.1)', color: '#2DD4BF', border: '1px solid rgba(45,212,191,0.25)', borderRadius: '6px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px' }}>
                {telegramTest === 'sending' ? <><span className="animate-spin" style={{ width: 12, height: 12, border: '2px solid currentColor', borderTopColor: 'transparent', borderRadius: '50%', display: 'inline-block' }} /> Sending...</> : telegramTest === 'sent' ? '✅ Test sent!' : '📱 Send Test Message'}
              </button>
            </Section>

            <Section title="Anthropic API">
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
                <Field label="API Key"><input className="cc-input" type="password" placeholder="sk-ant-••••••••••••" /></Field>
                <div style={{ display: 'flex', alignItems: 'flex-end', paddingBottom: '14px' }}>
                  <button onClick={testApi} style={{ padding: '8px 16px', fontSize: '13px', fontWeight: 600, background: 'rgba(201,168,76,0.1)', color: '#C9A84C', border: '1px solid rgba(201,168,76,0.25)', borderRadius: '6px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px' }}>
                    {apiTest === 'testing' ? <><span className="animate-spin" style={{ width: 12, height: 12, border: '2px solid currentColor', borderTopColor: 'transparent', borderRadius: '50%', display: 'inline-block' }} /> Testing...</> : apiTest === 'ok' ? '✅ Connected' : apiTest === 'fail' ? '❌ Failed' : 'Test Connection'}
                  </button>
                </div>
              </div>
              <div style={{ display: 'flex', gap: '16px', fontSize: '13px', color: 'rgba(242,237,228,0.5)' }}>
                <span>Usage this month: <span style={{ color: '#C9A84C' }}>124,000 tokens</span></span>
                <span>Est. cost: <span style={{ color: '#C9A84C' }}>~€0.37</span></span>
              </div>
            </Section>

            <Section title="Stripe">
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div>
                  <div style={{ fontSize: '13px', color: '#F2EDE4', fontWeight: 600 }}>
                    {stripeConnected ? '✅ Stripe connected (Test mode)' : 'Not connected'}
                  </div>
                  <div style={{ fontSize: '12px', color: 'rgba(242,237,228,0.4)', marginTop: '2px' }}>Accept card payments on invoices</div>
                </div>
                <button onClick={() => setStripeConnected(!stripeConnected)} style={{ padding: '8px 16px', fontSize: '13px', fontWeight: 600, cursor: 'pointer', borderRadius: '6px', background: 'rgba(201,168,76,0.12)', color: '#C9A84C', border: '1px solid rgba(201,168,76,0.3)' }}>
                  {stripeConnected ? 'Disconnect' : '🔗 Connect Stripe'}
                </button>
              </div>
            </Section>
          </>
        )}

        {activeTab === 'agent' && (
          <Section title="Agent Defaults">
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
              <Field label="Default daily send limit"><input type="number" className="cc-input" defaultValue={20} /></Field>
              <Field label="Delay between emails (min)"><input type="number" className="cc-input" defaultValue={3} /></Field>
              <Field label="Active from"><input type="time" className="cc-input" defaultValue="08:00" /></Field>
              <Field label="Active to"><input type="time" className="cc-input" defaultValue="20:00" /></Field>
              <Field label="Active days">
                <select className="cc-select" style={{ width: '100%' }}>
                  <option>Mon–Fri</option>
                  <option>Mon–Sat</option>
                  <option>Every day</option>
                </select>
              </Field>
              <Field label="Auto-send default">
                <select className="cc-select" style={{ width: '100%' }}>
                  <option value="on">ON — Send automatically</option>
                  <option value="off">OFF — Draft only</option>
                </select>
              </Field>
            </div>
            <button style={{ padding: '9px 18px', fontSize: '13px', fontWeight: 700, background: '#C9A84C', color: '#0A0A0F', border: 'none', borderRadius: '6px', cursor: 'pointer' }}>Save Defaults</button>
          </Section>
        )}

        {activeTab === 'pricing' && (
          <Section title="Default Service Prices (€)">
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
              {['Website Redesign', 'SEO Setup', 'Google My Business', 'Speed Optimization', 'Content Update', 'Hosting (Vercel)'].map((service, i) => (
                <Field key={service} label={service}>
                  <input type="number" className="cc-input" defaultValue={[997, 297, 197, 149, 297, 99][i]} />
                </Field>
              ))}
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px', paddingTop: '14px', borderTop: '1px solid rgba(255,255,255,0.06)', marginTop: '4px' }}>
              <Field label="Bundle discount %"><input type="number" className="cc-input" defaultValue={25} /></Field>
              <Field label="Currency">
                <select className="cc-select" style={{ width: '100%' }}>
                  <option>EUR</option>
                  <option>USD</option>
                  <option>GBP</option>
                </select>
              </Field>
            </div>
            <button style={{ padding: '9px 18px', fontSize: '13px', fontWeight: 700, background: '#C9A84C', color: '#0A0A0F', border: 'none', borderRadius: '6px', cursor: 'pointer' }}>Save Pricing</button>
          </Section>
        )}

        {activeTab === 'templates' && (
          <Section title="Email Templates">
            <div style={{ display: 'flex', gap: '4px', marginBottom: '14px' }}>
              {['DE', 'FR', 'AR', 'EN'].map(lang => (
                <button key={lang} style={{ padding: '6px 14px', fontSize: '12px', fontWeight: 600, background: lang === 'DE' ? 'rgba(201,168,76,0.12)' : 'rgba(255,255,255,0.04)', color: lang === 'DE' ? '#C9A84C' : 'rgba(242,237,228,0.5)', border: `1px solid ${lang === 'DE' ? 'rgba(201,168,76,0.3)' : 'rgba(255,255,255,0.08)'}`, borderRadius: '6px', cursor: 'pointer' }}>{lang}</button>
              ))}
            </div>
            <Field label="Outreach subject"><input className="cc-input" defaultValue="Ihr Webauftritt verliert täglich Kunden — kostenlose Analyse" /></Field>
            <Field label="Outreach body" hint="Use {{domain}}, {{contactName}}, {{monthlyLoss}}, {{bundlePrice}}">
              <textarea className="cc-input cc-scroll" style={{ height: '160px', resize: 'vertical', fontFamily: 'var(--font-dm-sans)', lineHeight: 1.6 }}
                defaultValue="Sehr geehrte/r {{contactName}},\n\nbei einer Analyse Ihrer Website {{domain}}..." />
            </Field>
            <Field label="Follow-up 1 subject"><input className="cc-input" defaultValue="Haben Sie den Bericht über {{domain}} erhalten?" /></Field>
            <Field label="Follow-up 2 subject"><input className="cc-input" defaultValue="Kurze Frage zu {{domain}}" /></Field>
            <button style={{ padding: '9px 18px', fontSize: '13px', fontWeight: 700, background: '#C9A84C', color: '#0A0A0F', border: 'none', borderRadius: '6px', cursor: 'pointer' }}>Save Templates</button>
          </Section>
        )}

        {activeTab === 'invoice' && (
          <Section title="Invoice Defaults">
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
              <Field label="Invoice prefix"><input className="cc-input" defaultValue="AH-" /></Field>
              <Field label="Payment terms (days)"><input type="number" className="cc-input" defaultValue={14} /></Field>
              <Field label="VAT rate (%)"><input type="number" className="cc-input" defaultValue={20} /></Field>
              <Field label="Bank (Wise IBAN)"><input className="cc-input" placeholder="EE..." /></Field>
              <Field label="BIC"><input className="cc-input" placeholder="TRWIBEB1XXX" /></Field>
            </div>
            <Field label="Invoice footer">
              <textarea className="cc-input" style={{ height: '60px', resize: 'none' }} defaultValue="Thank you for your business. AmanaHub OÜ — Estonia e-Residency" />
            </Field>
            <button style={{ padding: '9px 18px', fontSize: '13px', fontWeight: 700, background: '#C9A84C', color: '#0A0A0F', border: 'none', borderRadius: '6px', cursor: 'pointer' }}>Save Invoice Settings</button>
          </Section>
        )}
      </div>
    </div>
  )
}
