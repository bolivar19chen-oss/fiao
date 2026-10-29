import { HeaderSkeleton, LoadingFrame, StatRowSkeleton, TableCardSkeleton } from "@/components/app/skeletons"
import { Card, Skeleton } from "@/components/app/ui"

export default function Loading() {
  return (
    <LoadingFrame>
      <HeaderSkeleton back />
      <StatRowSkeleton />

      <TableCardSkeleton className="mt-4" columns={4} rows={3} />

      {/* Registrar un pago: el control de metodo (cuatro pastillas) y el monto. */}
      <Card className="mt-4">
        <Skeleton className="mb-6 h-7 w-44" />
        <Skeleton className="h-11 w-full rounded-full" />
        <Skeleton className="mt-4 h-5 w-24" />
        <Skeleton className="mt-1.5 h-12 w-full rounded-2xl" />
        <Skeleton className="mt-4 h-12 w-40 rounded-full" />
      </Card>

      <div className="mt-4 grid gap-4 lg:grid-cols-2">
        <TableCardSkeleton columns={3} rows={3} />
        <TableCardSkeleton columns={3} rows={3} />
      </div>
    </LoadingFrame>
  )
}
