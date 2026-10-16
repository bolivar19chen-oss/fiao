import Link from "next/link"
import { ArrowUpRight } from "lucide-react"
import { SectionHeading } from "@/components/ui/section-heading"

const services = [
  { title: "Inventory", body: "Stock levels, product catalog and low-stock alerts before the shelf runs empty." },
  { title: "Credit sales", body: "Installment schedules and partial payments that add up to the cent." },
  {
    title: "Credit score",
    body: "A transparent score for every customer, built from punctuality, debt ratio and history.",
  },
  { title: "Reports", body: "Portfolio, overdue accounts and cash flow in interactive dashboards." },
  {
    title: "Works offline",
    body: "Keep selling without signal. Everything syncs and is validated once you are back online.",
  },
  { title: "Reminders", body: "Automatic payment reminders, so nobody has to chase customers." },
]

// Lista editorial numerada; el detalle de cada modulo vive en /services.
export function Services() {
  return (
    <section id="services" className="container-x py-28">
      <SectionHeading index="02" label="Services" title="Everything a store needs to sell on credit." />

      <ol className="mt-14 border-b border-marron/10 lg:ml-[240px]">
        {services.map((s, i) => (
          <li key={s.title} className="border-t border-marron/10">
            <Link
              href="/services"
              className="group grid items-center gap-x-8 gap-y-2 py-7 sm:grid-cols-[3rem_1fr_auto] lg:grid-cols-[3rem_minmax(0,1fr)_minmax(0,1.1fr)_auto]"
            >
              <span className="font-display text-sm tabular-nums text-marron/35">{String(i + 1).padStart(2, "0")}</span>
              <h3 className="font-display text-3xl font-light tracking-[-0.03em] transition duration-300 group-hover:translate-x-1.5 group-hover:text-rojo sm:text-4xl">
                {s.title}
              </h3>
              <p className="text-marron/60 sm:col-start-2 lg:col-start-auto">{s.body}</p>
              <span className="hidden h-11 w-11 place-items-center rounded-full border border-marron/15 text-marron/40 transition duration-300 group-hover:border-rojo group-hover:bg-rojo group-hover:text-white sm:row-start-1 sm:grid sm:col-start-3 lg:col-start-4">
                <ArrowUpRight className="h-5 w-5 transition duration-300 group-hover:rotate-45" aria-hidden />
              </span>
            </Link>
          </li>
        ))}
      </ol>
    </section>
  )
}
