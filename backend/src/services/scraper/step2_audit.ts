import axios from 'axios'
import * as cheerio from 'cheerio'
import type { TechnicalAudit } from './types'
import { FREE_EMAIL_PROVIDERS, CHATBOT_SIGNATURES, ANALYTICS_SIGNATURES } from './constants'

function extractEmailsFromPage($: ReturnType<typeof cheerio.load>): string[] {
  const emails: string[] = []
  $('a[href^="mailto:"]').each((_, el) => {
    const href = $(el).attr('href') || ''
    const email = href.replace('mailto:', '').split('?')[0].trim().toLowerCase()
    if (email && email.includes('@')) emails.push(email)
  })
  // also scan text for email patterns
  const html = $.html()
  const emailRegex = /[a-zA-Z0-9._%+\-]+@[a-zA-Z0-9.\-]+\.[a-zA-Z]{2,}/g
  const found = html.match(emailRegex) || []
  found.forEach(e => {
    const clean = e.toLowerCase()
    if (!emails.includes(clean)) emails.push(clean)
  })
  return [...new Set(emails)]
}

async function fetchPageSpeed(url: string): Promise<Partial<TechnicalAudit>> {
  const apiKey = process.env.PAGESPEED_API_KEY || ''
  const params = new URLSearchParams({
    url,
    strategy: 'mobile',
    category: ['performance', 'accessibility', 'best-practices', 'seo'].join('&category='),
  })
  if (apiKey) params.set('key', apiKey)

  const psUrl = `https://www.googleapis.com/pagespeedonline/v5/runPagespeed?${params}&category=performance&category=accessibility&category=best-practices&category=seo`

  const res = await axios.get(psUrl, { timeout: 30000 })
  const data = res.data
  const cats = data.lighthouseResult?.categories || {}
  const audits = data.lighthouseResult?.audits || {}

  const scores = {
    performance: Math.round((cats.performance?.score ?? 0) * 100),
    accessibility: Math.round((cats.accessibility?.score ?? 0) * 100),
    bestPractices: Math.round((cats['best-practices']?.score ?? 0) * 100),
    seo: Math.round((cats.seo?.score ?? 0) * 100),
  }

  const loadTime = Math.round(
    audits['first-contentful-paint']?.numericValue ??
    audits['largest-contentful-paint']?.numericValue ?? 0
  )

  const failingAudits = Object.values(audits as Record<string, any>)
    .filter((a: any) => a.score !== null && a.score < 0.9 && a.title)
    .sort((a: any, b: any) => (a.score ?? 0) - (b.score ?? 0))
    .slice(0, 7)
    .map((a: any) => a.title as string)

  return { scores, loadTime, failingAudits }
}

async function scrapeWebsite(url: string): Promise<Partial<TechnicalAudit>> {
  const res = await axios.get(url, {
    timeout: 8000,
    maxRedirects: 5,
    headers: {
      'User-Agent': 'Mozilla/5.0 (compatible; AmanaBot/1.0)',
      'Accept-Language': 'fr,de,en;q=0.9,ar;q=0.8',
    },
  })

  const $ = cheerio.load(res.data as string)
  const rawHtml = res.data as string
  const textContent = $('body').text().replace(/\s+/g, ' ').trim()

  const hasSSL = url.startsWith('https://')

  const hasMobileMenu = $('[class*="burger"],[class*="hamburger"],[class*="mobile-nav"],[aria-label*="menu"],[class*="nav-toggle"]').length > 0

  const hasContactForm = $('form').filter((_, el) =>
    $(el).find('input[type="email"],input[name*="mail"],input[name*="email"]').length > 0
  ).length > 0

  const hasClickToCall = $('a[href^="tel:"]').length > 0

  const hasFacebook = $('a[href*="facebook.com"]').length > 0
  const hasInstagram = $('a[href*="instagram.com"]').length > 0
  const hasLinkedIn = $('a[href*="linkedin.com"]').length > 0
  const hasYouTube = $('a[href*="youtube.com"],iframe[src*="youtube"]').length > 0
  const hasVideo = $('video,iframe[src*="youtube"],iframe[src*="vimeo"]').length > 0

  const hasChatBot = CHATBOT_SIGNATURES.some(sig => rawHtml.includes(sig))
  const hasAnalytics = ANALYTICS_SIGNATURES.some(sig => rawHtml.includes(sig))

  const hasStructuredData = $('script[type="application/ld+json"]').length > 0
  const hasOpenGraph = $('meta[property^="og:"]').length > 0

  const emails = extractEmailsFromPage($)
  let domain = ''
  try { domain = new URL(url).hostname.replace(/^www\./, '') } catch {}
  const hasProfessionalEmail = emails.some(e =>
    e.includes('@' + domain) || !FREE_EMAIL_PROVIDERS.some(p => e.includes('@' + p))
  )

  const metaDescription = $('meta[name="description"]').attr('content')?.trim() || null
  const pageTitle = $('title').text().trim() || null

  const footerText = $('footer').text() + $('body').text().slice(-2000)
  const yearMatch = footerText.match(/©\s*(20\d{2})/)
  const copyrightYear = yearMatch ? parseInt(yearMatch[1]) : null
  const isOutdated = copyrightYear !== null && copyrightYear < 2021

  const gen = $('meta[name="generator"]').attr('content') || ''
  const wordpressVersion = gen.includes('WordPress') ? gen.replace('WordPress ', '').trim() : null
  const isWordpressOutdated = wordpressVersion ? parseFloat(wordpressVersion) < 6.4 : false

  const imgs = $('img')
  const withAlt = imgs.filter((_, el) => ($(el).attr('alt') || '').trim().length > 0).length
  const imagesWithAlt = imgs.length > 0 ? Math.round((withAlt / imgs.length) * 100) : 100

  const llmReadableRatio = Math.round((textContent.length / rawHtml.length) * 100)

  const aiVisibilityScore = Math.min(100, Math.round(
    (llmReadableRatio > 25 ? 30 : llmReadableRatio * 1.2) +
    (hasStructuredData ? 25 : 0) +
    (hasOpenGraph ? 20 : 0) +
    (imagesWithAlt > 80 ? 15 : imagesWithAlt * 0.15) +
    (metaDescription ? 10 : 0)
  ))

  const hasFreeEmail = !hasProfessionalEmail
  const hasNoSocial = !hasFacebook && !hasInstagram && !hasLinkedIn && !hasYouTube

  return {
    hasSSL, hasMobileMenu, hasContactForm, hasClickToCall,
    hasFacebook, hasInstagram, hasLinkedIn, hasYouTube, hasVideo,
    hasChatBot, hasAnalytics, hasStructuredData, hasOpenGraph,
    hasProfessionalEmail, metaDescription, pageTitle,
    copyrightYear, wordpressVersion, imagesWithAlt,
    llmReadableRatio, aiVisibilityScore,
    isOutdated, hasFreeEmail, hasNoSocial, isWordpressOutdated,
  }
}

