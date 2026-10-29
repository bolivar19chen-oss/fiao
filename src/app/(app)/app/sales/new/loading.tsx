import { HeaderSkeleton, LoadingFrame } from "@/components/app/skeletons"
import { Card, Skeleton } from "@/components/app/ui"

// Los tres pasos de la venta, uno bajo otro: quien compra, que se lleva y como paga.
export default function Loading() {
  return (
    <LoadingFrame className="max-w-2xl">
      <HeaderSkeleton back description={false} />

      <div className="flex flex-col gap-4">
        <Card>
          <Skeleton className="mb-6 h-7 w-40" />
          <Skeleton className="h-12 w-full rounded-2xl" />
        </Card>

        <Card>
          <Skeleton className="mb-6 h-7 w-52" />
          <div className="flex flex-col gap-3">
            {[0, 1, 2, 3].map((row) => (
              <div key={row} className="flex items-center gap-4">
                <Skeleton className="h-5 flex-1" />
                <Skeleton className="h-9 w-24 rounded-full" />
              </div>
            ))}
          </div>
        </Card>

        <Card>
          <Skeleton className="mb-6 h-7 w-44" />
          <div className="grid gap-4 sm:grid-cols-2">
            <Skeleton className="h-[74px] w-full rounded-2xl" />
            <Skeleton className="h-[74px] w-full rounded-2xl" />
          </div>
          <Skeleton className="mt-6 h-28 w-full rounded-2xl" />
        </Card>
      </div>
    </LoadingFrame>
  )
}
