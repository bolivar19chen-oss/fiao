"use server"

import { revalidatePath } from "next/cache"
import { redirect } from "next/navigation"

import { requireBusiness } from "@/lib/business"
import { createClient } from "@/lib/supabase/server"
import type { FormState } from "@/components/app/action-form"

export async function createCustomer(_prev: FormState, formData: FormData): Promise<FormState> {
  const business = await requireBusiness()
  const name = String(formData.get("name") ?? "").trim()
  const phone = String(formData.get("phone") ?? "").trim()
  const notes = String(formData.get("notes") ?? "").trim()

  if (!name) return { error: "Enter the customer's name." }
  if (name.length > 120) return { error: "Keep the name under 120 characters." }
  if (phone && !/^[\d\s()+-]{6,20}$/.test(phone)) return { error: "Enter a valid phone number." }
  if (notes.length > 500) return { error: "Keep the notes under 500 characters." }

  const supabase = await createClient()
  const { data, error } = await supabase
    .from("customers")
    .insert({ business_id: business.id, name, phone: phone || null, notes: notes || null })
    .select("id")
    .single()
  if (error) return { error: "We couldn't save the customer. Try again." }

  // Con el cache del router (staleTimes) la lista vieja seguiria en memoria sin esto.
  revalidatePath("/app/customers")
  redirect(`/app/customers/${data.id}`)
}
