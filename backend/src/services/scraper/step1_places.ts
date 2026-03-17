import axios from 'axios'
import type { ScraperInput, PlaceResult } from './types'

const PLACES_BASE = 'https://maps.googleapis.com/maps/api/place/textsearch/json'

function extractPlaceResult(result: any): PlaceResult {
  const website = result.website || null
  const phone = result.formatted_phone_number || result.international_phone_number || null
  const claimed = !!(result.opening_hours || result.website || result.formatted_phone_number)

  return {
    name: result.name || '',
    address: result.formatted_address || result.vicinity || '',
    website,
    phone,
    place_id: result.place_id || '',
    rating: result.rating ?? null,
    reviewCount: result.user_ratings_total ?? null,
    claimed,
  }
}

async function fetchPage(
  query: string,
  language: string,
  pageToken?: string
): Promise<{ results: PlaceResult[]; nextPageToken?: string }> {
  const apiKey = process.env.GOOGLE_PLACES_API_KEY
  if (!apiKey) throw new Error('GOOGLE_PLACES_API_KEY not set')

  const params: Record<string, string> = {
    query,
    key: apiKey,
    language: language.toLowerCase(),
  }
  if (pageToken) params.pagetoken = pageToken

  const res = await axios.get(PLACES_BASE, { params, timeout: 15000 })
  const data = res.data

  if (data.status === 'REQUEST_DENIED' || data.status === 'INVALID_REQUEST') {
    throw new Error(`Places API: ${data.status} — ${data.error_message}`)
  }
  if (data.status === 'OVER_QUERY_LIMIT') {
    throw new Error('QUOTA_EXCEEDED: Google Places API quota reached')
  }
  if (data.status === 'ZERO_RESULTS') {
    return { results: [] }
  }

  const results: PlaceResult[] = (data.results || [])
    .filter((r: any) => r.name && (r.formatted_address || r.vicinity))
    .filter((r: any) => (r.user_ratings_total ?? 0) <= 500)
    .map(extractPlaceResult)

  return {
    results,
    nextPageToken: data.next_page_token,
  }
}

export async function findPlaces(input: ScraperInput): Promise<PlaceResult[]> {
  const query = `${input.niche} in ${input.city} ${input.country}`
  const all: PlaceResult[] = []

  try {
    const page1 = await fetchPage(query, input.language)
    all.push(...page1.results)

    if (page1.nextPageToken && all.length < input.limit) {
      await new Promise(r => setTimeout(r, 2000))
      try {
        const page2 = await fetchPage(query, input.language, page1.nextPageToken)
        all.push(...page2.results)

        if (page2.nextPageToken && all.length < input.limit) {
          await new Promise(r => setTimeout(r, 2000))
          try {
            const page3 = await fetchPage(query, input.language, page2.nextPageToken)
            all.push(...page3.results)
          } catch { /* page 3 failure is acceptable */ }
        }
      } catch { /* page 2 failure is acceptable */ }
    }
  } catch (err: any) {
    if (err.message?.includes('QUOTA_EXCEEDED')) throw err
    if (err.code === 'ECONNREFUSED' || err.code === 'ETIMEDOUT') {
      await new Promise(r => setTimeout(r, 3000))
      try {
        const retry = await fetchPage(query, input.language)
        all.push(...retry.results)
      } catch {
        return []
      }
    }
    return all
  }

  return all
    .slice(0, input.limit)
    .sort((a, b) => (b.reviewCount ?? 0) - (a.reviewCount ?? 0))
}
