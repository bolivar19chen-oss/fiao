import { Skeleton } from "@/components/app/ui"

import { Panel } from "./ui"

// Lo mismo que (app)/app/loading.tsx, con la forma de las seis pantallas de /me.
export default function Loading() {
  return (
    <div role="status" aria-busy="true">
      <span className="sr-only">Loading</span>

      <header className="mb-8">
        <Skeleton className="h-5 w-40" />
        <Skeleton className="mt-6 h-4 w-52" />
        <Skeleton className="mt-2 h-9 w-44" />
      </header>

      <div className="flex flex-col gap-4">
        {[0, 1].map((panel) => (
          <Panel key={panel}>
            <Skeleton className="h-4 w-36" />
            <div className="mt-6 flex flex-col gap-3">
              {[0, 1, 2].map((row) => (
                <Skeleton key={row} className="h-4" />
              ))}
            </div>
          </Panel>
        ))}
      </div>
    </div>
  )
}
