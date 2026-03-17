'use client'
import { useState, useRef, useEffect, useCallback } from 'react'
import { api } from '@/lib/command-api'
import type { Lead, LeadStatus } from '@/types'

const STATUS_CONFIG: Record<LeadStatus, { color: string; bg: string }> = {
  PROSPECT:    { color: '#94a3b8', bg: 'rgba(148,163,184,0.1)' },
  AUDITED:     { color: '#2DD4BF', bg: 'rgba(45,212,191,0.1)' },
  EMAILED:     { color: '#C9A84C', bg: 'rgba(201,168,76,0.12)' },
  REPLIED:     { color: '#4ade80', bg: 'rgba(22,163,74,0.12)' },
  NEGOTIATING: { color: '#fbbf24', bg: 'rgba(217,119,6,0.12)' },
  CLOSED:      { color: '#16a34a', bg: 'rgba(22,163,74,0.15)' },
  DELIVERED:   { color: '#38bdf8', bg: 'rgba(45,212,191,0.15)' },
  COLD:        { color: '#f87171', bg: 'rgba(220,38,38,0.1)' },
}

const NICHE_COLORS: Record<string, string> = {
  restaurant: '#f97316', artisan: '#a78bfa', professional: '#38bdf8',
  medical: '#34d399', beauty: '#f472b6', trades: '#fbbf24', education: '#60a5fa', default: '#94a3b8',
}

const LANG_FLAGS: Record<string, string> = { FR: '🇫🇷', DE: '🇩🇪', AR: '🇸🇦', EN: '🇬🇧' }

function StatusBadge({ status }: { status: LeadStatus }) {
  const c = STATUS_CONFIG[status]
  return (
    <span className="cc-badge" style={{ background: c.bg, color: c.color }}>
      {status.toLowerCase().replace('_', '-')}
    </span>
  )
}

