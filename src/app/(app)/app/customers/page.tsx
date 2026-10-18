import type { Metadata } from "next"
import { Plus, Users } from "lucide-react"
import { StatusBadge } from "@/components/app/account-status"
import { CustomerFolder, type FolderCustomer } from "@/components/app/customer-folder"
import { ButtonLink, Card, EmptyState, PageHeader, PrimaryCell, Table } from "@/components/app/ui"
import { requireBusiness } from "@/lib/business"
import { scoreBand } from "@/lib/credit"
import { customerAccount, today, type SaleRow } from "@/lib/credit-account"
import { formatCents } from "@/lib/format"
import { createClient } from "@/lib/supabase/server"

export const metadata: Metadata = { title: "Customers - FIA'O" }

type Row = { id: string; name: string; phone: string | null; sales: SaleRow[] }

export default async function CustomersPage() {
  const business = await requireBusiness()
  const supabase = await createClient()
  const asOf = today()

  const { data } = await supabase
    .from("customers")
    .select(
      "id, name, phone, sales(id, total_cents, created_at, payments(amount_cents, paid_at), installments(due_date, amount_cents))",
    )
    .eq("business_id", business.id)
    .order("name")

  // El estado lo decide el motor, no una consulta: la regla de que es mora vive en un
  // solo lugar (src/lib/credit/status.ts).
  const customers = ((data ?? []) as Row[]).map((customer) => {
    const account = customerAccount(customer.sales, asOf)
    return {
      ...customer,
      balance: account.balanceCents,
      status: account.status,
      band: scoreBand(account.score),
    }
  })

  const toFolder = (c: (typeof customers)[number]): FolderCustomer => ({
    id: c.id,
    name: c.name,
    balanceCents: c.balance,
  })
  const overdue = customers.filter((c) => c.status === "OVERDUE").map(toFolder)
  // Con deuda pero sin atraso. Quien no debe nada no va en carpeta: esta en la lista.
  const onTime = customers.filter((c) => c.status === "CURRENT").map(toFolder)
  // Mirar antes de que se atrase: paga tarde seguido aunque hoy este al dia. Es la unica
  // carpeta que mira hacia adelante; las otras dos describen el presente.
  const watch = customers.filter((c) => c.band === "watch" && c.status !== "OVERDUE").map(toFolder)

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

      {/* Dos carpetas, derivadas del estado. No se guardan en la base: son una vista, y
          por eso nunca quedan viejas. Las carpetas propias del negocio necesitan su
          tabla y entran aparte. */}
      {customers.length > 0 && (
        <div className="mb-6 flex flex-wrap justify-center gap-8 sm:justify-start">
          <CustomerFolder label="Overdue" tone="alert" customers={overdue} width={300} />
          <CustomerFolder label="Watch" tone="warn" customers={watch} width={300} />
          <CustomerFolder label="On time" tone="calm" customers={onTime} width={300} />
        </div>
      )}

      <Card>
        {customers.length === 0 ? (
          <EmptyState
            icon={Users}
            title="No customers yet"
            body="Add the people who buy on credit at your store to start tracking what they owe."
            action={{ href: "/app/customers/new", label: "Add your first customer" }}
          />
        ) : (
          <Table head={["Customer", "Status", "Balance"]}>
            {customers.map((c) => (
              <tr key={c.id} className="hover:bg-fondo/50">
                <PrimaryCell href={`/app/customers/${c.id}`} title={c.name} sub={c.phone ?? undefined} />
                <td className="px-2 py-3">
                  <StatusBadge status={c.status} />
                </td>
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
