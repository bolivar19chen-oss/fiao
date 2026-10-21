import type { Metadata } from "next"
import Link from "next/link"
import { AlertTriangle, CalendarClock, ReceiptText, TrendingUp, Wallet } from "lucide-react"

import { requireBusiness } from "@/lib/business"
import { addDays, eachDay } from "@/lib/credit"
import { customerAccount, today, type SaleRow } from "@/lib/credit-account"
import { formatCents, formatCount, kpiDelta } from "@/lib/format"
import { createClient } from "@/lib/supabase/server"
import { StatusDonut, TopDebtors, type Debtor, type StatusSlice } from "@/components/app/charts"
import { Card, CardTitle, EmptyState, KpiCard, PageHeader } from "@/components/app/ui"

import { CollectedChart } from "./collected-chart"

export const metadata: Metadata = { title: "Dashboard - FIA'O" }

const DAYS_SHOWN = 30
const DUE_SOON_DAYS = 7

type CustomerRow = { id: string; name: string } & { sales: SaleRow[] }

const dayLabel = (iso: string) =>
  // Mediodia UTC: la fecha ya viene resuelta en Panama, y asi ningun huso la corre un dia.
  new Date(`${iso}T12:00:00Z`).toLocaleDateString("en-US", { day: "numeric", timeZone: "UTC" })

export default async function DashboardPage() {
  const business = await requireBusiness()
  const supabase = await createClient()
  const asOf = today()

  // Se traen los clientes con sus ventas y se suma aca, en centavos enteros: PostgREST no
  // hace agregados y el estado lo decide el motor, no una consulta.
  //
  // Carga asumida: una tienda de barrio, decenas de clientes. Si un negocio llegara a
  // miles, esto pasa a una vista en Postgres.
  const { data: rows } = await supabase
    .from("customers")
    .select(
      "id, name, sales(id, total_cents, created_at, payments(amount_cents, paid_at), installments(due_date, amount_cents))",
    )
    .eq("business_id", business.id)

  const customers = (rows ?? []) as CustomerRow[]
  const accounts = customers.map((customer) => ({
    id: customer.id,
    name: customer.name,
    account: customerAccount(customer.sales, asOf),
  }))

  const withDebt = accounts.filter((entry) => entry.account.balanceCents > 0)
  const portfolio = withDebt.reduce((sum, entry) => sum + entry.account.balanceCents, 0)

  // El estado sale del motor. Solo hay dos cubos porque el motor devuelve dos: "por
  // vencer" necesita los dias de gracia del negocio, que entran con la migracion de
  // intereses (docs/MODELO-CREDITO.md seccion 5). No se inventa la regla aca.
  const overdue = withDebt
    .filter((entry) => entry.account.status === "OVERDUE")
    .reduce((sum, entry) => sum + entry.account.balanceCents, 0)
  const slices: StatusSlice[] = [
    { key: "on-time", cents: portfolio - overdue },
    { key: "overdue", cents: overdue },
  ]

  const dueSoonLimit = addDays(asOf, DUE_SOON_DAYS)
  const dueThisWeek = accounts.reduce(
    (sum, entry) =>
      sum +
      entry.account.installments
        .filter((i) => i.paidDate === null && i.dueDate >= asOf && i.dueDate <= dueSoonLimit)
        .reduce((cents, i) => cents + i.amountCents, 0),
    0,
  )

  // Dos ventanas de 30 dias: la actual para la grafica, la anterior solo para la
  // variacion de lo cobrado. Es el unico indicador con historia con la que compararse.
  const days = eachDay(addDays(asOf, -(DAYS_SHOWN - 1)), asOf)
  const priorFrom = addDays(asOf, -(DAYS_SHOWN * 2 - 1))
  const paidOn = new Map<string, number>(days.map((day) => [day, 0]))
  let priorWeek = 0
  let thisWeek = 0
  const weekFrom = addDays(asOf, -6)
  const priorWeekFrom = addDays(asOf, -13)

  for (const customer of customers) {
    for (const sale of customer.sales) {
      for (const payment of sale.payments) {
        const day = payment.paid_at.slice(0, 10)
        if (day < priorFrom || day > asOf) continue
        const current = paidOn.get(day)
        if (current !== undefined) paidOn.set(day, current + payment.amount_cents)
        if (day >= weekFrom) thisWeek += payment.amount_cents
        else if (day >= priorWeekFrom) priorWeek += payment.amount_cents
      }
    }
  }

  const topDebtors: Debtor[] = withDebt
    .map((entry) => ({ id: entry.id, name: entry.name, cents: entry.account.balanceCents }))
    .sort((a, b) => b.cents - a.cents)
    .slice(0, 5)

  const hasSales = customers.some((customer) => customer.sales.length > 0)

  return (
    <>
      {/* El nombre del negocio y el titulo ya estan en la barra superior: aca va la
          accion, como en la referencia. */}
      <PageHeader
        title="Dashboard"
        description="What your customers owe you, as of today."
        action={
          <div className="flex gap-3">
            <Link href="/app/products/new" className="btn btn-glass">
              Add a product
            </Link>
            <Link href="/app/customers/new" className="btn btn-glass-red">
              Add a customer
            </Link>
          </div>
        }
      />

      {/* Fila de cuatro, como DashSpace. La variacion solo donde existe de verdad. */}
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <KpiCard
          icon={Wallet}
          label="Outstanding credit"
          value={formatCents(portfolio)}
          since={`${formatCount(withDebt.length)} ${withDebt.length === 1 ? "customer" : "customers"} with a balance`}
        />
        <KpiCard
          icon={AlertTriangle}
          label="Overdue"
          value={formatCents(overdue)}

          since="Past the due date"
        />
        <KpiCard icon={CalendarClock} label="Due this week" value={formatCents(dueThisWeek)} since="Next 7 days" />
        <KpiCard
          icon={TrendingUp}
          label="Collected this week"
          value={formatCents(thisWeek)}
          delta={kpiDelta(thisWeek, priorWeek)}
          since="vs the 7 days before"
        />
      </div>

      {hasSales ? (
        <>
          {/* Grafica grande a dos tercios y la dona al lado, como en la referencia. */}
          <div className="mt-4 grid gap-4 lg:grid-cols-[1.9fr_1fr]">
            <Card>
              <CardTitle>Collected</CardTitle>
              <CollectedChart days={days.map((day) => ({ label: dayLabel(day), cents: paidOn.get(day) ?? 0 }))} />
            </Card>
            <Card>
              <CardTitle>Portfolio by status</CardTitle>
              <StatusDonut slices={slices} />
            </Card>
          </div>

          <Card className="mt-4">
            <CardTitle>Top debtors</CardTitle>
            {topDebtors.length === 0 ? (
              <p className="text-[17px] leading-[22px] text-marron/60">Nobody owes you anything right now.</p>
            ) : (
              <TopDebtors debtors={topDebtors} />
            )}
          </Card>
        </>
      ) : (
        <Card className="mt-4">
          <CardTitle>Getting started</CardTitle>
          <EmptyState
            icon={ReceiptText}
            title="No credit sales yet"
            body="Add your customers and products first. Credit sales open in the next update."
            action={{ href: "/app/customers/new", label: "Add a customer" }}
          />
        </Card>
      )}
    </>
  )
}
