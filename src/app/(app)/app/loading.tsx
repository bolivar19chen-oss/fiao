import { HeaderSkeleton, KpiRowSkeleton, LoadingFrame } from "@/components/app/skeletons"
import { Card, Skeleton } from "@/components/app/ui"

// Esqueleto del dashboard: las cuatro fichas, la grafica con la dona al lado y los mayores
// deudores. Cada pantalla de /app tiene el suyo en su carpeta; este es el de la raiz.
export default function Loading() {
  return (
    <LoadingFrame>
      <HeaderSkeleton buttons={2} />
      <KpiRowSkeleton />

      {/* Mismas dos columnas que el dashboard: grafica a dos tercios, dona al lado. */}
      <div className="mt-4 grid gap-4 lg:grid-cols-[1.9fr_1fr]">
        <Card>
          <Skeleton className="mb-6 h-7 w-32" />
          <Skeleton className="h-64 w-full" />
        </Card>
        <Card>
          <Skeleton className="mb-6 h-7 w-44" />
          <Skeleton className="mx-auto h-52 w-52 rounded-full" />
          <Skeleton className="mt-5 h-[46px] w-full" />
        </Card>
      </div>

      <Card className="mt-4">
        <Skeleton className="mb-6 h-7 w-32" />
        <div className="flex flex-col gap-3">
          {[0, 1, 2, 3, 4].map((row) => (
            <Skeleton key={row} className="h-7 w-full" />
          ))}
        </div>
      </Card>
    </LoadingFrame>
  )
}
