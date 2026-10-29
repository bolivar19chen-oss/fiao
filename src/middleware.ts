import type { NextRequest } from "next/server"

import { updateSession } from "@/lib/supabase/middleware"

// Va en src/ y no en la raiz: con src/app, Next solo carga src/middleware.ts.
export async function middleware(request: NextRequest) {
  return updateSession(request)
}

export const config = {
  // Solo donde la sesion decide algo. Corria en todo el sitio, y cada peticion de la
  // landing (y cada prefetch) pagaba una validacion de JWT contra Supabase para nada:
  // ninguna pagina de marketing lee la sesion.
  matcher: ["/app/:path*", "/me/:path*", "/onboarding/:path*", "/login"],
}
