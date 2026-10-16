import type { Metadata } from "next"
import Link from "next/link"
import { notFound } from "next/navigation"
import { ReceiptText, Wallet } from "lucide-react"
import { Card, CardTitle, EmptyState, PageHeader, Stat, Table } from "@/components/app/ui"
import { requireBusiness } from "@/lib/business"
import { formatCents, formatDate } from "@/lib/format"
import { createClient } from "@/lib/supabase/server"

export const metadata: Metadata = { title: "Customer - FIA'O" }

export default async function CustomerPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const business = await requireBusiness()
  const supabase = await createClient()
  const { data: customer } = await supabase
    .from("customers")
    .select(
      "id, name, phone, notes, created_at, sales(id, total_cents, balance_cents, created_at, payments(id, amount_cents, paid_at))",
    )
    .eq("business_id", business.id)
    .eq("id", id)
    .maybeSingle()
  if (!customer) notFound()

  const sales = [...customer.sales].sort((a, b) => b.created_at.localeCompare(a.created_at))
  const payments = sales.flatMap((s) => s.payments).sort((a, b) => b.paid_at.localeCompare(a.paid_at))
  const balance = sales.reduce((sum, s) => sum + s.balance_cents, 0)

  return (
    <>
      <PageHeader
        title={customer.name}
        description={[customer.phone, `Customer since ${formatDate(customer.created_at)}`].filter(Boolean).join(" - ")}
        back={{ href: "/app/customers", label: "Customers" }}
      />
      <div className="grid gap-4 sm:grid-cols-2">
        <Stat label="Balance" value={formatCents(balance)} />
        <Stat label="Credit sales" value={String(sales.length)} />
      </div>
      {customer.notes && (
        <Card className="mt-4">
          <CardTitle>Notes</CardTitle>
          <p className="text-[15px] text-marron/75">{customer.notes}</p>
        </Card>
      )}
      <div className="mt-4 grid gap-4 lg:grid-cols-2">
        <Card>
          <CardTitle>Sales</CardTitle>
          {sales.length === 0 ? (
            <EmptyState icon={ReceiptText} title="No sales yet" body="Credit sales to this customer will show here." />
          ) : (
            <Table head={["Date", "Total", "Balance"]}>
              {sales.map((s) => (
                <tr key={s.id} className="hover:bg-white/50">
                  <td className="px-2 py-3">
                    <Link href={`/app/sales/${s.id}`} className="font-medium text-marron hover:text-rojo">
                      {formatDate(s.created_at)}
                    </Link>
                  </td>
                  <td className="px-2 py-3 text-right tabular-nums">{formatCents(s.total_cents)}</td>
                  <td className="px-2 py-3 text-right font-semibold tabular-nums">{formatCents(s.balance_cents)}</td>
                </tr>
              ))}
            </Table>
          )}
        </Card>
        <Card>
          <CardTitle>Payments</CardTitle>
          {payments.length === 0 ? (
            <EmptyState icon={Wallet} title="No payments yet" body="Payments from this customer will show here." />
          ) : (
            <Table head={["Date", "Amount"]}>
              {payments.map((p) => (
                <tr key={p.id}>
                  <td className="px-2 py-3">{formatDate(p.paid_at)}</td>
                  <td className="px-2 py-3 text-right font-semibold tabular-nums">{formatCents(p.amount_cents)}</td>
                </tr>
              ))}
            </Table>
          )}
        </Card>
      </div>
    </>
  )
}
