import type { Database } from "@shared/types/database"
import { createBrowserClient } from "@supabase/ssr"

// Cliente para componentes "use client". La sesion vive en cookies, legibles por el servidor.
export function createClient() {
  return createBrowserClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  )
}
