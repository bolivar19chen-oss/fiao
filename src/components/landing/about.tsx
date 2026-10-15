import { Check, Lock, Store } from "lucide-react"
import { IconTile } from "@/components/ui/icon-tile"

const principles = [
  { icon: Check, title: "Exact to the cent", body: "Every amount is stored as whole cents. No rounding drift, ever." },
  { icon: Lock, title: "Private by design", body: "Each store's data is isolated at the database level, not just hidden in the interface." },
  { icon: Store, title: "Made for the counter", body: "Fast on low-end phones, installable from the browser, readable at a glance." },
]

export function About() {
  return (
    <section id="about" className="container-x grid gap-14 py-28 lg:grid-cols-2">
      <div>
        <p className="eyebrow">About us</p>
        <h2 className="section-title mt-3">The corner-store notebook, rebuilt.</h2>
        <p className="mt-6 text-lg leading-relaxed text-marron/70">
          In Panama, buying on credit at the neighborhood store is a tradition built on trust. It usually lives in a
          paper notebook: easy to lose, hard to read and impossible to measure.
        </p>
        <p className="mt-4 text-lg leading-relaxed text-marron/70">
          We keep the trust and replace the notebook. FIA&apos;O gives small businesses the same control over credit
          that large retailers have, without the complexity.
        </p>
      </div>
      <div className="space-y-4">
        {principles.map(({ icon: Icon, title, body }) => (
          <div key={title} className="flex gap-5 rounded-3xl border border-marron/10 p-6 transition hover:border-rojo/25 hover:shadow-[0_18px_40px_-24px_rgb(185_28_28/0.35)]">
            <IconTile icon={Icon} />
            <div>
              <h3 className="font-display text-lg font-semibold">{title}</h3>
              <p className="mt-1 text-marron/65">{body}</p>
            </div>
          </div>
        ))}
      </div>
    </section>
  )
}
