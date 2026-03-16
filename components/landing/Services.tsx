'use client'
import { motion } from 'framer-motion'
import { useTranslations } from 'next-intl'
import { useInView } from 'framer-motion'
import { useRef } from 'react'
import { Shield, Layout, MapPin, Share2, Phone, Video, Mail, Bot, Search, FileText, Star, TrendingUp, Map, Settings } from 'lucide-react'

const oneTimeServices = [
  { icon: Shield, name: 'SSL Installation', price: '$97–$297' },
  { icon: Layout, name: 'Website Redesign', price: '$997–$3,000' },
  { icon: MapPin, name: 'Google My Business Optimization', price: '$297–$697' },
  { icon: Share2, name: 'Social Media Setup', price: '$197–$497/platform' },
  { icon: Phone, name: 'Click-To-Call Button', price: '$97–$297' },
  { icon: Video, name: 'Homepage Promo Video', price: '$297–$997' },
  { icon: Mail, name: 'Professional Email Setup', price: '$147–$297' },
  { icon: Bot, name: 'AI Chatbot Integration', price: '$497–$1,500 + $97/mo' },
  { icon: Search, name: 'SEO Optimization Package', price: '$497–$1,500' },
  { icon: FileText, name: 'Full Audit & Consulting Report', price: '$197–$497' },
]

const monthlyServices = [
  { icon: Star, name: 'Done-For-You Google Reviews', price: '$100–$500/mo' },
  { icon: TrendingUp, name: 'Reputation Management', price: '$250–$1,000/mo' },
  { icon: Map, name: 'Google Maps Rankings Optimization', price: '$300–$1,200/mo' },
  { icon: Settings, name: 'Ongoing Website Maintenance', price: '$97–$297/mo' },
]

function ServiceCard({ icon: Icon, name, price, badge, badgeColor, index }: {
  icon: React.ElementType; name: string; price: string; badge: string; badgeColor: string; index: number
}) {
  const ref = useRef(null)
  const inView = useInView(ref, { once: true, margin: '-50px' })

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 30 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.5, delay: index * 0.05 }}
      className="glass-card rounded-xl p-5 hover:border-[#C9A84C]/30 transition-all group"
    >
      <div className="flex items-start justify-between mb-3">
        <div className="p-2 rounded-lg bg-[#C9A84C]/10 text-[#C9A84C] group-hover:bg-[#C9A84C]/20 transition-colors">
          <Icon size={18} />
        </div>
        <span className={`text-xs px-2 py-1 rounded-full font-semibold ${badgeColor}`}>
          {badge}
        </span>
      </div>
      <h3 className="font-semibold text-[#F2EDE4] mb-1 text-sm">{name}</h3>
      <p className="text-[#C9A84C] font-semibold text-sm">{price}</p>
    </motion.div>
  )
}

export default function Services() {
  const t = useTranslations('services')
  return (
    <section id="services" className="py-24 px-4 sm:px-6 max-w-7xl mx-auto">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6 }}
        className="text-center mb-16"
      >
        <h2 className="font-playfair text-4xl font-bold text-[#F2EDE4] mb-4">{t('title')}</h2>
        <div className="w-16 h-0.5 bg-[#C9A84C] mx-auto" />
      </motion.div>

      <div>
        <h3 className="text-[#F2EDE4]/60 text-xs uppercase tracking-widest mb-4">{t('onetime_badge')} Services</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-12">
          {oneTimeServices.map((s, i) => (
            <ServiceCard
              key={s.name}
              {...s}
              badge={t('onetime_badge')}
              badgeColor="bg-[#C9A84C] text-[#0A0A0F]"
              index={i}
            />
          ))}
        </div>

        <h3 className="text-[#F2EDE4]/60 text-xs uppercase tracking-widest mb-4">{t('monthly_badge')} Services</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {monthlyServices.map((s, i) => (
            <ServiceCard
              key={s.name}
              {...s}
              badge={t('monthly_badge')}
              badgeColor="bg-[#2DD4BF]/20 text-[#2DD4BF] border border-[#2DD4BF]/30"
              index={i}
            />
          ))}
        </div>
      </div>
    </section>
  )
}
