"use client"

import { useState } from "react"

import { formatCents } from "@/lib/format"
import { WeekColumns, type DayBar } from "@/components/app/charts"

// Las pestanas de periodo de DashSpace (alli 12 months / 30 days / 7 days / 24 hours).
// Aca solo 30 y 7 dias: son los unicos periodos de los que la consulta trae datos, y una
// pestana que no puede responder es peor que no estar.
const RANGOS = [
  { label: "30 days", days: 30 },
  { label: "7 days", days: 7 },
] as const

export function CollectedChart({ days }: { days: DayBar[] }) {
  const [rango, setRango] = useState<(typeof RANGOS)[number]>(RANGOS[1])
  const visible = days.slice(-rango.days)
  const total = visible.reduce((sum, day) => sum + day.cents, 0)

  return (
    <>
      <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="font-display text-[22px] font-semibold tabular-nums tracking-[-0.01em] text-marron">
            {formatCents(total)}
          </p>
          <p className="mt-0.5 text-[13px] text-marron/55">Payments in the last {rango.label}</p>
        </div>
        <div role="tablist" aria-label="Period" className="flex gap-1 rounded-lg bg-papel p-1">
          {RANGOS.map((option) => (
            <button
              key={option.label}
              role="tab"
              type="button"
              aria-selected={rango.days === option.days}
              onClick={() => setRango(option)}
              className={`h-8 rounded-md px-3 text-[13px] font-medium transition duration-200 ease-apple ${
                rango.days === option.days ? "bg-fondo text-marron shadow-sm" : "text-marron/55 hover:text-marron"
              }`}
            >
              {option.label}
            </button>
          ))}
        </div>
      </div>
      {/* Treinta barras en cero no informan de nada. Mismo criterio que en /me. */}
      {total === 0 ? (
        <p className="text-[15px] text-marron/60">No payments in the last {rango.label}.</p>
      ) : (
        <WeekColumns days={visible} />
      )}
    </>
  )
}
