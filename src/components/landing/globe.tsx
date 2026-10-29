"use client"

import dynamic from "next/dynamic"

import type { GlobeArc, GlobeMarker } from "./globe-canvas"

export type { GlobeArc, GlobeMarker }

// cobe trae WebGL y arranca un bucle de animacion. Va en la cuarta seccion de la landing,
// bajo el pliegue: cargarlo de entrada retrasaba la primera pintura por un canvas que
// nadie esta mirando todavia. A demanda entra despues de la hidratacion.
//
// El hueco es cuadrado igual que el globo, asi que la pagina no salta cuando llega.
const Canvas = dynamic(() => import("./globe-canvas").then((mod) => mod.GlobeCanvas), {
  ssr: false,
  loading: () => <div className="aspect-square w-full max-w-[560px]" aria-hidden />,
})

export function Globe(props: React.ComponentProps<typeof Canvas>) {
  return <Canvas {...props} />
}
