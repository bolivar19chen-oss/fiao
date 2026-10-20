"use client"

import { motion, useReducedMotion } from "framer-motion"
import { AlertTriangle, Check, Clock } from "lucide-react"
import { Bar, BarChart, Cell, Pie, PieChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts"

import { formatCents } from "@/lib/format"

// Reglas que vienen de la guia de visualizacion y de docs/DISENO.md:
// - Los colores de estado son reservados y SIEMPRE van con icono y etiqueta, nunca solos.
// - Nada de torta: parte-de-un-todo va en barra apilada horizontal.
// - Una sola serie no lleva leyenda; el titulo ya dice que es.
// - El texto va en tinta, nunca del color de la serie.
// - Un grafico en pantalla es interactivo: lleva capa de hover.

// Recharts pide el color como dato: se pasa la variable del token para que siga al modo
// oscuro (ver TEMA en src/lib/colors.ts).
const TICK = { fill: "rgb(var(--marron) / 0.55)", fontSize: 12 }

/** Tooltip propio: el de Recharts trae su caja blanca con borde gris, ajeno a la marca. */
function MoneyTooltip({ active, payload, label }: { active?: boolean; payload?: { value: number }[]; label?: string }) {
  if (!active || !payload?.length) return null
  return (
    <div className="rounded-xl border border-fondo/70 bg-fondo/95 px-3 py-2 shadow-lg backdrop-blur">
      <p className="text-xs text-marron/60">{label}</p>
      <p className="font-display text-sm font-semibold tabular-nums text-marron">{formatCents(payload[0].value)}</p>
    </div>
  )
}

export type StatusSlice = { key: "on-time" | "due-soon" | "overdue"; cents: number }

const STATUS_META = {
  "on-time": { label: "On time", fill: "bg-estado-al-dia", ink: "text-estado-al-dia", Icon: Check },
  "due-soon": { label: "Due soon", fill: "bg-estado-por-vencer", ink: "text-estado-por-vencer", Icon: Clock },
  overdue: { label: "Overdue", fill: "bg-estado-mora", ink: "text-estado-mora", Icon: AlertTriangle },
} as const

/**
 * Cartera por estado. Barra apilada horizontal.
 *
 * Esta no va en Recharts: se arma con divs para que el separador entre segmentos mida
 * exactamente 2px a cualquier ancho. Un SVG estirado lo deforma (docs/UI-DASHBOARD.md
 * seccion 1). La leyenda ya trae cada valor escrito, asi que no le falta hover.
 */
export function StatusBar({ slices }: { slices: StatusSlice[] }) {
  const reduced = useReducedMotion()
  const total = slices.reduce((sum, slice) => sum + slice.cents, 0)
  const visible = slices.filter((slice) => slice.cents > 0)

  if (total === 0) return <p className="text-[15px] text-marron/60">Nothing owed right now.</p>

  const label = visible.map((s) => `${STATUS_META[s.key].label} ${formatCents(s.cents)}`).join(", ")

  return (
    <>
      <div
        className="flex h-12 gap-0.5 overflow-hidden rounded-lg"
        role="img"
        aria-label={`Portfolio by status: ${label}`}
      >
        {visible.map((slice) => (
          <motion.div
            key={slice.key}
            className={`${STATUS_META[slice.key].fill} first:rounded-l-lg last:rounded-r-lg`}
            initial={reduced ? false : { width: 0 }}
            animate={{ width: `${(slice.cents / total) * 100}%` }}
            transition={{ type: "spring", stiffness: 120, damping: 20 }}
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
              <span className="text-marron/60">
                {formatCents(slice.cents)} - {Math.round((slice.cents / total) * 100)}%
              </span>
            </li>
          )
        })}
      </ul>
    </>
  )
}

export type DayBar = { label: string; cents: number }

