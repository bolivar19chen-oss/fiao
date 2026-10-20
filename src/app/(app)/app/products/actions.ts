"use server"

import { revalidatePath } from "next/cache"
import { redirect } from "next/navigation"

import { requireBusiness } from "@/lib/business"
import { parseCents } from "@/lib/format"
import { createClient } from "@/lib/supabase/server"
import type { FormState } from "@/components/app/action-form"

function readCount(formData: FormData, key: string) {
  const raw = String(formData.get(key) ?? "").trim()
  if (raw === "") return 0
  return /^\d{1,7}$/.test(raw) ? Number(raw) : null
}

// Precio, stock y umbral: comunes al alta y a la edicion.
function readStock(
  formData: FormData,
): { error: string } | { price_cents: number; stock: number; low_stock_threshold: number } {
  const price_cents = parseCents(String(formData.get("price") ?? ""))
  if (price_cents === null) return { error: "Enter a valid price, for example 1.50." }
  const stock = readCount(formData, "stock")
  if (stock === null) return { error: "Stock must be a whole number, 0 or more." }
  const low_stock_threshold = readCount(formData, "low_stock_threshold")
  if (low_stock_threshold === null) return { error: "The low stock alert must be a whole number, 0 or more." }
  return { price_cents, stock, low_stock_threshold }
}

export async function createProduct(_prev: FormState, formData: FormData): Promise<FormState> {
  const business = await requireBusiness()
  const name = String(formData.get("name") ?? "").trim()
  if (!name) return { error: "Enter the product name." }
  if (name.length > 120) return { error: "Keep the name under 120 characters." }
  const values = readStock(formData)
  if ("error" in values) return values

  const supabase = await createClient()
  const { error } = await supabase.from("products").insert({ business_id: business.id, name, ...values })
  if (error) return { error: "We couldn't save the product. Try again." }

  redirect("/app/products")
}

export async function updateProduct(_prev: FormState, formData: FormData): Promise<FormState> {
  const business = await requireBusiness()
  const id = String(formData.get("id") ?? "")
  const values = readStock(formData)
  if ("error" in values) return values

  const supabase = await createClient()
  const { data, error } = await supabase
    .from("products")
    .update(values)
    .eq("business_id", business.id)
    .eq("id", id)
    .select("id")
  if (error || data.length === 0) return { error: "We couldn't save the changes. Try again." }

  revalidatePath("/app/products", "layout")
  return { ok: "Changes saved." }
}
