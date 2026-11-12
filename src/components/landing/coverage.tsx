import { maxStores, provinces } from "@/data/panama"
import { formatCount } from "@/lib/format"
import { Globe, type GlobePin } from "@/components/landing/globe"
import { SourceNote } from "@/components/ui/source-note"

// `provinces` viene ordenado por tiendas. Con el pais entero en pantalla solo se ven las
// cinco mayores, con el punto proporcional a sus tiendas; el resto aparece al acercarse.
const MAIN_PINS = 5

const pins: GlobePin[] = provinces.map(({ id, province, location, stores }, index) => ({
  id,
  size: Math.round(10 + (stores / maxStores) * 12),
  detail: index >= MAIN_PINS,
  name: province,
  coordinates: [location[1], location[0]],
  description: `${formatCount(stores)} registered ${stores === 1 ? "store" : "stores"}`,
}))

export function Coverage() {
  return (
    <section id="map" aria-labelledby="coverage-title" className="px-3">
      <div className="relative isolate rounded-[2.5rem] bg-crema-claro py-12 ring-1 ring-marron/[0.06] sm:py-16">
        <div className="container-x mb-7">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-rojo">Coverage</p>
          <h2
            id="coverage-title"
            className="mt-3 max-w-3xl font-display text-4xl font-light leading-[1.08] tracking-[-0.03em] sm:text-5xl"
          >
            Panama&apos;s corner stores, on one map.
          </h2>
          <p className="mt-4 max-w-2xl text-base leading-relaxed text-marron/70 sm:text-lg">
            Scroll to fly into Panama. Select a province to see its registered stores.
          </p>
        </div>
        <Globe pins={pins} />
        <div className="container-x mt-5 space-y-2">
          <SourceNote />
          <p className="text-xs text-marron/70">
            World, coastline and lakes from{" "}
            <a href="https://www.naturalearthdata.com/about/terms-of-use/" className="underline underline-offset-2">
              Natural Earth
            </a>
            . Province boundaries simplified from the{" "}
            <a
              href="https://www.arcgis.com/home/item.html?id=b4c6ce7c427c43c4b9599b80f6b863fd"
              className="underline underline-offset-2"
            >
              Instituto Geográfico Nacional Tommy Guardia, 2024
            </a>
            . Boundary data licensed under{" "}
            <a href="https://creativecommons.org/licenses/by-sa/4.0/" className="underline underline-offset-2">
              CC BY-SA 4.0
            </a>
            .
          </p>
        </div>
      </div>
    </section>
  )
}
