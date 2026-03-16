import type { Metadata } from 'next'
import { DM_Sans } from 'next/font/google'
import '../globals.css'

const dmSans = DM_Sans({
  subsets: ['latin'],
  variable: '--font-dm-sans',
  display: 'swap',
})

export const metadata: Metadata = {
  title: 'Portal — AmanaHub',
  robots: 'noindex, nofollow',
}

export default function PortalLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={dmSans.variable}>
      <body className="bg-[#0A0A0F] text-[#F2EDE4] font-sans antialiased">
        {children}
      </body>
    </html>
  )
}
