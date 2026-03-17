import type { Lead, Audit, Deal, Invoice, AgentLog, KPIData, Notification } from '@/types'

export const mockLeads: Lead[] = [
  {
    id: '1', domain: 'restaurant-berlin.de', businessName: 'Zur Goldenen Gans',
    contactName: 'Hans Mueller', contactEmail: 'hans@restaurant-berlin.de',
    city: 'Berlin', country: 'DE', niche: 'restaurant', language: 'DE',
    aigencyIssues: ['No SSL', 'Missing meta tags', 'No mobile optimization'],
    leadScore: 8, status: 'PROSPECT', createdAt: '2026-03-10T08:00:00Z', updatedAt: '2026-03-10T08:00:00Z'
  },
  {
    id: '2', domain: 'boulangerie-paris.fr', businessName: 'Maison Dupont',
    contactName: 'Jean Dupont', contactEmail: 'jean@boulangerie-paris.fr',
    city: 'Paris', country: 'FR', niche: 'artisan', language: 'FR',
    aigencyIssues: ['Slow loading', 'No Google Maps', 'Outdated design'],
    leadScore: 7, status: 'AUDITED', createdAt: '2026-03-09T09:00:00Z', updatedAt: '2026-03-11T10:00:00Z'
  },
  {
    id: '3', domain: 'halal-koeln.de', businessName: 'Al Madina Restaurant',
    contactName: 'Hassan Al-Rashid', contactEmail: 'hassan@halal-koeln.de',
    city: 'Cologne', country: 'DE', niche: 'restaurant', language: 'DE',
    aigencyIssues: ['No website', 'Missing GMB', 'No online ordering'],
    leadScore: 9, status: 'EMAILED', createdAt: '2026-03-08T10:00:00Z', updatedAt: '2026-03-12T14:00:00Z'
  },
  {
    id: '4', domain: 'avocat-lyon.fr', businessName: 'Cabinet Moreau',
    contactName: 'Marie Moreau', contactEmail: 'marie@avocat-lyon.fr',
    city: 'Lyon', country: 'FR', niche: 'professional', language: 'FR',
    aigencyIssues: ['Poor SEO', 'No contact form', 'No SSL certificate'],
    leadScore: 6, status: 'REPLIED', createdAt: '2026-03-07T11:00:00Z', updatedAt: '2026-03-13T09:00:00Z'
  },
  {
    id: '5', domain: 'zahnarzt-hamburg.de', businessName: 'Dr. Schmidt Dental',
    contactName: 'Klaus Schmidt', contactEmail: 'info@zahnarzt-hamburg.de',
    city: 'Hamburg', country: 'DE', niche: 'medical', language: 'DE',
    aigencyIssues: ['No online booking', 'Slow site', 'Missing schema markup'],
    leadScore: 8, status: 'NEGOTIATING', createdAt: '2026-03-05T08:00:00Z', updatedAt: '2026-03-14T15:00:00Z'
  },
  {
    id: '6', domain: 'coiffure-marseille.fr', businessName: 'Salon Belle Époque',
    contactName: 'Sophie Laurent', contactEmail: 'sophie@coiffure-marseille.fr',
    city: 'Marseille', country: 'FR', niche: 'beauty', language: 'FR',
    aigencyIssues: ['No booking system', 'Bad mobile UX', 'No reviews'],
    leadScore: 7, status: 'CLOSED', createdAt: '2026-03-01T09:00:00Z', updatedAt: '2026-03-10T12:00:00Z'
  },
  {
    id: '7', domain: 'electricien-toulouse.fr', businessName: 'Pro Élec Services',
    contactName: 'Pierre Martin', contactEmail: 'pierre@electricien-toulouse.fr',
    city: 'Toulouse', country: 'FR', niche: 'trades', language: 'FR',
    aigencyIssues: ['No website at all', 'Only Facebook page'],
    leadScore: 9, status: 'PROSPECT', createdAt: '2026-03-15T08:00:00Z', updatedAt: '2026-03-15T08:00:00Z'
  },
  {
    id: '8', domain: 'metzgerei-munich.de', businessName: 'Fleischerei Bauer',
    contactName: 'Franz Bauer', contactEmail: 'franz@metzgerei-munich.de',
    city: 'Munich', country: 'DE', niche: 'artisan', language: 'DE',
    aigencyIssues: ['Page speed F score', 'No SSL', 'No contact info visible'],
    leadScore: 6, status: 'COLD', createdAt: '2026-02-20T10:00:00Z', updatedAt: '2026-03-05T10:00:00Z'
  },
  {
    id: '9', domain: 'pharmacie-nice.fr', businessName: 'Pharmacie du Port',
    contactName: 'Anne Leclerc', contactEmail: 'anne@pharmacie-nice.fr',
    city: 'Nice', country: 'FR', niche: 'medical', language: 'FR',
    aigencyIssues: ['Outdated CMS', 'No online hours', 'Poor mobile'],
    leadScore: 7, status: 'AUDITED', createdAt: '2026-03-12T08:00:00Z', updatedAt: '2026-03-14T09:00:00Z'
  },
  {
    id: '10', domain: 'fahrschule-dusseldorf.de', businessName: 'Fahrschule Hoffmann',
    contactName: 'Dieter Hoffmann', contactEmail: 'info@fahrschule-dusseldorf.de',
    city: 'Düsseldorf', country: 'DE', niche: 'education', language: 'DE',
    aigencyIssues: ['No online booking', 'Outdated design', 'Missing FAQ'],
    leadScore: 7, status: 'DELIVERED', createdAt: '2026-02-01T08:00:00Z', updatedAt: '2026-03-01T10:00:00Z'
  },
]

