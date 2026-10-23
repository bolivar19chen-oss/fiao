import { Card, Skeleton } from "@/components/app/ui"

// Esqueleto de /app y sus rutas hijas. Sin este archivo Next espera la consulta antes
// de pintar nada y el clic no devuelve nada durante el viaje al servidor.
//
// Forma neutra a proposito: un esqueleto que promete tres cifras donde luego hay una
// tabla miente, y eso se siente peor que esperar.
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
