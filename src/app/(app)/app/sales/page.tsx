import type { Metadata } from "next"
import Link from "next/link"
import { Plus, ReceiptText } from "lucide-react"
import { Badge, ButtonLink, Card, EmptyState, PageHeader, Table } from "@/components/app/ui"
import { requireBusiness } from "@/lib/business"
import { formatCents, formatDate } from "@/lib/format"
import { createClient } from "@/lib/supabase/server"

export const metadata: Metadata = { title: "Sales - FIA'O" }

export default async function SalesPage() {
  const business = await requireBusiness()
  const supabase = await createClient()
  const { data } = await supabase
    .from("sales")
    .select("id, total_cents, balance_cents, created_at, customers(name)")
    .eq("business_id", business.id)
    .order("created_at", { ascending: false })
  const sales = data ?? []

  return (
    <>
      <PageHeader
        title="Sales"
        description="Credit sales and what is still owed on each."
        action={
          <ButtonLink href="/app/sales/new">
            <Plus className="h-4 w-4" aria-hidden />
            New sale
          </ButtonLink>
        }
      />
      <Card>
        {sales.length === 0 ? (
          <EmptyState
            icon={ReceiptText}
            title="No credit sales yet"
            body="Credit sales you record will show here with their balance."
          />
        ) : (
          <Table head={["Customer", "Date", "Total", "Balance"]}>
            {sales.map((s) => (
              <tr key={s.id} className="hover:bg-white/50">
                <td className="px-2 py-3">
                  <Link href={`/app/sales/${s.id}`} className="font-medium text-marron hover:text-rojo">
                    {s.customers.name}
                  </Link>
                </td>
                <td className="px-2 py-3 text-right text-marron/70">{formatDate(s.created_at)}</td>
                <td className="px-2 py-3 text-right tabular-nums">{formatCents(s.total_cents)}</td>
                <td className="px-2 py-3 text-right">
                  {s.balance_cents === 0 ? (
                    <Badge tone="neutral">Paid</Badge>
                  ) : (
                    <span className="font-semibold tabular-nums text-rojo">{formatCents(s.balance_cents)}</span>
                  )}
                </td>
              </tr>
            ))}
          </Table>
        )}
      </Card>
    </>
  )
}
