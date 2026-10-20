import Link from "next/link"
import type { LucideIcon } from "lucide-react"

// Piezas de interfaz comunes a las pantallas de la aplicacion. Mismo lenguaje que la
// landing: cristal sobre la luz de marca, botones redondeados.

export function PageHeader({
  title,
  description,
  back,
  action,
}: {
  title: string
  description?: React.ReactNode
  back?: { href: string; label: string }
  action?: React.ReactNode
}) {
  return (
    <header className="mb-8 flex flex-wrap items-end justify-between gap-4 sm:mb-10">
      <div className="min-w-0">
        {back && (
          <Link href={back.href} className="text-sm font-medium text-marron/60 hover:text-rojo">
            &larr; {back.label}
          </Link>
        )}
        {/* title=: en la ficha de cliente este h1 es el nombre, y truncado no habia forma de leerlo entero. */}
        <h1
          title={title}
          className="mt-1 truncate font-display text-[34px] font-bold leading-[41px] tracking-[-0.015em] text-marron sm:text-[40px] sm:leading-[46px]"
        >
          {title}
        </h1>
        {description && <p className="mt-2 text-[17px] leading-[22px] text-marron/65">{description}</p>}
      </div>
      {action}
    </header>
  )
}

export function Card({ className = "", children }: { className?: string; children: React.ReactNode }) {
  // Superficie limpia: separan el tono y el aire, no una sombra. El cristal se queda en
  // el sitio publico, donde hay una aurora detras que lo justifica.
  return (
    <section className={`rounded-[1.75rem] border border-marron/10 bg-fondo p-7 sm:p-9 ${className}`}>
      {children}
    </section>
  )
}

export function CardTitle({ children }: { children: React.ReactNode }) {
  return (
    <h2 className="mb-6 font-display text-[22px] font-semibold leading-[28px] tracking-[-0.01em] text-marron">
      {children}
    </h2>
  )
}

export function EmptyState({
  icon: Icon,
  title,
  body,
  action,
}: {
  icon: LucideIcon
  title: string
  body: string
  action?: { href: string; label: string }
}) {
  return (
    <div className="flex flex-col items-center px-4 py-14 text-center">
      <span className="flex h-16 w-16 items-center justify-center rounded-[1.25rem] bg-rojo/10 text-rojo">
        <Icon className="h-7 w-7" strokeWidth={1.75} aria-hidden />
      </span>
      <p className="mt-6 font-display text-[22px] font-semibold leading-[28px] tracking-[-0.01em] text-marron">
        {title}
      </p>
      <p className="mt-2 max-w-sm text-[17px] leading-[22px] text-marron/65">{body}</p>
      {action && (
        <Link href={action.href} className="btn btn-glass-red mt-7">
          {action.label}
        </Link>
      )}
    </div>
  )
}

export function ButtonLink({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <Link href={href} className="btn btn-glass-red">
      {children}
    </Link>
  )
}

