'use client'
import { motion } from 'framer-motion'
import { useTranslations } from 'next-intl'
import { ArrowRight, BarChart2, Star, Globe } from 'lucide-react'

export default function Hero() {
  const t = useTranslations('hero')
  const words = t('headline').split(' ')

  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden pt-16">
      {/* Orbs */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="orb-1 absolute top-1/4 left-1/4 w-96 h-96 bg-[#C9A84C]/10 rounded-full blur-3xl" />
        <div className="orb-2 absolute bottom-1/3 right-1/4 w-80 h-80 bg-[#2DD4BF]/8 rounded-full blur-3xl" />
        <div className="orb-3 absolute top-1/2 left-1/2 w-64 h-64 bg-[#C9A84C]/6 rounded-full blur-2xl" />
      </div>

      <div className="relative z-10 max-w-5xl mx-auto px-4 sm:px-6 text-center">
        {/* Headline */}
        <motion.h1
          className="font-playfair text-4xl sm:text-5xl lg:text-6xl font-bold text-[#F2EDE4] leading-tight mb-6"
          initial="hidden"
          animate="visible"
          variants={{ visible: { transition: { staggerChildren: 0.06 } } }}
        >
          {words.map((word, i) => (
            <motion.span
              key={i}
              className="inline-block mr-2"
              variants={{
                hidden: { opacity: 0, y: 20 },
                visible: { opacity: 1, y: 0 },
              }}
              transition={{ duration: 0.5 }}
            >
              {word}
            </motion.span>
          ))}
        </motion.h1>

        {/* Subheadline */}
        <motion.p
          className="text-[#F2EDE4]/70 text-lg sm:text-xl max-w-2xl mx-auto mb-10"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8, duration: 0.6 }}
        >
          {t('subheadline')}
        </motion.p>

        {/* CTAs */}
        <motion.div
          className="flex flex-col sm:flex-row gap-4 justify-center mb-16"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1, duration: 0.5 }}
        >
          <a
            href="#contact"
            className="inline-flex items-center gap-2 px-8 py-4 bg-[#C9A84C] text-[#0A0A0F] rounded-full font-semibold text-lg hover:bg-[#C9A84C]/90 transition-all hover:scale-105"
          >
            {t('cta1')} <ArrowRight size={18} />
          </a>
          <a
            href="#services"
            className="inline-flex items-center gap-2 px-8 py-4 border border-[#F2EDE4]/20 text-[#F2EDE4] rounded-full font-semibold text-lg hover:border-[#C9A84C] hover:text-[#C9A84C] transition-all"
          >
            {t('cta2')}
          </a>
        </motion.div>

        {/* Stat pills */}
        <motion.div
          className="flex flex-wrap justify-center gap-3"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.3, duration: 0.5 }}
        >
          {[
            { icon: <BarChart2 size={14} />, text: t('stat1') },
            { icon: <Star size={14} />, text: t('stat2') },
            { icon: <Globe size={14} />, text: t('stat3') },
          ].map((stat, i) => (
            <div
              key={i}
              className="flex items-center gap-2 px-4 py-2 glass-card rounded-full text-sm text-[#F2EDE4]/80"
            >
              <span className="text-[#C9A84C]">{stat.icon}</span>
              {stat.text}
            </div>
          ))}
        </motion.div>
      </div>

      {/* Diagonal divider */}
      <div
        className="absolute bottom-0 left-0 right-0 h-20 bg-[#0A0A0F]"
        style={{ clipPath: 'polygon(0 100%, 100% 0, 100% 100%)' }}
      />
    </section>
  )
}
