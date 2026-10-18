import type { Metadata } from "next"
import Link from "next/link"
import { notFound } from "next/navigation"
import { CalendarClock, Wallet } from "lucide-react"
import { Card, CardTitle, EmptyState, PageHeader, Stat, Table } from "@/components/app/ui"
import { requireBusiness } from "@/lib/business"
import { formatCents, formatCount, formatDate } from "@/lib/format"
import { createClient } from "@/lib/supabase/server"
import { RecordPayment } from "./record-payment"

export const metadata: Metadata = { title: "Sale - FIA'O" }

export default async function SalePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const business = await requireBusiness()
  const supabase = await createClient()
  const { data: sale } = await supabase
    .from("sales")
    .select(
      "id, total_cents, balance_cents, created_at, customers(id, name), sale_items(id, quantity, unit_price_cents, products(name)), installments(id, number, due_date, amount_cents), payments(id, amount_cents, paid_at, method)",
    )
    .eq("business_id", business.id)
    .eq("id", id)
    .maybeSingle()
  if (!sale) notFound()

  const installments = [...sale.installments].sort((a, b) => a.number - b.number)
  const payments = [...sale.payments].sort((a, b) => b.paid_at.localeCompare(a.paid_at))

  return (
    <>
      <PageHeader
        title={`Sale on ${formatDate(sale.created_at)}`}
        back={{ href: "/app/sales", label: "Sales" }}
        description={
          <>
            Customer:{" "}
            <Link href={`/app/customers/${sale.customers.id}`} className="font-medium text-rojo hover:underline">
              {sale.customers.name}
            </Link>
          </>
        }
      />
      <div className="grid gap-4 sm:grid-cols-2">
        <Stat label="Total" value={formatCents(sale.total_cents)} />
        <Stat label="Balance" value={formatCents(sale.balance_cents)} />
      </div>

      <Card className="mt-4">
        <CardTitle>Items</CardTitle>
        <Table head={["Product", "Qty", "Unit price", "Subtotal"]}>
          {sale.sale_items.map((item) => (
            <tr key={item.id}>
              <td className="px-2 py-3 font-medium">{item.products.name}</td>
              <td className="px-2 py-3 text-right tabular-nums">{formatCount(item.quantity)}</td>
              <td className="px-2 py-3 text-right tabular-nums">{formatCents(item.unit_price_cents)}</td>
              <td className="px-2 py-3 text-right font-semibold tabular-nums">
                {formatCents(item.unit_price_cents * item.quantity)}
              </td>
            </tr>
          ))}
        </Table>
      </Card>

      <div className="mt-4">
        <RecordPayment saleId={sale.id} balanceCents={sale.balance_cents} />
      </div>

      <div className="mt-4 grid gap-4 lg:grid-cols-2">
        <Card>
          <CardTitle>Installments</CardTitle>
          {installments.length === 0 ? (
            <EmptyState icon={CalendarClock} title="No installments" body="This sale has no payment plan." />
          ) : (
            <Table head={["#", "Due", "Amount"]}>
              {installments.map((inst) => (
                <tr key={inst.id}>
                  <td className="px-2 py-3">{inst.number}</td>
                  <td className="px-2 py-3 text-right">{formatDate(`${inst.due_date}T12:00:00Z`)}</td>
                  <td className="px-2 py-3 text-right font-semibold tabular-nums">{formatCents(inst.amount_cents)}</td>
                </tr>
              ))}
            </Table>
          )}
        </Card>
        <Card>
          <CardTitle>Payments</CardTitle>
          {payments.length === 0 ? (
            <EmptyState icon={Wallet} title="No payments yet" body="Payments on this sale will show here." />
          ) : (
            <Table head={["Date", "Method", "Amount"]}>
              {payments.map((p) => (
                <tr key={p.id}>
                  <td className="px-2 py-3">{formatDate(p.paid_at)}</td>
                  <td className="px-2 py-3 capitalize text-marron/70">{p.method}</td>
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
