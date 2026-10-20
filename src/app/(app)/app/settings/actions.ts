"use server"

import { revalidatePath } from "next/cache"

import { requireBusiness } from "@/lib/business"
import { parseBasisPoints } from "@/lib/format"
import { createClient } from "@/lib/supabase/server"
import type { FormState } from "@/components/app/action-form"

export async function updateBusinessName(_prev: FormState, formData: FormData): Promise<FormState> {
  const business = await requireBusiness()
  // RLS ya lo impide; se valida tambien aca para devolver un mensaje claro.
  if (business.role !== "owner") return { error: "Only the owner can rename the store." }

  const name = String(formData.get("name") ?? "").trim()
  if (!name) return { error: "Enter your store's name." }
  if (name.length > 80) return { error: "Keep the name under 80 characters." }

  const supabase = await createClient()
  const { error } = await supabase.from("businesses").update({ name }).eq("id", business.id)
  if (error) return { error: "We couldn't save the name. Try again." }

  // El nombre sale en el shell: se revalida todo /app.
  revalidatePath("/app", "layout")
  return { ok: "Store name saved." }
}

/**
 * Los terminos del credito de esta tienda. ADR 0009: los pone el negocio, FIA'O no trae
 * ninguno y no valida que sean legales.
 *
 * Las tasas llegan como porcentaje con dos decimales y se guardan en puntos base, que es
 * un entero: "1.50" -> 150. Ni un float toca esto, igual que el dinero.
 */
export async function updateCreditTerms(_prev: FormState, formData: FormData): Promise<FormState> {
  const business = await requireBusiness()
  // La RLS ya lo impide; se valida aca para devolver un mensaje que se entienda.
  if (business.role !== "owner") return { error: "Only the owner can change the credit terms." }

  // Union explicita: sin ella TypeScript infiere `error?: undefined` en la rama buena y
  // el `return` de la mala deja de encajar en FormState.
  type Parsed = { error: string } | { value: number }

  const rate = (name: string, label: string): Parsed => {
    const raw = String(formData.get(name) ?? "").trim()
    const bp = raw === "" ? 0 : parseBasisPoints(raw)
    if (bp === null) return { error: `${label} must be a number, like 1.50.` }
    if (bp > 10000) return { error: `${label} cannot be over 100%.` }
    return { value: bp }
  }

  const whole = (name: string, label: string, min: number, max: number): Parsed => {
    const raw = String(formData.get(name) ?? "").trim()
    if (!/^\d{1,3}$/.test(raw)) return { error: `${label} must be a whole number.` }
    const value = Number(raw)
    if (value < min || value > max) return { error: `${label} must be between ${min} and ${max}.` }
    return { value }
  }

  const monthly = rate("monthly_rate", "The monthly interest")
  if ("error" in monthly) return monthly
  const late = rate("late_rate", "The late fee")
  if ("error" in late) return late
  const grace = whole("grace_days", "The grace period", 0, 90)
  if ("error" in grace) return grace
  const installments = whole("default_installments", "The number of installments", 1, 24)
  if ("error" in installments) return installments
  const everyDays = whole("installment_days", "The days between installments", 1, 90)
  if ("error" in everyDays) return everyDays

  const supabase = await createClient()
  const { error } = await supabase
    .from("businesses")
    .update({
      monthly_rate_bp: monthly.value,
      late_rate_bp: late.value,
      grace_days: grace.value,
      default_installments: installments.value,
      installment_days: everyDays.value,
    })
    .eq("id", business.id)
  if (error) return { error: "We couldn't save the terms. Try again." }

  revalidatePath("/app/settings")
  return { ok: "Credit terms saved. They apply to new sales only." }
}
