import type { Metadata } from "next"
import { Card, CardTitle, EmptyState, Stat } from "@/components/app/ui"
import { requireBusiness } from "@/lib/business"
import { formatCents, formatCount } from "@/lib/format"
import { createClient } from "@/lib/supabase/server"
import { ReceiptText } from "lucide-react"

export const metadata: Metadata = { title: "Dashboard - FIA'O" }

const WEEK_MS = 7 * 24 * 60 * 60 * 1000

export default async function DashboardPage() {
  const business = await requireBusiness()
  const supabase = await createClient()
  const since = new Date(Date.now() - WEEK_MS).toISOString()

  // Sin agregados en PostgREST: se traen solo las filas con saldo y se suman aca, en
  // centavos enteros.
  const [{ data: openSales }, { data: weekPayments }] = await Promise.all([
    supabase.from("sales").select("customer_id, balance_cents").eq("business_id", business.id).gt("balance_cents", 0),
    supabase.from("payments").select("amount_cents").eq("business_id", business.id).gte("paid_at", since),
  ])

  const portfolio = (openSales ?? []).reduce((sum, s) => sum + s.balance_cents, 0)
  const debtors = new Set((openSales ?? []).map((s) => s.customer_id)).size
  const collected = (weekPayments ?? []).reduce((sum, p) => sum + p.amount_cents, 0)

  return (
    <>
      <header className="mb-6">
        <p className="eyebrow">{business.name}</p>
        <h1 className="section-title mt-1">Dashboard</h1>
      </header>
      <div className="grid gap-4 sm:grid-cols-3">
        <Stat label="Outstanding credit" value={formatCents(portfolio)} note="Total owed across open sales" />
        <Stat label="Customers with debt" value={formatCount(debtors)} />
        <Stat label="Collected this week" value={formatCents(collected)} note="Payments in the last 7 days" />
      </div>
      {portfolio === 0 && (
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
