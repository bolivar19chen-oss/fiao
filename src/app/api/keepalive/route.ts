import { createClient } from "@/lib/supabase/server"

// La llama a diario el cron de vercel.json. Un proyecto gratuito de Supabase se pausa a los
// 7 dias sin actividad, y con eso se caen el login y toda la app: una consulta minima al dia
// lo mantiene despierto. Sin sesion RLS no devuelve filas, pero la base trabaja igual.
export const dynamic = "force-dynamic"

export async function GET() {
  const supabase = await createClient()
  const { error } = await supabase.from("panama_divisions").select("code", { head: true }).limit(1)
  return Response.json({ ok: !error }, { status: error ? 503 : 200 })
}
