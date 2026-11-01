import type { Metadata } from "next"
import {
  BellRing,
  ChartColumn,
  ChevronDown,
  HandCoins,
  Package,
  ShieldCheck,
  Smartphone,
  UserRound,
  WifiOff,
} from "lucide-react"

import { Cta } from "@/components/landing/cta"
import { IconTile } from "@/components/ui/icon-tile"
import { PageHero } from "@/components/ui/page-hero"
import { ScoreRing } from "@/components/ui/score-ring"
import shunYi from "@/assets/img/mini-market-shun-yi.webp"

export const metadata: Metadata = {
  title: "Services - FIA'O",
}

const steps = [
  {
    title: "Add your customers",
    body: "Name and phone are enough. Each customer gets a profile with their full credit history.",
  },
  {
    title: "Sell on credit",
    body: "Record the sale, pick the products and set the installments. Stock updates on its own.",
  },
  {
    title: "Collect and grow",
    body: "Register payments as they come in. Balances and credit scores update instantly.",
  },
]

const modules = [
  {
    icon: UserRound,
    title: "Customers",
    points: ["Profiles with purchase and payment history", "Balance owed at a glance", "Notes for each customer"],
  },
  {
    icon: Package,
    title: "Inventory",
    points: ["Product catalog with prices", "Stock that updates with every sale", "Low-stock alerts"],
  },
  {
    icon: HandCoins,
    title: "Credit sales",
    points: ["Installment schedules", "Partial payments of any amount", "Account statements per customer"],
  },
  {
    icon: ChartColumn,
    title: "Reports",
    points: ["Total credit outstanding", "Overdue accounts and top debtors", "Weekly collections"],
  },
  {
    icon: WifiOff,
    title: "Offline mode",
    points: ["Keep selling without signal", "Automatic sync when back online", "Every change validated on the server"],
  },
  {
    icon: BellRing,
    title: "Reminders",
    points: ["Payment reminders by email", "WhatsApp reminders on the roadmap", "You choose when they go out"],
  },
]

const factors = [
  { title: "Punctuality", body: "Paying on or before the due date carries the most weight." },
  { title: "Debt ratio", body: "How much a customer owes compared to what they usually buy." },
  { title: "Tenure", body: "How long the customer has been buying on credit at your store." },
  { title: "Frequency", body: "How regularly the customer buys and pays." },
]

const faqs = [
  {
    q: "Do I need an internet connection?",
    a: "No. FIA'O keeps working offline and syncs your sales and payments when the connection comes back. The server validates every operation before saving it.",
  },
  {
    q: "Does it work on my phone?",
    a: "Yes. FIA'O runs in the browser and can be installed on any Android or iPhone, including low-end devices. No app store needed.",
  },
  {
    q: "Can other stores see my customers?",
    a: "No. Each store's data is isolated by the database itself, not just hidden by the app. Credit scores are never shared between stores.",
  },
  {
    q: "How exact are the balances?",
    a: "Every amount is stored as whole cents, so there are no rounding errors, no matter how many partial payments a customer makes.",
  },
  {
    q: "Can my employees use it?",
    a: "Yes. The owner can invite staff to the store, and each person logs in with their own account.",
  },
]

