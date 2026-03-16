import Navbar from '@/components/landing/Navbar'
import Hero from '@/components/landing/Hero'
import Services from '@/components/landing/Services'
import PricingTable from '@/components/landing/PricingTable'
import HowItWorks from '@/components/landing/HowItWorks'
import StatsBanner from '@/components/landing/StatsBanner'
import CTABanner from '@/components/landing/CTABanner'
import Footer from '@/components/landing/Footer'

export default function LandingPage() {
  return (
    <main>
      <Navbar />
      <Hero />
      <Services />
      <PricingTable />
      <HowItWorks />
      <StatsBanner />
      <CTABanner />
      <Footer />
    </main>
  )
}
