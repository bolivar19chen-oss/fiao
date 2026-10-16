"use server"

import { revalidatePath } from "next/cache"
import type { FormState } from "@/components/app/action-form"
import { requireBusiness } from "@/lib/business"
import { createClient } from "@/lib/supabase/server"

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
