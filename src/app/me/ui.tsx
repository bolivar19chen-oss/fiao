// Piezas compartidas por las pantallas de /me. Mismas reglas que la guia de pantallas de
// aplicacion: superficie plana, separacion por tono y una linea de 1px, titulo pequeno.

export function Panel({
  title,
  className = "",
  children,
}: {
  title?: string
  className?: string
  children: React.ReactNode
}) {
  return (
    <section className={`rounded-[1.5rem] border border-marron/10 bg-fondo p-6 ${className}`}>
      {title && <h2 className="mb-5 text-[13px] font-semibold text-marron/60">{title}</h2>}
      {children}
    </section>
  )
}

/** Fila de titulo de una pantalla: el nombre, y debajo la frase que la resume. */
export function ScreenTitle({ title, children }: { title: string; children?: React.ReactNode }) {
  return (
    <header className="mb-8">
      <h1 className="text-[17px] font-semibold text-marron">{title}</h1>
      {children && <p className="mt-2 text-[15px] leading-[20px] text-marron/65">{children}</p>}
    </header>
  )
}

export function Empty({ children }: { children: React.ReactNode }) {
  return <p className="text-[15px] text-marron/60">{children}</p>
}

export function Rows({ children }: { children: React.ReactNode }) {
  return <ul className="divide-y divide-marron/[0.07]">{children}</ul>
}

export function Row({ children }: { children: React.ReactNode }) {
  return <li className="flex items-center gap-4 py-3.5 first:pt-0 last:pb-0">{children}</li>
}
