import { Card, Skeleton } from "./ui"

// Esqueletos con la forma de cada pantalla de la aplicacion.
//
// Cada medida sale del componente real, no de la vista: encabezado de 41/46 px, tarjetas de
// 28/36 px de relleno, filas de tabla de 44 px (60 con la linea secundaria). Asi, cuando
// llegan los datos nada salta: el contenido ocupa el hueco que ya estaba reservado.
//
// Se parecen a la pantalla que viene a proposito. Un esqueleto generico para todas
// promete tres cifras donde luego hay una tabla, y eso se siente peor que esperar.

/** Envoltorio de todo esqueleto: lo anuncia como "cargando" a un lector de pantalla. */
export function LoadingFrame({ className = "", children }: { className?: string; children: React.ReactNode }) {
  return (
    <div role="status" aria-busy="true" className={className}>
      <span className="sr-only">Loading</span>
      {children}
    </div>
  )
}

/** Mismas medidas que PageHeader. `buttons` son los botones redondos de la derecha. */
export function HeaderSkeleton({
  back = false,
  description = true,
  buttons = 0,
}: {
  back?: boolean
  description?: boolean
  buttons?: number
}) {
  return (
    <header className="mb-8 flex flex-wrap items-end justify-between gap-4 sm:mb-10">
      <div className="min-w-0">
        {/* El enlace de regreso es en linea: su caja mide la linea del padre (24 px), no sus 20. */}
        {back && <Skeleton className="h-6 w-24" />}
        <Skeleton className="mt-1 h-[41px] w-56 max-w-full sm:h-[46px]" />
        {description && <Skeleton className="mt-2 h-[22px] w-72 max-w-full" />}
      </div>
      {buttons > 0 && (
        <div className="flex gap-3">
          {Array.from({ length: buttons }, (_, i) => (
            <Skeleton key={i} className="h-12 w-36 rounded-full" />
          ))}
        </div>
      )}
    </header>
  )
}

/** Las cuatro fichas de indicadores del dashboard (KpiCard). */
export function KpiRowSkeleton() {
  return (
    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
      {[0, 1, 2, 3].map((i) => (
        <div key={i} className="rounded-xl border border-marron/10 bg-fondo p-5">
          <Skeleton className="h-11 w-11 rounded-full" />
          <Skeleton className="mt-4 h-[19px] w-28" />
          <Skeleton className="mt-1 h-8 w-36" />
          <Skeleton className="mt-1 h-4 w-32" />
        </div>
      ))}
    </div>
  )
}

/** Las dos fichas Stat (saldo, total) de las pantallas de detalle. */
export function StatRowSkeleton() {
  return (
    <div className="grid gap-4 sm:grid-cols-2">
      {[0, 1].map((i) => (
        <Card key={i}>
          <Skeleton className="h-[19px] w-16" />
          <Skeleton className="mt-3 h-[34px] w-40" />
        </Card>
      ))}
    </div>
  )
}

/** Cabecera y filas de la Table real. `twoLine` es la fila con dato secundario debajo. */
export function TableSkeleton({
  columns,
  rows = 5,
  twoLine = false,
}: {
  columns: number
  rows?: number
  twoLine?: boolean
}) {
  return (
    <div className="-mx-2">
      <div className="flex justify-between gap-4 px-2 pb-3">
        {Array.from({ length: columns }, (_, i) => (
          <Skeleton key={i} className="h-4 w-16" />
        ))}
      </div>
      <div className="divide-y divide-marron/[0.07]">
        {Array.from({ length: rows }, (_, row) => (
          <div key={row} className="flex items-center justify-between gap-4 px-2 py-3">
            <div className="min-w-0 flex-1">
              <Skeleton className="h-[18px] w-40 max-w-full" />
              {twoLine && <Skeleton className="mt-0.5 h-4 w-24" />}
            </div>
            {Array.from({ length: columns - 1 }, (_, i) => (
              <Skeleton key={i} className="h-5 w-16" />
            ))}
          </div>
        ))}
      </div>
    </div>
  )
}

/** Una tarjeta con su titulo y una tabla dentro. */
export function TableCardSkeleton({
  className = "",
  title = true,
  ...table
}: { className?: string; title?: boolean } & React.ComponentProps<typeof TableSkeleton>) {
  return (
    <Card className={className}>
      {title && <Skeleton className="mb-6 h-7 w-36" />}
      <TableSkeleton {...table} />
    </Card>
  )
}

/** Una tarjeta con titulo y unas lineas de texto: estado de cuenta, notas, ajustes. */
export function TextCardSkeleton({
  className = "",
  title = true,
  lines = 2,
}: {
  className?: string
  title?: boolean
  lines?: number
}) {
  return (
    <Card className={className}>
      {title && <Skeleton className="mb-6 h-7 w-36" />}
      {/* Cada linea ocupa lo que una de texto de 15 px (22,5 px) y lleva dentro la barra gris. */}
      {Array.from({ length: lines }, (_, i) => (
        <div key={i} className="flex h-[22.5px] items-center">
          <Skeleton className={`h-4 ${i === lines - 1 ? "w-2/3" : "w-full"}`} />
        </div>
      ))}
    </Card>
  )
}

/**
 * Pantalla de formulario completa: encabezado con regreso, campos y boton.
 * `fields` lleva un booleano por campo: true si el campo trae una pista debajo.
 */
export function FormPageSkeleton({ fields, className = "max-w-xl" }: { fields: boolean[]; className?: string }) {
  return (
    <LoadingFrame className={className}>
      <HeaderSkeleton back description={false} />
      <Card>
        <div className="flex flex-col gap-4">
          {fields.map((hinted, i) => (
            <div key={i}>
              <Skeleton className="h-5 w-24" />
              <Skeleton className="mt-1.5 h-12 w-full rounded-2xl" />
              {hinted && <Skeleton className="mt-1 h-4 w-40" />}
            </div>
          ))}
          <Skeleton className="h-12 w-40 rounded-full" />
        </div>
      </Card>
    </LoadingFrame>
  )
}
