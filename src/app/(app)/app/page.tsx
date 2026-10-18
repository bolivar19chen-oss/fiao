import type { Metadata } from "next"
import { ReceiptText } from "lucide-react"
import { StatusBar, TopDebtors, WeekColumns, type Debtor, type StatusSlice } from "@/components/app/charts"
import { Card, CardTitle, EmptyState, PageHeader, Stat } from "@/components/app/ui"
import { requireBusiness } from "@/lib/business"
import { addDays, eachDay } from "@/lib/credit"
import { customerAccount, today, type SaleRow } from "@/lib/credit-account"
import { formatCents, formatCount } from "@/lib/format"
import { createClient } from "@/lib/supabase/server"

export const metadata: Metadata = { title: "Dashboard - FIA'O" }

const DAYS_SHOWN = 7
const DUE_SOON_DAYS = 7

type CustomerRow = { id: string; name: string } & { sales: SaleRow[] }

const weekdayOf = (iso: string) =>
  // Mediodia UTC: la fecha ya viene resuelta en Panama, y asi ningun huso la corre un dia.
  new Date(`${iso}T12:00:00Z`).toLocaleDateString("en-US", { weekday: "short", timeZone: "UTC" })

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

  const days = eachDay(addDays(asOf, -(DAYS_SHOWN - 1)), asOf)
  const paidOn = new Map<string, number>(days.map((day) => [day, 0]))
  for (const customer of customers) {
    for (const sale of customer.sales) {
      for (const payment of sale.payments) {
        const day = payment.paid_at.slice(0, 10)
        const current = paidOn.get(day)
        if (current !== undefined) paidOn.set(day, current + payment.amount_cents)
      }
    }
  }
  const collected = [...paidOn.values()].reduce((sum, cents) => sum + cents, 0)

  const topDebtors: Debtor[] = withDebt
    .map((entry) => ({ id: entry.id, name: entry.name, cents: entry.account.balanceCents }))
    .sort((a, b) => b.cents - a.cents)
    .slice(0, 5)

  const hasSales = customers.some((customer) => customer.sales.length > 0)

  return (
    <>
      {/* El nombre del negocio ya esta en el shell: no se repite aca. */}
      <PageHeader title="Dashboard" description="What your customers owe you, as of today." />

      {/* La figura principal responde la pregunta que el dueno se hace al abrir. */}
      <Card>
        <p className="text-xs font-semibold uppercase tracking-[0.1em] text-marron/55">Outstanding credit</p>
        <p className="mt-2 font-display text-[44px] font-bold leading-none tracking-[-0.03em] text-marron sm:text-[58px]">
          {formatCents(portfolio)}
        </p>
        <p className="mt-2 text-sm text-marron/60">
          Across {formatCount(withDebt.length)} {withDebt.length === 1 ? "customer" : "customers"} with an open balance
        </p>
      </Card>

      <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4">
        <Stat label="Overdue" value={formatCents(overdue)} note="Past the due date" />
        <Stat label="Due this week" value={formatCents(dueThisWeek)} note="Next 7 days" />
        <Stat
          className="col-span-2 sm:col-span-1"
          label="Collected this week"
          value={formatCents(collected)}
          note="Payments in the last 7 days"
        />
      </div>

      {hasSales ? (
        <>
          <Card className="mt-4">
            <CardTitle>Portfolio by status</CardTitle>
            <StatusBar slices={slices} />
          </Card>

          <div className="mt-4 grid gap-4 lg:grid-cols-2">
            <Card>
              <CardTitle>Collected this week</CardTitle>
              <WeekColumns days={days.map((day) => ({ label: weekdayOf(day), cents: paidOn.get(day) ?? 0 }))} />
            </Card>
            <Card>
              <CardTitle>Top debtors</CardTitle>
              {topDebtors.length === 0 ? (
                <p className="text-[15px] text-marron/60">Nobody owes you anything right now.</p>
              ) : (
                <TopDebtors debtors={topDebtors} />
              )}
            </Card>
          </div>
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
