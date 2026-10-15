import { BellRing, ChartColumn, Gauge, HandCoins, Package, WifiOff } from "lucide-react"
import { Aurora } from "@/components/ui/aurora"
import { IconTile } from "@/components/ui/icon-tile"

const services = [
  { icon: Package, title: "Inventory", body: "Stock levels, product catalog and low-stock alerts before the shelf runs empty." },
  { icon: HandCoins, title: "Credit sales", body: "Sell on credit with clear installment schedules and partial payments that add up to the cent." },
  { icon: Gauge, title: "Credit score", body: "A transparent score for every customer, built from punctuality, debt ratio and history." },
  { icon: ChartColumn, title: "Reports", body: "Portfolio, overdue accounts and cash flow in interactive dashboards, not spreadsheets." },
  { icon: WifiOff, title: "Works offline", body: "Keep selling without signal. Every operation syncs and is validated once you are back online." },
  { icon: BellRing, title: "Payment reminders", body: "Automatic reminders so customers pay on time and nobody has to chase them." },
]

export function Services() {
  return (
    <section id="services" className="relative isolate overflow-hidden py-28">
      <Aurora className="opacity-70" />
      <div className="container-x">
        <div className="max-w-2xl">
          <p className="eyebrow">Services</p>
          <h2 className="section-title mt-3">Everything a store needs to sell on credit.</h2>
        </div>
        <div className="mt-14 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {services.map(({ icon: Icon, title, body }) => (
            <article key={title} className="glass group rounded-3xl p-7 transition duration-300 hover:-translate-y-1">
              <IconTile icon={Icon} />
              <h3 className="mt-6 font-display text-xl font-semibold">{title}</h3>
              <p className="mt-2 leading-relaxed text-marron/65">{body}</p>
            </article>
          ))}
        </div>
      </div>
    </section>
  )
}