export const mockKPIs: KPIData = {
  leadsThisMonth: 47,
  leadsLastMonth: 38,
  emailsSentThisMonth: 312,
  replyRate: 4.2,
  revenueThisMonth: 4250,
}

export const mockAgentLogs: AgentLog[] = [
  { id: '1', message: '▶️  Agent session started', level: 'info', createdAt: '2026-03-17T08:00:00Z' },
  { id: '2', message: '✅ Fetching PageSpeed for restaurant-berlin.de', level: 'success', leadId: '1', createdAt: '2026-03-17T08:00:14Z' },
  { id: '3', message: '✅ Score: Performance 34 | SEO 41 | Accessibility 62', level: 'success', leadId: '1', createdAt: '2026-03-17T08:00:18Z' },
  { id: '4', message: '✅ Claude analysis complete for restaurant-berlin.de', level: 'success', leadId: '1', createdAt: '2026-03-17T08:00:45Z' },
  { id: '5', message: '✅ PDF generated → uploaded to Supabase', level: 'success', leadId: '1', createdAt: '2026-03-17T08:00:46Z' },
  { id: '6', message: '✅ Email drafted (German) — Subject: Ihr Webauftritt verliert täglich Kunden', level: 'success', leadId: '1', createdAt: '2026-03-17T08:00:47Z' },
  { id: '7', message: '✅ Email sent to hans@restaurant-berlin.de', level: 'success', leadId: '1', createdAt: '2026-03-17T08:00:48Z' },
  { id: '8', message: '⏳ Waiting 3 min before next lead...', level: 'info', createdAt: '2026-03-17T08:00:49Z' },
  { id: '9', message: '▶️  Processing next lead: halal-koeln.de', level: 'info', leadId: '3', createdAt: '2026-03-17T08:03:50Z' },
  { id: '10', message: '✅ Fetching PageSpeed for halal-koeln.de', level: 'success', leadId: '3', createdAt: '2026-03-17T08:03:55Z' },
  { id: '11', message: '⚠️  PageSpeed timeout — retrying...', level: 'warning', leadId: '3', createdAt: '2026-03-17T08:04:10Z' },
  { id: '12', message: '✅ Score: Performance 21 | SEO 38 | Accessibility 55', level: 'success', leadId: '3', createdAt: '2026-03-17T08:04:22Z' },
  { id: '13', message: '✅ Email sent to hassan@halal-koeln.de', level: 'success', leadId: '3', createdAt: '2026-03-17T08:05:15Z' },
  { id: '14', message: '📊 Batch update: 5 leads processed, 4 emails sent, 1 skipped', level: 'info', createdAt: '2026-03-17T08:20:00Z' },
  { id: '15', message: '⏸ Agent paused — daily limit reached (20/20)', level: 'warning', createdAt: '2026-03-17T10:45:00Z' },
]

