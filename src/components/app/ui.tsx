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
    <header className="mb-6 flex flex-wrap items-end justify-between gap-4">
      <div className="min-w-0">
        {back && (
          <Link href={back.href} className="text-sm font-medium text-marron/60 hover:text-rojo">
            &larr; {back.label}
          </Link>
        )}
        <h1 className="section-title mt-1 truncate">{title}</h1>
        {description && <p className="mt-1 text-[15px] text-marron/65">{description}</p>}
      </div>
      {action}
    </header>
  )
}

export function Card({ className = "", children }: { className?: string; children: React.ReactNode }) {
  return <section className={`glass rounded-[1.75rem] p-5 sm:p-6 ${className}`}>{children}</section>
}

export function CardTitle({ children }: { children: React.ReactNode }) {
  return <h2 className="mb-4 font-display text-lg font-semibold text-marron">{children}</h2>
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
    <div className="flex flex-col items-center px-4 py-10 text-center">
      <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-rojo/10 text-rojo">
        <Icon className="h-6 w-6" strokeWidth={1.75} aria-hidden />
      </span>
      <p className="mt-4 font-display text-lg font-semibold text-marron">{title}</p>
      <p className="mt-1 max-w-sm text-sm text-marron/65">{body}</p>
      {action && (
        <Link href={action.href} className="btn btn-glass-red mt-5">
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

// En pantallas angostas la tabla se desplaza en horizontal dentro de su tarjeta.
export function Table({ head, children }: { head: string[]; children: React.ReactNode }) {
  return (
    <div className="-mx-2 overflow-x-auto">
      <table className="w-full min-w-[32rem] text-left text-sm">
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

export function Field({
  label,
  hint,
  ...input
}: { label: string; hint?: string } & React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <label className="block">
      <span className="text-sm font-medium text-marron">{label}</span>
      <input
        {...input}
        className="mt-1.5 h-12 w-full rounded-2xl border border-marron/10 bg-white/70 px-4 text-[15px] text-marron outline-none transition placeholder:text-marron/35 focus:border-rojo/40 focus:bg-white focus:ring-4 focus:ring-rojo/10"
      />
      {hint && <span className="mt-1 block text-xs text-marron/55">{hint}</span>}
    </label>
  )
}

export function Stat({ label, value, note }: { label: string; value: string; note?: string }) {
  return (
    <Card>
      <p className="text-xs font-semibold uppercase tracking-[0.12em] text-marron/55">{label}</p>
      <p className="mt-2 font-display text-3xl font-semibold tracking-tight text-marron">{value}</p>
      {note && <p className="mt-1 text-xs text-marron/55">{note}</p>}
    </Card>
  )
}
