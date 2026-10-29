"use client"

import dynamic from "next/dynamic"

import type { DayBar, Debtor } from "./charts"
import type { StatusSlice } from "./status"

// Recharts pesa ~160 kB y solo hace falta cuando hay una grafica que dibujar de verdad.
// Cargarla a demanda es lo que baja /me a la linea base y aligera el panel del dueno.
//
// Cada hueco reservado mide lo mismo que su grafica, asi que nada salta al llegar. Donde
// la altura depende de los datos se calcula igual que en el componente real.

const WeekColumns = dynamic(() => import("./charts").then((mod) => mod.WeekColumns), {
  ssr: false,
  loading: () => <div className="h-44" aria-hidden />,
})

const StatusDonutImpl = dynamic(() => import("./charts").then((mod) => mod.StatusDonut), {
  ssr: false,
  // h-52 de la dona, mt-5 de la leyenda, y cada fila de leyenda con su hueco.
  loading: () => <div style={{ height: 208 + 20 + 46 }} aria-hidden />,
})

const TopDebtorsImpl = dynamic(() => import("./charts").then((mod) => mod.TopDebtors), {
  ssr: false,
  loading: () => <div aria-hidden />,
})

export function WeekChart({ days }: { days: DayBar[] }) {
  return <WeekColumns days={days} />
}

export function StatusDonut({ slices }: { slices: StatusSlice[] }) {
  return <StatusDonutImpl slices={slices} />
}

export function TopDebtors({ debtors }: { debtors: Debtor[] }) {
  // Misma formula que el componente real, para que el hueco mida lo que va a ocupar.
  return (
    <div style={{ minHeight: debtors.length * 40 + 8 }}>
      <TopDebtorsImpl debtors={debtors} />
    </div>
  )
}
