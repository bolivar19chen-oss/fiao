import { NextResponse, type NextRequest } from "next/server"

import { createClient } from "@/lib/supabase/server"

// Destino del enlace de confirmacion de email (flujo PKCE): canjea el codigo por sesion.
export async function GET(request: NextRequest) {
  const { searchParams, origin } = request.nextUrl
  const code = searchParams.get("code")

  if (code) {
    const supabase = await createClient()
    const { error } = await supabase.auth.exchangeCodeForSession(code)
    // El layout de (app) manda a /onboarding si todavia no tiene negocio.
    if (!error) return NextResponse.redirect(`${origin}/app`)
  }

  return NextResponse.redirect(`${origin}/login`)
}