export async function auditWebsite(website: string): Promise<TechnicalAudit | null> {
  try {
    const normalizedUrl = website.startsWith('http') ? website : `https://${website}`

    const [psResult, scrapeResult] = await Promise.allSettled([
      fetchPageSpeed(normalizedUrl),
      scrapeWebsite(normalizedUrl),
    ])

    const ps = psResult.status === 'fulfilled' ? psResult.value : {}
    const sc = scrapeResult.status === 'fulfilled' ? scrapeResult.value : {}

    // If both failed → return null
    if (psResult.status === 'rejected' && scrapeResult.status === 'rejected') {
      return null
    }

    return {
      scores: (ps as any).scores ?? { performance: 0, accessibility: 0, bestPractices: 0, seo: 0 },
      loadTime: (ps as any).loadTime ?? 0,
      failingAudits: (ps as any).failingAudits ?? [],
      hasSSL: (sc as any).hasSSL ?? normalizedUrl.startsWith('https://'),
      hasMobileMenu: (sc as any).hasMobileMenu ?? false,
      hasContactForm: (sc as any).hasContactForm ?? false,
      hasClickToCall: (sc as any).hasClickToCall ?? false,
      hasFacebook: (sc as any).hasFacebook ?? false,
      hasInstagram: (sc as any).hasInstagram ?? false,
      hasLinkedIn: (sc as any).hasLinkedIn ?? false,
      hasYouTube: (sc as any).hasYouTube ?? false,
      hasVideo: (sc as any).hasVideo ?? false,
      hasChatBot: (sc as any).hasChatBot ?? false,
      hasAnalytics: (sc as any).hasAnalytics ?? false,
      hasStructuredData: (sc as any).hasStructuredData ?? false,
      hasOpenGraph: (sc as any).hasOpenGraph ?? false,
      hasProfessionalEmail: (sc as any).hasProfessionalEmail ?? false,
      metaDescription: (sc as any).metaDescription ?? null,
      pageTitle: (sc as any).pageTitle ?? null,
      copyrightYear: (sc as any).copyrightYear ?? null,
      wordpressVersion: (sc as any).wordpressVersion ?? null,
      imagesWithAlt: (sc as any).imagesWithAlt ?? 100,
      llmReadableRatio: (sc as any).llmReadableRatio ?? 0,
      aiVisibilityScore: (sc as any).aiVisibilityScore ?? 0,
      isOutdated: (sc as any).isOutdated ?? false,
      hasFreeEmail: (sc as any).hasFreeEmail ?? true,
      hasNoSocial: (sc as any).hasNoSocial ?? true,
      isWordpressOutdated: (sc as any).isWordpressOutdated ?? false,
    }
  } catch {
    return null
  }
}
