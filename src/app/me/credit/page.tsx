import type { Metadata } from "next"

import { scoreBand, type ScoreBand } from "@/lib/credit"
import { t, type Key, type Lang } from "@/lib/i18n"
import { getLang } from "@/lib/lang"

import { getMeData } from "../data"
import { Empty, Panel, ScreenTitle } from "../ui"

export const metadata: Metadata = { title: "Credit - FIA'O" }

// Las bandas salen del motor (src/lib/credit/bands.ts): good desde 70, fair desde 40.
const BAND: Record<ScoreBand, { label: Key; next: Key | null; target: number }> = {
  new: { label: "bandNew", next: "nameFair", target: 40 },
  watch: { label: "bandWatch", next: "nameFair", target: 40 },
  fair: { label: "bandFair", next: "nameGood", target: 70 },
  good: { label: "bandGood", next: null, target: 100 },
}

// Los cuatro factores del motor, con su nombre en la interfaz y lo que mueve cada uno.
const FACTORS = [
  { key: "punctuality", label: "factorPunctuality", hint: "factorPunctualityHint" },
  { key: "debtRatio", label: "factorDebt", hint: "factorDebtHint" },
  { key: "tenure", label: "factorTenure", hint: "factorTenureHint" },
  { key: "frequency", label: "factorFrequency", hint: "factorFrequencyHint" },
] as const satisfies readonly { key: string; label: Key; hint: Key }[]

export default async function CreditPage() {
  const { creditors } = await getMeData()
  const lang: Lang = await getLang()

  return (
    <>
      <ScreenTitle title={t(lang, "credit")}>{t(lang, "creditIntro")}</ScreenTitle>

      {creditors.length === 0 ? (
        <Panel>
          <Empty>{t(lang, "standingStarts")}</Empty>
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
                  <p className="text-[15px] text-marron/70">{t(lang, band.label)}</p>
                </div>

                {shop.score !== null && (
                  <>
                    <div className="mt-5 h-1.5 overflow-hidden rounded-full bg-marron/[0.08]">
                      <div className="h-full rounded-full bg-rojo" style={{ width: `${percent}%` }} />
                    </div>
                    <p className="mt-2 text-[13px] text-marron/70">
                      {band.next
                        ? t(lang, "pointsToNext", { n: band.target - score, band: t(lang, band.next) })
                        : t(lang, "topStanding")}
                    </p>

                    <ul className="mt-6 flex flex-col gap-4">
                      {FACTORS.map(({ key, label, hint }) => {
                        const points = shop.breakdown[key]
                        const max = shop.weights[key]
                        return (
                          <li key={key}>
                            <div className="flex items-baseline justify-between gap-3">
                              <span className="text-[15px] text-marron">{t(lang, label)}</span>
                              <span className="shrink-0 text-[15px] tabular-nums text-marron">
                                {/* Peso cero es "no se pudo medir", no "saco cero". */}
                                {max === 0 ? t(lang, "notSet") : t(lang, "outOf", { points, max })}
                              </span>
                            </div>
                            <p className="mt-0.5 text-[13px] text-marron/70">{t(lang, hint)}</p>
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
