'use client'
import { useEffect, useState } from 'react'

const scoreColor = (score: number) =>
  score >= 90 ? '#16a34a' : score >= 50 ? '#d97706' : '#dc2626'

export default function ScoreRing({ score, label }: { score: number; label: string }) {
  const [displayed, setDisplayed] = useState(0)
  const r = 36
  const circumference = 2 * Math.PI * r
  const offset = circumference - (displayed / 100) * circumference
  const color = scoreColor(score)

  useEffect(() => {
    const timer = setTimeout(() => {
      let current = 0
      const interval = setInterval(() => {
        current += 2
        if (current >= score) { setDisplayed(score); clearInterval(interval) }
        else setDisplayed(current)
      }, 16)
      return () => clearInterval(interval)
    }, 200)
    return () => clearTimeout(timer)
  }, [score])

  return (
    <div className="flex flex-col items-center gap-2">
      <div className="relative w-24 h-24">
        <svg className="w-24 h-24 -rotate-90" viewBox="0 0 100 100">
          <circle cx="50" cy="50" r={r} fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="8" />
          <circle
            cx="50" cy="50" r={r} fill="none"
            stroke={color} strokeWidth="8"
            strokeDasharray={circumference}
            strokeDashoffset={offset}
            strokeLinecap="round"
            style={{ transition: 'stroke-dashoffset 0.05s linear' }}
          />
        </svg>
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="font-bold text-xl" style={{ color }}>{displayed}</span>
        </div>
      </div>
      <span className="text-[#F2EDE4]/60 text-xs text-center">{label}</span>
    </div>
  )
}
