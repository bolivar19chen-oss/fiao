"use server"

import { redirect } from "next/navigation"
import { isAuthRetryableFetchError, type AuthError } from "@supabase/supabase-js"

import { siteUrl } from "@/lib/site-url"
import { createClient } from "@/lib/supabase/server"

// email y name vuelven al formulario: React 19 lo resetea tras cada action.
export type AuthState = { error?: string; message?: string; email?: string; name?: string } | null

// Si el servicio no responde (caido o pausado), supabase-js devuelve "fetch failed": eso no
// le dice nada a quien intenta entrar, y parece que escribio mal la clave.
const authMessage = (error: AuthError) =>
  isAuthRetryableFetchError(error) ? "We can't reach the server right now. Try again in a few minutes." : error.message

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
  if (error) return { error: authMessage(error), email: credentials.email }

  // A /onboarding y no a /app: es la unica pagina que sabe enrutar por rol, y aca no se
  // puede saber cual es sin consultar la base. Un cliente mandado a /app daria tres
  // saltos antes de llegar a /me.
  redirect("/onboarding")
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
  if (error) return { error: authMessage(error), email: credentials.email, name }

  // El registro entra directo: el proyecto tiene la confirmacion por correo apagada
  // (supabase/config.toml, auth.email.enable_confirmations), asi que signUp devuelve
  // sesion. Si alguien la vuelve a encender, no hay sesion y el alta se corta aca:
  // el aviso queda como red, no como camino normal.
  if (!data.session) return { message: "Your account was created. Log in to continue." }

  redirect("/onboarding")
}
