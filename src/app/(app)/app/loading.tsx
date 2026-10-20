import { Card, Skeleton } from "@/components/app/ui"

// Esqueleto compartido por /app y sus rutas hijas.
//
// Es lo que arregla el "boton lento": sin este archivo Next espera la consulta antes de
// pintar nada, asi que el clic en la navegacion no devuelve nada durante el viaje al
// servidor. Con el, la ruta cambia al instante, el item activo se marca solo y esto
// ocupa el sitio hasta que llegan los datos.
//
// Forma neutra a proposito: cabecera, una ficha alta y dos mas. Es lo que tienen todas
// las pantallas. Un esqueleto que promete tres cifras donde luego hay una tabla miente,
// y eso se siente peor que esperar.
export default function Loading() {
  return (
    <div role="status" aria-busy="true">
      <span className="sr-only">Loading</span>

      {/* Mismo alto que PageHeader: al llegar los datos nada salta. */}
      <header className="mb-6">
        <Skeleton className="h-9 w-48" />
        <Skeleton className="mt-2 h-5 w-72 max-w-full" />
      </header>

      <Card>
        <Skeleton className="h-4 w-40" />
        <Skeleton className="mt-3 h-12 w-64 max-w-full sm:h-14" />
        <Skeleton className="mt-3 h-4 w-56 max-w-full" />
      </Card>

      <div className="mt-4 grid gap-4 lg:grid-cols-2">
        {[0, 1].map((card) => (
          <Card key={card}>
            <Skeleton className="h-5 w-36" />
            <div className="mt-5 flex flex-col gap-3">
              {[0, 1, 2, 3].map((row) => (
                <Skeleton key={row} className="h-4" />
              ))}
            </div>
          </Card>
        ))}
      </div>
    </div>
  )
}
