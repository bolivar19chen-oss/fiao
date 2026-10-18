import { categories, districtCount, provinces, topDistrict, totalStores } from "@/data/panama"

const miniSuperShare = Math.round((categories[0].stores / totalStores) * 100)
const topProvince = provinces[0]
const topProvinceShare = Math.round((topProvince.stores / totalStores) * 100)

export function KpiBand() {
  return (
    <section aria-label="Key figures" className="container-x pt-20">
      <dl className="grid grid-cols-2 gap-y-10 lg:grid-cols-4">
        {[
          { value: `${provinces.length}/${districtCount}`, label: "Provinces / districts" },
          { value: `${topProvinceShare}%`, label: `Of stores are in ${topProvince.province}` },
          { value: `${miniSuperShare}%`, label: "Are mini supers" },
          { value: topDistrict.name, label: `Top district · ${topDistrict.stores} stores` },
        ].map((kpi) => (
          <div key={kpi.label} className="flex flex-col-reverse border-l border-marron/15 pl-6">
            <dt className="mt-2 text-sm text-marron/55">{kpi.label}</dt>
            <dd
              title={kpi.value}
              className="truncate font-display text-4xl font-light tabular-nums tracking-[-0.04em] text-marron sm:text-5xl"
            >
              {kpi.value}
            </dd>
          </div>
        ))}
      </dl>
    </section>
  )
}