export default function ServicesPage() {
  return (
    <main>
      <PageHero
        eyebrow="Services"
        title={
          <>
            One tool for the whole <span className="text-rojo">credit cycle.</span>
          </>
        }
        lead="From the first sale on credit to the last payment, FIA'O keeps every balance, product and customer in one place."
        image={shunYi}
        imagePosition="50% 52%"
      />

      {/* How it works */}
      <section className="container-x pb-28">
        <p className="eyebrow text-center">How it works</p>
        <ol className="relative mt-10 grid gap-6 md:grid-cols-3">
          <span
            className="absolute left-[16%] right-[16%] top-7 hidden h-px bg-gradient-to-r from-rojo/30 via-amarillo/60 to-rojo/30 md:block"
            aria-hidden
          />
          {steps.map((step, i) => (
            <li key={step.title} className="relative text-center">
              <span className="btn-glass-red mx-auto grid h-14 w-14 place-items-center rounded-full font-display text-lg font-semibold">
                {i + 1}
              </span>
              <h3 className="mt-6 font-display text-xl font-semibold">{step.title}</h3>
              <p className="mx-auto mt-2 max-w-xs leading-relaxed text-marron/70">{step.body}</p>
            </li>
          ))}
        </ol>
      </section>

      {/* Modules */}
      <section className="border-y border-marron/10 bg-marron/[0.015] py-28">
        <div className="container-x">
          <p className="eyebrow">What&apos;s included</p>
          <h2 className="section-title mt-3 max-w-2xl">Six modules, one ledger.</h2>
          <div className="mt-12 grid gap-5 md:grid-cols-2 lg:grid-cols-3">
            {modules.map(({ icon, title, points }) => (
              <article key={title} className="rounded-3xl border border-marron/10 bg-fondo p-7">
                <div className="flex items-center gap-4">
                  <IconTile icon={icon} />
                  <h3 className="font-display text-xl font-semibold">{title}</h3>
                </div>
                <ul className="mt-6 space-y-3 border-t border-marron/[0.07] pt-5">
                  {points.map((p) => (
                    <li key={p} className="flex gap-3 text-sm text-marron/70">
                      <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-rojo" />
                      {p}
                    </li>
                  ))}
                </ul>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* Credit score */}
      <section className="relative isolate overflow-hidden py-28">
        <div
          className="pointer-events-none absolute -left-24 top-1/3 -z-10 h-96 w-96 rounded-full bg-amarillo/25 blur-[110px]"
          aria-hidden
        />
        <div className="container-x grid items-center gap-14 lg:grid-cols-2">
          <div className="glass mx-auto flex w-full max-w-sm flex-col items-center rounded-[2rem] px-8 py-12 text-center">
            <ScoreRing score={82} className="h-44 w-44" />
            <div className="mt-6 font-display text-2xl font-semibold">Good standing</div>
            <p className="mt-2 text-sm text-marron/70">Scores go from 0 to 100 and update with every payment.</p>
            <div className="mt-6 flex w-full justify-between text-xs font-semibold uppercase tracking-wider">
              <span className="text-rojo">Risk</span>
              <span className="text-marron/70">Fair</span>
              <span className="text-marron">Trusted</span>
            </div>
            <div className="mt-2 h-2 w-full rounded-full bg-gradient-to-r from-rojo via-amarillo to-marron/70" />
          </div>
          <div>
            <p className="eyebrow">Credit score</p>
            <h2 className="section-title mt-3">Know who to trust, before you sell.</h2>
            <p className="mt-5 text-lg leading-relaxed text-marron/70">
              Every customer gets a score built from their real history at your store. Late payments lower it gradually
              according to how many days they are overdue; paying on time brings it back up.
            </p>
            <dl className="mt-8 grid gap-4 sm:grid-cols-2">
              {factors.map((f) => (
                <div key={f.title} className="rounded-2xl border border-marron/10 p-5">
                  <dt className="font-display font-semibold">{f.title}</dt>
                  <dd className="mt-1 text-sm leading-relaxed text-marron/70">{f.body}</dd>
                </div>
              ))}
            </dl>
          </div>
        </div>
      </section>

      {/* Platform */}
      <section className="container-x pb-28">
        <div className="grid gap-5 md:grid-cols-3">
          {[
            {
              icon: Smartphone,
              title: "Installs like an app",
              body: "Add FIA'O to the home screen straight from the browser.",
            },
            { icon: WifiOff, title: "Built for weak signal", body: "Fast on low-end phones and spotty connections." },
            { icon: ShieldCheck, title: "Secure by default", body: "Data isolation enforced by the database itself." },
          ].map(({ icon, title, body }) => (
            <div key={title} className="glass flex gap-4 rounded-3xl p-6">
              <IconTile icon={icon} />
              <div>
                <h3 className="font-display font-semibold">{title}</h3>
                <p className="mt-1 text-sm text-marron/70">{body}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* FAQ */}
      <section className="container-x max-w-3xl pb-28">
        <p className="eyebrow text-center">FAQ</p>
        <h2 className="section-title mt-3 text-center">Questions store owners ask.</h2>
        <div className="mt-12 divide-y divide-marron/10 rounded-3xl border border-marron/10">
          {faqs.map((f) => (
            <details key={f.q} className="group px-6 py-5 [&_summary::-webkit-details-marker]:hidden">
              <summary className="flex cursor-pointer list-none items-center justify-between gap-4 font-display text-lg font-semibold">
                {f.q}
                <ChevronDown
                  className="h-5 w-5 shrink-0 text-rojo transition-transform group-open:rotate-180"
                  aria-hidden
                />
              </summary>
              <p className="mt-3 leading-relaxed text-marron/70">{f.a}</p>
            </details>
          ))}
        </div>
      </section>

      <Cta />
    </main>
  )
}
