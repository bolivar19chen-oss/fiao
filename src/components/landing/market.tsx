import { CollectionChart } from "@/components/landing/collection-chart"
import { SampleBadge } from "@/components/ui/sample-badge"
import { maxStores, provinces } from "@/data/panama"
import { formatCents, formatCount } from "@/lib/format"

export function Market() {
  return (
    <section id="market" className="container-x py-28">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div className="max-w-2xl">
          <p className="eyebrow">Market</p>
          <h2 className="section-title mt-3">The market at a glance.</h2>
        </div>
        <SampleBadge />
      </div>

      <div className="mt-12 grid gap-6 lg:grid-cols-[1.25fr_1fr]">
        <div className="overflow-hidden rounded-3xl border border-marron/10">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[34rem] text-left text-sm">
              <thead className="bg-marron/[0.03] text-xs uppercase tracking-wider text-marron/55">
                <tr>
                  <th scope="col" className="px-6 py-4 font-semibold">Province</th>
                  <th scope="col" className="px-6 py-4 font-semibold">Stores</th>
                  <th scope="col" className="px-6 py-4 text-right font-semibold">On credit</th>
                  <th scope="col" className="px-6 py-4 text-right font-semibold">Avg. ticket</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-marron/[0.07]">
                {provinces.map((p) => (
                  <tr key={p.id} className="transition hover:bg-amarillo/[0.07]">
                    <th scope="row" className="px-6 py-3.5 font-medium">{p.province}</th>
                    <td className="px-6 py-3.5">
                      <div className="flex items-center gap-3">
                        <span className="w-12 tabular-nums">{formatCount(p.stores)}</span>
                        <span className="h-1.5 flex-1 rounded-full bg-marron/[0.06]">
                          <span
                            className="block h-full rounded-full bg-gradient-to-r from-rojo to-[#e04848]"
                            style={{ width: `${(p.stores / maxStores) * 100}%` }}
                          />
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-3.5 text-right tabular-nums">{p.creditSharePct}%</td>
                    <td className="px-6 py-3.5 text-right tabular-nums">{formatCents(p.avgTicketCents)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="flex flex-col rounded-3xl border border-marron/10 p-6">
          <h3 className="font-display text-lg font-semibold">Credit recovered with FIA&apos;O</h3>
          <p className="mt-1 text-sm text-marron/60">Example store, last six months</p>
          <div className="mt-4 flex gap-5 text-xs text-marron/65">
            <span className="inline-flex items-center gap-2">
              <span className="h-2 w-2 rounded-full bg-rojo" /> Collected
            </span>
            <span className="inline-flex items-center gap-2">
              <span className="h-2 w-2 rounded-full bg-amarillo" /> Outstanding
            </span>
          </div>
          <div className="mt-4 min-h-[260px] flex-1">
            <CollectionChart />
          </div>
        </div>
      </div>
    </section>
  )
}
