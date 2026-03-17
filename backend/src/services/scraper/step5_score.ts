import Anthropic from '@anthropic-ai/sdk'
import type { ScrapedLead, LeadScore } from './types'

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })

// Simple in-memory cache: domain → { score, expires }
const scoreCache = new Map<string, { score: LeadScore; expires: number }>()

function getContactQuality(lead: Omit<ScrapedLead, 'score'>): 'direct' | 'generic' | 'phone_only' | 'none' {
  if (lead.contact.email && !lead.contact.emailIsGeneric) return 'direct'
  if (lead.contact.email) return 'generic'
  if (lead.contact.phone) return 'phone_only'
  return 'none'
}

export async function scoreLead(lead: Omit<ScrapedLead, 'score'>): Promise<LeadScore> {
  const domain = lead.domain

  // Check cache
  const cached = scoreCache.get(domain)
  if (cached && cached.expires > Date.now()) return cached.score

  const contactQuality = getContactQuality(lead)

  const issueLines = lead.issues.slice(0, 10).map(i => `- [${i.severity}] ${i.title}`).join('\n')

  const userPrompt = `Score this lead for outreach priority.

Business: ${lead.businessName} (${lead.domain})
Niche: ${lead.niche} | City: ${lead.place.address}
Google rating: ${lead.place.rating ?? 'N/A'} (${lead.place.reviewCount ?? 0} reviews)
No website: ${lead.audit === null}

Issues found (${lead.issues.length}):
${issueLines || '- none detected'}

Contact quality: ${contactQuality === 'direct' ? 'direct personal email' : contactQuality === 'generic' ? 'generic email only' : contactQuality === 'phone_only' ? 'phone/WhatsApp only' : 'no contact found'}

Respond with valid JSON only:
{
  "score": 1-10,
  "priority": "high|med|low",
  "reasoning": "one sentence max",
  "estimatedDeal": number in EUR,
  "topIssues": ["issue1","issue2","issue3"]
}`

  try {
    const msg = await client.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 300,
      temperature: 0,
      system: 'You score sales leads for a digital agency. Respond with valid JSON only. No markdown. No explanation.',
      messages: [{ role: 'user', content: userPrompt }],
    })

    const text = (msg.content[0] as any).text as string
    const parsed = JSON.parse(text.trim())

    const score: LeadScore = {
      score: Math.max(1, Math.min(10, parseInt(parsed.score) || 5)),
      priority: parsed.priority || (parsed.score >= 7 ? 'high' : parsed.score >= 4 ? 'med' : 'low'),
      reasoning: parsed.reasoning || '',
      estimatedDeal: parsed.estimatedDeal || 0,
      topIssues: (parsed.topIssues || []).slice(0, 3),
      contactQuality,
    }

    // Cache for 24h
    scoreCache.set(domain, { score, expires: Date.now() + 24 * 60 * 60 * 1000 })
    return score
  } catch {
    // Fallback scoring
    const criticalCount = lead.issues.filter(i => i.severity === 'critical').length
    const baseScore = Math.min(10, Math.max(1,
      criticalCount * 2 +
      (contactQuality === 'direct' ? 2 : contactQuality === 'generic' ? 1 : 0) +
      (lead.contact.whatsappActive ? 1 : 0) +
      ((lead.place.reviewCount ?? 0) > 20 ? 1 : 0) -
      (lead.audit === null ? 3 : 0)
    ))

    const score: LeadScore = {
      score: baseScore,
      priority: baseScore >= 7 ? 'high' : baseScore >= 4 ? 'med' : 'low',
      reasoning: 'Scored by rule engine (Claude unavailable)',
      estimatedDeal: lead.issues.reduce((sum, i) => sum + i.price, 0),
      topIssues: lead.issues.slice(0, 3).map(i => i.title),
      contactQuality,
    }

    scoreCache.set(domain, { score, expires: Date.now() + 60 * 60 * 1000 })
    return score
  }
}
