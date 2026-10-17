import { MapPin } from "lucide-react"
import { Globe, type GlobeArc, type GlobeMarker } from "@/components/landing/globe"
import { SourceNote } from "@/components/ui/source-note"
import { maxStores, provinces, totalStores } from "@/data/panama"
import { formatCount } from "@/lib/format"

// Ciudad de Panama: centro del globo y origen de los arcos.
const hq = provinces.find((p) => p.id === "pa")!

const markers: GlobeMarker[] = provinces.map((p) => ({
  id: p.id,
  location: p.location,
  size: 0.018 + (p.stores / maxStores) * 0.03,
  label: p.id === hq.id ? `Panama · ${formatCount(totalStores)} stores` : undefined,
}))

const arcs: GlobeArc[] = provinces
  .filter((p) => p.id !== hq.id)
  .map((p) => ({ id: `arc-${p.id}`, from: hq.location, to: p.location }))

export function Coverage() {
  return (
    <section id="map" className="px-3">
      {/* Panel crema con bordes redondeados: cambio de ritmo antes del cierre. */}
      <div className="relative isolate overflow-hidden rounded-[2.5rem] bg-crema-claro py-24 ring-1 ring-marron/[0.06]">
        <div
          className="pointer-events-none absolute left-1/4 top-1/2 -z-10 h-[36rem] w-[36rem] -translate-x-1/2 -translate-y-1/2 rounded-full bg-amarillo/30 blur-[120px]"
          aria-hidden
        />
        <div className="container-x grid items-center gap-14 lg:grid-cols-[1.1fr_1fr]">
          <Globe markers={markers} arcs={arcs} focus={hq.location} className="mx-auto w-full max-w-[560px]" />
          <div>
            <p className="flex items-baseline gap-3 border-t border-marron/15 pt-6 text-xs font-semibold uppercase tracking-[0.18em] text-marron/50">
              <span className="font-display tabular-nums text-rojo">04</span>
              Coverage
            </p>
            <h2 className="mt-5 font-display text-4xl font-light leading-[1.08] tracking-[-0.03em] sm:text-5xl">
              Panama&apos;s corner stores, on one map.
            </h2>
            <p className="mt-5 text-lg leading-relaxed text-marron/70">
              From Bocas del Toro to Darién, small stores carry the neighborhood economy. Each point is a province,
              sized by its registered stores. Drag the globe to explore.
            </p>
            <ul className="mt-8 grid grid-cols-2 gap-3">
              {provinces.slice(0, 6).map((p) => (
                <li key={p.id} className="glass flex items-center gap-3 rounded-2xl px-4 py-3">
                  <MapPin className="h-4 w-4 shrink-0 text-rojo" aria-hidden />
                  <div className="min-w-0">
                    <div className="truncate text-sm font-semibold">{p.province}</div>
                    <div className="text-xs tabular-nums text-marron/55">{formatCount(p.stores)} stores</div>
                  </div>
                </li>
              ))}
            </ul>
            <SourceNote className="mt-5" />
          </div>
        </div>
      </div>
    </section>
  )
}
