import { redirect } from "next/navigation"
import { cache } from "react"
import { createClient } from "@/lib/supabase/server"

// Negocio activo del usuario. Si tiene varios, el primero que creo o al que lo sumaron:
// el selector de negocio no entra en esta fase. cache() evita repetir la consulta entre el
// layout y la pagina del mismo request.
export const getCurrentBusiness = cache(async () => {
  const supabase = await createClient()
  const { data: auth } = await supabase.auth.getClaims()
  if (!auth) return null

  // Filtro por user_id: la politica de business_members deja ver a todo el equipo.
  const { data } = await supabase
    .from("business_members")
    .select("role, businesses(id, name)")
    .eq("user_id", auth.claims.sub)
    .order("created_at")
    .limit(1)
    .maybeSingle()

  if (!data?.businesses) return null
  return { ...data.businesses, role: data.role, userId: auth.claims.sub }
})

// Para paginas y actions de (app). El layout ya redirige, pero layout y pagina se
// renderizan en paralelo: la pagina no puede asumir que el negocio existe.
export async function requireBusiness() {
  const business = await getCurrentBusiness()
  if (!business) redirect("/onboarding")
  return business
}
