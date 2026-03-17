'use client'
import { useState, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { setToken } from '@/lib/command-auth'

const LionLogo = () => (
  <svg width="80" height="80" viewBox="0 0 100 100" fill="none">
    {/* Geometric lion head */}
    <polygon points="50,8 70,25 80,50 70,75 50,92 30,75 20,50 30,25" fill="none" stroke="#C9A84C" strokeWidth="2"/>
    <polygon points="50,18 65,30 72,50 65,70 50,82 35,70 28,50 35,30" fill="rgba(201,168,76,0.1)" stroke="#C9A84C" strokeWidth="1.5"/>
    {/* Eyes */}
    <circle cx="40" cy="44" r="4" fill="#C9A84C"/>
    <circle cx="60" cy="44" r="4" fill="#C9A84C"/>
    <circle cx="40" cy="44" r="2" fill="#0A0A0F"/>
    <circle cx="60" cy="44" r="2" fill="#0A0A0F"/>
    {/* Nose */}
    <polygon points="50,52 46,58 54,58" fill="#C9A84C" opacity="0.8"/>
    {/* Mane lines */}
    <line x1="50" y1="8" x2="50" y2="18" stroke="#C9A84C" strokeWidth="1.5" opacity="0.6"/>
    <line x1="70" y1="25" x2="65" y2="30" stroke="#C9A84C" strokeWidth="1.5" opacity="0.6"/>
    <line x1="80" y1="50" x2="72" y2="50" stroke="#C9A84C" strokeWidth="1.5" opacity="0.6"/>
    <line x1="70" y1="75" x2="65" y2="70" stroke="#C9A84C" strokeWidth="1.5" opacity="0.6"/>
    <line x1="30" y1="25" x2="35" y2="30" stroke="#C9A84C" strokeWidth="1.5" opacity="0.6"/>
    <line x1="20" y1="50" x2="28" y2="50" stroke="#C9A84C" strokeWidth="1.5" opacity="0.6"/>
  </svg>
)

export default function CommandLogin() {
  const [code, setCode] = useState('')
  const [loading, setLoading] = useState(false)
  const [shaking, setShaking] = useState(false)
  const router = useRouter()
  const inputRef = useRef<HTMLInputElement>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    try {
      const res = await fetch('/api/auth', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code }),
      })
      const data = await res.json()
      if (data.valid && data.token) {
        setToken(data.token)
        router.push('/command/dashboard')
      } else {
        setShaking(true)
        setCode('')
        setTimeout(() => setShaking(false), 400)
        inputRef.current?.focus()
      }
    } catch {
      setShaking(true)
      setTimeout(() => setShaking(false), 400)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{ background: '#0A0A0F', minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'var(--font-dm-sans), sans-serif', position: 'relative', overflow: 'hidden' }}>
      {/* Background orbs */}
      <div style={{ position: 'absolute', width: 400, height: 400, borderRadius: '50%', background: 'radial-gradient(circle, rgba(201,168,76,0.06) 0%, transparent 70%)', top: '10%', left: '20%', pointerEvents: 'none' }} className="orb-1" />
      <div style={{ position: 'absolute', width: 300, height: 300, borderRadius: '50%', background: 'radial-gradient(circle, rgba(45,212,191,0.04) 0%, transparent 70%)', bottom: '15%', right: '15%', pointerEvents: 'none' }} className="orb-2" />

      <div className="animate-fadeIn" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '28px', width: '100%', maxWidth: '380px', padding: '0 24px' }}>
        {/* Logo */}
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '12px' }}>
          <LionLogo />
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: '11px', letterSpacing: '0.25em', color: 'rgba(201,168,76,0.6)', textTransform: 'uppercase', marginBottom: '4px' }}>AmanaHub</div>
            <h1 style={{ fontSize: '28px', fontWeight: 700, color: '#C9A84C', margin: 0, letterSpacing: '-0.02em' }}>Command Center</h1>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className={shaking ? 'animate-shake' : ''} style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: '12px' }}>
          <input
            ref={inputRef}
            type="password"
            value={code}
            onChange={(e) => setCode(e.target.value)}
            placeholder="Access code"
            autoComplete="off"
            className="cc-input"
            style={{ textAlign: 'center', letterSpacing: '0.15em', fontSize: '16px', padding: '14px' }}
            autoFocus
          />
          <button
            type="submit"
            disabled={loading || !code}
            style={{
              background: code && !loading ? '#C9A84C' : 'rgba(201,168,76,0.3)',
              color: code && !loading ? '#0A0A0F' : 'rgba(201,168,76,0.5)',
              border: 'none',
              borderRadius: '6px',
              padding: '14px',
              fontSize: '15px',
              fontWeight: 700,
              letterSpacing: '0.08em',
              cursor: code && !loading ? 'pointer' : 'not-allowed',
              transition: 'all 0.2s',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px',
            }}
          >
            {loading ? (
              <>
                <span
                  className="animate-spin"
                  style={{ display: 'inline-block', width: 16, height: 16, border: '2px solid rgba(0,0,0,0.3)', borderTopColor: '#0A0A0F', borderRadius: '50%' }}
                />
                Authenticating...
              </>
            ) : 'Access'}
          </button>
        </form>

        <div style={{ fontSize: '12px', color: 'rgba(242,237,228,0.2)', textAlign: 'center' }}>
          Internal access only · AmanaHub OÜ
        </div>
      </div>
    </div>
  )
}
