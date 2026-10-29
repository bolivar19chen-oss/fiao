import type { Metadata } from "next"
import { notFound } from "next/navigation"

import { requireBusiness } from "@/lib/business"
import { centsToInput } from "@/lib/format"
import { createClient } from "@/lib/supabase/server"
import { ActionForm } from "@/components/app/action-form"
import { Card, Field, PageHeader } from "@/components/app/ui"

import { updateProduct } from "../actions"
import { StockBadge } from "../stock-badge"

export const metadata: Metadata = { title: "Product - FIA'O" }

export default async function ProductPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const business = await requireBusiness()
  const supabase = await createClient()
  const { data: product } = await supabase
    .from("products")
    .select("id, name, price_cents, stock, low_stock_threshold")
    .eq("business_id", business.id)
    .eq("id", id)
    .maybeSingle()
  if (!product) notFound()

  return (
    <div className="max-w-xl">
      <PageHeader
        title={product.name}
        back={{ href: "/app/products", label: "Inventory" }}
        action={<StockBadge stock={product.stock} threshold={product.low_stock_threshold} />}
      />
      <Card>
        <ActionForm action={updateProduct} submitLabel="Save changes" pendingLabel="Saving...">
          <input type="hidden" name="id" value={product.id} />
          <Field
            label="Price"
            name="price"
            required
            inputMode="decimal"
            autoComplete="off"
            defaultValue={centsToInput(product.price_cents)}
          />
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="In stock" name="stock" inputMode="numeric" autoComplete="off" defaultValue={product.stock} />
            <Field
              label="Low stock alert"
              name="low_stock_threshold"
              inputMode="numeric"
              autoComplete="off"
              defaultValue={product.low_stock_threshold}
              hint="Warn me when stock gets this low."
            />
          </div>
        </ActionForm>
      </Card>
    </div>
  )
}
