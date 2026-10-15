import type { LucideIcon } from "lucide-react"

export function IconTile({ icon: Icon }: { icon: LucideIcon }) {
  return (
    <span className="grid h-12 w-12 shrink-0 place-items-center rounded-2xl bg-gradient-to-br from-rojo/10 to-amarillo/20 text-rojo ring-1 ring-inset ring-rojo/10">
      <Icon className="h-5 w-5" strokeWidth={1.75} aria-hidden />
    </span>
  )
}
