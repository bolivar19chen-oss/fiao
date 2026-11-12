"use client"

import { useEffect, useState } from "react"
import { Check } from "lucide-react"

// Cada id tiene su regla `[data-fondo="..."]` en globals.css, que define --app-fondo. El
// mismo atributo pinta la muestra de aca y el fondo de la app, asi nunca se desfasan.
const FONDOS = [
  { id: "", label: "Plain" },
  { id: "amanecer", label: "Sunrise" },
  { id: "brasa", label: "Ember" },
  { id: "arena", label: "Sand" },
  { id: "la-confianza", label: "La Confianza", credit: "Mitzi Valdés" },
  { id: "san-juan", label: "San Juan", credit: "Mitzi Valdés" },
] as const

// Cuanta transparencia llevan el panel y las fichas cuando hay fondo (--cristal en globals.css).
const CRISTALES = [
  { id: "claro", label: "Clear" },
  { id: "", label: "Frosted" },
  { id: "solido", label: "Solid" },
] as const

// La eleccion vive en localStorage("fondo") y en data-fondo de <html>, igual que el tema: el
// script de src/app/layout.tsx la aplica antes de pintar.
export function FondoPicker() {
  const [fondo, setFondo] = useState("")
  const [cristal, setCristal] = useState("")

  useEffect(() => {
    setFondo(document.documentElement.dataset.fondo ?? "")
    setCristal(document.documentElement.dataset.cristal ?? "")
  }, [])

  // Las dos preferencias se guardan igual: atributo en <html> y la misma clave en localStorage.
  function save(key: "fondo" | "cristal", id: string) {
    if (key === "fondo") setFondo(id)
    else setCristal(id)
    if (id) document.documentElement.dataset[key] = id
    else delete document.documentElement.dataset[key]
    try {
      if (id) localStorage.setItem(key, id)
      else localStorage.removeItem(key)
    } catch {
      // Sin almacenamiento la eleccion vale para esta visita.
    }
  }

  return (
    <div>
      <div role="radiogroup" aria-label="Background" className="grid grid-cols-3 gap-3 sm:grid-cols-6">
        {FONDOS.map(({ id, label }) => (
          <button
            key={id}
            type="button"
            role="radio"
            aria-checked={fondo === id}
            onClick={() => save("fondo", id)}
            className="group text-left focus-visible:outline-none"
          >
            <span
              data-fondo={id || undefined}
              // "Plain" no tiene regla propia y heredaria el fondo elegido en <html>.
              style={id ? undefined : { background: "rgb(var(--papel))" }}
              className="app-fondo relative block aspect-[4/3] rounded-xl ring-1 ring-marron/15 transition group-hover:ring-rojo/50 group-focus-visible:ring-2 group-focus-visible:ring-rojo group-aria-checked:ring-2 group-aria-checked:ring-rojo"
            >
              {fondo === id && (
                <span className="absolute right-1.5 top-1.5 grid h-5 w-5 place-items-center rounded-full bg-rojo-panel text-white">
                  <Check className="h-3 w-3" strokeWidth={3} aria-hidden />
                </span>
              )}
            </span>
            <span className="mt-1.5 block text-xs font-medium text-marron/70">{label}</span>
          </button>
        ))}
      </div>
      <div
        role="radiogroup"
        aria-label="Glass"
        className="mt-5 inline-flex rounded-full border border-marron/10 bg-papel p-1"
      >
        {CRISTALES.map(({ id, label }) => (
          <button
            key={id}
            type="button"
            role="radio"
            aria-checked={cristal === id}
            // Sin fondo no hay nada que transparentar: el control se ve pero no actua.
            disabled={!fondo}
            onClick={() => save("cristal", id)}
            className="h-9 rounded-full px-4 text-sm font-medium text-marron/70 transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rojo disabled:opacity-50 aria-checked:bg-fondo aria-checked:text-marron"
          >
            {label}
          </button>
        ))}
      </div>
      <p className="mt-4 text-xs text-marron/70">
        Photos:{" "}
        <a
          href="https://commons.wikimedia.org/wiki/File:Abarroter%C3%ADa_de_la_comunidad_de_Alto_De_La_Estancia.jpg"
          className="underline underline-offset-2"
        >
          La Confianza
        </a>{" "}
        and{" "}
        <a
          href="https://commons.wikimedia.org/wiki/File:Min%C3%ADsuper_San_Juan.jpg"
          className="underline underline-offset-2"
        >
          San Juan
        </a>{" "}
        by Mitzi Valdés, CC BY-SA 4.0. Resized.
      </p>
    </div>
  )
}
