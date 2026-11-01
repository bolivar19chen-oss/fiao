import Image from "next/image"
import { Check, Lock, Store } from "lucide-react"

import { IconTile } from "@/components/ui/icon-tile"
import { SectionHeading } from "@/components/ui/section-heading"
import shunYi from "@/assets/img/mini-market-shun-yi.webp"

const principles = [
  { icon: Check, title: "Exact to the cent", body: "Every amount is stored as whole cents. No rounding drift, ever." },
  {
    icon: Lock,
    title: "Private by design",
    body: "Each store's data is isolated at the database level, not just hidden in the interface.",
  },
  {
    icon: Store,
    title: "Made for the counter",
    body: "Fast on low-end phones, installable from the browser, readable at a glance.",
  },
]

export function About() {
  return (
    <section id="about" className="container-x py-28">
      <SectionHeading index="01" label="About us" title="The corner-store notebook, rebuilt.">
        <p>
          In Panama, buying on credit at the neighborhood store is a tradition built on trust. It usually lives in a
          paper notebook: easy to lose, hard to read and impossible to measure. We keep the trust and replace the
          notebook.
        </p>
      </SectionHeading>

      {/* Una tienda de verdad ancla lo que dice el parrafo: el cuaderno vive en un mostrador real.
          Va bajo el pliegue, asi que carga diferida; las medidas salen del import (R-40). */}
      <figure className="mt-14 lg:ml-[240px]">
        <Image
          src={shunYi}
          alt="Front of Mini Market Shun Yi, a corner store with a red and orange sign in Spanish and Chinese above its glass entrance, cars parked outside."
          sizes="(min-width: 1024px) 960px, calc(100vw - 48px)"
          placeholder="blur"
          className="aspect-[21/9] w-full rounded-3xl object-cover object-[50%_62%]"
        />
        <figcaption className="mt-3 text-sm text-marron/70">A neighborhood store in Panama City.</figcaption>
      </figure>

      <div className="mt-16 grid gap-10 md:grid-cols-3 lg:ml-[240px]">
        {principles.map(({ icon, title, body }) => (
          <div key={title}>
            <IconTile icon={icon} />
            <h3 className="mt-5 font-display text-lg font-semibold">{title}</h3>
            <p className="mt-2 leading-relaxed text-marron/70">{body}</p>
          </div>
        ))}
      </div>
    </section>
  )
}
