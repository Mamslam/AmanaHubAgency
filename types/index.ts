// Lead types
export type LeadStatus = 'PROSPECT' | 'AUDITED' | 'EMAILED' | 'REPLIED' | 'NEGOTIATING' | 'CLOSED' | 'DELIVERED' | 'COLD'
export type EmailType = 'OUTREACH' | 'FOLLOWUP_1' | 'FOLLOWUP_2'
export type EmailStatus = 'DRAFT' | 'SENT' | 'REPLIED' | 'BOUNCED'
export type DealStatus = 'NEGOTIATING' | 'CLOSED' | 'CANCELLED'
export type InvoiceStatus = 'PENDING' | 'SENT' | 'PAID' | 'OVERDUE'
export type AgentStatus = 'RUNNING' | 'PAUSED' | 'IDLE'

export interface Lead {
  id: string
  domain: string
  businessName?: string
  contactName?: string
  contactEmail?: string
  contactPhone?: string
  city?: string
  country?: string
  niche?: string
  language: string
  aigencyIssues: string[]
  leadScore?: number
  status: LeadStatus
  notes?: string
  createdAt: string
  updatedAt: string
  audits?: Audit[]
  emails?: Email[]
  deals?: Deal[]
}

export interface Audit {
  id: string
  leadId: string
  scores: {
    performance: number
    accessibility: number
    bestPractices: number
    seo: number
  }
  issues: Issue[]
  roiAnalysis: ROIAnalysis
  dynamicPricing: DynamicPricing
  outreachEmails: OutreachEmails
  pdfUrl?: string
  createdAt: string
}

export interface Issue {
  id: string
  title: string
  severity: 'critical' | 'warning' | 'info'
  description: string
}

export interface ROIAnalysis {
  monthlyLoss: number
  annualLoss: number
  potentialGain: number
  grade: string
  summary: string
}

export interface DynamicPricing {
  services: ServiceItem[]
  bundlePrice: number
  bundleDiscount: number
  monthlyRecurring: number
}

export interface ServiceItem {
  name: string
  price: number
  included: boolean
}

export interface OutreachEmails {
  FR?: EmailContent
  DE?: EmailContent
  AR?: EmailContent
  EN?: EmailContent
}

export interface EmailContent {
  subject: string
  body: string
}

export interface Email {
  id: string
  leadId: string
  subject: string
  body: string
  language: string
  pdfUrl?: string
  sentAt?: string
  repliedAt?: string
  gmailId?: string
  type: EmailType
  status: EmailStatus
  createdAt: string
}

export interface Deal {
  id: string
  leadId: string
  services: ServiceItem[]
  oneTimeValue: number
  monthlyValue: number
  status: DealStatus
  closedAt?: string
  invoices?: Invoice[]
  deliverables?: Deliverable[]
  createdAt: string
}

export interface Invoice {
  id: string
  dealId: string
  number: string
  amount: number
  vatAmount: number
  total: number
  pdfUrl?: string
  stripeUrl?: string
  status: InvoiceStatus
  dueDate: string
  paidAt?: string
  createdAt: string
}

export interface Deliverable {
  id: string
  dealId: string
  service: string
  checklist: ChecklistItem[]
  completedAt?: string
  createdAt: string
}

export interface ChecklistItem {
  id: string
  label: string
  done: boolean
}

export interface AgentLog {
  id: string
  message: string
  level: 'info' | 'success' | 'warning' | 'error'
  leadId?: string
  createdAt: string
}

export interface AgentConfig {
  dailySendLimit: number
  delayBetweenEmails: number
  autoSend: boolean
  activeHoursFrom: string
  activeHoursTo: string
  activeDays: string[]
  languages: string[]
  followUpEnabled: boolean
  notificationLevel: 'all' | 'replies' | 'none'
}

export interface KPIData {
  leadsThisMonth: number
  leadsLastMonth: number
  emailsSentThisMonth: number
  replyRate: number
  revenueThisMonth: number
}

export interface Notification {
  id: string
  type: 'reply' | 'deal' | 'payment' | 'agent' | 'import'
  message: string
  read: boolean
  createdAt: string
}

export interface PipelineColumn {
  status: LeadStatus
  label: string
  color: string
  leads: Lead[]
}

export interface Project {
  id: string
  client: Lead
  deal: Deal
  deliverables: Deliverable[]
  startDate: string
  deadline?: string
}
