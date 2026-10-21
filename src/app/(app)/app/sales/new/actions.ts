"use server"

import { redirect } from "next/navigation"

import { requireBusiness } from "@/lib/business"
import { buildSchedule } from "@/lib/credit"
import { today } from "@/lib/credit-account"
import { createClient } from "@/lib/supabase/server"
import type { FormState } from "@/components/app/action-form"

/**
 * Registra una venta a credito.
 *
 * El reparto de las cuotas se calcula aca, con el motor, y la base lo comprueba contra
 * su propio total antes de escribir nada (register_sale). Son dos sitios a proposito:
 * la aritmetica del dinero vive en un solo lugar (ADR 0005) y la integridad se garantiza
 * donde esta la transaccion.
 *
 * Los precios se leen de la base, no del formulario. Si cambiaron entre que se dibujo la
 * pantalla y que se envio, los totales no cuadran y la venta se rechaza entera: es
 * preferible repetirla a guardar una deuda por un monto que nadie acordo.
 */
export async function createSale(_prev: FormState, formData: FormData): Promise<FormState> {
  const business = await requireBusiness()
  const supabase = await createClient()

  const customerId = String(formData.get("customer_id") ?? "")
  if (!customerId) return { error: "Choose who is buying." }

  // Las cantidades llegan como item_<uuid>. Solo cuentan las positivas.
  const items: { product_id: string; quantity: number }[] = []
  for (const [key, value] of formData.entries()) {
    if (!key.startsWith("item_")) continue
    const quantity = Number(String(value))
    if (!Number.isInteger(quantity) || quantity <= 0) continue
    items.push({ product_id: key.slice(5), quantity })
  }
  if (items.length === 0) return { error: "Add at least one product." }

  const count = Number(String(formData.get("installments") ?? ""))
  const everyDays = Number(String(formData.get("installment_days") ?? ""))
  if (!Number.isInteger(count) || count < 1 || count > 24) return { error: "Choose between 1 and 24 installments." }
  if (!Number.isInteger(everyDays) || everyDays < 1 || everyDays > 90) {
    return { error: "Days between installments must be between 1 and 90." }
  }

  // El total sale de los precios de la base, nunca de lo que mande el navegador.
  const { data: products } = await supabase
    .from("products")
    .select("id, price_cents")
    .eq("business_id", business.id)
    .in(
      "id",
      items.map((item) => item.product_id),
    )

  const priceOf = new Map((products ?? []).map((product) => [product.id, product.price_cents]))
  let totalCents = 0
  for (const item of items) {
    const price = priceOf.get(item.product_id)
    if (price === undefined) return { error: "One of those products is no longer available." }
    totalCents += price * item.quantity
  }
  if (totalCents <= 0) return { error: "The total has to be more than zero." }

  const schedule = buildSchedule({ totalCents, count, everyDays, soldOn: today() })

  const { data: saleId, error } = await supabase.rpc("register_sale", {
    p_customer_id: customerId,
    p_items: items,
    p_installments: schedule.map((installment) => ({
      number: installment.number,
      due_date: installment.dueDate,
      amount_cents: installment.amountCents,
    })),
    // Un token por intento: un doble toque o un reintento deja una venta, no dos.
    p_client_token: crypto.randomUUID(),
  })

  if (error) {
    // El mensaje de la base es el util (sin stock, sobre el limite, totales que no
    // cuadran), pero no se expone crudo: se registra y se responde en palabras.
    console.error("register_sale failed:", error)
    if (error.message.includes("not enough stock")) return { error: "You do not have enough stock for that." }
    if (error.message.includes("credit limit")) return { error: "That sale goes over this customer's credit limit." }
    if (error.message.includes("add up to"))
      return { error: "Prices changed while you were filling this in. Try again." }
    return { error: "We couldn't record the sale. Try again." }
  }

  redirect(`/app/sales/${saleId}`)
}
