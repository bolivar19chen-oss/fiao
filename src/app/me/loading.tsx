import { Skeleton } from "@/components/app/ui"

import { Panel } from "./ui"

// Esqueleto de las seis pantallas de /me.
//
// Es lo que arregla el "boton lento" de este lado. Sin este archivo Next espera la
// consulta antes de pintar nada, asi que tocar un icono del riel no devuelve nada
// durante el viaje al servidor. Con el, la ruta cambia al instante, el item activo se
// marca solo y esto ocupa el sitio hasta que llegan los datos.
//
// Forma neutra a proposito: una cabecera y dos fichas, que es lo que tienen las seis.
// Un esqueleto que promete una cifra enorme donde luego hay una lista miente, y eso se
// siente peor que esperar.
export default function Loading() {
  return (
    <div role="status" aria-busy="true">
      <span className="sr-only">Loading</span>

      <header className="mb-8">
        <Skeleton className="h-5 w-40" />
        <Skeleton className="mt-6 h-4 w-52" />
        <Skeleton className="mt-2 h-9 w-44" />
      </header>

      <div className="flex flex-col gap-4">
        {[0, 1].map((panel) => (
          <Panel key={panel}>
            <Skeleton className="h-4 w-36" />
            <div className="mt-6 flex flex-col gap-3">
              {[0, 1, 2].map((row) => (
                <Skeleton key={row} className="h-4" />
              ))}
            </div>
          </Panel>
        ))}
      </div>
    </div>
  )
}
