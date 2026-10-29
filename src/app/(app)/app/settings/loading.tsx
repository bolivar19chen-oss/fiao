import { HeaderSkeleton, LoadingFrame, TextCardSkeleton } from "@/components/app/skeletons"
import { Card, Skeleton } from "@/components/app/ui"

// Las seis tarjetas de ajustes, en el orden de la pantalla.
export default function Loading() {
  return (
    <LoadingFrame className="max-w-2xl">
      <HeaderSkeleton description={false} />

      <Card>
        <Skeleton className="mb-6 h-7 w-24" />
        <Skeleton className="h-5 w-28" />
        <Skeleton className="mt-1.5 h-12 w-full rounded-2xl" />
        <Skeleton className="mt-4 h-12 w-36 rounded-full" />
      </Card>

      <Card className="mt-4">
        <Skeleton className="mb-6 h-7 w-32" />
        <Skeleton className="h-20 w-20 rounded-full" />
      </Card>

      <TextCardSkeleton className="mt-4" lines={2} />
      <TextCardSkeleton className="mt-4" lines={1} />
      <TextCardSkeleton className="mt-4" lines={1} />

      <Card className="mt-4">
        <Skeleton className="mb-6 h-7 w-36" />
        <div className="mb-6 flex flex-col gap-2">
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-2/3" />
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          {[0, 1, 2, 3, 4].map((field) => (
            <div key={field}>
              <Skeleton className="h-5 w-28" />
              <Skeleton className="mt-1.5 h-12 w-full rounded-2xl" />
            </div>
          ))}
        </div>
        <Skeleton className="mt-4 h-12 w-36 rounded-full" />
      </Card>
    </LoadingFrame>
  )
}
