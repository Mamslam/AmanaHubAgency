import { Metadata } from 'next'
import AuthGate from '@/components/portal/AuthGate'

export const metadata: Metadata = {
  robots: 'noindex, nofollow',
  title: 'Portal — AmanaHub',
}

export default function PortalPage() {
  return <AuthGate />
}
