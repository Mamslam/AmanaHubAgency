'use client'
import { useEffect, useState } from 'react'
import PortalModal from './PortalModal'

const SECRET = ['a', 'm', 'a', 'n', 'a']

export default function KonamiListener() {
  const [sequence, setSequence] = useState<string[]>([])
  const [showModal, setShowModal] = useState(false)

  useEffect(() => {
    let timeout: NodeJS.Timeout

    const handleKey = (e: KeyboardEvent) => {
      const key = e.key.toLowerCase()
      clearTimeout(timeout)

      setSequence(prev => {
        const next = [...prev, key]
        const trimmed = next.slice(-SECRET.length)

        if (trimmed.join('') === SECRET.join('')) {
          setShowModal(true)
          return []
        }

        timeout = setTimeout(() => setSequence([]), 2000)
        return trimmed
      })
    }

    window.addEventListener('keydown', handleKey)
    return () => {
      window.removeEventListener('keydown', handleKey)
      clearTimeout(timeout)
    }
  }, [])

  if (!showModal) return null
  return <PortalModal onClose={() => setShowModal(false)} />
}
