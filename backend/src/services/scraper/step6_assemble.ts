import type { ScrapedLead, PlaceResult, TechnicalAudit, ContactResult, Issue, LeadScore, ScraperInput } from './types'

export function assembleLead(
  place: PlaceResult,
  audit: TechnicalAudit | null,
  contact: ContactResult,
  issues: Issue[],
  score: LeadScore,
  input: ScraperInput
): ScrapedLead {
  let domain = ''
  if (place.website) {
    try {
      domain = new URL(
        place.website.startsWith('http') ? place.website : `https://${place.website}`
      ).hostname.replace(/^www\./, '')
    } catch {
      domain = place.website.replace(/^https?:\/\//, '').replace(/^www\./, '').split('/')[0]
    }
  }

  // Deduplicate issues (don't double-count seo + missing_meta)
  const deduped = issues.filter((issue, idx, arr) => {
    if (issue.key === 'missing_meta') {
      return !arr.some(i => i.key === 'seo_critical' || i.key === 'seo_warning')
    }
    return true
  })

  const totalIssueValue = deduped.reduce((sum, i) => sum + i.price, 0)

  return {
    businessName: place.name,
    domain,
    address: place.address,
    niche: input.niche,
    city: input.city,
    country: input.country,
    language: input.language,
    place,
    audit,
    contact,
    score,
    issues: deduped,
    totalIssueValue,
    scrapedAt: new Date(),
  }
}
