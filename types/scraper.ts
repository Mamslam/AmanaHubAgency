export type ScraperInput = {
  niche: string
  city: string
  country: string
  language: 'DE' | 'FR' | 'AR' | 'EN'
  limit: number
}

export type PlaceResult = {
  name: string
  address: string
  website: string | null
  phone: string | null
  place_id: string
  rating: number | null
  reviewCount: number | null
  claimed: boolean
}

export type TechnicalAudit = {
  scores: { performance: number; accessibility: number; bestPractices: number; seo: number }
  loadTime: number
  failingAudits: string[]
  hasSSL: boolean; hasMobileMenu: boolean; hasContactForm: boolean; hasClickToCall: boolean
  hasFacebook: boolean; hasInstagram: boolean; hasLinkedIn: boolean; hasYouTube: boolean
  hasVideo: boolean; hasChatBot: boolean; hasAnalytics: boolean; hasStructuredData: boolean
  hasOpenGraph: boolean; hasProfessionalEmail: boolean
  metaDescription: string | null; pageTitle: string | null
  copyrightYear: number | null; wordpressVersion: string | null
  imagesWithAlt: number; llmReadableRatio: number; aiVisibilityScore: number
  isOutdated: boolean; hasFreeEmail: boolean; hasNoSocial: boolean; isWordpressOutdated: boolean
}

export type ContactResult = {
  email: string | null
  emailConfidence: number
  emailSource: 'website' | 'hunter' | 'gmb' | null
  emailIsGeneric: boolean
  contactName: string | null
  phone: string | null
  phoneFormatted: string | null
  whatsapp: string | null
  whatsappActive: boolean
  linkedin: string | null
}

export type LeadScore = {
  score: number
  priority: 'high' | 'med' | 'low'
  reasoning: string
  estimatedDeal: number
  topIssues: string[]
  contactQuality: 'direct' | 'generic' | 'phone_only' | 'none'
}

export type ScraperIssue = {
  key: string
  title: string
  detail: string
  severity: 'critical' | 'warning' | 'info'
  service: string
  price: number
  weight: number
}

export type ScrapedLead = {
  businessName: string
  domain: string
  address: string
  niche: string
  city: string
  country: string
  language: string
  place: PlaceResult
  audit: TechnicalAudit | null
  contact: ContactResult
  score: LeadScore
  issues: ScraperIssue[]
  totalIssueValue: number
  scrapedAt: string
}

export type ProgressEvent = {
  phase: 1 | 2 | 3 | 4
  label: string
  current: number
  total: number
  lead?: { name: string; domain: string; score?: number; issueCount: number }
  done?: boolean
  leads?: ScrapedLead[]
  summary?: ScraperSummary
  error?: string
}

export type ScraperSummary = {
  total: number
  highPriority: number
  withEmail: number
  withWhatsApp: number
  noSSL: number
  avgAiScore: number
  estimatedPipelineValue: number
}

export type ScraperJob = {
  jobId: string
  status: string
  startedAt: string
  summary?: ScraperSummary
  leadCount: number
}
