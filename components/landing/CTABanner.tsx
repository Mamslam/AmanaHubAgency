'use client'
import { motion } from 'framer-motion'
import { useTranslations } from 'next-intl'
import { ArrowRight } from 'lucide-react'

export default function CTABanner() {
  const t = useTranslations('cta')
  return (
    <section
      id="contact"
      className="relative py-24 overflow-hidden"
      style={{ clipPath: 'polygon(0 8%, 100% 0, 100% 92%, 0 100%)' }}
    >
      <div className="absolute inset-0 bg-[#C9A84C]" />
      <div className="relative z-10 max-w-4xl mx-auto px-4 sm:px-6 text-center">
        <motion.h2
          className="font-playfair text-4xl sm:text-5xl font-bold text-[#0A0A0F] mb-8"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
        >
          {t('headline')}
        </motion.h2>
        <motion.a
          href="#"
          className="inline-flex items-center gap-2 px-10 py-5 bg-[#0A0A0F] text-[#F2EDE4] rounded-full font-semibold text-lg hover:bg-[#0A0A0F]/90 transition-all hover:scale-105"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.2 }}
        >
          {t('button')} <ArrowRight size={18} />
        </motion.a>
      </div>
    </section>
  )
}
