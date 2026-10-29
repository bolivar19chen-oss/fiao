import { HeaderSkeleton, LoadingFrame, TableCardSkeleton } from "@/components/app/skeletons"

export default function Loading() {
  return (
    <LoadingFrame>
      <HeaderSkeleton buttons={1} />
      <TableCardSkeleton title={false} columns={3} rows={7} twoLine />
    </LoadingFrame>
  )
}
