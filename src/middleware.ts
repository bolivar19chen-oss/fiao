import type { NextRequest } from "next/server"

import { updateSession } from "@/lib/supabase/middleware"

// Va en src/ y no en la raiz: con src/app, Next solo carga src/middleware.ts.
export async function middleware(request: NextRequest) {
  return updateSession(request)
}

export const config = {
  // Todo menos assets estaticos e imagenes.
  matcher: ["/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico)$).*)"],
}
