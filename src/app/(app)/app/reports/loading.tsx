import { HeaderSkeleton, LoadingFrame } from "@/components/app/skeletons"
import { Card, Skeleton } from "@/components/app/ui"

export default function Loading() {
  return (
    <LoadingFrame>
      <HeaderSkeleton />
      <Card>
        <Skeleton className="h-64 w-full" />
      </Card>
    </LoadingFrame>
  )
}
