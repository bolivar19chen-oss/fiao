"use server"

import { revalidatePath } from "next/cache"

import { requireBusiness } from "@/lib/business"
import { parseCents } from "@/lib/format"
import { createClient } from "@/lib/supabase/server"

export type PaymentState = { error: string } | { ok: true } | null

export const METHODS = ["cash", "yappy", "card", "paypal"] as const
export type Method = (typeof METHODS)[number]

const isMethod = (value: string): value is Method => (METHODS as readonly string[]).includes(value)

/**
 * Registra un abono.
 *
 * El saldo lo mueve la base en la misma transaccion (`register_payment`), no esta accion:
 * en dos pasos, un fallo entre medio dejaria el pago registrado y la deuda intacta.
 *
 * `client_token` llega del navegador, no se genera aca. Es lo que hace que un doble clic,
 * un reintento de la red o la cola offline no cobren dos veces.
 */
export async function recordPayment(_prev: PaymentState, data: FormData): Promise<PaymentState> {
  const saleId = String(data.get("sale_id") ?? "")
  const method = String(data.get("method") ?? "")
  const token = String(data.get("client_token") ?? "")
  const reference = String(data.get("provider_ref") ?? "").trim()

  if (!saleId || !token) return { error: "Something went wrong. Reload the page and try again." }
  if (!isMethod(method)) return { error: "Choose how the customer paid." }

  const cents = parseCents(String(data.get("amount") ?? ""))
  if (cents === null || cents <= 0) return { error: "Enter the amount they paid." }

  // En efectivo no hay nada que referenciar; en los demas, la referencia es la que frena
  // un webhook entregado dos veces.
  if (method !== "cash" && !reference) return { error: "Enter the reference from the receipt." }

  await requireBusiness()
  const supabase = await createClient()
  const { error } = await supabase.rpc("register_payment", {
    p_sale_id: saleId,
    p_amount_cents: cents,
    p_method: method,
    p_client_token: token,
    // Omitido en efectivo: la funcion lo toma como null por defecto.
    p_provider_ref: method === "cash" ? undefined : reference,
  })

  if (error) {
    // El unico mensaje que le sirve al usuario es el del monto; el resto es ruido.
    const tooMuch = error.message.includes("larger than the balance")
    return { error: tooMuch ? "That is more than the balance on this sale." : "We couldn't record the payment." }
  }

  revalidatePath(`/app/sales/${saleId}`)
  revalidatePath("/app")
  return { ok: true }
}
