"use server"

import { redirect } from "next/navigation"
import { siteUrl } from "@/lib/site-url"
import { createClient } from "@/lib/supabase/server"

// email y name vuelven al formulario: React 19 lo resetea tras cada action.
export type AuthState = { error?: string; message?: string; email?: string; name?: string } | null

// El navegador ya valida con required/minLength, pero eso se salta con facilidad: se
// vuelve a validar aca.
function readCredentials(formData: FormData) {
  const email = String(formData.get("email") ?? "").trim()
  const password = String(formData.get("password") ?? "")
  if (!email || !password) return { error: "Enter your email and password.", email }
  return { email, password }
}

export async function logIn(_prev: AuthState, formData: FormData): Promise<AuthState> {
  const credentials = readCredentials(formData)
  if ("error" in credentials) return credentials

  const supabase = await createClient()
  const { error } = await supabase.auth.signInWithPassword(credentials)
  if (error) return { error: error.message, email: credentials.email }

  redirect("/app")
}

export async function signUp(_prev: AuthState, formData: FormData): Promise<AuthState> {
  const credentials = readCredentials(formData)
  if ("error" in credentials) return credentials
  const name = String(formData.get("name") ?? "").trim()
  if (credentials.password.length < 8)
    return { error: "Use at least 8 characters for your password.", email: credentials.email, name }

  const supabase = await createClient()
  const { data, error } = await supabase.auth.signUp({
    ...credentials,
    options: {
      data: { full_name: name },
      // A donde vuelve el enlace del email de confirmacion. Tiene que estar en
      // Authentication > URL Configuration > Redirect URLs del proyecto.
      emailRedirectTo: `${await siteUrl()}/auth/callback`,
    },
  })
  if (error) return { error: error.message, email: credentials.email, name }

  // Sin sesion = el proyecto exige confirmar el email antes de entrar.
  if (!data.session) return { message: "Check your email to confirm your account, then log in." }

  redirect("/onboarding")
}
