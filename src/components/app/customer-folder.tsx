"use client"

import { useEffect, useId, useRef, useState } from "react"
import Link from "next/link"
import { AlertTriangle, Check, Eye } from "lucide-react"

import { formatCents } from "@/lib/format"

/**
 * Carpeta de cristal con los clientes de un grupo adentro.
 *
 * Tres capas, de atras hacia adelante: un panel de fondo con el color del grupo, las
 * fichas de los clientes, y un panel de cristal esmerilado que desenfoca lo que queda
 * detras. Las fichas son elementos reales entre paneles reales, asi que el cristal las
 * difumina de verdad cuando se mueven.
 *
 * - Reposo: cerrada y plana. De las fichas solo asoma el borde.
 * - Hover o foco: el panel se inclina sobre su bisagra inferior y las fichas suben.
 * - Abierta: el panel cae mas y las fichas salen en abanico, cada una un enlace.
 *
 * Adaptada de un componente que generaba su fondo con ruido en canvas. Ese generador se
 * dejo afuera: eran unas 400 lineas de sombreado que no aportan nada a una app de
 * credito, y la marca ya tiene su propio fondo.
 */

const W = 340
const H = 272
const HEADROOM = 54
const FRONT_TOP = 74
const FRONT_H = H - FRONT_TOP
const MAX_VISIBLE = 4

const BACK_PATH =
  "M0 56A22 22 0 0 1 22 34L146 34C170 34 172 0 198 0L318 0A22 22 0 0 1 340 22L340 250A22 22 0 0 1 318 272L22 272A22 22 0 0 1 0 250Z"
const FRONT_PATH = `M0 22A22 22 0 0 1 22 0L118 0C144 0 146 32 172 32L318 32A22 22 0 0 1 340 54L340 ${FRONT_H - 22}A22 22 0 0 1 318 ${FRONT_H}L22 ${FRONT_H}A22 22 0 0 1 0 ${FRONT_H - 22}Z`

export type FolderCustomer = { id: string; name: string; balanceCents: number }