function LeadProfileSlideOver({
  lead,
  onClose,
  onUpdate,
  onDelete,
}: {
  lead: Lead
  onClose: () => void
  onUpdate: (updated: Lead) => void
  onDelete: (id: string) => void
}) {
  const [saving, setSaving] = useState(false)
  const [notes, setNotes] = useState(lead.notes || '')

  const saveNotes = async () => {
    setSaving(true)
    try {
      const updated = await api.put<Lead>(`/leads/${lead.id}`, { notes })
      onUpdate(updated)
    } catch (e) {
      console.error(e)
    } finally {
      setSaving(false)
    }
  }

  const markCold = async () => {
    try {
      const updated = await api.put<Lead>(`/leads/${lead.id}`, { status: 'COLD' })
      onUpdate(updated)
      onClose()
    } catch (e) { console.error(e) }
  }

  const deleteLead = async () => {
    if (!confirm(`Delete ${lead.domain}?`)) return
    try {
      await api.delete(`/leads/${lead.id}`)
      onDelete(lead.id)
      onClose()
    } catch (e) { console.error(e) }
  }

  const runAudit = async () => {
    try {
      await api.post(`/audit/run`, { leadId: lead.id, domain: lead.domain, niche: lead.niche, language: lead.language })
      const updated = await api.get<Lead>(`/leads/${lead.id}`)
      onUpdate(updated)
    } catch (e) { console.error(e) }
  }

  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 100,
      background: 'rgba(0,0,0,0.6)',
      display: 'flex', justifyContent: 'flex-end',
    }} onClick={onClose}>
      <div className="cc-scroll animate-slideIn" style={{
        width: '440px', height: '100vh', background: '#0f0f1a',
        border: '1px solid rgba(255,255,255,0.08)',
        overflowY: 'auto', padding: '24px',
      }} onClick={(e) => e.stopPropagation()}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '24px' }}>
          <div>
            <h2 style={{ margin: '0 0 4px', fontSize: '18px', fontWeight: 700, color: '#F2EDE4' }}>{lead.businessName || lead.domain}</h2>
            <a href={`https://${lead.domain}`} target="_blank" rel="noopener" style={{ fontSize: '13px', color: '#C9A84C', textDecoration: 'none' }}>{lead.domain}</a>
          </div>
          <button onClick={onClose} style={{ background: 'none', border: 'none', color: 'rgba(242,237,228,0.4)', fontSize: '20px', cursor: 'pointer' }}>✕</button>
        </div>

        <div style={{ display: 'flex', gap: '8px', marginBottom: '20px', flexWrap: 'wrap' }}>
          <StatusBadge status={lead.status} />
          {lead.niche && (
            <span className="cc-badge" style={{ background: `${NICHE_COLORS[lead.niche] || NICHE_COLORS.default}18`, color: NICHE_COLORS[lead.niche] || NICHE_COLORS.default }}>
              {lead.niche}
            </span>
          )}
          {lead.leadScore && (
            <span className="cc-badge" style={{ background: 'rgba(201,168,76,0.12)', color: '#C9A84C' }}>Score: {lead.leadScore}/10</span>
          )}
          <span style={{ fontSize: '16px' }}>{LANG_FLAGS[lead.language] || '🌐'}</span>
        </div>

        <div style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: '8px', padding: '16px', marginBottom: '16px' }}>
          <div style={{ fontSize: '11px', color: 'rgba(242,237,228,0.4)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '12px' }}>Contact</div>
          {[
            { label: 'Name', value: lead.contactName },
            { label: 'Email', value: lead.contactEmail },
            { label: 'Phone', value: lead.contactPhone },
            { label: 'City', value: lead.city },
            { label: 'Country', value: lead.country },
          ].map(({ label, value }) => value ? (
            <div key={label} style={{ display: 'flex', gap: '8px', marginBottom: '6px', fontSize: '13px' }}>
              <span style={{ color: 'rgba(242,237,228,0.4)', width: '60px', flexShrink: 0 }}>{label}</span>
              <span style={{ color: '#F2EDE4' }}>{value}</span>
            </div>
          ) : null)}
        </div>

        {lead.aigencyIssues.length > 0 && (
          <div style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: '8px', padding: '16px', marginBottom: '16px' }}>
            <div style={{ fontSize: '11px', color: 'rgba(242,237,228,0.4)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '12px' }}>Detected Issues</div>
            {lead.aigencyIssues.map((issue, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px', fontSize: '13px', color: '#fbbf24' }}>
                <span>⚠️</span> {issue}
              </div>
            ))}
          </div>
        )}

        <div style={{ marginBottom: '16px' }}>
          <div style={{ fontSize: '11px', color: 'rgba(242,237,228,0.4)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '8px' }}>Notes</div>
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Add notes about this lead..."
            className="cc-input"
            style={{ height: '80px', resize: 'vertical' }}
          />
          {notes !== (lead.notes || '') && (
            <button onClick={saveNotes} disabled={saving} style={{ marginTop: '6px', padding: '6px 12px', fontSize: '12px', background: 'rgba(201,168,76,0.12)', color: '#C9A84C', border: '1px solid rgba(201,168,76,0.3)', borderRadius: '6px', cursor: 'pointer' }}>
              {saving ? 'Saving...' : 'Save Notes'}
            </button>
          )}
        </div>

        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
          <button onClick={runAudit} style={{ padding: '8px 14px', fontSize: '13px', fontWeight: 600, background: 'rgba(45,212,191,0.12)', color: '#2DD4BF', border: '1px solid rgba(45,212,191,0.3)', borderRadius: '6px', cursor: 'pointer' }}>🔍 Run Audit</button>
          <button onClick={markCold} style={{ padding: '8px 14px', fontSize: '13px', fontWeight: 600, background: 'rgba(148,163,184,0.1)', color: '#94a3b8', border: '1px solid rgba(148,163,184,0.2)', borderRadius: '6px', cursor: 'pointer' }}>❄️ Mark Cold</button>
          <button onClick={deleteLead} style={{ padding: '8px 14px', fontSize: '13px', fontWeight: 600, background: 'rgba(220,38,38,0.1)', color: '#f87171', border: '1px solid rgba(220,38,38,0.25)', borderRadius: '6px', cursor: 'pointer' }}>🗑 Delete</button>
        </div>

        <div style={{ marginTop: '16px', fontSize: '11px', color: 'rgba(242,237,228,0.25)' }}>
          Added: {new Date(lead.createdAt).toLocaleDateString('en-GB')} · Updated: {new Date(lead.updatedAt).toLocaleDateString('en-GB')}
        </div>
      </div>
    </div>
  )
}

function AddLeadModal({ onClose, onAdd }: { onClose: () => void; onAdd: (lead: Lead) => void }) {
  const [form, setForm] = useState({ domain: '', businessName: '', contactEmail: '', niche: 'restaurant', language: 'DE', city: '', country: '' })
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  const submit = async () => {
    if (!form.domain) { setError('Domain is required'); return }
    setSaving(true)
    try {
      const lead = await api.post<Lead>('/leads', { ...form, aigencyIssues: [], status: 'PROSPECT' })
      onAdd(lead)
      onClose()
    } catch (e: any) {
      setError(e.message)
    } finally {
      setSaving(false)
    }
  }

  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 100, background: 'rgba(0,0,0,0.7)', display: 'flex', alignItems: 'center', justifyContent: 'center' }} onClick={onClose}>
      <div style={{ background: '#0f0f1a', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px', padding: '24px', width: '480px' }} onClick={e => e.stopPropagation()}>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '20px' }}>
          <div style={{ fontSize: '16px', fontWeight: 700, color: '#F2EDE4' }}>Add Lead</div>
          <button onClick={onClose} style={{ background: 'none', border: 'none', color: 'rgba(242,237,228,0.4)', fontSize: '18px', cursor: 'pointer' }}>✕</button>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '12px' }}>
          {([
            ['domain', 'Domain *', 'example.com'],
            ['businessName', 'Business Name', 'Restaurant XY'],
            ['contactEmail', 'Email', 'info@...'],
            ['city', 'City', 'Berlin'],
          ] as [keyof typeof form, string, string][]).map(([key, label, placeholder]) => (
            <div key={key}>
              <label style={{ fontSize: '11px', color: 'rgba(242,237,228,0.5)', display: 'block', marginBottom: '4px' }}>{label}</label>
              <input className="cc-input" placeholder={placeholder} value={form[key]} onChange={e => setForm(f => ({ ...f, [key]: e.target.value }))} />
            </div>
          ))}
          <div>
            <label style={{ fontSize: '11px', color: 'rgba(242,237,228,0.5)', display: 'block', marginBottom: '4px' }}>Niche</label>
            <select className="cc-select" style={{ width: '100%' }} value={form.niche} onChange={e => setForm(f => ({ ...f, niche: e.target.value }))}>
              {['restaurant', 'artisan', 'medical', 'beauty', 'professional', 'trades', 'education'].map(n => <option key={n} value={n}>{n}</option>)}
            </select>
          </div>
          <div>
            <label style={{ fontSize: '11px', color: 'rgba(242,237,228,0.5)', display: 'block', marginBottom: '4px' }}>Language</label>
            <select className="cc-select" style={{ width: '100%' }} value={form.language} onChange={e => setForm(f => ({ ...f, language: e.target.value }))}>
              {['DE', 'FR', 'AR', 'EN'].map(l => <option key={l} value={l}>{l}</option>)}
            </select>
          </div>
        </div>
        {error && <div style={{ fontSize: '12px', color: '#f87171', marginBottom: '10px' }}>{error}</div>}
        <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
          <button onClick={onClose} style={{ padding: '8px 16px', fontSize: '13px', background: 'rgba(255,255,255,0.05)', color: 'rgba(242,237,228,0.6)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '6px', cursor: 'pointer' }}>Cancel</button>
          <button onClick={submit} disabled={saving} style={{ padding: '8px 20px', fontSize: '13px', fontWeight: 700, background: '#C9A84C', color: '#0A0A0F', border: 'none', borderRadius: '6px', cursor: 'pointer' }}>
            {saving ? 'Adding...' : '＋ Add Lead'}
          </button>
        </div>
      </div>
    </div>
  )
}

export default function LeadsPage() {
  const [leads, setLeads] = useState<Lead[]>([])
  const [total, setTotal] = useState(0)
  const [loading, setLoading] = useState(true)
  const [selected, setSelected] = useState<Set<string>>(new Set())
  const [filterStatus, setFilterStatus] = useState<string>('all')
  const [filterNiche, setFilterNiche] = useState<string>('all')
  const [filterLang, setFilterLang] = useState<string>('all')
  const [search, setSearch] = useState('')
  const [activeLead, setActiveLead] = useState<Lead | null>(null)
  const [showImport, setShowImport] = useState(false)
  const [showAddModal, setShowAddModal] = useState(false)
  const [dragging, setDragging] = useState(false)
  const [importing, setImporting] = useState(false)
  const fileRef = useRef<HTMLInputElement>(null)

  const fetchLeads = useCallback(async () => {
    try {
      const params = new URLSearchParams()
      if (filterStatus !== 'all') params.set('status', filterStatus)
      if (filterNiche !== 'all') params.set('niche', filterNiche)
      if (filterLang !== 'all') params.set('language', filterLang)
      params.set('limit', '100')
      const res = await api.get<{ leads: Lead[]; total: number }>(`/leads?${params}`)
      setLeads(res.leads)
      setTotal(res.total)
    } catch (e) {
      console.error(e)
    } finally {
      setLoading(false)
    }
  }, [filterStatus, filterNiche, filterLang])

  useEffect(() => { fetchLeads() }, [fetchLeads])

  const filtered = leads.filter((l) => {
    if (search && !l.domain.includes(search.toLowerCase()) && !l.businessName?.toLowerCase().includes(search.toLowerCase())) return false
    return true
  })

  const handleCSV = async (file: File) => {
    setImporting(true)
    try {
      const text = await file.text()
      const lines = text.trim().split('\n')
      const headers = lines[0].split(',').map(h => h.trim().toLowerCase())
      const rows = lines.slice(1).map(line => {
        const vals = line.split(',').map(v => v.trim().replace(/^"|"$/g, ''))
        const obj: Record<string, string> = {}
        headers.forEach((h, i) => { obj[h] = vals[i] || '' })
        return obj
      })
      const leadsPayload = rows.filter(r => r.domain).map(r => ({
        domain: r.domain,
        businessName: r.businessname || r.business_name || '',
        contactEmail: r.email || r.contactemail || '',
        niche: r.niche || 'professional',
        language: (r.language || 'DE').toUpperCase(),
        aigencyIssues: r.issues ? r.issues.split('|') : [],
        status: 'PROSPECT',
      }))
      const result = await api.post<{ imported: number; duplicates: number }>('/leads/import', { leads: leadsPayload })
      alert(`Imported: ${result.imported} · Duplicates skipped: ${result.duplicates}`)
      fetchLeads()
      setShowImport(false)
    } catch (e: any) {
      alert('Import failed: ' + e.message)
    } finally {
      setImporting(false)
    }
  }

  const bulkMarkCold = async () => {
    for (const id of selected) {
      await api.put(`/leads/${id}`, { status: 'COLD' }).catch(() => {})
    }
    setSelected(new Set())
    fetchLeads()
  }

  const bulkDelete = async () => {
    if (!confirm(`Delete ${selected.size} leads?`)) return
    for (const id of selected) {
      await api.delete(`/leads/${id}`).catch(() => {})
    }
    setSelected(new Set())
    fetchLeads()
  }

  const toggleSelect = (id: string) => {
    const next = new Set(selected)
    next.has(id) ? next.delete(id) : next.add(id)
    setSelected(next)
  }

  const allSelected = filtered.length > 0 && filtered.every(l => selected.has(l.id))
  const toggleAll = () => {
    if (allSelected) {
      const next = new Set(selected)
      filtered.forEach(l => next.delete(l.id))
      setSelected(next)
    } else {
      const next = new Set(selected)
      filtered.forEach(l => next.add(l.id))
      setSelected(next)
    }
  }

  const handleUpdate = (updated: Lead) => {
    setLeads(prev => prev.map(l => l.id === updated.id ? updated : l))
    if (activeLead?.id === updated.id) setActiveLead(updated)
  }

  const handleDelete = (id: string) => {
    setLeads(prev => prev.filter(l => l.id !== id))
    setTotal(t => t - 1)
  }

  return (
    <div className="animate-fadeIn" style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h2 style={{ margin: '0 0 4px', fontSize: '20px', fontWeight: 700, color: '#F2EDE4' }}>Leads</h2>
          <p style={{ margin: 0, fontSize: '13px', color: 'rgba(242,237,228,0.4)' }}>{total} total · {filtered.length} shown</p>
        </div>
        <div style={{ display: 'flex', gap: '8px' }}>
          <button onClick={() => setShowImport(!showImport)} style={{ padding: '9px 16px', fontSize: '13px', fontWeight: 600, background: 'rgba(201,168,76,0.12)', color: '#C9A84C', border: '1px solid rgba(201,168,76,0.3)', borderRadius: '6px', cursor: 'pointer' }}>📥 Import CSV</button>
          <button onClick={() => setShowAddModal(true)} style={{ padding: '9px 16px', fontSize: '13px', fontWeight: 600, background: 'rgba(45,212,191,0.1)', color: '#2DD4BF', border: '1px solid rgba(45,212,191,0.25)', borderRadius: '6px', cursor: 'pointer' }}>＋ Add Lead</button>
        </div>
      </div>

      {showImport && (
        <div className="animate-fadeIn" style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(201,168,76,0.2)', borderRadius: '10px', padding: '20px' }}>
          <div style={{ fontSize: '14px', fontWeight: 600, color: '#C9A84C', marginBottom: '12px' }}>Import CSV</div>
          <div
            onDragOver={(e) => { e.preventDefault(); setDragging(true) }}
            onDragLeave={() => setDragging(false)}
            onDrop={(e) => { e.preventDefault(); setDragging(false); const f = e.dataTransfer.files[0]; if (f) handleCSV(f) }}
            onClick={() => fileRef.current?.click()}
            style={{
              border: `2px dashed ${dragging ? '#C9A84C' : 'rgba(255,255,255,0.15)'}`,
              borderRadius: '8px', padding: '32px', textAlign: 'center', cursor: 'pointer',
              background: dragging ? 'rgba(201,168,76,0.05)' : 'transparent', transition: 'all 0.2s',
            }}
          >
            <div style={{ fontSize: '28px', marginBottom: '8px' }}>📁</div>
            <div style={{ fontSize: '14px', color: '#F2EDE4', marginBottom: '4px' }}>{importing ? 'Importing...' : 'Drop CSV here or click to browse'}</div>
            <div style={{ fontSize: '12px', color: 'rgba(242,237,228,0.35)' }}>Columns: domain, businessName, email, niche, language, issues (pipe-separated)</div>
          </div>
          <input ref={fileRef} type="file" accept=".csv" style={{ display: 'none' }} onChange={(e) => { const f = e.target.files?.[0]; if (f) handleCSV(f) }} />
        </div>
      )}

      <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', alignItems: 'center' }}>
        <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search domain or name..." className="cc-input" style={{ width: '220px' }} />
        {[
          { value: filterStatus, onChange: setFilterStatus, options: ['all', 'PROSPECT', 'AUDITED', 'EMAILED', 'REPLIED', 'NEGOTIATING', 'CLOSED', 'DELIVERED', 'COLD'], label: 'Status' },
          { value: filterNiche, onChange: setFilterNiche, options: ['all', 'restaurant', 'artisan', 'professional', 'medical', 'beauty', 'trades', 'education'], label: 'Niche' },
          { value: filterLang, onChange: setFilterLang, options: ['all', 'FR', 'DE', 'AR', 'EN'], label: 'Language' },
        ].map(({ value, onChange, options, label }) => (
          <select key={label} value={value} onChange={(e) => onChange(e.target.value)} className="cc-select">
            {options.map(o => <option key={o} value={o}>{o === 'all' ? `All ${label}` : o}</option>)}
          </select>
        ))}

        {selected.size > 0 && (
          <div style={{ display: 'flex', gap: '6px', marginLeft: 'auto' }}>
            <span style={{ fontSize: '13px', color: '#C9A84C', alignSelf: 'center' }}>{selected.size} selected</span>
            <button onClick={bulkMarkCold} style={{ padding: '6px 12px', fontSize: '12px', fontWeight: 600, background: 'rgba(255,255,255,0.05)', color: '#94a3b8', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '6px', cursor: 'pointer' }}>❄️ Cold</button>
            <button onClick={bulkDelete} style={{ padding: '6px 12px', fontSize: '12px', fontWeight: 600, background: 'rgba(255,255,255,0.05)', color: '#f87171', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '6px', cursor: 'pointer' }}>🗑 Delete</button>
          </div>
        )}
      </div>

      <div style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: '10px', overflow: 'hidden' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px' }}>
          <thead>
            <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.07)' }}>
              <th style={{ padding: '12px 16px', textAlign: 'left', width: '40px' }}>
                <input type="checkbox" checked={allSelected} onChange={toggleAll} style={{ cursor: 'pointer' }} />
              </th>
              {['Domain', 'Business', 'City', 'Niche', 'Issues', 'Score', 'Status', 'Added', 'Actions'].map(h => (
                <th key={h} style={{ padding: '12px 12px', textAlign: 'left', color: 'rgba(242,237,228,0.45)', fontWeight: 600, fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={10} style={{ padding: '40px', textAlign: 'center', color: 'rgba(242,237,228,0.3)', fontSize: '14px' }}>Loading leads...</td></tr>
            ) : filtered.map((lead, i) => (
              <tr
                key={lead.id}
                className="animate-fadeIn"
                style={{
                  borderBottom: '1px solid rgba(255,255,255,0.04)',
                  animationDelay: `${i * 0.03}s`,
                  background: selected.has(lead.id) ? 'rgba(201,168,76,0.04)' : 'transparent',
                  cursor: 'pointer', transition: 'background 0.15s',
                }}
                onMouseEnter={(e) => { if (!selected.has(lead.id)) (e.currentTarget as HTMLElement).style.background = 'rgba(255,255,255,0.03)' }}
                onMouseLeave={(e) => { if (!selected.has(lead.id)) (e.currentTarget as HTMLElement).style.background = 'transparent' }}
              >
                <td style={{ padding: '12px 16px' }} onClick={(e) => { e.stopPropagation(); toggleSelect(lead.id) }}>
                  <input type="checkbox" checked={selected.has(lead.id)} onChange={() => toggleSelect(lead.id)} style={{ cursor: 'pointer' }} />
                </td>
                <td style={{ padding: '10px 12px' }} onClick={() => setActiveLead(lead)}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <span style={{ fontSize: '14px' }}>{LANG_FLAGS[lead.language] || '🌐'}</span>
                    <span style={{ color: '#C9A84C', fontWeight: 500 }}>{lead.domain}</span>
                  </div>
                </td>
                <td style={{ padding: '10px 12px', color: 'rgba(242,237,228,0.8)' }} onClick={() => setActiveLead(lead)}>{lead.businessName || '—'}</td>
                <td style={{ padding: '10px 12px', color: 'rgba(242,237,228,0.5)' }} onClick={() => setActiveLead(lead)}>{lead.city || '—'}</td>
                <td style={{ padding: '10px 12px' }} onClick={() => setActiveLead(lead)}>
                  {lead.niche && (
                    <span className="cc-badge" style={{ background: `${NICHE_COLORS[lead.niche] || NICHE_COLORS.default}18`, color: NICHE_COLORS[lead.niche] || NICHE_COLORS.default }}>
                      {lead.niche}
                    </span>
                  )}
                </td>
                <td style={{ padding: '10px 12px' }} onClick={() => setActiveLead(lead)}>
                  <span style={{ fontSize: '12px', color: '#fbbf24' }}>⚠️ {lead.aigencyIssues.length}</span>
                </td>
                <td style={{ padding: '10px 12px' }} onClick={() => setActiveLead(lead)}>
                  {lead.leadScore && (
                    <span className="cc-badge" style={{ background: lead.leadScore >= 8 ? 'rgba(22,163,74,0.12)' : lead.leadScore >= 6 ? 'rgba(217,119,6,0.12)' : 'rgba(220,38,38,0.1)', color: lead.leadScore >= 8 ? '#4ade80' : lead.leadScore >= 6 ? '#fbbf24' : '#f87171' }}>
                      {lead.leadScore}
                    </span>
                  )}
                </td>
                <td style={{ padding: '10px 12px' }} onClick={() => setActiveLead(lead)}><StatusBadge status={lead.status} /></td>
                <td style={{ padding: '10px 12px', color: 'rgba(242,237,228,0.4)', fontSize: '12px' }} onClick={() => setActiveLead(lead)}>
                  {new Date(lead.createdAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })}
                </td>
                <td style={{ padding: '10px 12px' }}>
                  <div style={{ display: 'flex', gap: '4px' }}>
                    {['📄', '📧', '🔍'].map(icon => (
                      <button key={icon} title={icon} onClick={(e) => { e.stopPropagation(); setActiveLead(lead) }} style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '4px', padding: '3px 6px', cursor: 'pointer', fontSize: '12px' }}>{icon}</button>
                    ))}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {!loading && filtered.length === 0 && (
          <div style={{ padding: '40px', textAlign: 'center', color: 'rgba(242,237,228,0.3)', fontSize: '14px' }}>
            {leads.length === 0 ? 'No leads yet. Import a CSV or add leads manually.' : 'No leads match current filters'}
          </div>
        )}
      </div>

      {activeLead && (
        <LeadProfileSlideOver
          lead={activeLead}
          onClose={() => setActiveLead(null)}
          onUpdate={handleUpdate}
          onDelete={handleDelete}
        />
      )}
      {showAddModal && (
        <AddLeadModal
          onClose={() => setShowAddModal(false)}
          onAdd={(lead) => { setLeads(prev => [lead, ...prev]); setTotal(t => t + 1) }}
        />
      )}
    </div>
  )
}