// Primera columna de texto, el resto numericas y alineadas a la derecha. Sin ancho minimo:
// en un celular el saldo tiene que verse sin desplazar. Los datos secundarios (telefono,
// fecha) van debajo del nombre, no en columnas propias.
export function Table({ head, children }: { head: string[]; children: React.ReactNode }) {
  return (
    <div className="-mx-2 overflow-x-auto">
      <table className="w-full text-left text-sm">
        <thead>
          <tr className="text-xs font-semibold uppercase tracking-[0.12em] text-marron/50">
            {head.map((h, i) => (
              <th key={h} className={`px-2 pb-3 font-semibold ${i > 0 ? "text-right" : ""}`}>
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-marron/[0.07]">{children}</tbody>
      </table>
    </div>
  )
}

export function Badge({ tone, children }: { tone: "red" | "yellow" | "neutral"; children: React.ReactNode }) {
  const tones = {
    red: "bg-rojo/10 text-rojo",
    yellow: "bg-amarillo/25 text-marron",
    neutral: "bg-marron/[0.06] text-marron/70",
  }
  return (
    <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ${tones[tone]}`}>
      {children}
    </span>
  )
}

// El unico lugar donde vive el aspecto de un campo. Si hace falta una variante, se
// agrega aca: escribir las clases otra vez en una pantalla obliga a acordarse de varios
// archivos el dia que cambie el foco o el radio.
const FIELD_BASE =
  "mt-1.5 w-full rounded-2xl border border-marron/10 bg-papel text-marron outline-none transition placeholder:text-marron/35 focus:border-rojo/40 focus:bg-fondo focus:ring-4 focus:ring-rojo/10"

const FIELD_LOOK = {
  default: "h-12 px-4 text-[15px]",
  // Los digitos de un monto se alinean en columna: asi se compara de un vistazo.
  amount: "h-12 px-4 text-[15px] tabular-nums",
  // Un codigo se lee en voz alta, caracter por caracter: mas alto, centrado y espaciado.
  code: "h-14 px-4 text-center font-display text-xl font-semibold uppercase tracking-[0.18em] placeholder:font-sans placeholder:text-base placeholder:font-normal placeholder:normal-case placeholder:tracking-normal",
} as const

const slug = (text: string) =>
  text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")

/**
 * El campo con etiqueta y pista.
 *
 * La etiqueta se ata con `htmlFor` y no envolviendo al input: envuelto, el nombre
 * accesible se come tambien la pista, y un lector de pantalla lee "Reference Reference
 * from your Yappy app.". La pista va aparte, con `aria-describedby`, que es lo que
 * corresponde: describe, no nombra.
 *
 * El id sale del `name` porque dentro de un formulario es unico, y asi el componente
 * sirve igual en una pagina de servidor, donde no se pueden usar hooks.
 */
export function Field({
  label,
  hint,
  look = "default",
  id,
  ...input
}: { label: string; hint?: string; look?: keyof typeof FIELD_LOOK } & React.InputHTMLAttributes<HTMLInputElement>) {
  const fieldId = id ?? input.name ?? slug(label)
  const hintId = `${fieldId}-hint`

  return (
    <div>
      <label htmlFor={fieldId} className="block text-sm font-medium text-marron">
        {label}
      </label>
      <input
        {...input}
        id={fieldId}
        aria-describedby={hint ? hintId : undefined}
        className={`${FIELD_BASE} ${FIELD_LOOK[look]}`}
      />
      {hint && (
        <span id={hintId} className="mt-1 block text-xs text-marron/55">
          {hint}
        </span>
      )}
    </div>
  )
}

export function Stat({
  label,
  value,
  note,
  className = "",
}: {
  label: string
  value: string
  note?: string
  className?: string
}) {
  return (
    <Card className={className}>
      <p className="text-xs font-semibold uppercase tracking-[0.12em] text-marron/55">{label}</p>
      <p className="mt-3 font-display text-[28px] font-semibold tabular-nums leading-[34px] tracking-[-0.015em] text-marron">
        {value}
      </p>
      {note && <p className="mt-2 text-[13px] leading-[18px] text-marron/55">{note}</p>}
    </Card>
  )
}

// Celda principal de una fila: enlace al detalle y una linea secundaria debajo.
export function PrimaryCell({ href, title, sub }: { href: string; title: string; sub?: string }) {
  return (
    <td className="px-2 py-3">
      <Link href={href} className="font-medium text-marron hover:text-rojo">
        {title}
      </Link>
      {sub && <span className="block text-xs text-marron/55">{sub}</span>}
    </td>
  )
}

// Bloque en gris de los esqueletos de carga. El pulso se apaga si el sistema pide menos
// movimiento: un parpadeo constante marea y hay quien no lo tolera.
export function Skeleton({ className = "" }: { className?: string }) {
  return <div aria-hidden className={`animate-pulse rounded-xl bg-marron/10 motion-reduce:animate-none ${className}`} />
}

/**
 * Ficha de indicador al estilo DashSpace: icono en circulo tintado, etiqueta, cifra y
 * variacion. Copiada a peticion del usuario.
 *
 * `delta` es opcional y a proposito: una variacion que no se puede calcular se imprime
 * como raya, nunca como cero ni como un verde inventado. Hoy solo lo cobrado tiene
 * periodo anterior con el que compararse; la cartera y la mora no se guardan historicas.
 *
 * `goodWhenUp` dice en que direccion es buena la noticia. La mora que sube es roja
 * aunque el numero crezca.
 */
export function KpiCard({
  icon: Icon,
  label,
  value,
  delta,
  since,
  goodWhenUp = true,
}: {
  icon: LucideIcon
  label: string
  value: string
  delta?: number | null
  since?: string
  goodWhenUp?: boolean
}) {
  const bueno = delta === undefined || delta === null || delta === 0 ? null : delta > 0 === goodWhenUp
  const tono = bueno === null ? "text-marron/45" : bueno ? "text-estado-al-dia" : "text-estado-mora"

  return (
    <div className="rounded-xl border border-marron/10 bg-fondo p-5">
      <span className="grid h-11 w-11 place-items-center rounded-full bg-rojo/[0.09] text-rojo">
        <Icon className="h-5 w-5" strokeWidth={1.75} aria-hidden />
      </span>
      <p className="mt-4 text-[13px] text-marron/55">{label}</p>
      <div className="mt-1 flex flex-wrap items-baseline gap-x-2 gap-y-1">
        <p className="font-display text-[26px] font-semibold tabular-nums leading-tight tracking-[-0.015em] text-marron">
          {value}
        </p>
        <span className={`text-[13px] font-semibold tabular-nums ${tono}`}>
          {delta === undefined || delta === null ? "—" : `${delta > 0 ? "+" : ""}${delta}%`}
        </span>
      </div>
      {since && <p className="mt-1 text-xs text-marron/50">{since}</p>}
    </div>
  )
}
