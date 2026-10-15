import { SampleBadge } from "@/components/ui/sample-badge"
import { provinces, totalStores } from "@/data/panama"
import { formatCents, formatCount } from "@/lib/format"

const avgCreditShare = Math.round(
  provinces.reduce((sum, p) => sum + p.creditSharePct * p.stores, 0) / totalStores,
)

export function KpiBand() {
  return (
    <section aria-label="Key figures" className="container-x -mt-10">
      <div className="glass grid grid-cols-2 gap-px overflow-hidden rounded-3xl bg-marron/[0.06] lg:grid-cols-4">
        {[
          { value: formatCount(totalStores), label: "Corner stores mapped" },
          { value: String(provinces.length), label: "Provinces covered" },
          { value: `${avgCreditShare}%`, label: "Of sales made on credit" },
          { value: formatCents(Math.round(provinces.reduce((s, p) => s + p.avgTicketCents, 0) / provinces.length)), label: "Average ticket" },
        ].map((kpi) => (
          <div key={kpi.label} className="bg-white/80 px-6 py-7">
            <div className="font-display text-3xl font-semibold tabular-nums tracking-tight text-marron">{kpi.value}</div>
            <div className="mt-1 text-sm text-marron/60">{kpi.label}</div>
          </div>
        ))}
      </div>
      <div className="mt-3 flex justify-end">
        <SampleBadge />
      </div>
    </section>
  )
}
