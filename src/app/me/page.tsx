import type { Metadata } from "next"
import Link from "next/link"

import { formatCents } from "@/lib/format"
import { LOCALE, t, type Lang } from "@/lib/i18n"
import { getLang } from "@/lib/lang"
import { WeekChart } from "@/components/app/lazy-charts"
import { StatusBar, type StatusSlice } from "@/components/app/status"

import { getMeData } from "./data"
import { Panel, Row, Rows } from "./ui"

export const metadata: Metadata = { title: "Overview - FIA'O" }

// Mediodia UTC para que ningun huso corra la fecha un dia. El locale viene del idioma:
// "Nov 5" en ingles, "5 nov" en espanol, "11月5日" en chino.
const fecha = (iso: string, lang: Lang) =>
  new Date(`${iso}T12:00:00Z`).toLocaleDateString(LOCALE[lang], {
    month: "short",
    day: "numeric",
    timeZone: "UTC",
  })

// La pregunta de esta pantalla: cuanto debo y que me toca pagar ahora. La cifra que la
// responde es la mas grande de la pantalla, y el hallazgo va justo debajo.
export default async function OverviewPage() {
  const { profile, creditors, totalCents, overdueCents, next, week } = await getMeData()
  const lang = await getLang()

  const slices: StatusSlice[] = [
    { key: "on-time", cents: totalCents - overdueCents },
    { key: "overdue", cents: overdueCents },
  ]
  const paidThisWeek = week.reduce((sum, day) => sum + day.cents, 0)
  const owing = creditors.filter((c) => c.balanceCents > 0)
  return (
    <>
      <header>
        <h1 className="text-[17px] font-semibold text-marron">
          {t(lang, "hello")}, {profile.fullName.split(" ")[0]}
        </h1>
        <p className="mt-6 text-[13px] text-marron/55">{t(lang, "youOweAcross")}</p>
        <p className="mt-1 font-display text-[36px] font-semibold tabular-nums leading-none tracking-[-0.02em] text-marron">
          {formatCents(totalCents)}
        </p>
        <p className="mt-3 text-[15px] leading-[20px] text-marron/70">
          {next ? (
            <>
              {next.overdue ? t(lang, "lateSince") : t(lang, "nextPayment")} {fecha(next.dueDate, lang)}:{" "}
              <span className={`font-semibold ${next.overdue ? "text-estado-mora" : "text-marron"}`}>
                {formatCents(next.amountCents)}
              </span>{" "}
              at {next.shop}.
            </>
          ) : totalCents > 0 ? (
            t(lang, "noDueDates")
          ) : (
            t(lang, "allPaidUp")
          )}
        </p>
      </header>

      <div className="mt-8 grid gap-4 lg:grid-cols-2">
        <Panel title={t(lang, "byStatus")}>
          <StatusBar slices={slices} />
        </Panel>

        <Panel title={t(lang, "paidThisWeek")}>
          {/* Siete barras en cero no informan de nada y ocupan media pantalla: cuando no
              hubo pagos se dice con una frase. */}
          {paidThisWeek === 0 ? (
            <p className="text-[15px] text-marron/60">{t(lang, "noPaymentsWeek")}</p>
          ) : (
            <>
              <p className="mb-4 font-display text-[22px] font-semibold tabular-nums tracking-[-0.01em] text-marron">
                {formatCents(paidThisWeek)}
              </p>
              <WeekChart days={week} />
            </>
          )}
        </Panel>
      </div>

      <Panel className="mt-4" title={t(lang, "whoYouOwe")}>
        {owing.length === 0 ? (
          <p className="text-[15px] text-marron/60">{t(lang, "oweNothing")}</p>
        ) : (
          <>
            <Rows>
              {owing.slice(0, 4).map((shop) => (
                <Row key={shop.id}>
                  <span className="min-w-0 flex-1 truncate text-[15px] text-marron">{shop.name}</span>
                  {shop.overdue && (
                    <span className="shrink-0 text-[13px] font-semibold text-estado-mora">{t(lang, "late")}</span>
                  )}
                  <span className="shrink-0 text-right text-[15px] tabular-nums text-marron">
                    {formatCents(shop.balanceCents)}
                  </span>
                </Row>
              ))}
            </Rows>
            {owing.length > 4 && (
              <Link href="/me/creditors" className="mt-5 inline-block text-[13px] font-semibold text-rojo">
                {t(lang, "viewAll")} {owing.length}
              </Link>
            )}
          </>
        )}
      </Panel>
    </>
  )
}
