import { createServerClient } from "@supabase/ssr"
import { cookies } from "next/headers"

// Uno nuevo por request: nunca compartir este cliente entre renders.
export async function createClient() {
  const cookieStore = await cookies()

  return createServerClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!, {
    cookies: {
      getAll() {
        return cookieStore.getAll()
      },
      setAll(cookiesToSet) {
        // Desde un Server Component las cookies son de solo lectura y esto lanza.
        // No pasa nada: el middleware ya escribe los refrescos de token.
        try {
          cookiesToSet.forEach(({ name, value, options }) => cookieStore.set(name, value, options))
        } catch {}
      },
    },
  })
}
