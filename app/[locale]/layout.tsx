import type { Metadata } from 'next'
import { NextIntlClientProvider } from 'next-intl'
import { getMessages } from 'next-intl/server'
import KonamiListener from '@/components/landing/KonamiListener'

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
  const messages = await getMessages()

  return (
    <NextIntlClientProvider messages={messages}>
      {children}
      <KonamiListener />
    </NextIntlClientProvider>
  )
}
