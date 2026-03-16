import type { Metadata } from 'next'
import { Playfair_Display, DM_Sans } from 'next/font/google'
import { NextIntlClientProvider } from 'next-intl'
import { getMessages } from 'next-intl/server'
import KonamiListener from '@/components/landing/KonamiListener'
import '../globals.css'

const playfair = Playfair_Display({
  subsets: ['latin'],
  variable: '--font-playfair',
  display: 'swap',
})

const dmSans = DM_Sans({
  subsets: ['latin'],
  variable: '--font-dm-sans',
  display: 'swap',
})

export const metadata: Metadata = {
  title: 'AmanaHub — Digital Agency',
  description: 'AI-powered web design, SEO, and reputation management for local businesses.',
}

export default async function LocaleLayout({
  children,
  params,
}: {
  children: React.ReactNode
  params: Promise<{ locale: string }>
}) {
  const { locale } = await params
  const messages = await getMessages()

  return (
    <html lang={locale} className={`${playfair.variable} ${dmSans.variable}`}>
      <body className="bg-[#0A0A0F] text-[#F2EDE4] font-sans antialiased">
        <NextIntlClientProvider messages={messages}>
          {children}
          <KonamiListener />
        </NextIntlClientProvider>
      </body>
    </html>
  )
}
