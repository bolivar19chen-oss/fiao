import { MapPin } from "lucide-react"
import { Globe, type GlobeArc, type GlobeMarker } from "@/components/landing/globe"
import { SampleBadge } from "@/components/ui/sample-badge"
import { maxStores, provinces, totalStores } from "@/data/panama"
import { formatCount } from "@/lib/format"

const hq = provinces[0]

const markers: GlobeMarker[] = provinces.map((p) => ({
  id: p.id,
  location: p.location,
  size: 0.018 + (p.stores / maxStores) * 0.03,
  label: p.id === hq.id ? `Panama · ${formatCount(totalStores)} stores` : undefined,
}))

const arcs: GlobeArc[] = provinces.slice(1).map((p) => ({ id: `arc-${p.id}`, from: hq.location, to: p.location }))

export function Coverage() {
  return (
    <section id="map" className="relative isolate overflow-hidden py-28">
      <div className="pointer-events-none absolute left-1/2 top-1/2 -z-10 h-[40rem] w-[40rem] -translate-x-1/2 -translate-y-1/2 rounded-full bg-amarillo/20 blur-[120px]" aria-hidden />
      <div className="container-x grid items-center gap-14 lg:grid-cols-[1.1fr_1fr]">
        <Globe markers={markers} arcs={arcs} focus={hq.location} className="mx-auto w-full max-w-[560px]" />
        <div>
          <p className="eyebrow">Coverage</p>
          <h2 className="section-title mt-3">Every corner store in Panama, on one map.</h2>
          <p className="mt-5 text-lg leading-relaxed text-marron/70">
            From Bocas del Toro to Darién, small stores carry the neighborhood economy. Drag the globe to explore.
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
          <div className="mt-4">
            <SampleBadge />
          </div>
        </div>
      </div>
    </section>
  )
}
