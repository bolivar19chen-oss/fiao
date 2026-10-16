import Link from "next/link"
import { ArrowDownRight, ArrowRight, Check } from "lucide-react"
import { Aurora } from "@/components/ui/aurora"
import { ScoreRing } from "@/components/ui/score-ring"
import { provinces, totalStores } from "@/data/panama"
import { formatCents } from "@/lib/format"

export function Hero() {
  return (
    <section className="px-3 pt-3">
      {/* Panel con bordes redondeados y margen: el hero se lee como una pieza propia. */}
      <div className="relative isolate overflow-hidden rounded-[2.5rem] bg-gradient-to-b from-[#fff8ea] to-white pb-20 pt-32 ring-1 ring-marron/[0.06] sm:pt-40">
        <Aurora />
        <div className="container-x grid items-center gap-16 lg:grid-cols-[1.08fr_1fr]">
          <div>
            <span className="glass inline-flex items-center gap-2 rounded-full px-3.5 py-1.5 text-xs font-semibold text-marron/80">
              <span className="h-1.5 w-1.5 rounded-full bg-rojo" />
              Built for Panama&apos;s corner stores
            </span>
            <h1 className="mt-7 font-display text-5xl leading-[1.02] tracking-[-0.04em] sm:text-6xl lg:text-[5.4rem]">
              <span className="font-light text-marron">Credit sales,</span>
              <br />
              <span className="font-semibold text-rojo">finally under control.</span>
            </h1>
            <p className="mt-7 max-w-xl text-lg leading-relaxed text-marron/70">
              FIA&apos;O turns the store notebook into a secure ledger: inventory, credit sales, payment history and a
              credit score for every customer, on any phone.
            </p>
            <div className="mt-9 flex flex-wrap gap-3">
              <Link href="/login" className="btn btn-glass-red h-12 px-6 text-[15px]">
                Get started
                <ArrowRight className="h-4 w-4" aria-hidden />
              </Link>
              <Link href="/services" className="btn btn-glass h-12 px-6 text-[15px]">
                Explore services
              </Link>
            </div>

            <div className="mt-12 flex flex-wrap items-end gap-x-10 gap-y-6">
              <div>
                <ArrowDownRight className="h-5 w-5 text-rojo" strokeWidth={1.75} aria-hidden />
                <div className="mt-1 font-display text-5xl font-light tabular-nums tracking-[-0.04em]">
                  {totalStores}
                </div>
                <div className="mt-1 text-sm text-marron/60">
                  Food stores registered across {provinces.length} provinces
                </div>
              </div>
              <ul className="space-y-1.5 border-l border-marron/15 pl-6 text-sm text-marron/65">
                {["Works offline", "Installs on any phone", "Data isolated per store"].map((item) => (
                  <li key={item} className="flex items-center gap-2">
                    <Check className="h-4 w-4 text-rojo" strokeWidth={2.5} aria-hidden />
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          </div>

          <HeroPreview />
        </div>
      </div>
    </section>
  )
}

// Product mockup: a customer's ledger as it looks in the app.
function HeroPreview() {
  const rows = [
    { name: "Rosa M.", due: "Due Oct 18", cents: 4550, score: 82 },
    { name: "Luis C.", due: "Due Oct 20", cents: 1275, score: 74 },
    { name: "Ana P.", due: "Paid", cents: 0, score: 91 },
    { name: "Jorge R.", due: "3 days late", cents: 2890, score: 58 },
  ]
  return (
    <div className="relative mx-auto w-full max-w-md">
      <div className="glass rounded-[2rem] p-6 pt-14 sm:pt-16">
        <div className="flex items-center justify-between">
          <div>
            <div className="text-xs font-medium uppercase tracking-wider text-marron/50">Outstanding credit</div>
            <div className="mt-1 font-display text-3xl font-semibold tabular-nums">
              {formatCents(rows.reduce((s, r) => s + r.cents, 0))}
            </div>
          </div>
          <span className="rounded-full bg-rojo/10 px-3 py-1 text-xs font-semibold text-rojo">This week</span>
        </div>
        <ul className="mt-6 divide-y divide-marron/[0.07]">
          {rows.map((r) => (
            <li key={r.name} className="flex items-center gap-3 py-3">
              <span className="grid h-9 w-9 place-items-center rounded-full bg-amarillo/25 text-xs font-bold text-marron">
                {r.name[0]}
              </span>
              <div className="flex-1">
                <div className="text-sm font-semibold">{r.name}</div>
                <div className={`text-xs ${r.due.includes("late") ? "text-rojo" : "text-marron/55"}`}>{r.due}</div>
              </div>
              <div className="text-sm font-semibold tabular-nums">{formatCents(r.cents)}</div>
            </li>
          ))}
        </ul>
      </div>

      <div className="glass absolute -left-6 -top-8 hidden items-center gap-3 rounded-2xl px-4 py-3 sm:flex">
        <ScoreRing score={82} />
        <div>
          <div className="text-xs text-marron/55">Credit score</div>
          <div className="text-sm font-semibold">Rosa M. · Good</div>
        </div>
      </div>

      <div className="glass absolute -bottom-7 -right-4 hidden items-center gap-3 rounded-2xl px-4 py-3 sm:flex">
        <span className="grid h-9 w-9 place-items-center rounded-full bg-rojo text-white">
          <Check className="h-4 w-4" strokeWidth={3} aria-hidden />
        </span>
        <div>
          <div className="text-xs text-marron/55">Payment received</div>
          <div className="text-sm font-semibold tabular-nums">+{formatCents(1250)}</div>
        </div>
      </div>
    </div>
  )
}
