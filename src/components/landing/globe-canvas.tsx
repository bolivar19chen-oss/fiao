"use client"

import { useEffect, useRef, useState, type CSSProperties } from "react"
import { Compass, Globe2, Minus, Plus } from "lucide-react"

import { BRAND, SUPERFICIE } from "@/lib/colors"

import { mountGlobe, type GlobeControls, type GlobePin } from "./globe-engine"
import panamaCoast from "./panama-coast.json"
import panamaLakes from "./panama-lakes.json"
import panamaProvinces from "./panama-provinces.json"
import world from "./world-map.json"

const panama = {
  type: "FeatureCollection",
  features: [...panamaCoast.features, ...panamaProvinces.features, ...panamaLakes.features],
}

const mapColors = {
  "--fiao-ocean": SUPERFICIE.blanco,
  "--fiao-ocean-light": SUPERFICIE.blanco,
  "--fiao-land": BRAND.marron.DEFAULT,
  "--fiao-grid": BRAND.crema.DEFAULT,
  "--fiao-highlight": BRAND.rojo.DEFAULT,
  "--fiao-panama": BRAND.rojo.suave,
  "--fiao-detail-line": BRAND.marron.claro,
  "--fiao-border": BRAND.marron.claro,
} as CSSProperties

const iconButton =
  "inline-flex size-11 shrink-0 items-center justify-center rounded-xl border border-marron/15 bg-fondo text-marron hover:text-rojo focus-visible:outline focus-visible:outline-2 focus-visible:outline-rojo"
const mapButton =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-xl border border-marron/15 bg-fondo px-3 text-sm font-semibold text-marron hover:text-rojo focus-visible:outline focus-visible:outline-2 focus-visible:outline-rojo"

export function GlobeCanvas({ pins }: { pins: GlobePin[] }) {
  const stage = useRef<HTMLDivElement>(null)
  const journey = useRef<HTMLDivElement>(null)
  const controls = useRef<GlobeControls>(null)
  const [exploring, setExploring] = useState(false)
  const [selected, setSelected] = useState<GlobePin | null>(null)

  useEffect(() => {
    if (!stage.current || !journey.current) return
    let lastMode = "journey"
    let lastPin: GlobePin | null = null

    const map = mountGlobe(stage.current, {
      world,
      panama,
      pins,
      scrollTarget: journey.current,
      onChange: ({ mode, selectedPin }) => {
        if (lastMode !== mode) {
          lastMode = mode
          setExploring(mode === "explore")
        }
        if (lastPin !== selectedPin) {
          lastPin = selectedPin
          setSelected(selectedPin)
        }
      },
    })
    controls.current = map
    return () => {
      controls.current = null
      map.destroy()
    }
  }, [pins])

  return (
    <div ref={journey} className="coverage-map-journey">
      <div className="coverage-map-sticky container-x">
        <div ref={stage} className="coverage-map-stage rounded-3xl" style={mapColors} />
        <div className="flex flex-wrap items-center justify-between gap-2 py-3" aria-label="Map controls" role="group">
          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              className={mapButton}
              onClick={() => controls.current?.setExploring(!exploring)}
              aria-pressed={exploring}
            >
              <Globe2 className="size-4" aria-hidden />
              {exploring ? "Resume scroll" : "Explore map"}
            </button>
            <button
              type="button"
              className={mapButton}
              onClick={() => controls.current?.focus([-80.3, 8.55], undefined, "")}
            >
              <Compass className="size-4" aria-hidden />
              Panama
            </button>
            <button
              type="button"
              className={iconButton}
              aria-label="Zoom out"
              onClick={() => controls.current?.zoomBy(1 / 1.35)}
            >
              <Minus className="size-4" aria-hidden />
            </button>
            <button
              type="button"
              className={iconButton}
              aria-label="Zoom in"
              onClick={() => controls.current?.zoomBy(1.35)}
            >
              <Plus className="size-4" aria-hidden />
            </button>
          </div>
          <label className="flex min-h-11 items-center gap-2 text-sm font-medium text-marron">
            Go to
            <select
              value={selected?.id ?? ""}
              onChange={(event) => {
                const place = event.target.value
                if (place === "world") controls.current?.focus([-42, 16], 1, "")
                else if (place) controls.current?.focus([-80.3, 8.55], undefined, place)
              }}
              className="min-h-11 rounded-xl border border-marron/15 bg-fondo px-2 text-sm text-marron"
            >
              <option value="" disabled>
                Select a place
              </option>
              <option value="world">World view</option>
              {pins.map(({ id, name }) => (
                <option key={id} value={id}>
                  {name}
                </option>
              ))}
            </select>
          </label>
        </div>
        <p className="min-h-5 text-sm text-marron/75" aria-live="polite">
          {selected
            ? `${selected.name} · ${selected.description}`
            : exploring
              ? "Drag to rotate. Pinch or use the zoom controls."
              : "Scroll to approach Panama, or explore the map by hand."}
        </p>
      </div>
    </div>
  )
}
