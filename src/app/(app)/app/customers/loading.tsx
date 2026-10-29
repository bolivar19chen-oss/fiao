import { HeaderSkeleton, LoadingFrame, TableCardSkeleton } from "@/components/app/skeletons"
import { Skeleton } from "@/components/app/ui"

export default function Loading() {
  return (
    <LoadingFrame>
      <HeaderSkeleton buttons={1} />

      {/* Las tres carpetas de arriba: 300 px de ancho y 288 de alto, como CustomerFolder. */}
      <div className="mb-6 flex flex-wrap justify-center gap-8 sm:justify-start">
        {[0, 1, 2].map((folder) => (
          <Skeleton key={folder} className="h-[288px] w-[300px] max-w-full rounded-[1.75rem]" />
        ))}
      </div>

      <TableCardSkeleton title={false} columns={3} rows={6} twoLine />
    </LoadingFrame>
  )
}
