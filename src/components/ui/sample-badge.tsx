import { SAMPLE_DATA } from "@/data/panama"

// Visible until the verified dataset replaces the placeholders in src/data/panama.ts.
export function SampleBadge() {
  if (!SAMPLE_DATA) return null
  return (
    <span className="inline-flex items-center rounded-full border border-amarillo/60 bg-amarillo/15 px-2.5 py-0.5 text-[11px] font-semibold uppercase tracking-wider text-marron/70">
      Sample data
    </span>
  )
}
