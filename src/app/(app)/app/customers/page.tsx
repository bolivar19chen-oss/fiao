import type { Metadata } from "next"
import { Plus, Users } from "lucide-react"
import { ButtonLink, Card, EmptyState, PageHeader, PrimaryCell, Table } from "@/components/app/ui"
import { requireBusiness } from "@/lib/business"
import { formatCents } from "@/lib/format"
import { createClient } from "@/lib/supabase/server"

export const metadata: Metadata = { title: "Customers - FIA'O" }

export default async function CustomersPage() {
  const business = await requireBusiness()
  const supabase = await createClient()
  const { data } = await supabase
    .from("customers")
    .select("id, name, phone, sales(balance_cents)")
    .eq("business_id", business.id)
    .order("name")

  const customers = (data ?? []).map((c) => ({
    ...c,
    balance: c.sales.reduce((sum, s) => sum + s.balance_cents, 0),
  }))

  return (
    <>
      <PageHeader
        title="Customers"
        description="Everyone you sell to on credit."
        action={
          customers.length > 0 && (
            <ButtonLink href="/app/customers/new">
              <Plus className="h-4 w-4" aria-hidden />
              Add customer
            </ButtonLink>
          )
        }
      />
      <Card>
        {customers.length === 0 ? (
          <EmptyState
            icon={Users}
            title="No customers yet"
            body="Add the people who buy on credit at your store to start tracking what they owe."
            action={{ href: "/app/customers/new", label: "Add your first customer" }}
          />
        ) : (
          <Table head={["Customer", "Balance"]}>
            {customers.map((c) => (
              <tr key={c.id} className="hover:bg-white/50">
                <PrimaryCell href={`/app/customers/${c.id}`} title={c.name} sub={c.phone ?? undefined} />
                <td
                  className={`px-2 py-3 text-right font-semibold tabular-nums ${c.balance > 0 ? "text-rojo" : "text-marron/60"}`}
                >
                  {formatCents(c.balance)}
                </td>
              </tr>
            ))}
          </Table>
        )}
      </Card>
    </>
  )
}