export const mockNotifications: Notification[] = [
  { id: '1', type: 'reply', message: 'Jean Dupont (boulangerie-paris.fr) replied to your email!', read: false, createdAt: '2026-03-17T09:15:00Z' },
  { id: '2', type: 'deal', message: 'New deal closed! Salon Belle Époque — €1,997', read: false, createdAt: '2026-03-16T14:30:00Z' },
  { id: '3', type: 'payment', message: 'Invoice AH-2026-006 paid ✅ €1,997 received via Stripe', read: true, createdAt: '2026-03-15T11:00:00Z' },
  { id: '4', type: 'agent', message: 'Agent session complete: 18 sent, 2 skipped, 1 reply', read: true, createdAt: '2026-03-15T10:45:00Z' },
  { id: '5', type: 'import', message: '47 new leads imported from CSV batch', read: true, createdAt: '2026-03-14T09:00:00Z' },
]

export const mockRevenueData = [
  { month: 'Oct', oneTime: 1200, recurring: 400 },
  { month: 'Nov', oneTime: 1800, recurring: 500 },
  { month: 'Dec', oneTime: 2200, recurring: 600 },
  { month: 'Jan', oneTime: 1600, recurring: 650 },
  { month: 'Feb', oneTime: 3100, recurring: 750 },
  { month: 'Mar', oneTime: 3500, recurring: 750 },
]

export const mockFunnelData = [
  { stage: 'Prospects', count: 380, rate: 100 },
  { stage: 'Audited', count: 210, rate: 55.3 },
  { stage: 'Emailed', count: 180, rate: 47.4 },
  { stage: 'Replied', count: 24, rate: 6.3 },
  { stage: 'Negotiating', count: 12, rate: 3.2 },
  { stage: 'Closed', count: 8, rate: 2.1 },
]

export const mockInvoices: Invoice[] = [
  { id: '1', dealId: '1', number: 'AH-2026-001', amount: 1664, vatAmount: 333, total: 1997, status: 'PAID', dueDate: '2026-02-14T00:00:00Z', paidAt: '2026-02-12T00:00:00Z', createdAt: '2026-02-01T00:00:00Z' },
  { id: '2', dealId: '2', number: 'AH-2026-002', amount: 1664, vatAmount: 333, total: 1997, status: 'PAID', dueDate: '2026-02-28T00:00:00Z', paidAt: '2026-02-26T00:00:00Z', createdAt: '2026-02-15T00:00:00Z' },
  { id: '3', dealId: '3', number: 'AH-2026-003', amount: 249, vatAmount: 0, total: 249, status: 'PAID', dueDate: '2026-03-01T00:00:00Z', paidAt: '2026-03-01T00:00:00Z', createdAt: '2026-02-01T00:00:00Z' },
  { id: '4', dealId: '4', number: 'AH-2026-004', amount: 1164, vatAmount: 233, total: 1397, status: 'SENT', dueDate: '2026-03-20T00:00:00Z', createdAt: '2026-03-06T00:00:00Z' },
  { id: '5', dealId: '5', number: 'AH-2026-005', amount: 249, vatAmount: 0, total: 249, status: 'PENDING', dueDate: '2026-04-01T00:00:00Z', createdAt: '2026-03-01T00:00:00Z' },
  { id: '6', dealId: '6', number: 'AH-2026-006', amount: 1664, vatAmount: 333, total: 1997, status: 'OVERDUE', dueDate: '2026-03-10T00:00:00Z', createdAt: '2026-02-24T00:00:00Z' },
]