export function CustomerFolder({
  label,
  tone,
  customers,
  width = 340,
}: {
  label: string
  /** `alert` mora, `warn` a vigilar, `calm` al dia. */
  tone: "alert" | "warn" | "calm"
  customers: FolderCustomer[]
  width?: number
}) {
  const uid = useId().replace(/:/g, "")
  const rootRef = useRef<HTMLDivElement>(null)
  const filesRef = useRef<HTMLDivElement>(null)
  const [open, setOpen] = useState(false)

  // Con la carpeta cerrada las fichas salen del orden de tabulacion: no se ven y no se
  // puede llegar a ellas.
  useEffect(() => {
    filesRef.current?.toggleAttribute("inert", !open)
  }, [open])

  useEffect(() => {
    if (!open) return
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false)
    const onDown = (e: PointerEvent) => {
      if (!rootRef.current?.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener("keydown", onKey)
    document.addEventListener("pointerdown", onDown)
    return () => {
      document.removeEventListener("keydown", onKey)
      document.removeEventListener("pointerdown", onDown)
    }
  }, [open])

  // El bloque <style> es CSS plano y no puede leer clases de Tailwind, asi que los
  // colores entran como variables desde aca. Leen los tokens de TEMA (src/lib/colors.ts),
  // asi que siguen al modo oscuro: ningun valor se escribe a mano en el componente.
  const FILL = { alert: "--estado-mora", warn: "--estado-por-vencer", calm: "--estado-al-dia" } as const
  const vars = {
    "--cf-fill": `rgb(var(${FILL[tone]}))`,
    "--cf-ink": "rgb(var(--marron))",
    "--cf-focus": "rgb(var(--rojo))",
    "--cf-white": "rgb(var(--fondo))",
    "--cf-paper": "rgb(var(--papel))",
  } as React.CSSProperties

  const k = width / W
  const visible = customers.slice(0, MAX_VISIBLE)
  const total = customers.reduce((sum, customer) => sum + customer.balanceCents, 0)
  const Icon = tone === "alert" ? AlertTriangle : tone === "warn" ? Eye : Check

  return (
    <div
      ref={rootRef}
      className="cf-root relative inline-block align-top"
      data-tone={tone}
      data-open={open || undefined}
      style={{ width, height: (H + HEADROOM) * k, ...vars }}
    >
      <style>{CSS}</style>
      <div className="cf-stage" style={{ transform: `translateY(${HEADROOM * k}px) scale(${k})` }}>
        <div className="cf-shadow" aria-hidden />

        <div className="cf-back" style={{ clipPath: `path('${BACK_PATH}')` }} aria-hidden />

        {/* Las fichas: despues del cristal en el orden de tabulacion, debajo en pantalla. */}
        <div ref={filesRef} className="cf-files" role="list" aria-label={`${label} contents`}>
          {visible.map((customer, index) => (
            <div key={customer.id} role="listitem" className="contents">
              <Link
                href={`/app/customers/${customer.id}`}
                className="cf-sheet"
                style={
                  {
                    "--cf-slot": visible.length <= 1 ? 0 : (index / (visible.length - 1)) * 2 - 1,
                    "--cf-depth": visible.length - 1 - index,
                    zIndex: index + 1,
                  } as React.CSSProperties
                }
              >
                <span className="cf-sheet-name">{customer.name}</span>
                <span className="cf-sheet-amount">{formatCents(customer.balanceCents)}</span>
              </Link>
            </div>
          ))}
        </div>

        <div className="cf-front" style={{ clipPath: `path('${FRONT_PATH}')` }}>
          <div className="cf-tint" aria-hidden />
          <svg className="cf-rim" viewBox={`0 0 ${W} ${FRONT_H}`} aria-hidden>
            <defs>
              <linearGradient id={`cf-rim-${uid}`} x1="0" y1="0" x2="0" y2="1">
                <stop offset="0" style={{ stopColor: "rgb(var(--brillo))" }} stopOpacity="0.95" />
                <stop offset="1" style={{ stopColor: "rgb(var(--brillo))" }} stopOpacity="0.15" />
              </linearGradient>
            </defs>
            <path d={FRONT_PATH} stroke={`url(#cf-rim-${uid})`} />
          </svg>

          <button
            type="button"
            className="cf-hit"
            aria-expanded={open}
            aria-label={`${open ? "Close" : "Open"} ${label}, ${customers.length} ${customers.length === 1 ? "customer" : "customers"}`}
            onClick={() => setOpen((o) => !o)}
          />

          <div className="cf-label">
            <span className="cf-icon">
              <Icon className="h-4 w-4" aria-hidden />
            </span>
            <span className="cf-title">{label}</span>
            <span className="cf-meta">
              {customers.length} {customers.length === 1 ? "customer" : "customers"} - {formatCents(total)}
            </span>
          </div>
        </div>
      </div>
    </div>
  )
}

const CSS = `
.cf-root {
  --cf-hinge: 0deg;
  --cf-lift: 44px;
  --cf-spread: 0px;
  --cf-fan: 0deg;
  --cf-stack: 14px;
  --cf-ease: cubic-bezier(.2, .8, .2, 1);
  --cf-spring: cubic-bezier(.34, 1.36, .5, 1);
  isolation: isolate;
}
.cf-root:hover, .cf-root:focus-within { --cf-hinge: -11deg; --cf-lift: -32px; --cf-spread: 8px; --cf-fan: 1.4deg; --cf-stack: 10px; }
.cf-root[data-open] { --cf-hinge: -24deg; --cf-lift: -94px; --cf-spread: 38px; --cf-fan: 5deg; --cf-stack: 28px; }

.cf-stage { position: absolute; left: 0; top: 0; width: 340px; height: 272px; transform-origin: 0 0; }
.cf-shadow {
  position: absolute; left: 18px; right: 18px; bottom: -6px; height: 56px;
  border-radius: 40px; background: rgb(72 45 31 / .22); filter: blur(20px);
}
.cf-back {
  position: absolute; inset: 0; overflow: hidden;
  background: radial-gradient(120% 140% at 18% 0%, color-mix(in srgb, var(--cf-fill) 70%, white) 0%, var(--cf-fill) 55%, color-mix(in srgb, var(--cf-fill) 70%, black) 100%);
}

.cf-files {
  position: absolute; inset: 0; z-index: 5; pointer-events: none;
  /* nada asoma por debajo del bolsillo, por alta que quede la pila */
  clip-path: inset(-400px -400px 10px -400px);
}
.cf-sheet {
  position: absolute; left: 34px; top: 104px; width: 272px; height: 64px;
  display: flex; align-items: center; justify-content: space-between; gap: 12px;
  padding: 0 16px; border-radius: 14px; pointer-events: auto; text-decoration: none;
  background: linear-gradient(180deg, var(--cf-white) 0%, var(--cf-paper) 100%);
  box-shadow: inset 0 1px 0 rgb(var(--brillo) / .9), 0 0 0 .5px rgb(var(--marron) / .1), 0 10px 24px -8px rgb(72 45 31 / .28);
  transform-origin: 50% 100%;
  transform:
    translate(calc(var(--cf-slot) * var(--cf-spread)), calc(var(--cf-lift) + var(--cf-depth) * var(--cf-stack) * -1))
    rotate(calc(var(--cf-slot) * var(--cf-fan)));
  transition: transform .75s var(--cf-spring) calc(var(--cf-depth) * 40ms), box-shadow .4s var(--cf-ease);
}
.cf-root[data-open] .cf-sheet:hover, .cf-root[data-open] .cf-sheet:focus-visible {
  box-shadow: inset 0 1px 0 rgb(var(--brillo) / .9), 0 0 0 .5px rgb(var(--marron) / .1), 0 22px 40px -12px rgb(72 45 31 / .42);
}
.cf-sheet:focus-visible { outline: 2px solid var(--cf-focus); outline-offset: 2px; }
.cf-sheet-name { font-size: 15px; font-weight: 500; color: var(--cf-ink); overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.cf-sheet-amount { flex: none; font-size: 15px; font-weight: 600; font-variant-numeric: tabular-nums; color: var(--cf-ink); }

.cf-front {
  position: absolute; left: 0; top: 74px; width: 340px; height: 198px; z-index: 10;
  -webkit-backdrop-filter: blur(22px) saturate(1.5); backdrop-filter: blur(22px) saturate(1.5);
  transform-origin: 50% 100%; transform: perspective(760px) rotateX(var(--cf-hinge));
  transition: transform .8s var(--cf-spring);
}
.cf-tint {
  position: absolute; inset: 0;
  background: linear-gradient(180deg, rgb(var(--fondo) / .16) 0%, rgb(var(--fondo) / .5) 42%, rgb(var(--fondo) / .93) 100%);
}
.cf-rim { position: absolute; left: 0; top: 0; width: 340px; height: 198px; fill: none; pointer-events: none; overflow: visible; }
.cf-rim path { stroke-width: 2.4; }

.cf-hit { position: absolute; inset: 0; z-index: 1; cursor: pointer; background: none; border: 0; padding: 0; }
.cf-label { position: absolute; left: 28px; bottom: 30px; z-index: 2; display: flex; flex-direction: column; gap: 5px; max-width: 240px; pointer-events: none; }
.cf-icon { display: grid; place-items: center; width: 28px; height: 28px; border-radius: 9px; background: color-mix(in srgb, var(--cf-fill) 14%, transparent); color: var(--cf-fill); }
.cf-title { font-family: var(--font-poppins), sans-serif; font-size: 19px; font-weight: 600; letter-spacing: -.012em; color: var(--cf-ink); }
.cf-meta { font-size: 13px; color: rgb(var(--marron) / .6); white-space: nowrap; }

@media (prefers-reduced-motion: reduce) {
  .cf-root *, .cf-root *::before, .cf-root *::after { transition-duration: 0s !important; animation: none !important; }
}
`
