import axios from 'axios'
import * as cheerio from 'cheerio'
import type { ContactResult } from './types'
import { FREE_EMAIL_PROVIDERS, GENERIC_EMAIL_PREFIXES, CONTACT_PAGE_PATHS } from './constants'

function isGenericEmail(email: string): boolean {
  const prefix = email.split('@')[0].toLowerCase()
  return GENERIC_EMAIL_PREFIXES.some(g => prefix === g || prefix.startsWith(g + '.'))
}

function formatPhoneE164(phone: string, country: string): string | null {
  if (!phone) return null
  const digits = phone.replace(/\D/g, '')
  if (digits.length < 7) return null

  const countryPrefixes: Record<string, string> = {
    DE: '49', FR: '33', MA: '212', BE: '32', CH: '41',
    SN: '221', DZ: '213', TN: '216', AE: '971', SA: '966',
    GB: '44', US: '1',
  }
  const prefix = countryPrefixes[country.toUpperCase()]

  if (digits.startsWith('00')) return '+' + digits.slice(2)
  if (digits.startsWith('0') && prefix) return '+' + prefix + digits.slice(1)
  if (digits.startsWith('+')) return phone.replace(/\s/g, '')
  if (prefix && !digits.startsWith(prefix)) return '+' + prefix + digits

  return '+' + digits
}

async function scrapeContactPages(domain: string): Promise<{ email: string | null; name: string | null }> {
  for (const path of CONTACT_PAGE_PATHS) {
    try {
      const url = `https://${domain}${path}`
      const res = await axios.get(url, {
        timeout: 5000,
        headers: { 'User-Agent': 'Mozilla/5.0 (compatible; AmanaBot/1.0)' },
        maxRedirects: 3,
      })
      const $ = cheerio.load(res.data as string)

      // Extract mailto links
      const emails: string[] = []
      $('a[href^="mailto:"]').each((_, el) => {
        const href = $(el).attr('href') || ''
        const email = href.replace('mailto:', '').split('?')[0].trim().toLowerCase()
        if (email.includes('@')) emails.push(email)
      })

      // Also scan for email patterns
      const html = res.data as string
      const emailRegex = /[a-zA-Z0-9._%+\-]+@[a-zA-Z0-9.\-]+\.[a-zA-Z]{2,}/g
      const found = html.match(emailRegex) || []
      found.forEach(e => {
        const clean = e.toLowerCase()
        if (!emails.includes(clean)) emails.push(clean)
      })

      // Prefer non-generic emails
      const personal = emails.find(e => !isGenericEmail(e))
      if (personal) {
        // Try to find name near this email
        let name: string | null = null
        $('h1,h2,h3').each((_, el) => {
          const text = $(el).text().trim()
          if (/Gérant|Inhaber|Owner|Fondateur|Geschäftsführer|Manager|Directeur/i.test(text)) {
            // Adjacent text might be name
            const next = $(el).next().text().trim()
            if (next && next.length < 50) name = next
          }
        })
        return { email: personal, name }
      }

      // Return generic if nothing better
      const generic = emails.find(e => isGenericEmail(e))
      if (generic) return { email: generic, name: null }
    } catch {
      // try next path
    }
  }
  return { email: null, name: null }
}

async function hunterSearch(domain: string): Promise<{ email: string | null; confidence: number; name: string | null; linkedin: string | null }> {
  const apiKey = process.env.HUNTER_API_KEY
  if (!apiKey) return { email: null, confidence: 0, name: null, linkedin: null }

  try {
    const res = await axios.get('https://api.hunter.io/v2/domain-search', {
      params: { domain, api_key: apiKey, limit: 5 },
      timeout: 10000,
    })

    const emails = res.data?.data?.emails || []
    if (emails.length === 0) return { email: null, confidence: 0, name: null, linkedin: null }

    // Prefer decision-makers
    const priority = ['owner', 'founder', 'ceo', 'manager', 'director', 'president', 'partner']
    let best = emails.find((e: any) =>
      priority.some(p => (e.position || '').toLowerCase().includes(p)) && e.confidence >= 70
    )
    if (!best) best = emails.filter((e: any) => e.confidence >= 70)[0]
    if (!best) best = emails[0]

    if (!best) return { email: null, confidence: 0, name: null, linkedin: null }

    const name = [best.first_name, best.last_name].filter(Boolean).join(' ') || null
    const linkedin = best.linkedin || null

    return { email: best.value, confidence: best.confidence || 50, name, linkedin }
  } catch {
    return { email: null, confidence: 0, name: null, linkedin: null }
  }
}

async function checkWhatsApp(phoneE164: string): Promise<boolean> {
  try {
    const number = phoneE164.replace('+', '')
    await axios.head(`https://wa.me/${number}`, {
      timeout: 3000,
      maxRedirects: 2,
    })
    return true
  } catch {
    return false
  }
}

export async function findContact(
  domain: string,
  phone: string | null,
  country: string
): Promise<ContactResult> {
  const result: ContactResult = {
    email: null,
    emailConfidence: 0,
    emailSource: null,
    emailIsGeneric: false,
    contactName: null,
    phone,
    phoneFormatted: null,
    whatsapp: null,
    whatsappActive: false,
    linkedin: null,
  }

  // Format phone
  if (phone) {
    result.phoneFormatted = formatPhoneE164(phone, country)
  }

  // SIGNAL 1: Scrape contact pages
  try {
    const { email, name } = await scrapeContactPages(domain)
    if (email) {
      result.email = email
      result.emailIsGeneric = isGenericEmail(email)
      result.emailSource = 'website'
      result.emailConfidence = result.emailIsGeneric ? 30 : 80
      if (name) result.contactName = name
    }
  } catch { /* continue */ }

  // SIGNAL 2: Hunter.io (if no direct email found)
  if (!result.email || result.emailIsGeneric) {
    try {
      const hunter = await hunterSearch(domain)
      if (hunter.email && hunter.confidence >= 70) {
        // Prefer Hunter's direct contact over generic scraped
        if (!result.email || result.emailIsGeneric) {
          result.email = hunter.email
          result.emailConfidence = hunter.confidence
          result.emailSource = 'hunter'
          result.emailIsGeneric = isGenericEmail(hunter.email)
          if (hunter.name && !result.contactName) result.contactName = hunter.name
          if (hunter.linkedin) result.linkedin = hunter.linkedin
        }
      }
    } catch { /* continue */ }
  }

  // SIGNAL 3: Fall back to generic
  if (!result.email) {
    const generic = `info@${domain}`
    result.email = generic
    result.emailIsGeneric = true
    result.emailSource = 'gmb'
    result.emailConfidence = 30
  }

  // SIGNAL 4: WhatsApp check
  if (result.phoneFormatted) {
    result.whatsapp = result.phoneFormatted
    result.whatsappActive = await checkWhatsApp(result.phoneFormatted)
  }

  return result
}
