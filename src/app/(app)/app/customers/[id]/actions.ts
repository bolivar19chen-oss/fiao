"use server"

import { requireBusiness } from "@/lib/business"
import { createClient } from "@/lib/supabase/server"

export type InviteState = { code: string; expiresInHours: number } | { error: string } | null

const TTL_MINUTES = 1440

// El codigo vuelve en claro una sola vez: la base guarda solo su hash y no hay forma de
// recuperarlo. Si el cliente lo pierde, el negocio genera otro.
export async function createInvite(_prev: InviteState, formData: FormData): Promise<InviteState> {
  const customerId = String(formData.get("customer_id") ?? "")
  if (!customerId) return { error: "Missing customer." }

  // La funcion comprueba la membresia por su cuenta; esto ademas corta antes de la
  // llamada si la sesion perdio el negocio.
  await requireBusiness()

  const supabase = await createClient()
  const { data, error } = await supabase.rpc("create_customer_invite", {
    p_customer_id: customerId,
    p_ttl_minutes: TTL_MINUTES,
  })

  if (error || !data) return { error: "We couldn't create an invite code. Try again." }
  return { code: data, expiresInHours: TTL_MINUTES / 60 }
}
