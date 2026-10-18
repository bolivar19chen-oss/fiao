import { About } from "@/components/landing/about"
import { Coverage } from "@/components/landing/coverage"
import { Cta } from "@/components/landing/cta"
import { Hero } from "@/components/landing/hero"
import { Intro } from "@/components/landing/intro"
import { KpiBand } from "@/components/landing/kpi-band"
import { Market } from "@/components/landing/market"
import { Services } from "@/components/landing/services"
import { Reveal } from "@/components/ui/reveal"

export default function Home() {
  return (
    <main>
      <Intro />
      <Hero />
      <Reveal>
        <KpiBand />
      </Reveal>
      <Reveal>
        <About />
      </Reveal>
      <Reveal>
        <Services />
      </Reveal>
      <Reveal>
        <Market />
      </Reveal>
      <Reveal>
        <Coverage />
      </Reveal>
      <Reveal>
        <Cta />
      </Reveal>
    </main>
  )
}
