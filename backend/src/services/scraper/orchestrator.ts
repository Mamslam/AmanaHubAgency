import pLimit from 'p-limit'
import { findPlaces } from './step1_places'
import { auditWebsite } from './step2_audit'
import { findContact } from './step3_contact'
import { detectIssues } from './step4_issues'
import { scoreLead } from './step5_score'
import { assembleLead } from './step6_assemble'
import { prisma } from '../../lib/prisma'
import type { ScraperInput, ScrapedLead, PlaceResult, ProgressEvent } from './types'

const AUDIT_CONCURRENCY = 5
const SCORE_CONCURRENCY = 10

export async function runScraper(
  input: ScraperInput,
  onProgress: (event: ProgressEvent) => void
): Promise<ScrapedLead[]> {
  // PHASE 1: Find places
  onProgress({ phase: 1, label: `Searching for ${input.niche} businesses in ${input.city}...`, current: 0, total: input.limit })

  let places: PlaceResult[] = []
  try {
    places = await findPlaces(input)
  } catch (err: any) {
    onProgress({ phase: 1, label: `Search failed: ${err.message}`, current: 0, total: 0 })
    return []
  }

  onProgress({ phase: 1, label: `Found ${places.length} businesses`, current: places.length, total: places.length })

  if (places.length === 0) return []

  // PHASE 2: Audit + Contact per lead
  const auditLimit = pLimit(AUDIT_CONCURRENCY)
  const partialLeads: Omit<ScrapedLead, 'score'>[] = []
  let doneCount = 0

  const auditTasks = places.map((place, i) =>
    auditLimit(async () => {
      onProgress({
        phase: 2,
        label: `Analyzing ${place.name}...`,
        current: doneCount,
        total: places.length,
      })

      const domain = place.website
        ? (() => {
            try {
              return new URL(place.website.startsWith('http') ? place.website : `https://${place.website}`).hostname.replace(/^www\./, '')
            } catch { return place.website.replace(/^https?:\/\//, '').replace(/^www\./, '').split('/')[0] }
          })()
        : ''

      const [audit, contact] = await Promise.all([
        place.website ? auditWebsite(place.website) : Promise.resolve(null),
        domain ? findContact(domain, place.phone, input.country) : Promise.resolve({
          email: null, emailConfidence: 0, emailSource: null as any,
          emailIsGeneric: false, contactName: null, phone: place.phone,
          phoneFormatted: null, whatsapp: null, whatsappActive: false, linkedin: null,
        }),
      ])

      const issues = detectIssues(audit, place)

      const partial: Omit<ScrapedLead, 'score'> = {
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
        issues,
        totalIssueValue: issues.reduce((s, i) => s + i.price, 0),
        scrapedAt: new Date(),
      }

      partialLeads.push(partial)
      doneCount++

      onProgress({
        phase: 2,
        label: `Analyzed ${place.name}`,
        current: doneCount,
        total: places.length,
        lead: {
          name: place.name,
          domain,
          issueCount: issues.length,
        },
      })
    })
  )

  await Promise.all(auditTasks)

  // PHASE 3: Score all leads
  onProgress({ phase: 3, label: 'Scoring leads with AI...', current: 0, total: partialLeads.length })

  const scoreLimit = pLimit(SCORE_CONCURRENCY)
  const scoredLeads: ScrapedLead[] = []

  const scoreTasks = partialLeads.map(partial =>
    scoreLimit(async () => {
      const score = await scoreLead(partial)
      const lead = assembleLead(partial.place, partial.audit, partial.contact, partial.issues, score, input)
      scoredLeads.push(lead)
    })
  )

  await Promise.all(scoreTasks)

  onProgress({ phase: 3, label: `Scored ${scoredLeads.length} leads`, current: scoredLeads.length, total: scoredLeads.length })

  // PHASE 4: Filter, sort, save
  const filtered = scoredLeads
    .filter(l => l.score.score >= 3)
    .sort((a, b) => b.score.score - a.score.score || (b.place.reviewCount ?? 0) - (a.place.reviewCount ?? 0))

  // Save to DB (upsert by domain)
  for (const lead of filtered) {
    if (!lead.domain) continue
    try {
      await prisma.lead.upsert({
        where: { domain: lead.domain },
        update: {
          businessName: lead.businessName,
          contactEmail: lead.contact.email || undefined,
          contactPhone: lead.contact.phone || undefined,
          contactName: lead.contact.contactName || undefined,
          city: lead.city,
          country: lead.country,
          niche: lead.niche,
          language: lead.language,
          aigencyIssues: lead.issues.slice(0, 5).map(i => i.title),
          leadScore: lead.score.score,
        },
        create: {
          domain: lead.domain,
          businessName: lead.businessName,
          contactEmail: lead.contact.email || undefined,
          contactPhone: lead.contact.phone || undefined,
          contactName: lead.contact.contactName || undefined,
          city: lead.city,
          country: lead.country,
          niche: lead.niche,
          language: lead.language,
          aigencyIssues: lead.issues.slice(0, 5).map(i => i.title),
          leadScore: lead.score.score,
          status: 'PROSPECT',
        },
      })
    } catch { /* skip duplicate domain errors */ }
  }

  onProgress({ phase: 4, label: `Complete — ${filtered.length} leads saved`, current: filtered.length, total: filtered.length })

  return filtered
}
