interface SectionHeadingProps {
  index: string
  label: string
  title: React.ReactNode
  children?: React.ReactNode
}

// Encabezado editorial: indice + etiqueta a la izquierda, titulo a la derecha, sobre una linea fina.
export function SectionHeading({ index, label, title, children }: SectionHeadingProps) {
  return (
    <div className="grid gap-5 border-t border-marron/15 pt-6 lg:grid-cols-[240px_1fr]">
      <p className="flex items-baseline gap-3 text-xs font-semibold uppercase tracking-[0.18em] text-marron/70">
        <span className="font-display tabular-nums text-rojo">{index}</span>
        {label}
      </p>
      <div>
        <h2 className="max-w-3xl font-display text-4xl font-light leading-[1.08] tracking-[-0.03em] text-marron sm:text-5xl">
          {title}
        </h2>
        {children && <div className="mt-5 max-w-2xl font-sub text-lg leading-relaxed text-marron/70">{children}</div>}
      </div>
    </div>
  )
}
