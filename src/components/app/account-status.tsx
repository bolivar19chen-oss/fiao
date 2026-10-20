import { AlertTriangle, Check, Clock } from "lucide-react"

import type { AccountStatus, ScoreBreakdown } from "@/lib/credit"

// Los colores de estado de docs/DISENO.md. Salieron de validar la paleta con el script
// de la guia de visualizacion, no de elegirlos a ojo.
//
// Siempre con icono y etiqueta, nunca color solo: en modo oscuro el ambar y el rojo no
// llegan a separarse lo suficiente para daltonismo dentro de la banda de luminosidad que
// exige el fondo, asi que la identidad no puede descansar en el color.
const STATUS = {
  NO_DEBT: { label: "No debt", icon: Check, className: "bg-estado-al-dia/12 text-estado-al-dia" },
  CURRENT: { label: "On time", icon: Check, className: "bg-estado-al-dia/12 text-estado-al-dia" },
  OVERDUE: { label: "Overdue", icon: AlertTriangle, className: "bg-rojo/12 text-rojo" },
} as const

export function StatusBadge({ status }: { status: AccountStatus }) {
  const { label, icon: Icon, className } = STATUS[status]
  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold ${className}`}>
      <Icon className="h-3.5 w-3.5" aria-hidden />
      {label}
    </span>
  )
}

export function DueSoonBadge({ label }: { label: string }) {
  return (
    <span className="bg-estado-por-vencer/12 inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold text-estado-por-vencer">
      <Clock className="h-3.5 w-3.5" aria-hidden />
      {label}
    </span>
  )
}

const FACTORS: { key: keyof ScoreBreakdown; label: string; max: number }[] = [
  { key: "punctuality", label: "Punctuality", max: 40 },
  { key: "debtRatio", label: "Debt ratio", max: 30 },
  { key: "tenure", label: "Tenure", max: 20 },
  { key: "frequency", label: "Frequency", max: 10 },
]

/**
 * El puntaje con su desglose.
 *
 * `score` nulo no es un mal puntaje: es que no hay nada que medir todavia. Mostrar 0 ahi
 * seria mentir, porque 0 se lee como "paga pesimo".
 */
export function CreditScore({ score, breakdown }: { score: number | null; breakdown: ScoreBreakdown }) {
  if (score === null) {
    return (
      <div className="rounded-2xl border border-marron/10 bg-papel p-4">
        <p className="text-sm font-medium text-marron">Not enough history yet</p>
        <p className="mt-1 text-xs leading-relaxed text-marron/60">
          A score appears once this customer has credit sales with a payment schedule.
        </p>
      </div>
    )
  }

  const circumference = 2 * Math.PI * 38

  return (
    <div>
      <div className="flex items-center gap-5">
        <svg
          width="92"
          height="92"
          viewBox="0 0 92 92"
          role="img"
          aria-label={`Store credit score ${score} out of 100`}
        >
          <circle cx="46" cy="46" r="38" fill="none" className="stroke-marron/10" strokeWidth="9" />
          <circle
            cx="46"
            cy="46"
            r="38"
            fill="none"
            className="stroke-rojo"
            strokeWidth="9"
            strokeLinecap="round"
            strokeDasharray={`${(circumference * score) / 100} ${circumference}`}
            transform="rotate(-90 46 46)"
          />
          <text x="46" y="52" textAnchor="middle" className="fill-marron font-display" fontSize="26" fontWeight="700">
            {score}
          </text>
        </svg>
        <div>
          <p className="text-sm font-semibold text-marron">Store credit score</p>
          <p className="mt-1 text-xs leading-relaxed text-marron/60">
            At this shop only. Weights are fixed and the breakdown always adds up.
          </p>
        </div>
      </div>

      <dl className="mt-4 space-y-2.5">
        {FACTORS.map(({ key, label, max }) => (
          <div key={key} className="flex items-center gap-3">
            <dt className="w-24 shrink-0 text-xs text-marron/70">{label}</dt>
            <dd className="flex flex-1 items-center gap-3">
              <span className="bg-marron/8 h-2 flex-1 overflow-hidden rounded-full">
                <span
                  className="block h-full rounded-full bg-rojo/70"
                  style={{ width: `${(breakdown[key] / max) * 100}%` }}
                />
              </span>
              <span className="w-12 shrink-0 text-right text-xs font-semibold tabular-nums text-marron">
                {breakdown[key]}/{max}
              </span>
            </dd>
          </div>
        ))}
      </dl>
    </div>
  )
}
