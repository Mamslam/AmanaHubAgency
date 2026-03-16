import { NextRequest, NextResponse } from 'next/server'

const sleep = (ms: number) => new Promise(r => setTimeout(r, ms))

async function fetchWithRetry(url: string, retries = 3, delayMs = 3000): Promise<Response> {
  for (let i = 0; i < retries; i++) {
    const res = await fetch(url, { cache: 'no-store' })
    if (res.status !== 429) return res
    if (i < retries - 1) await sleep(delayMs * (i + 1))
  }
  throw new Error('PageSpeed API rate limit exceeded. Please wait a moment and try again.')
}

export async function POST(req: NextRequest) {
  const { url } = await req.json()

  const key = process.env.PAGESPEED_API_KEY
  const keyParam = key ? `&key=${key}` : ''
  const endpoint = `https://www.googleapis.com/pagespeedonline/v5/runPagespeed?url=${encodeURIComponent(url)}&strategy=mobile&category=performance&category=accessibility&category=best-practices&category=seo${keyParam}`

  try {
    const res = await fetchWithRetry(endpoint)
    if (!res.ok) {
      const body = await res.text()
      throw new Error(`PageSpeed API error ${res.status}: ${body.slice(0, 200)}`)
    }

    const data = await res.json()
    const cats = data.lighthouseResult?.categories ?? {}
    const audits = data.lighthouseResult?.audits ?? {}

    const scores = {
      performance: Math.round((cats.performance?.score ?? 0) * 100),
      accessibility: Math.round((cats.accessibility?.score ?? 0) * 100),
      bestPractices: Math.round((cats['best-practices']?.score ?? 0) * 100),
      seo: Math.round((cats.seo?.score ?? 0) * 100),
    }

    const failingAudits = Object.values(
      audits as Record<string, { score: number | null; title: string; description?: string }>
    )
      .filter(a => a.score !== null && a.score < 0.9)
      .sort((a, b) => (a.score ?? 0) - (b.score ?? 0))
      .slice(0, 7)
      .map(a => `${a.title}: ${(a.description ?? '').substring(0, 120)}`)

    return NextResponse.json({ scores, failingAudits })
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
