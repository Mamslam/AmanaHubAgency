'use client'
import { useTranslations, useLocale } from 'next-intl'
import { useRouter, usePathname } from 'next/navigation'

const LinkedInIcon = () => (
  <svg viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
    <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z"/><rect x="2" y="9" width="4" height="12"/><circle cx="4" cy="4" r="2"/>
  </svg>
)
const InstagramIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-5 h-5">
    <rect x="2" y="2" width="20" height="20" rx="5" ry="5"/><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/><line x1="17.5" y1="6.5" x2="17.51" y2="6.5"/>
  </svg>
)
const FacebookIcon = () => (
  <svg viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
    <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"/>
  </svg>
)

export default function Footer() {
  const t = useTranslations('footer')
  const nt = useTranslations('nav')
  const locale = useLocale()
  const router = useRouter()
  const pathname = usePathname()

  const switchLocale = (newLocale: string) => {
    const segments = pathname.split('/')
    segments[1] = newLocale
    router.push(segments.join('/'))
  }

  return (
    <footer className="border-t border-white/10 py-16 px-4 sm:px-6">
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10 mb-10">
          {/* Brand */}
          <div className="md:col-span-1">
            <div className="font-playfair text-2xl font-bold text-[#F2EDE4] mb-3">
              <span className="text-[#C9A84C]">A</span>manaHub
              <span className="text-[#C9A84C]">.</span>
            </div>
            <p className="text-[#F2EDE4]/50 text-sm leading-relaxed">{t('tagline')}</p>
          </div>

          {/* Services */}
          <div>
            <h4 className="text-[#F2EDE4] font-semibold mb-4">Services</h4>
            <ul className="space-y-2 text-[#F2EDE4]/50 text-sm">
              <li><a href="#services" className="hover:text-[#C9A84C] transition-colors">Web Design</a></li>
              <li><a href="#services" className="hover:text-[#C9A84C] transition-colors">SEO</a></li>
              <li><a href="#services" className="hover:text-[#C9A84C] transition-colors">Reputation Management</a></li>
              <li><a href="#services" className="hover:text-[#C9A84C] transition-colors">AI Chatbot</a></li>
            </ul>
          </div>

          {/* Company */}
          <div>
            <h4 className="text-[#F2EDE4] font-semibold mb-4">Company</h4>
            <ul className="space-y-2 text-[#F2EDE4]/50 text-sm">
              <li><a href="#about" className="hover:text-[#C9A84C] transition-colors">{nt('about')}</a></li>
              <li><a href="#pricing" className="hover:text-[#C9A84C] transition-colors">{nt('pricing')}</a></li>
              <li><a href="#contact" className="hover:text-[#C9A84C] transition-colors">{nt('contact')}</a></li>
            </ul>
          </div>

          {/* Legal */}
          <div>
            <h4 className="text-[#F2EDE4] font-semibold mb-4">Legal</h4>
            <ul className="space-y-2 text-[#F2EDE4]/50 text-sm">
              <li><a href="#" className="hover:text-[#C9A84C] transition-colors">Privacy Policy</a></li>
              <li><a href="#" className="hover:text-[#C9A84C] transition-colors">Terms of Service</a></li>
            </ul>
          </div>
        </div>

        <div className="border-t border-white/10 pt-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-[#F2EDE4]/40 text-sm">{t('copyright')}</p>

          <div className="flex items-center gap-4">
            {/* Lang switcher */}
            <div className="flex gap-1">
              {(['fr', 'en', 'de'] as const).map(loc => (
                <button
                  key={loc}
                  onClick={() => switchLocale(loc)}
                  className={`px-2 py-1 rounded text-sm transition-colors ${
                    locale === loc ? 'text-[#C9A84C]' : 'text-[#F2EDE4]/40 hover:text-[#F2EDE4]'
                  }`}
                >
                  {loc === 'en' ? '🇬🇧' : loc === 'fr' ? '🇫🇷' : '🇩🇪'}
                </button>
              ))}
            </div>

            {/* Social icons */}
            <div className="flex gap-3 text-[#F2EDE4]/40">
              <a href="#" className="hover:text-[#C9A84C] transition-colors" aria-label="LinkedIn"><LinkedInIcon /></a>
              <a href="#" className="hover:text-[#C9A84C] transition-colors" aria-label="Instagram"><InstagramIcon /></a>
              <a href="#" className="hover:text-[#C9A84C] transition-colors" aria-label="Facebook"><FacebookIcon /></a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  )
}
