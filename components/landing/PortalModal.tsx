'use client'
import { useState, useEffect, useRef } from 'react'
import { motion } from 'framer-motion'
import { setPortalToken } from '@/lib/portal-auth'
import { useRouter } from 'next/navigation'
import { Lock } from 'lucide-react'

export default function PortalModal({ onClose }: { onClose: () => void }) {
  const [code, setCode] = useState('')
  const [shake, setShake] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)
  const router = useRouter()

  useEffect(() => {
    inputRef.current?.focus()
    const handleKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose() }
    window.addEventListener('keydown', handleKey)
    return () => window.removeEventListener('keydown', handleKey)
  }, [onClose])

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
      router.push('/portal')
    } else {
      setShake(true)
      setTimeout(() => setShake(false), 600)
      setCode('')
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm" onClick={onClose}>
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.9 }}
        onClick={e => e.stopPropagation()}
        className="glass-card rounded-2xl p-8 w-full max-w-sm mx-4"
        style={{ border: '1px solid rgba(201, 168, 76, 0.3)' }}
      >
        <div className="flex justify-center mb-6">
          <div className="p-3 rounded-xl bg-[#C9A84C]/10 border border-[#C9A84C]/20">
            <Lock size={24} className="text-[#C9A84C]" />
          </div>
        </div>
        <h2 className="font-playfair text-xl font-bold text-[#F2EDE4] text-center mb-6">Enter Access Code</h2>
        <form onSubmit={handleSubmit}>
          <motion.div
            animate={shake ? { x: [-8, 8, -8, 8, 0] } : {}}
            transition={{ duration: 0.4 }}
          >
            <input
              ref={inputRef}
              type="password"
              value={code}
              onChange={e => setCode(e.target.value)}
              placeholder="Access code"
              className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-[#F2EDE4] placeholder-white/30 focus:outline-none focus:border-[#C9A84C]/50 mb-4"
            />
          </motion.div>
          <button
            type="submit"
            className="w-full py-3 bg-[#C9A84C] text-[#0A0A0F] rounded-xl font-semibold hover:bg-[#C9A84C]/90 transition-colors"
          >
            Access
          </button>
        </form>
      </motion.div>
    </div>
  )
}
