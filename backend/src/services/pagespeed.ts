import axios from 'axios'

export interface PageSpeedResult {
  performance: number
  accessibility: number
  bestPractices: number
  seo: number
  failingAudits: string[]
  loadTime: string
}

const CACHE = new Map<string, { result: PageSpeedResult; ts: number }>()
const CACHE_TTL = 24 * 60 * 60 * 1000 // 24h

export async function fetchPageSpeed(url: string): Promise<PageSpeedResult> {
  const cacheKey = url.toLowerCase()
  const cached = CACHE.get(cacheKey)
  if (cached && Date.now() - cached.ts < CACHE_TTL) {
    return cached.result
  }

  const apiUrl = `https://www.googleapis.com/pagespeedonline/v5/runPagespeed?url=${encodeURIComponent(url)}&strategy=mobile&key=${process.env.PAGESPEED_API_KEY || ''}`

  let attempt = 0
  while (attempt < 2) {
    try {
      const res = await axios.get(apiUrl, { timeout: 30000 })
      const cats = res.data.lighthouseResult?.categories || {}
      const audits = res.data.lighthouseResult?.audits || {}

      const result: PageSpeedResult = {
        performance: Math.round((cats.performance?.score || 0) * 100),
        accessibility: Math.round((cats.accessibility?.score || 0) * 100),
        bestPractices: Math.round((cats['best-practices']?.score || 0) * 100),
        seo: Math.round((cats.seo?.score || 0) * 100),
        failingAudits: Object.entries(audits)
          .filter(([, a]: [string, any]) => a.score !== null && a.score < 0.9 && a.title)
          .slice(0, 7)
          .map(([, a]: [string, any]) => a.title),
        loadTime: audits['speed-index']?.displayValue || 'Unknown',
      }

      CACHE.set(cacheKey, { result, ts: Date.now() })
      return result
    } catch (err: any) {
      attempt++
      if (attempt >= 2) throw new Error(`PageSpeed failed: ${err.message}`)
      await new Promise(r => setTimeout(r, 2000))
    }
  }
  throw new Error('PageSpeed unreachable')
}
