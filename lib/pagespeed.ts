export interface PageSpeedScores {
  performance: number
  accessibility: number
  bestPractices: number
  seo: number
}

export interface PageSpeedResult {
  scores: PageSpeedScores
  failingAudits: string[]
}

export async function fetchPageSpeed(url: string): Promise<PageSpeedResult> {
  const endpoint = `https://www.googleapis.com/pagespeedonline/v5/runPagespeed?url=${encodeURIComponent(url)}&strategy=mobile&category=performance&category=accessibility&category=best-practices&category=seo`

  const res = await fetch(endpoint)
  if (!res.ok) throw new Error(`PageSpeed API error: ${res.status}`)

  const data = await res.json()
  const cats = data.lighthouseResult?.categories ?? {}
  const audits = data.lighthouseResult?.audits ?? {}

  const scores: PageSpeedScores = {
    performance: Math.round((cats.performance?.score ?? 0) * 100),
    accessibility: Math.round((cats.accessibility?.score ?? 0) * 100),
    bestPractices: Math.round((cats['best-practices']?.score ?? 0) * 100),
    seo: Math.round((cats.seo?.score ?? 0) * 100),
  }

  const failing = Object.values(audits as Record<string, { score: number | null; title: string; description?: string }>)
    .filter(a => a.score !== null && a.score < 0.9)
    .sort((a, b) => (a.score ?? 0) - (b.score ?? 0))
    .slice(0, 7)
    .map(a => `${a.title}: ${(a.description ?? '').substring(0, 120)}`)

  return { scores, failingAudits: failing }
}
