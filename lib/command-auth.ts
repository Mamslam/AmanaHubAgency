const TOKEN_KEY = 'cc_token'
const TOKEN_EXPIRY = 24 * 60 * 60 * 1000 // 24h

export function getToken(): string | null {
  if (typeof window === 'undefined') return null
  return localStorage.getItem(TOKEN_KEY)
}

export function setToken(token: string): void {
  localStorage.setItem(TOKEN_KEY, token)
  localStorage.setItem(`${TOKEN_KEY}_ts`, Date.now().toString())
}

export function clearToken(): void {
  localStorage.removeItem(TOKEN_KEY)
  localStorage.removeItem(`${TOKEN_KEY}_ts`)
}

export function isAuthenticated(): boolean {
  if (typeof window === 'undefined') return false
  const token = localStorage.getItem(TOKEN_KEY)
  const ts = localStorage.getItem(`${TOKEN_KEY}_ts`)
  if (!token || !ts) return false
  if (Date.now() - parseInt(ts) > TOKEN_EXPIRY) {
    clearToken()
    return false
  }
  return true
}
