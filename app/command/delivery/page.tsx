'use client'
import { useState } from 'react'
import { mockLeads } from '@/lib/mock-data'

const CARD = {
  background: 'rgba(255,255,255,0.03)',
  border: '1px solid rgba(255,255,255,0.07)',
  borderRadius: '10px',
  padding: '20px',
}

const CHECKLIST_TEMPLATES: Record<string, string[]> = {
  'Website Redesign': [
    'Discovery call completed',
    'Content received from client',
    'Design mockup approved',
    'Development started',
    'Staging site sent for review',
    'Revisions applied',
    'Domain configured',
    'Deployed to Vercel',
    'SSL verified',
    'Client sign-off received',
  ],
  'SEO Setup': [
    'Keyword research completed',
    'Meta tags optimized',
    'Sitemap generated & submitted',
    'Google Search Console configured',
    'Before/after report sent',
  ],
  'Google My Business': [
    'Listing claimed',
    'Photos uploaded',
    'Hours/info completed',
    'First review requested',
    'Confirmation sent to client',
  ],
  'Maintenance': [
    'Monthly check performed',
    'Backups verified',
    'Performance report sent',
    'Uptime confirmed',
  ],
}

type ChecklistState = Record<string, boolean[]>

const mockProjects = [
  { id: '1', lead: mockLeads[5], services: ['Website Redesign', 'SEO Setup'], value: 1997, start: '2026-03-01', deadline: '2026-03-31' },
  { id: '2', lead: mockLeads[9], services: ['Website Redesign', 'Google My Business'], value: 1497, start: '2026-02-01', deadline: '2026-03-01' },
]

