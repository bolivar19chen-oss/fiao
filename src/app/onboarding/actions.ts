"use server"

import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"

export type OnboardingState = { error: string; name: string } | null

export async function createBusiness(_prev: OnboardingState, formData: FormData): Promise<OnboardingState> {
  const name = String(formData.get("name") ?? "").trim()
  if (!name) return { error: "Enter your store's name.", name }
  if (name.length > 80) return { error: "Keep the name under 80 characters.", name }

  const supabase = await createClient()
  const { error } = await supabase.rpc("create_business", { p_name: name })
  if (error) return { error: "We couldn't create your store. Try again.", name }

  redirect("/app")
}
