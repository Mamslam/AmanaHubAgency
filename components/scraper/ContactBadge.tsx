'use client'
import type { ContactResult } from '@/types/scraper'

export function ContactBadge({ contact }: { contact: ContactResult }) {
  if (contact.email && !contact.emailIsGeneric) {
    return (
      <span title={contact.email} style={{ fontSize: '13px', cursor: 'default' }}>
        ✉️ <span style={{ color: '#4ade80', fontSize: '11px' }}>direct</span>
      </span>
    )
  }
  if (contact.whatsappActive) {
    return (
      <span title={contact.whatsapp || ''} style={{ fontSize: '13px', cursor: 'default' }}>
        💬 <span style={{ color: '#2DD4BF', fontSize: '11px' }}>WA</span>
      </span>
    )
  }
  if (contact.email && contact.emailIsGeneric) {
    return (
      <span title={contact.email} style={{ fontSize: '13px', cursor: 'default' }}>
        ✉️ <span style={{ color: '#C9A84C', fontSize: '11px' }}>generic</span>
      </span>
    )
  }
  if (contact.phone) {
    return (
      <span title={contact.phone} style={{ fontSize: '13px', cursor: 'default' }}>
        📞 <span style={{ color: '#60a5fa', fontSize: '11px' }}>phone</span>
      </span>
    )
  }
  return <span style={{ color: '#f87171', fontSize: '12px' }}>✕ none</span>
}
