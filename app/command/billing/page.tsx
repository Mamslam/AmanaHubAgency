'use client'
import { useState } from 'react'
import { mockInvoices, mockLeads } from '@/lib/mock-data'
import type { InvoiceStatus } from '@/types'

const CARD = {
  background: 'rgba(255,255,255,0.03)',
  border: '1px solid rgba(255,255,255,0.07)',
  borderRadius: '10px',
  padding: '20px',
}

const STATUS_CONFIG: Record<InvoiceStatus, { color: string; bg: string }> = {
  PENDING: { color: '#94a3b8', bg: 'rgba(148,163,184,0.1)' },
  SENT:    { color: '#fbbf24', bg: 'rgba(217,119,6,0.1)' },
  PAID:    { color: '#4ade80', bg: 'rgba(22,163,74,0.12)' },
  OVERDUE: { color: '#f87171', bg: 'rgba(220,38,38,0.1)' },
}

export default function BillingPage() {
  const [activeTab, setActiveTab] = useState<'invoices' | 'create' | 'recurring'>('invoices')
  const [filterStatus, setFilterStatus] = useState<string>('all')

  const totalRevenue = mockInvoices.filter(i => i.status === 'PAID').reduce((s, i) => s + i.total, 0)
  const outstanding = mockInvoices.filter(i => i.status === 'SENT' || i.status === 'PENDING').reduce((s, i) => s + i.total, 0)
  const overdue = mockInvoices.filter(i => i.status === 'OVERDUE').reduce((s, i) => s + i.total, 0)
  const mrr = 750

  const filtered = mockInvoices.filter(i => filterStatus === 'all' || i.status === filterStatus)

  return (
    <div className="animate-fadeIn" style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
      {/* Revenue overview */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '12px' }}>
        {[
          { label: 'Collected', value: `€${totalRevenue.toLocaleString()}`, color: '#4ade80', icon: '💰' },
          { label: 'Outstanding', value: `€${outstanding.toLocaleString()}`, color: '#fbbf24', icon: '📤' },
          { label: 'Overdue', value: `€${overdue.toLocaleString()}`, color: '#f87171', icon: '⚠️' },
          { label: 'MRR', value: `€${mrr}/mo`, color: '#2DD4BF', icon: '🔄' },
        ].map(m => (
          <div key={m.label} style={CARD}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
              <span style={{ fontSize: '11px', color: 'rgba(242,237,228,0.4)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>{m.label}</span>
              <span>{m.icon}</span>
            </div>
            <div style={{ fontSize: '24px', fontWeight: 700, color: m.color }}>{m.value}</div>
          </div>
        ))}
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: '4px', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: '8px', padding: '4px', width: 'fit-content' }}>
        {([['invoices', '📋 Invoices'], ['create', '＋ Create Invoice'], ['recurring', '🔄 Recurring']] as const).map(([tab, label]) => (
          <button key={tab} onClick={() => setActiveTab(tab)} style={{
            padding: '8px 18px', fontSize: '13px', fontWeight: 600,
            background: activeTab === tab ? 'rgba(201,168,76,0.12)' : 'transparent',
            color: activeTab === tab ? '#C9A84C' : 'rgba(242,237,228,0.5)',
            border: `1px solid ${activeTab === tab ? 'rgba(201,168,76,0.3)' : 'transparent'}`,
            borderRadius: '6px', cursor: 'pointer', transition: 'all 0.15s',
          }}>{label}</button>
        ))}
      </div>

      {/* Invoices list */}
      {activeTab === 'invoices' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
            <select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)} className="cc-select">
              {['all', 'PENDING', 'SENT', 'PAID', 'OVERDUE'].map(s => <option key={s} value={s}>{s === 'all' ? 'All Status' : s}</option>)}
            </select>
            <span style={{ fontSize: '13px', color: 'rgba(242,237,228,0.4)' }}>{filtered.length} invoices</span>
          </div>
          <div style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: '10px', overflow: 'hidden' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.07)' }}>
                  {['Number', 'Client', 'Amount', 'VAT', 'Total', 'Due Date', 'Status', 'Actions'].map(h => (
                    <th key={h} style={{ padding: '12px 14px', textAlign: 'left', color: 'rgba(242,237,228,0.4)', fontWeight: 600, fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtered.map((inv) => {
                  const s = STATUS_CONFIG[inv.status]
                  const lead = mockLeads.find(l => l.deals?.some(() => true)) || mockLeads[0]
                  void lead
                  return (
                    <tr key={inv.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.04)' }}
                      onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.background = 'rgba(255,255,255,0.02)' }}
                      onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.background = 'transparent' }}
                    >
                      <td style={{ padding: '12px 14px', color: '#C9A84C', fontWeight: 600, fontFamily: 'monospace' }}>{inv.number}</td>
                      <td style={{ padding: '12px 14px', color: '#F2EDE4' }}>{mockLeads[Number(inv.id) % mockLeads.length]?.businessName || 'Client'}</td>
                      <td style={{ padding: '12px 14px', color: 'rgba(242,237,228,0.7)' }}>€{inv.amount.toLocaleString()}</td>
                      <td style={{ padding: '12px 14px', color: 'rgba(242,237,228,0.5)' }}>€{inv.vatAmount}</td>
                      <td style={{ padding: '12px 14px', color: '#F2EDE4', fontWeight: 700 }}>€{inv.total.toLocaleString()}</td>
                      <td style={{ padding: '12px 14px', color: inv.status === 'OVERDUE' ? '#f87171' : 'rgba(242,237,228,0.5)', fontSize: '12px' }}>
                        {new Date(inv.dueDate).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}
                      </td>
                      <td style={{ padding: '12px 14px' }}>
                        <span className="cc-badge" style={{ background: s.bg, color: s.color }}>{inv.status}</span>
                      </td>
                      <td style={{ padding: '12px 14px' }}>
                        <div style={{ display: 'flex', gap: '4px' }}>
                          <button title="Download PDF" style={{ padding: '4px 8px', fontSize: '12px', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '4px', cursor: 'pointer', color: '#F2EDE4' }}>📄</button>
                          {inv.status !== 'PAID' && (
                            <button title="Mark paid" style={{ padding: '4px 8px', fontSize: '12px', background: 'rgba(22,163,74,0.1)', border: '1px solid rgba(22,163,74,0.2)', borderRadius: '4px', cursor: 'pointer', color: '#4ade80' }}>✅</button>
                          )}
                          <button title="Send reminder" style={{ padding: '4px 8px', fontSize: '12px', background: 'rgba(201,168,76,0.08)', border: '1px solid rgba(201,168,76,0.2)', borderRadius: '4px', cursor: 'pointer', color: '#C9A84C' }}>📧</button>
                        </div>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Create Invoice */}
      {activeTab === 'create' && (
        <div style={CARD}>
          <div style={{ fontSize: '14px', fontWeight: 600, color: '#F2EDE4', marginBottom: '20px' }}>New Invoice — AmanaHub OÜ</div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px', marginBottom: '20px' }}>
            <div>
              <label style={{ fontSize: '12px', color: 'rgba(242,237,228,0.5)', display: 'block', marginBottom: '6px' }}>Client Name</label>
              <input className="cc-input" placeholder="Client or company name" />
            </div>
            <div>
              <label style={{ fontSize: '12px', color: 'rgba(242,237,228,0.5)', display: 'block', marginBottom: '6px' }}>Client Email</label>
              <input className="cc-input" type="email" placeholder="client@example.com" />
            </div>
            <div>
              <label style={{ fontSize: '12px', color: 'rgba(242,237,228,0.5)', display: 'block', marginBottom: '6px' }}>Invoice Number</label>
              <input className="cc-input" defaultValue="AH-2026-007" />
            </div>
            <div>
              <label style={{ fontSize: '12px', color: 'rgba(242,237,228,0.5)', display: 'block', marginBottom: '6px' }}>Due Date</label>
              <input type="date" className="cc-input" />
            </div>
          </div>

          {/* Line items */}
          <div style={{ marginBottom: '16px' }}>
            <div style={{ fontSize: '12px', color: 'rgba(242,237,228,0.4)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '10px' }}>Services</div>
            {[
              { service: 'Website Redesign', price: 997 },
              { service: 'SEO Setup', price: 297 },
              { service: 'Google My Business', price: 197 },
            ].map((item, i) => (
              <div key={i} style={{ display: 'flex', gap: '10px', marginBottom: '8px', alignItems: 'center' }}>
                <input className="cc-input" defaultValue={item.service} style={{ flex: 2 }} />
                <input className="cc-input" type="number" defaultValue={item.price} style={{ width: '100px' }} />
                <button style={{ padding: '8px 10px', background: 'rgba(220,38,38,0.1)', color: '#f87171', border: '1px solid rgba(220,38,38,0.2)', borderRadius: '6px', cursor: 'pointer' }}>✕</button>
              </div>
            ))}
            <button style={{ padding: '7px 14px', fontSize: '12px', fontWeight: 600, background: 'rgba(255,255,255,0.04)', color: 'rgba(242,237,228,0.6)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '6px', cursor: 'pointer' }}>
              + Add Line Item
            </button>
          </div>

          {/* Summary */}
          <div style={{ background: 'rgba(201,168,76,0.04)', border: '1px solid rgba(201,168,76,0.15)', borderRadius: '8px', padding: '14px', marginBottom: '16px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', marginBottom: '6px' }}>
              <span style={{ color: 'rgba(242,237,228,0.5)' }}>Subtotal</span>
              <span style={{ color: '#F2EDE4' }}>€1,491</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', marginBottom: '6px' }}>
              <span style={{ color: 'rgba(242,237,228,0.5)' }}>Bundle discount (25%)</span>
              <span style={{ color: '#4ade80' }}>- €373</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', marginBottom: '8px' }}>
              <span style={{ color: 'rgba(242,237,228,0.5)' }}>VAT (20%)</span>
              <span style={{ color: '#F2EDE4' }}>€224</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '16px', fontWeight: 700, borderTop: '1px solid rgba(201,168,76,0.2)', paddingTop: '8px' }}>
              <span style={{ color: '#C9A84C' }}>Total</span>
              <span style={{ color: '#C9A84C' }}>€1,342</span>
            </div>
          </div>

          <div style={{ display: 'flex', gap: '8px' }}>
            <button style={{ padding: '10px 20px', fontSize: '13px', fontWeight: 700, background: '#C9A84C', color: '#0A0A0F', border: 'none', borderRadius: '6px', cursor: 'pointer' }}>
              📄 Generate PDF
            </button>
            <button style={{ padding: '10px 16px', fontSize: '13px', fontWeight: 600, background: 'rgba(45,212,191,0.1)', color: '#2DD4BF', border: '1px solid rgba(45,212,191,0.25)', borderRadius: '6px', cursor: 'pointer' }}>
              📧 Send to Client
            </button>
          </div>
        </div>
      )}

      {/* Recurring */}
      {activeTab === 'recurring' && (
        <div style={CARD}>
          <div style={{ fontSize: '14px', fontWeight: 600, color: '#F2EDE4', marginBottom: '14px' }}>Recurring Clients</div>
          {mockLeads.filter(l => l.status === 'DELIVERED').map((lead) => (
            <div key={lead.id} style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '12px 0', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: '13px', fontWeight: 600, color: '#F2EDE4' }}>{lead.businessName || lead.domain}</div>
                <div style={{ fontSize: '11px', color: 'rgba(242,237,228,0.4)', marginTop: '2px' }}>Maintenance · Next billing: Apr 1, 2026</div>
              </div>
              <span style={{ fontSize: '14px', fontWeight: 700, color: '#2DD4BF' }}>€99/mo</span>
              <span className="cc-badge" style={{ background: 'rgba(22,163,74,0.1)', color: '#4ade80' }}>Active</span>
              <button style={{ padding: '5px 10px', fontSize: '11px', fontWeight: 600, background: 'rgba(201,168,76,0.08)', color: '#C9A84C', border: '1px solid rgba(201,168,76,0.2)', borderRadius: '4px', cursor: 'pointer' }}>Invoice Now</button>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
