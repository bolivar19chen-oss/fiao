import type { Metadata } from "next"
import { notFound } from "next/navigation"
import { ReceiptText, Wallet } from "lucide-react"
import { CreditScore, StatusBadge } from "@/components/app/account-status"
import { Card, CardTitle, EmptyState, PageHeader, PrimaryCell, Stat, Table } from "@/components/app/ui"
import { customerAccount } from "@/lib/credit-account"
import { requireBusiness } from "@/lib/business"
import { formatCents, formatDate } from "@/lib/format"
import { createClient } from "@/lib/supabase/server"
import { InviteCard } from "./invite-card"

export const metadata: Metadata = { title: "Customer - FIA'O" }

export default async function CustomerPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const business = await requireBusiness()
  const supabase = await createClient()
  const { data: customer } = await supabase
    .from("customers")
    .select(
      "id, name, phone, notes, created_at, user_id, sales(id, total_cents, balance_cents, created_at, payments(id, amount_cents, paid_at), installments(due_date, amount_cents))",
    )
    .eq("business_id", business.id)
    .eq("id", id)
    .maybeSingle()
  if (!customer) notFound()

  const sales = [...customer.sales].sort((a, b) => b.created_at.localeCompare(a.created_at))
  const payments = sales.flatMap((s) => s.payments).sort((a, b) => b.paid_at.localeCompare(a.paid_at))
  // El saldo, el estado y el puntaje salen del motor, no de sumas sueltas en la pagina.
  const account = customerAccount(customer.sales)

  return (
    <>
      <PageHeader
        title={customer.name}
        description={[customer.phone, `Customer since ${formatDate(customer.created_at)}`].filter(Boolean).join(" - ")}
        back={{ href: "/app/customers", label: "Customers" }}
      />
      <div className="grid gap-4 sm:grid-cols-2">
        <Stat label="Balance" value={formatCents(account.balanceCents)} />
        <Stat label="Credit sales" value={String(sales.length)} />
      </div>
      <div className="mt-4 grid gap-4 lg:grid-cols-2">
        <Card>
          <div className="flex items-center justify-between gap-3">
            <CardTitle>Account status</CardTitle>
            <StatusBadge status={account.status} />
          </div>
          <p className="text-[15px] text-marron/75">
            {account.installments.filter((i) => i.paidDate === null).length} of {account.installments.length}{" "}
            installments still open.
          </p>
        </Card>
        <Card>
          <CardTitle>Credit score</CardTitle>
          <CreditScore score={account.score} breakdown={account.breakdown} />
        </Card>
      </div>
      <div className="mt-4">
        <InviteCard customerId={customer.id} linked={customer.user_id !== null} />
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
                  <PrimaryCell href={`/app/sales/${s.id}`} title={formatDate(s.created_at)} />
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
