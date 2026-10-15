import { About } from "@/components/landing/about"
import { Coverage } from "@/components/landing/coverage"
import { Cta } from "@/components/landing/cta"
import { Hero } from "@/components/landing/hero"
import { KpiBand } from "@/components/landing/kpi-band"
import { Market } from "@/components/landing/market"
import { Services } from "@/components/landing/services"

export default function Home() {
  return (
    <main>
      <Hero />
      <KpiBand />
      <About />
      <Services />
      <Market />
      <Coverage />
      <Cta />
    </main>
  )
}
