import { CategoryChart } from "@/components/landing/category-chart"
import { SectionHeading } from "@/components/ui/section-heading"
import { SourceNote } from "@/components/ui/source-note"
import { maxStores, provinces, totalStores } from "@/data/panama"
import { formatCount } from "@/lib/format"

export function Market() {
  return (
    <section id="market" className="container-x py-28">
      <SectionHeading index="03" label="Market" title="The market at a glance.">
        <p>
          {formatCount(totalStores)} food stores with a sanitary registration from the Ministry of Health, by province
          and type of store.
        </p>
      </SectionHeading>

      <div className="mt-14 grid gap-6 lg:grid-cols-[1.25fr_1fr]">
        <div className="overflow-hidden rounded-3xl border border-marron/10">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[34rem] text-left text-sm">
              <thead className="bg-marron/[0.03] text-xs uppercase tracking-wider text-marron/55">
                <tr>
                  <th scope="col" className="px-6 py-4 font-semibold">
                    Province
                  </th>
                  <th scope="col" className="px-6 py-4 font-semibold">
                    Stores
                  </th>
                  <th scope="col" className="px-6 py-4 text-right font-semibold">
                    Share
                  </th>
                  <th scope="col" className="px-6 py-4 font-semibold">
                    Top district
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-marron/[0.07]">
                {provinces.map((p) => (
                  <tr key={p.id} className="transition hover:bg-amarillo/[0.07]">
                    <th scope="row" className="px-6 py-3.5 font-medium">
                      {p.province}
                    </th>
                    <td className="px-6 py-3.5">
                      <div className="flex items-center gap-3">
                        <span className="w-9 tabular-nums">{formatCount(p.stores)}</span>
                        <span className="h-1.5 flex-1 rounded-full bg-marron/[0.06]">
                          <span
                            className="block h-full rounded-full bg-gradient-to-r from-rojo to-[#e04848]"
                            style={{ width: `${(p.stores / maxStores) * 100}%` }}
                          />
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-3.5 text-right tabular-nums">
                      {((p.stores / totalStores) * 100).toFixed(1)}%
                    </td>
                    <td className="px-6 py-3.5 text-marron/70">
                      {p.topDistrict && (
                        <>
                          {p.topDistrict.name}{" "}
                          <span className="tabular-nums text-marron/45">({p.topDistrict.stores})</span>
                        </>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="flex flex-col rounded-3xl border border-marron/10 p-6">
          <h3 className="font-display text-lg font-semibold">Stores by type</h3>
          <p className="mt-1 text-sm text-marron/60">Registered food stores across Panama</p>
          <div className="mt-6 min-h-[260px] flex-1">
            <CategoryChart />
          </div>
        </div>
      </div>

      <SourceNote className="mt-5" />
    </section>
  )
}
