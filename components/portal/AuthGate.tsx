'use client'
import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { getPortalToken, setPortalToken } from '@/lib/portal-auth'
import AuditTool from './AuditTool'

export default function AuthGate() {
  const [authed, setAuthed] = useState(false)
  const [checked, setChecked] = useState(false)
  const [code, setCode] = useState('')
  const [shake, setShake] = useState(false)

  useEffect(() => {
    const token = getPortalToken()
    setAuthed(!!token)
    setChecked(true)
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    const res = await fetch('/api/auth', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ code }),
    })
    const data = await res.json()
    if (data.valid) {
      setPortalToken(data.token)
      setAuthed(true)
    } else {
      setShake(true)
      setTimeout(() => setShake(false), 600)
      setCode('')
    }
  }

  if (!checked) return null
  if (authed) return <AuditTool />

  return (
    <div className="min-h-screen bg-[#0A0A0F] flex items-center justify-center px-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-sm"
      >
        <div className="glass-card rounded-2xl p-10" style={{ border: '1px solid rgba(201, 168, 76, 0.2)' }}>
          {/* Logo */}
          <div className="flex justify-center mb-8">
            <div className="w-16 h-16 bg-[#C9A84C] rounded-xl flex items-center justify-center">
              <span className="font-playfair font-bold text-2xl text-[#0A0A0F]">AH</span>
            </div>
          </div>

          <h1 className="font-playfair text-2xl font-bold text-[#F2EDE4] text-center mb-8">Portal Access</h1>

          <form onSubmit={handleSubmit}>
            <motion.div animate={shake ? { x: [-8, 8, -8, 8, 0] } : {}} transition={{ duration: 0.4 }}>
              <input
                type="password"
                value={code}
                onChange={e => setCode(e.target.value)}
                placeholder="Access code"
                autoFocus
                className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-[#F2EDE4] placeholder-white/30 focus:outline-none focus:border-[#C9A84C]/50 mb-4"
              />
            </motion.div>
            <button
              type="submit"
              className="w-full py-3 bg-[#C9A84C] text-[#0A0A0F] rounded-xl font-bold text-lg hover:bg-[#C9A84C]/90 transition-colors"
            >
              Enter Portal
            </button>
          </form>
        </div>
      </motion.div>
    </div>
  )
}
