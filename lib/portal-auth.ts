const STORAGE_KEY = 'ah_portal'
const MAX_AGE_MS = 8 * 60 * 60 * 1000 // 8 hours

interface PortalSession {
  token: string
  ts: number
}

export function setPortalToken(token: string): void {
  if (typeof window === 'undefined') return
  localStorage.setItem(STORAGE_KEY, JSON.stringify({ token, ts: Date.now() }))
}

export function getPortalToken(): string | null {
  if (typeof window === 'undefined') return null
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return null
    const session: PortalSession = JSON.parse(raw)
    if (Date.now() - session.ts > MAX_AGE_MS) {
      localStorage.removeItem(STORAGE_KEY)
      return null
    }
    return session.token
  } catch {
    return null
  }
}

export function clearPortalToken(): void {
  if (typeof window === 'undefined') return
  localStorage.removeItem(STORAGE_KEY)
}
