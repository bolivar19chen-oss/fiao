"use client"

import dynamic from "next/dynamic"

// Recharts son 109 kB comprimidos (372 kB sin comprimir) y esta grafica va en la tercera
// seccion de la landing, bajo el pliegue: cargarlos de entrada retrasaba la primera pintura
// por unas barras que nadie esta mirando todavia. A demanda entra despues de la hidratacion.
//
// No hace falta reservar alto aqui: el contenedor de market.tsx ya lleva min-h-[260px].
const Chart = dynamic(() => import("./category-chart").then((mod) => mod.CategoryChart), {
  ssr: false,
  loading: () => <div className="h-full" aria-hidden />,
})

export function LazyCategoryChart(props: React.ComponentProps<typeof Chart>) {
  return <Chart {...props} />
}
