import type { Metadata } from "next"

import { scoreBand, type ScoreBand } from "@/lib/credit"

import { getMeData } from "../data"
import { Empty, Panel, ScreenTitle } from "../ui"

export const metadata: Metadata = { title: "Credit - FIA'O" }

// Las bandas salen del motor (src/lib/credit/bands.ts): good desde 70, fair desde 40.
const BAND: Record<ScoreBand, { label: string; next: string | null; target: number }> = {
  new: { label: "New customer", next: "Fair", target: 40 },
  watch: { label: "Needs attention", next: "Fair", target: 40 },
  fair: { label: "Fair standing", next: "Good", target: 70 },
  good: { label: "Good standing", next: null, target: 100 },
}

// Los cuatro factores del motor, con su nombre en la interfaz y lo que mueve cada uno.
const FACTORS = [
  { key: "punctuality", label: "Paying on time", hint: "Weighs most. Every installment paid by its due date." },
  { key: "debtRatio", label: "How much you owe", hint: "Your balance against the limit the shop gives you." },
  { key: "tenure", label: "How long you have bought", hint: "Months since your first credit sale there." },
  { key: "frequency", label: "How often you buy", hint: "Credit sales in the last twelve months." },
] as const

export default async function CreditPage() {
  const { creditors } = await getMeData()

  return (
    <>
      <ScreenTitle title="Credit">
        Each shop keeps its own standing for you. Paying an installment on time raises it; a late one lowers it.
      </ScreenTitle>

      {creditors.length === 0 ? (
        <Panel>
          <Empty>Your standing starts the first time a shop sells to you on credit.</Empty>
        </Panel>
      ) : (
        <div className="flex flex-col gap-4">
          {creditors.map((shop) => {
            const band = BAND[scoreBand(shop.score)]
            const score = shop.score ?? 0
            const percent = Math.min(100, Math.round((score / band.target) * 100))
            return (
              <Panel key={shop.id} title={shop.name}>
                <div className="flex items-baseline gap-3">
                  <p className="font-display text-[36px] font-semibold tabular-nums leading-none tracking-[-0.02em] text-marron">
                    {/* Sin historial no hay puntaje: raya, no cero. */}
                    {shop.score ?? "—"}
                  </p>
                  <p className="text-[15px] text-marron/70">{band.label}</p>
                </div>

                {shop.score !== null && (
                  <>
                    <div className="mt-5 h-1.5 overflow-hidden rounded-full bg-marron/[0.08]">
                      <div className="h-full rounded-full bg-rojo" style={{ width: `${percent}%` }} />
                    </div>
                    <p className="mt-2 text-[13px] text-marron/55">
                      {band.next ? `${band.target - score} points to ${band.next}` : "Top standing. Keep it."}
                    </p>

                    <ul className="mt-6 flex flex-col gap-4">
                      {FACTORS.map(({ key, label, hint }) => {
                        const points = shop.breakdown[key]
                        const max = shop.weights[key]
                        return (
                          <li key={key}>
                            <div className="flex items-baseline justify-between gap-3">
                              <span className="text-[15px] text-marron">{label}</span>
                              <span className="shrink-0 text-[15px] tabular-nums text-marron">
                                {/* Peso cero es "no se pudo medir", no "saco cero". */}
                                {max === 0 ? "Not set" : `${points} of ${max}`}
                              </span>
                            </div>
                            <p className="mt-0.5 text-[13px] text-marron/55">{hint}</p>
                          </li>
                        )
                      })}
                    </ul>
                  </>
                )}
              </Panel>
            )
          })}
        </div>
      )}
    </>
  )
}
