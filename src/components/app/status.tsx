"use client"

import { AlertTriangle, Check, Clock } from "lucide-react"

import { formatCents } from "@/lib/format"

// Parte-de-un-todo y los colores de estado. Vive aparte de charts.tsx a proposito:
// nada de esto necesita recharts, y tenerlo en el mismo archivo obligaba a /me a
// descargar la libreria de graficas entera para pintar tres divs de colores.
//
// Ya no usa framer-motion: animar el ancho de dos barras costaba otros ~46 kB y una
// transicion de CSS hace lo mismo gratis. En un Android barato eso vale mas que la
// libreria.
//
// Lleva "use client" aunque no tenga estado: charts.tsx es cliente y necesita
// STATUS_META. Sin la directiva, Next trata este modulo como de servidor cuando /me lo
// renderiza, y la constante llega undefined al otro lado.
//
// Reglas que se mantienen: los colores de estado son reservados y SIEMPRE van con icono
// y etiqueta, nunca solos.

export type StatusSlice = { key: "on-time" | "due-soon" | "overdue"; cents: number }

export const STATUS_META = {
  "on-time": { label: "On time", fill: "bg-estado-al-dia", ink: "text-estado-al-dia", Icon: Check },
  "due-soon": { label: "Due soon", fill: "bg-estado-por-vencer", ink: "text-estado-por-vencer", Icon: Clock },
  overdue: { label: "Overdue", fill: "bg-estado-mora", ink: "text-estado-mora", Icon: AlertTriangle },
} as const

/**
 * Reparto en barra apilada horizontal.
 *
 * El separador va con `gap` y no con un borde: asi mide exactamente 2px a cualquier
 * ancho. Un SVG estirado lo deforma (docs/UI-DASHBOARD.md seccion 1). La leyenda ya trae
 * cada valor escrito, asi que no le falta hover.
 */
export function StatusBar({ slices }: { slices: StatusSlice[] }) {
  const total = slices.reduce((sum, slice) => sum + slice.cents, 0)
  const visible = slices.filter((slice) => slice.cents > 0)

  if (total === 0) return <p className="text-[15px] text-marron/70">Nothing owed right now.</p>

  const label = visible.map((s) => `${STATUS_META[s.key].label} ${formatCents(s.cents)}`).join(", ")

  return (
    <>
      <div
        className="flex h-12 gap-0.5 overflow-hidden rounded-lg"
        role="img"
        aria-label={`Portfolio by status: ${label}`}
      >
        {visible.map((slice) => (
          <div
            key={slice.key}
            className={`${STATUS_META[slice.key].fill} transition-[width] duration-700 ease-apple first:rounded-l-lg last:rounded-r-lg motion-reduce:transition-none`}
            style={{ width: `${(slice.cents / total) * 100}%` }}
          />
        ))}
      </div>

      <ul className="mt-4 flex flex-wrap gap-x-6 gap-y-2">
        {slices.map((slice) => {
          const { label: name, ink, Icon } = STATUS_META[slice.key]
          return (
            <li key={slice.key} className="flex items-center gap-2 text-[13px]">
              <Icon className={`h-4 w-4 shrink-0 ${ink}`} aria-hidden />
              <span className="font-semibold text-marron">{name}</span>
              <span className="text-marron/70">
                {formatCents(slice.cents)} - {Math.round((slice.cents / total) * 100)}%
              </span>
            </li>
          )
        })}
      </ul>
    </>
  )
}
