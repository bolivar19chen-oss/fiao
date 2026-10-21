import type { Metadata } from "next"
import { Package, Users } from "lucide-react"

import { requireBusiness } from "@/lib/business"
import { today } from "@/lib/credit-account"
import { createClient } from "@/lib/supabase/server"
import { Card, EmptyState, PageHeader } from "@/components/app/ui"

import { NewSaleForm, type SaleCustomer } from "./new-sale-form"

export const metadata: Metadata = { title: "New sale - FIA'O" }

export default async function NewSalePage() {
  const business = await requireBusiness()
  const supabase = await createClient()

  const [{ data: customers }, { data: products }, { data: terms }] = await Promise.all([
    supabase.from("customers").select("id, name").eq("business_id", business.id).order("name"),
    supabase
      .from("products")
      .select("id, name, price_cents, stock")
      .eq("business_id", business.id)
      .gt("stock", 0)
      .order("name"),
    supabase.from("businesses").select("default_installments, installment_days").eq("id", business.id).single(),
  ])

  // Sin clientes o sin existencias no hay venta que registrar, y decirlo es mas util que
  // un formulario con dos desplegables vacios.
  if (!customers?.length) {
    return (
      <div className="max-w-2xl">
        <PageHeader title="New sale" back={{ href: "/app/sales", label: "Sales" }} />
        <Card>
          <EmptyState
            icon={Users}
            title="No customers yet"
            body="Add the person who is buying on credit before you record the sale."
            action={{ href: "/app/customers/new", label: "Add a customer" }}
          />
        </Card>
      </div>
    )
  }

  if (!products?.length) {
    return (
      <div className="max-w-2xl">
        <PageHeader title="New sale" back={{ href: "/app/sales", label: "Sales" }} />
        <Card>
          <EmptyState
            icon={Package}
            title="Nothing in stock"
            body="Add products with stock before you sell them on credit."
            action={{ href: "/app/products/new", label: "Add a product" }}
          />
        </Card>
      </div>
    )
  }

  return (
    <div className="max-w-2xl">
      <PageHeader
        title="New sale"
        description="Pick the customer, add what they are taking, and agree the payment plan."
        back={{ href: "/app/sales", label: "Sales" }}
      />
      <NewSaleForm
        customers={customers as SaleCustomer[]}
        products={(products as { id: string; name: string; price_cents: number; stock: number }[]).map((product) => ({
          id: product.id,
          name: product.name,
          priceCents: product.price_cents,
          stock: product.stock,
        }))}
        defaultInstallments={terms?.default_installments ?? 2}
        defaultDays={terms?.installment_days ?? 15}
        // Hoy lo resuelve el servidor en la zona del negocio: el telefono puede ir corrido.
        soldOn={today()}
      />
    </div>
  )
}
