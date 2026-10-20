import { BRAND } from "@/lib/colors"

// `mark` deja solo el simbolo, sin el nombre: es lo que cabe en un riel de 72px.
export function Logo({ className = "", mark = false }: { className?: string; mark?: boolean }) {
  return (
    <span className={`inline-flex items-center gap-2.5 ${className}`}>
      <svg viewBox="0 0 32 32" className="h-8 w-8 shrink-0" aria-hidden>
        <rect width="32" height="32" rx="9" fill={BRAND.rojo.DEFAULT} />
        <path d="M10 8H22V11.5H14V14.5H20.5V18H14V24H10Z" fill="#fff" />
        <circle cx="23.5" cy="21" r="2.75" fill={BRAND.amarillo.DEFAULT} />
      </svg>
      {!mark && (
        <span className="font-display text-xl font-bold tracking-tight text-marron">
          FIA<span className="text-amarillo">&apos;</span>O
        </span>
      )}
    </span>
  )
}
