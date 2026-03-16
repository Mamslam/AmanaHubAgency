'use client'
import { motion } from 'framer-motion'
import { useTranslations } from 'next-intl'
import { Search, Presentation, Wrench } from 'lucide-react'

const icons = [Search, Presentation, Wrench]

export default function HowItWorks() {
  const t = useTranslations('how')
  const steps = [1, 2, 3] as const

  return (
    <section id="about" className="py-24 px-4 sm:px-6 max-w-6xl mx-auto">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        className="text-center mb-16"
      >
        <h2 className="font-playfair text-4xl font-bold text-[#F2EDE4] mb-4">{t('title')}</h2>
        <div className="w-16 h-0.5 bg-[#C9A84C] mx-auto" />
      </motion.div>

      <div className="relative">
        {/* Connecting line (desktop) */}
        <div className="hidden md:block absolute top-12 left-1/6 right-1/6 h-0.5 bg-gradient-to-r from-transparent via-[#C9A84C]/40 to-transparent" />

        <div className="grid md:grid-cols-3 gap-8">
          {steps.map((step, i) => {
            const Icon = icons[i]
            return (
              <motion.div
                key={step}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: i * 0.15 }}
                className="flex flex-col items-center text-center relative"
              >
                <div className="relative mb-6">
                  <div className="w-24 h-24 rounded-full bg-[#C9A84C]/10 border border-[#C9A84C]/30 flex items-center justify-center">
                    <Icon size={32} className="text-[#C9A84C]" />
                  </div>
                  <motion.div
                    className="absolute -top-2 -right-2 w-8 h-8 rounded-full bg-[#C9A84C] flex items-center justify-center text-[#0A0A0F] font-bold text-sm"
                    initial={{ scale: 0 }}
                    whileInView={{ scale: 1 }}
                    viewport={{ once: true }}
                    transition={{ delay: i * 0.15 + 0.3, type: 'spring' }}
                  >
                    {step}
                  </motion.div>
                </div>
                <h3 className="font-playfair text-xl font-semibold text-[#F2EDE4] mb-3">
                  {t(`step${step}.title` as `step1.title`)}
                </h3>
                <p className="text-[#F2EDE4]/60 text-sm leading-relaxed">
                  {t(`step${step}.desc` as `step1.desc`)}
                </p>
              </motion.div>
            )
          })}
        </div>
      </div>
    </section>
  )
}
