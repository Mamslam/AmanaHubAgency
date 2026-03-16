'use client'
import { motion, useInView } from 'framer-motion'
import { useTranslations } from 'next-intl'
import { useRef, useEffect, useState } from 'react'

function CountUp({ target, suffix }: { target: number; suffix?: string }) {
  const [count, setCount] = useState(0)
  const ref = useRef<HTMLSpanElement>(null)
  const inView = useInView(ref, { once: true })

  useEffect(() => {
    if (!inView) return
    const duration = 2000
    const steps = 60
    const increment = target / steps
    let current = 0
    const timer = setInterval(() => {
      current += increment
      if (current >= target) {
        setCount(target)
        clearInterval(timer)
      } else {
        setCount(Math.floor(current))
      }
    }, duration / steps)
    return () => clearInterval(timer)
  }, [inView, target])

  return <span ref={ref}>{count}{suffix}</span>
}

export default function StatsBanner() {
  const t = useTranslations('stats')
  const stats = [
    { value: 500, suffix: '+', label: t('clients') },
    { value: 12, suffix: '', label: t('countries') },
    { value: 98, suffix: '%', label: t('satisfaction') },
    { value: 4.9, suffix: '★', label: t('rating') },
  ]

  return (
    <section className="py-20 px-4 sm:px-6">
      <div className="max-w-5xl mx-auto glass-card rounded-2xl py-12 px-8">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
          {stats.map((stat, i) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
            >
              <div className="font-playfair text-4xl font-bold text-[#C9A84C] mb-2">
                <CountUp target={stat.value} suffix={stat.suffix} />
              </div>
              <div className="text-[#F2EDE4]/60 text-sm uppercase tracking-wide">{stat.label}</div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}