/** Cobros por dia. Columnas, una sola serie, con hover por dia. */
export function WeekColumns({ days }: { days: DayBar[] }) {
  const reduced = useReducedMotion()
  const peak = Math.max(...days.map((day) => day.cents), 0)

  return (
    <>
      <div className="h-44 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={days} margin={{ top: 8, right: 0, bottom: 0, left: 0 }}>
            <XAxis dataKey="label" tickLine={false} axisLine={{ stroke: "rgb(var(--marron) / 0.14)" }} tick={TICK} />
            <YAxis hide />
            <Tooltip content={<MoneyTooltip />} cursor={{ fill: "rgb(var(--marron) / 0.04)" }} />
            {/* radius solo arriba: el extremo que apoya en la base queda recto. */}
            <Bar dataKey="cents" radius={[4, 4, 0, 0]} isAnimationActive={!reduced} animationDuration={600}>
              {days.map((day) => (
                <Cell key={day.label} fill="rgb(var(--rojo))" fillOpacity={day.cents === peak && peak > 0 ? 1 : 0.7} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
      {/* La tabla equivalente, para quien no puede leer la forma. */}
      <p className="sr-only">{days.map((day) => `${day.label}: ${formatCents(day.cents)}`).join(". ")}</p>
    </>
  )
}

export type Debtor = { id: string; name: string; cents: number }

/** Top deudores. Barras horizontales: los nombres son largos y en vertical no entran. */
export function TopDebtors({ debtors }: { debtors: Debtor[] }) {
  const reduced = useReducedMotion()

  return (
    <>
      <div style={{ height: debtors.length * 40 + 8 }} className="w-full">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={debtors} layout="vertical" margin={{ top: 0, right: 0, bottom: 0, left: 0 }}>
            <XAxis type="number" hide />
            <YAxis
              type="category"
              dataKey="name"
              width={110}
              tickLine={false}
              axisLine={false}
              tick={TICK}
              interval={0}
            />
            <Tooltip content={<MoneyTooltip />} cursor={{ fill: "rgb(var(--marron) / 0.04)" }} />
            <Bar dataKey="cents" radius={[0, 4, 4, 0]} isAnimationActive={!reduced} animationDuration={600}>
              {debtors.map((debtor, index) => (
                <Cell
                  key={debtor.id}
                  fill="rgb(var(--rojo))"
                  // Mas claro hacia abajo: el orden es el dato, y el tono lo acompana.
                  fillOpacity={1 - index * 0.14}
                />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
      <p className="sr-only">{debtors.map((debtor) => `${debtor.name}: ${formatCents(debtor.cents)}`).join(". ")}</p>
    </>
  )
}

/**
 * Reparto de la cartera en dona, con el total en el centro.
 *
 * **Excepcion anotada:** docs/DISENO.md dice "nada de torta". Esta entra a peticion
 * expresa del usuario, copiando la estructura de DashSpace. Se mantienen las otras dos
 * reglas que si protegen la lectura: los colores de estado son reservados y la leyenda
 * lleva icono y etiqueta, nunca color solo. Con dos segmentos y el total escrito en el
 * centro, una dona se lee sin tener que comparar angulos.
 */
export function StatusDonut({ slices }: { slices: StatusSlice[] }) {
  const reduced = useReducedMotion()
  const total = slices.reduce((sum, slice) => sum + slice.cents, 0)
  const visible = slices.filter((slice) => slice.cents > 0)

  if (total === 0) return <p className="text-[15px] text-marron/60">Nothing owed right now.</p>

  const FILL = {
    "on-time": "rgb(var(--estado-al-dia))",
    "due-soon": "rgb(var(--estado-por-vencer))",
    overdue: "rgb(var(--estado-mora))",
  } as const

  return (
    <>
      <div className="relative h-52 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={visible}
              dataKey="cents"
              nameKey="key"
              innerRadius="68%"
              outerRadius="100%"
              paddingAngle={visible.length > 1 ? 2 : 0}
              stroke="none"
              isAnimationActive={!reduced}
              animationDuration={600}
            >
              {visible.map((slice) => (
                <Cell key={slice.key} fill={FILL[slice.key]} />
              ))}
            </Pie>
          </PieChart>
        </ResponsiveContainer>
        {/* El total va escrito, no deducido del angulo. */}
        <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-[11px] font-semibold uppercase tracking-[0.1em] text-marron/50">Outstanding</span>
          <span className="font-display text-[22px] font-semibold tabular-nums tracking-[-0.01em] text-marron">
            {formatCents(total)}
          </span>
        </div>
      </div>

      <ul className="mt-5 flex flex-col gap-2.5">
        {visible.map((slice) => {
          const { label, ink, Icon } = STATUS_META[slice.key]
          return (
            <li key={slice.key} className="flex items-center gap-2 text-[13px]">
              <Icon className={`h-4 w-4 shrink-0 ${ink}`} strokeWidth={2} aria-hidden />
              <span className="flex-1 font-semibold text-marron">{label}</span>
              <span className="shrink-0 tabular-nums text-marron/60">
                {formatCents(slice.cents)} - {Math.round((slice.cents / total) * 100)}%
              </span>
            </li>
          )
        })}
      </ul>
    </>
  )
}
