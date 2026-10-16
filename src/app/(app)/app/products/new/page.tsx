import type { Metadata } from "next"
import { ActionForm } from "@/components/app/action-form"
import { Card, Field, PageHeader } from "@/components/app/ui"
import { createProduct } from "../actions"

export const metadata: Metadata = { title: "New product - FIA'O" }

export default function NewProductPage() {
  return (
    <div className="max-w-xl">
      <PageHeader title="New product" back={{ href: "/app/products", label: "Inventory" }} />
      <Card>
        <ActionForm action={createProduct} submitLabel="Save product" pendingLabel="Saving...">
          <Field label="Name" name="name" required maxLength={120} autoComplete="off" />
          <Field label="Price" name="price" required inputMode="decimal" placeholder="0.00" autoComplete="off" />
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="In stock" name="stock" inputMode="numeric" placeholder="0" autoComplete="off" />
            <Field
              label="Low stock alert"
              name="low_stock_threshold"
              inputMode="numeric"
              placeholder="0"
              autoComplete="off"
              hint="Warn me when stock gets this low."
            />
          </div>
        </ActionForm>
      </Card>
    </div>
  )
}
