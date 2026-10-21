import type { Metadata } from "next"
import Link from "next/link"

import { formatCents } from "@/lib/format"
import { WeekChart } from "@/components/app/lazy-charts"
import { StatusBar, type StatusSlice } from "@/components/app/status"

import { getMeData } from "./data"
import { Panel, Row, Rows } from "./ui"

export const metadata: Metadata = { title: "Overview - FIA'O" }

const fecha = (iso: string) =>
  new Date(`${iso}T12:00:00Z`).toLocaleDateString("en-US", { month: "short", day: "numeric", timeZone: "UTC" })

// La pregunta de esta pantalla: cuanto debo y que me toca pagar ahora. La cifra que la
// responde es la mas grande de la pantalla, y el hallazgo va justo debajo.
export default async function OverviewPage() {
  const { profile, creditors, totalCents, overdueCents, next, week } = await getMeData()

  const slices: StatusSlice[] = [
    { key: "on-time", cents: totalCents - overdueCents },
    { key: "overdue", cents: overdueCents },
  ]
  const paidThisWeek = week.reduce((sum, day) => sum + day.cents, 0)
  const owing = creditors.filter((c) => c.balanceCents > 0)

  return (
    <>
      <header>
        <h1 className="text-[17px] font-semibold text-marron">Hello, {profile.fullName.split(" ")[0]}</h1>
        <p className="mt-6 text-[13px] text-marron/55">You owe, across all your shops</p>
        <p className="mt-1 font-display text-[36px] font-semibold tabular-nums leading-none tracking-[-0.02em] text-marron">
          {formatCents(totalCents)}
        </p>
        <p className="mt-3 text-[15px] leading-[20px] text-marron/70">
          {next ? (
            <>
              {next.overdue ? "Late since" : "Next payment"} {fecha(next.dueDate)}:{" "}
              <span className={`font-semibold ${next.overdue ? "text-estado-mora" : "text-marron"}`}>
                {formatCents(next.amountCents)}
              </span>{" "}
              at {next.shop}.
            </>
          ) : totalCents > 0 ? (
            "No due dates on record for what you owe."
          ) : (
            "You are all paid up."
          )}
        </p>
      </header>

      <div className="mt-8 grid gap-4 lg:grid-cols-2">
        <Panel title="What you owe, by status">
          <StatusBar slices={slices} />
        </Panel>

        <Panel title="What you paid this week">
          {/* Siete barras en cero no informan de nada y ocupan media pantalla: cuando no
              hubo pagos se dice con una frase. */}
          {paidThisWeek === 0 ? (
            <p className="text-[15px] text-marron/60">No payments in the last 7 days.</p>
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

      <Panel className="mt-4" title="Who you owe">
        {owing.length === 0 ? (
          <p className="text-[15px] text-marron/60">You owe nothing right now.</p>
        ) : (
          <>
            <Rows>
              {owing.slice(0, 4).map((shop) => (
                <Row key={shop.id}>
                  <span className="min-w-0 flex-1 truncate text-[15px] text-marron">{shop.name}</span>
                  {shop.overdue && <span className="shrink-0 text-[13px] font-semibold text-estado-mora">Late</span>}
                  <span className="shrink-0 text-right text-[15px] tabular-nums text-marron">
                    {formatCents(shop.balanceCents)}
                  </span>
                </Row>
              ))}
            </Rows>
            {owing.length > 4 && (
              <Link href="/me/creditors" className="mt-5 inline-block text-[13px] font-semibold text-rojo">
                View all {owing.length}
              </Link>
            )}
          </>
        )}
      </Panel>
    </>
  )
}
