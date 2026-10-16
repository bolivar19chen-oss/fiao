import { categories, districtCount, provinces, topDistrict, totalStores } from "@/data/panama"
import { formatCount } from "@/lib/format"

const miniSuperShare = Math.round((categories[0].stores / totalStores) * 100)

export function KpiBand() {
  return (
    <section aria-label="Key figures" className="container-x -mt-10">
      <div className="glass grid grid-cols-2 gap-px overflow-hidden rounded-3xl bg-marron/[0.06] lg:grid-cols-4">
        {[
          { value: formatCount(totalStores), label: "Registered food stores" },
          { value: `${provinces.length} / ${districtCount}`, label: "Provinces / districts" },
          { value: `${miniSuperShare}%`, label: "Are mini supers" },
          { value: topDistrict.name, label: `Top district · ${topDistrict.stores} stores` },
        ].map((kpi) => (
          <div key={kpi.label} className="bg-white/80 px-6 py-7">
            <div className="truncate font-display text-3xl font-semibold tabular-nums tracking-tight text-marron">{kpi.value}</div>
            <div className="mt-1 text-sm text-marron/60">{kpi.label}</div>
          </div>
        ))}
      </div>
    </section>
  )
}
