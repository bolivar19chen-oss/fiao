import type { Metadata } from "next"
import { Coins, Compass, Eye, HeartHandshake, KeyRound, Sparkles } from "lucide-react"
import { Cta } from "@/components/landing/cta"
import { IconTile } from "@/components/ui/icon-tile"
import { PageHero } from "@/components/ui/page-hero"

export const metadata: Metadata = {
  title: "About Us - FIA'O",
}

const values = [
  { icon: HeartHandshake, title: "Respect the relationship", body: "Credit at the corner store is built on trust between neighbors. Our tools protect that trust instead of replacing it." },
  { icon: Coins, title: "Every cent counts", body: "Small margins leave no room for rounding errors. Every balance is exact, every time." },
  { icon: Sparkles, title: "Simple beats clever", body: "If it takes a manual to sell on credit, we failed. Every screen is designed to be used at a busy counter." },
  { icon: KeyRound, title: "Your data is yours", body: "Each store owns its records. We never sell them, and no other store can see them." },
]

const roadmap = [
  {
    stage: "Now",
    title: "The digital ledger",
    items: ["Customer profiles and payment history", "Inventory with low-stock alerts", "Credit sales with installments and partial payments"],
  },
  {
    stage: "Next",
    title: "Anywhere, any signal",
    items: ["Installable app for any phone", "Offline mode with automatic sync", "Reports on portfolio, overdue accounts and cash flow"],
  },
  {
    stage: "Later",
    title: "Credit that grows the business",
    items: ["Customer credit scores", "Automatic payment reminders", "A beta with real stores across Panama"],
  },
]

export default function AboutPage() {
  return (
    <main>
      <PageHero
        eyebrow="About us"
        title={
          <>
            Trust is the oldest <span className="text-rojo">credit system.</span>
          </>
        }
        lead="We build software for the stores that have always sold on trust, so they can keep doing it without losing track of a single cent."
      />

      {/* The name */}
      <section className="container-x pb-24">
        <div className="glass relative overflow-hidden rounded-[2rem] p-8 sm:p-14">
          <div className="grid gap-10 lg:grid-cols-[auto_1fr] lg:items-center">
            <div className="font-display text-7xl font-bold tracking-tight text-rojo sm:text-8xl">
              fia<span className="text-amarillo">&apos;</span>o
            </div>
            <div>
              <p className="eyebrow">Where the name comes from</p>
              <p className="mt-3 text-xl leading-relaxed text-marron/80">
                In Panama, buying <em>fiao</em> means taking it now and paying later. No paperwork, just a name written in
                the store&apos;s notebook. FIA&apos;O keeps that tradition and gives it the tools it never had.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Mission and vision */}
      <section className="container-x grid gap-6 pb-24 md:grid-cols-2">
        {[
          { icon: Compass, label: "Mission", text: "Give every small store the same control over credit that large retailers have, with a tool anyone can use on the phone they already own." },
          { icon: Eye, label: "Vision", text: "A Panama where selling on credit is a growth tool for small businesses, not a risk they carry alone." },
        ].map(({ icon, label, text }) => (
          <div key={label} className="rounded-3xl border border-marron/10 p-8 sm:p-10">
            <IconTile icon={icon} />
            <h2 className="mt-6 font-display text-2xl font-semibold">{label}</h2>
            <p className="mt-3 text-lg leading-relaxed text-marron/70">{text}</p>
          </div>
        ))}
      </section>

      {/* Values */}
      <section className="border-y border-marron/10 bg-marron/[0.015] py-24">
        <div className="container-x">
          <p className="eyebrow">What we believe</p>
          <h2 className="section-title mt-3 max-w-2xl">Four rules behind every decision.</h2>
          <div className="mt-12 grid gap-px overflow-hidden rounded-3xl bg-marron/10 sm:grid-cols-2">
            {values.map(({ icon, title, body }, i) => (
              <div key={title} className="bg-white p-8">
                <div className="flex items-center gap-4">
                  <span className="font-display text-sm font-semibold tabular-nums text-rojo">{String(i + 1).padStart(2, "0")}</span>
                  <IconTile icon={icon} />
                </div>
                <h3 className="mt-5 font-display text-xl font-semibold">{title}</h3>
                <p className="mt-2 leading-relaxed text-marron/65">{body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Roadmap */}
      <section className="container-x py-28">
        <p className="eyebrow">Roadmap</p>
        <h2 className="section-title mt-3 max-w-2xl">Where we are and where we&apos;re going.</h2>
        <ol className="mt-14 grid gap-6 lg:grid-cols-3">
          {roadmap.map((step, i) => (
            <li key={step.stage} className={`relative rounded-3xl p-8 ${i === 0 ? "glass ring-1 ring-rojo/20" : "border border-marron/10"}`}>
              <span
                className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-wider ${
                  i === 0 ? "bg-rojo text-white" : "bg-marron/[0.06] text-marron/70"
                }`}
              >
                {step.stage}
              </span>
              <h3 className="mt-5 font-display text-xl font-semibold">{step.title}</h3>
              <ul className="mt-4 space-y-3">
                {step.items.map((item) => (
                  <li key={item} className="flex gap-3 text-marron/70">
                    <span className={`mt-2 h-1.5 w-1.5 shrink-0 rounded-full ${i === 0 ? "bg-rojo" : "bg-amarillo"}`} />
                    {item}
                  </li>
                ))}
              </ul>
            </li>
          ))}
        </ol>
      </section>

      <Cta />
    </main>
  )
}
