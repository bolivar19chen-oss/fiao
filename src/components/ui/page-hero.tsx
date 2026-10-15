import { Aurora } from "./aurora"

interface PageHeroProps {
  eyebrow: string
  title: React.ReactNode
  lead: string
}

export function PageHero({ eyebrow, title, lead }: PageHeroProps) {
  return (
    <section className="relative isolate overflow-hidden pb-20 pt-36 sm:pt-44">
      <Aurora />
      <div className="container-x max-w-4xl text-center">
        <p className="eyebrow">{eyebrow}</p>
        <h1 className="mt-4 font-display text-4xl font-semibold leading-[1.08] tracking-tight sm:text-6xl">{title}</h1>
        <p className="mx-auto mt-6 max-w-2xl text-lg leading-relaxed text-marron/70">{lead}</p>
      </div>
    </section>
  )
}
