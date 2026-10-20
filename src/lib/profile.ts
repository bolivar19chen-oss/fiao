import { cache } from "react"

import { createClient } from "@/lib/supabase/server"

export type Profile = {
  userId: string
  role: "business" | "customer"
  fullName: string
  /** Null en los perfiles creados antes de la migracion 20261020120000. */
  province: string | null
}

// Perfil del usuario actual, o null si todavia no eligio rol. Es lo que decide a donde
// entra: sin perfil, a /onboarding. cache() evita repetir la consulta entre el layout y
// la pagina del mismo request, igual que getCurrentBusiness.
export const getCurrentProfile = cache(async (): Promise<Profile | null> => {
  const supabase = await createClient()
  const { data: auth } = await supabase.auth.getClaims()
  if (!auth) return null

  // La RLS ya limita a la fila propia; el filtro es para que la consulta use la PK.
  const { data } = await supabase
    .from("profiles")
    .select("user_id, role, full_name, province")
    .eq("user_id", auth.claims.sub)
    .maybeSingle()

  if (!data) return null
  return {
    userId: data.user_id,
    role: data.role as Profile["role"],
    fullName: data.full_name,
    province: data.province,
  }
})
