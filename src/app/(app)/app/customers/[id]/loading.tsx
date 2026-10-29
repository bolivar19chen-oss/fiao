import {
  HeaderSkeleton,
  LoadingFrame,
  StatRowSkeleton,
  TableCardSkeleton,
  TextCardSkeleton,
} from "@/components/app/skeletons"

export default function Loading() {
  return (
    <LoadingFrame>
      <HeaderSkeleton back />
      <StatRowSkeleton />

      <div className="mt-4 grid gap-4 lg:grid-cols-2">
        <TextCardSkeleton lines={1} />
        <TextCardSkeleton lines={4} />
      </div>

      <TextCardSkeleton className="mt-4" lines={2} />

      <div className="mt-4 grid gap-4 lg:grid-cols-2">
        <TableCardSkeleton columns={3} rows={4} />
        <TableCardSkeleton columns={2} rows={4} />
      </div>
    </LoadingFrame>
  )
}
