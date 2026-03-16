'use client'
import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useTranslations, useLocale } from 'next-intl'
import { useRouter, usePathname } from 'next/navigation'
import { Menu, X } from 'lucide-react'

const localeFlags: Record<string, string> = { en: '🇬🇧', fr: '🇫🇷', de: '🇩🇪' }

export default function Navbar() {
  const t = useTranslations('nav')
  const locale = useLocale()
  const router = useRouter()
  const pathname = usePathname()
  const [scrolled, setScrolled] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)

  useEffect(() => {
    const handler = () => setScrolled(window.scrollY > 60)
    window.addEventListener('scroll', handler)
    return () => window.removeEventListener('scroll', handler)
  }, [])

  const switchLocale = (newLocale: string) => {
    const segments = pathname.split('/')
    segments[1] = newLocale
    router.push(segments.join('/'))
  }

  const navLinks = [
    { key: 'services', href: '#services' },
    { key: 'pricing', href: '#pricing' },
    { key: 'about', href: '#about' },
    { key: 'contact', href: '#contact' },
  ] as const

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled ? 'bg-[#0A0A0F]/80 backdrop-blur-md border-b border-white/10' : ''
      }`}
    >
      <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Logo */}
        <Link href={`/${locale}`} className="font-playfair text-xl font-bold text-[#F2EDE4]">
          <span className="text-[#C9A84C]">A</span>manaHub
          <span className="text-[#C9A84C]">.</span>
        </Link>

        {/* Desktop nav */}
        <div className="hidden md:flex items-center gap-6">
          {navLinks.map(link => (
            <a
              key={link.key}
              href={link.href}
              className="text-sm text-[#F2EDE4]/70 hover:text-[#C9A84C] transition-colors"
            >
              {t(link.key)}
            </a>
          ))}
        </div>

        {/* Right: lang switcher + CTA */}
        <div className="hidden md:flex items-center gap-3">
          <div className="flex gap-1">
            {(['fr', 'en', 'de'] as const).map(loc => (
              <button
                key={loc}
                onClick={() => switchLocale(loc)}
                className={`px-2 py-1 rounded text-sm transition-all ${
                  locale === loc
                    ? 'bg-[#C9A84C]/20 text-[#C9A84C]'
                    : 'text-[#F2EDE4]/50 hover:text-[#F2EDE4]'
                }`}
              >
                {localeFlags[loc]}
              </button>
            ))}
          </div>
          <a
            href="#contact"
            className="px-4 py-2 bg-[#C9A84C] text-[#0A0A0F] rounded-full text-sm font-semibold hover:bg-[#C9A84C]/90 transition-colors"
          >
            {t('cta')}
          </a>
        </div>

        {/* Mobile hamburger */}
        <button
          className="md:hidden text-[#F2EDE4]"
          onClick={() => setMenuOpen(!menuOpen)}
          aria-label="Toggle menu"
        >
          {menuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </nav>

      {/* Mobile menu */}
      {menuOpen && (
        <div className="md:hidden bg-[#0A0A0F]/95 backdrop-blur-md border-b border-white/10 px-4 py-4 flex flex-col gap-4">
          {navLinks.map(link => (
            <a
              key={link.key}
              href={link.href}
              onClick={() => setMenuOpen(false)}
              className="text-[#F2EDE4]/80 hover:text-[#C9A84C]"
            >
              {t(link.key)}
            </a>
          ))}
          <div className="flex gap-2 pt-2 border-t border-white/10">
            {(['fr', 'en', 'de'] as const).map(loc => (
              <button
                key={loc}
                onClick={() => { switchLocale(loc); setMenuOpen(false) }}
                className={`px-3 py-1 rounded text-sm ${
                  locale === loc ? 'bg-[#C9A84C]/20 text-[#C9A84C]' : 'text-[#F2EDE4]/50'
                }`}
              >
                {localeFlags[loc]} {loc.toUpperCase()}
              </button>
            ))}
          </div>
        </div>
      )}
    </header>
  )
}
