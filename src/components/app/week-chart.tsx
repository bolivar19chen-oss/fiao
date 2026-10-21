"use client"

import dynamic from "next/dynamic"

import type { DayBar } from "./charts"

// Recharts pesa ~160 kB y solo hace falta cuando de verdad hay una grafica que dibujar.
// Cargarla a demanda es lo que baja /me de 265 kB a la linea base: el cliente que no ha
// pagado nada esta semana no descarga una libreria de graficas para leer una frase.
//
// El hueco reservado tiene el alto final del grafico, asi que nada salta al llegar.
const WeekColumns = dynamic(() => import("./charts").then((mod) => mod.WeekColumns), {
  ssr: false,
  loading: () => <div className="h-44" aria-hidden />,
})

export function WeekChart({ days }: { days: DayBar[] }) {
  return <WeekColumns days={days} />
}
