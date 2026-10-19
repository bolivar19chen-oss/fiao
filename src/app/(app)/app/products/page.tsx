import type { Metadata } from "next"
import { Package, Plus } from "lucide-react"
import { ButtonLink, Card, EmptyState, PageHeader, PrimaryCell, Table } from "@/components/app/ui"
import { requireBusiness } from "@/lib/business"
import { formatCents, formatCount } from "@/lib/format"
import { createClient } from "@/lib/supabase/server"
import { StockBadge } from "./stock-badge"

export const metadata: Metadata = { title: "Inventory - FIA'O" }

export default async function ProductsPage() {
  const business = await requireBusiness()
  const supabase = await createClient()
  const { data } = await supabase
    .from("products")
    .select("id, name, price_cents, stock, low_stock_threshold")
    .eq("business_id", business.id)
    .order("name")
  const products = data ?? []

  return (
    <>
      <PageHeader
        title="Inventory"
        description="Products, prices and what you have in stock."
        action={
          products.length > 0 && (
            <ButtonLink href="/app/products/new">
              <Plus className="h-4 w-4" aria-hidden />
              Add product
            </ButtonLink>
          )
        }
      />
      <Card>
        {products.length === 0 ? (
          <EmptyState
            icon={Package}
            title="No products yet"
            body="Add what you sell so you can track stock and use it in credit sales."
            action={{ href: "/app/products/new", label: "Add your first product" }}
          />
        ) : (
          <Table head={["Product", "Price", "Stock"]}>
            {products.map((p) => (
              <tr key={p.id} className="hover:bg-papel">
                <PrimaryCell href={`/app/products/${p.id}`} title={p.name} />
                <td className="px-2 py-3 text-right tabular-nums">{formatCents(p.price_cents)}</td>
                <td className="px-2 py-3 text-right">
                  <span className="inline-flex flex-wrap items-center justify-end gap-x-2 gap-y-1">
                    <StockBadge stock={p.stock} threshold={p.low_stock_threshold} />
                    <span className="font-semibold tabular-nums">{formatCount(p.stock)}</span>
                  </span>
                </td>
              </tr>
            ))}
          </Table>
        )}
      </Card>
    </>
  )
}
