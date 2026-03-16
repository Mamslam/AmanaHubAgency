'use client'
import { motion } from 'framer-motion'
import { useTranslations } from 'next-intl'
import { useState } from 'react'

const rows = [
  { category: 'Performance Optimization', included: 'Image compression, CSS/JS minification, lazy loading, caching', price: '$297–$997', best: false },
  { category: 'Accessibility Improvements', included: 'Contrast ratios, alt text, form labels, keyboard navigation', price: '$197–$497', best: false },
  { category: 'Best Practices', included: 'HTTPS, deprecated APIs, security, HTML validation', price: '$197–$597', best: false },
  { category: 'SEO Enhancements', included: 'Meta tags, mobile-friendliness, structured data', price: '$297–$797', best: false },
  { category: 'Progressive Web App', included: 'Service worker, offline mode, installability', price: '$497–$1,500', best: false },
  { category: 'Full Audit + All Fixes Bundle', included: 'All of the above, priority support, monthly report', price: '$997–$2,500', best: true },
]

export default function PricingTable() {
  const t = useTranslations('pricing')
  const [hovered, setHovered] = useState<number | null>(null)

  return (
    <section id="pricing" className="py-24 px-4 sm:px-6">
      <div className="max-w-5xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-12"
        >
          <h2 className="font-playfair text-4xl font-bold text-[#F2EDE4] mb-4">{t('title')}</h2>
          <div className="w-16 h-0.5 bg-[#C9A84C] mx-auto" />
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="glass-card rounded-2xl overflow-hidden"
        >
          {/* Header */}
          <div className="grid grid-cols-12 gap-4 px-6 py-4 border-b border-white/10 text-[#F2EDE4]/50 text-xs uppercase tracking-widest">
            <div className="col-span-4">{t('category')}</div>
            <div className="col-span-5">{t('included')}</div>
            <div className="col-span-3 text-right">{t('price_range')}</div>
          </div>

          {rows.map((row, i) => (
            <div
              key={row.category}
              onMouseEnter={() => setHovered(i)}
              onMouseLeave={() => setHovered(null)}
              className={`grid grid-cols-12 gap-4 px-6 py-5 border-b border-white/5 transition-all cursor-default ${
                row.best
                  ? 'bg-[#C9A84C]/8 border-[#C9A84C]/20'
                  : hovered === i
                  ? 'bg-white/[0.03]'
                  : ''
              }`}
            >
              <div className="col-span-4 flex items-center gap-2">
                <span className={`font-semibold text-sm ${row.best ? 'text-[#C9A84C]' : 'text-[#F2EDE4]'}`}>
                  {row.category}
                </span>
                {row.best && (
                  <span className="text-xs bg-[#C9A84C] text-[#0A0A0F] px-2 py-0.5 rounded-full font-bold">
                    {t('best_value')}
                  </span>
                )}
              </div>
              <div className="col-span-5 text-[#F2EDE4]/60 text-sm flex items-center">{row.included}</div>
              <div className={`col-span-3 text-right font-semibold flex items-center justify-end ${row.best ? 'text-[#C9A84C] text-lg' : 'text-[#F2EDE4]'}`}>
                {row.price}
              </div>
            </div>
          ))}
        </motion.div>
      </div>
    </section>
  )
}