export default function DeliveryPage() {
  const [checklistState, setChecklistState] = useState<Record<string, ChecklistState>>(() => {
    const state: Record<string, ChecklistState> = {}
    mockProjects.forEach(p => {
      state[p.id] = {}
      p.services.forEach(s => {
        const items = CHECKLIST_TEMPLATES[s] || []
        state[p.id][s] = items.map((_, i) => i < Math.floor(items.length * 0.6))
      })
    })
    return state
  })

  const toggleCheck = (projectId: string, service: string, idx: number) => {
    setChecklistState(prev => {
      const next = { ...prev }
      next[projectId] = { ...next[projectId] }
      next[projectId][service] = [...next[projectId][service]]
      next[projectId][service][idx] = !next[projectId][service][idx]
      return next
    })
  }

  const getProgress = (projectId: string) => {
    const cls = checklistState[projectId]
    let done = 0, total = 0
    Object.values(cls).forEach(arr => { done += arr.filter(Boolean).length; total += arr.length })
    return total > 0 ? Math.round((done / total) * 100) : 0
  }

  return (
    <div className="animate-fadeIn" style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      <div>
        <h2 style={{ margin: '0 0 4px', fontSize: '20px', fontWeight: 700, color: '#F2EDE4' }}>Delivery Tracker</h2>
        <p style={{ margin: 0, fontSize: '13px', color: 'rgba(242,237,228,0.4)' }}>{mockProjects.length} active projects</p>
      </div>

      {mockProjects.map((project) => {
        const progress = getProgress(project.id)
        const daysLeft = Math.ceil((new Date(project.deadline).getTime() - Date.now()) / 86400000)
        return (
          <div key={project.id} style={CARD}>
            {/* Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '16px' }}>
              <div>
                <h3 style={{ margin: '0 0 4px', fontSize: '16px', fontWeight: 700, color: '#F2EDE4' }}>
                  {project.lead.businessName || project.lead.domain}
                </h3>
                <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                  <span style={{ fontSize: '12px', color: '#C9A84C' }}>{project.lead.domain}</span>
                  <span style={{ fontSize: '12px', color: 'rgba(242,237,228,0.3)' }}>·</span>
                  <span style={{ fontSize: '12px', color: 'rgba(242,237,228,0.5)' }}>€{project.value.toLocaleString()}</span>
                  <span style={{ fontSize: '12px', color: 'rgba(242,237,228,0.3)' }}>·</span>
                  {project.services.map(s => (
                    <span key={s} className="cc-badge" style={{ background: 'rgba(45,212,191,0.08)', color: '#2DD4BF', fontSize: '10px' }}>{s}</span>
                  ))}
                </div>
              </div>
              <div style={{ textAlign: 'right' }}>
                <div style={{ fontSize: '28px', fontWeight: 800, color: progress === 100 ? '#4ade80' : '#C9A84C' }}>{progress}%</div>
                <div style={{ fontSize: '11px', color: daysLeft < 0 ? '#f87171' : 'rgba(242,237,228,0.4)' }}>
                  {daysLeft < 0 ? `${Math.abs(daysLeft)}d overdue` : `${daysLeft}d left`}
                </div>
              </div>
            </div>

            {/* Progress bar */}
            <div style={{ height: '6px', background: 'rgba(255,255,255,0.06)', borderRadius: '3px', overflow: 'hidden', marginBottom: '20px' }}>
              <div style={{
                height: '100%',
                width: `${progress}%`,
                background: progress === 100 ? '#4ade80' : 'linear-gradient(90deg, #C9A84C, #E8C76A)',
                borderRadius: '3px',
                transition: 'width 0.4s ease',
              }} />
            </div>

            {/* Checklists */}
            <div style={{ display: 'grid', gridTemplateColumns: project.services.length > 1 ? `repeat(${project.services.length}, 1fr)` : '1fr', gap: '16px' }}>
              {project.services.map((service) => {
                const items = CHECKLIST_TEMPLATES[service] || []
                const checks = checklistState[project.id]?.[service] || []
                const done = checks.filter(Boolean).length
                return (
                  <div key={service} style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.05)', borderRadius: '8px', padding: '14px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                      <span style={{ fontSize: '13px', fontWeight: 600, color: '#2DD4BF' }}>{service}</span>
                      <span style={{ fontSize: '11px', color: 'rgba(242,237,228,0.4)' }}>{done}/{items.length}</span>
                    </div>
                    {items.map((item, i) => (
                      <div key={i} onClick={() => toggleCheck(project.id, service, i)} style={{
                        display: 'flex', alignItems: 'center', gap: '8px',
                        padding: '5px 0', cursor: 'pointer',
                        borderBottom: '1px solid rgba(255,255,255,0.03)',
                      }}>
                        <span style={{ fontSize: '14px', flexShrink: 0 }}>{checks[i] ? '✅' : '⬜'}</span>
                        <span style={{ fontSize: '12px', color: checks[i] ? 'rgba(242,237,228,0.35)' : 'rgba(242,237,228,0.75)', textDecoration: checks[i] ? 'line-through' : 'none', lineHeight: 1.4 }}>
                          {item}
                        </span>
                      </div>
                    ))}
                  </div>
                )
              })}
            </div>

            {/* Actions */}
            <div style={{ display: 'flex', gap: '8px', marginTop: '16px', paddingTop: '16px', borderTop: '1px solid rgba(255,255,255,0.05)' }}>
              <button style={{ padding: '7px 14px', fontSize: '12px', fontWeight: 600, background: 'rgba(201,168,76,0.1)', color: '#C9A84C', border: '1px solid rgba(201,168,76,0.25)', borderRadius: '6px', cursor: 'pointer' }}>
                📧 Email Client
              </button>
              <button style={{ padding: '7px 14px', fontSize: '12px', fontWeight: 600, background: 'rgba(45,212,191,0.08)', color: '#2DD4BF', border: '1px solid rgba(45,212,191,0.2)', borderRadius: '6px', cursor: 'pointer' }}>
                📄 View Invoice
              </button>
              {progress === 100 && (
                <button style={{ padding: '7px 14px', fontSize: '12px', fontWeight: 600, background: 'rgba(22,163,74,0.12)', color: '#4ade80', border: '1px solid rgba(22,163,74,0.25)', borderRadius: '6px', cursor: 'pointer' }}>
                  ✅ Mark Delivered
                </button>
              )}
            </div>
          </div>
        )
      })}
    </div>
  )
}
