import { redirect } from "next/navigation"
import { AppShell } from "@/components/app/app-shell"
import { getCurrentBusiness } from "@/lib/business"

// La sesion ya la exige el middleware. La pertenencia a un negocio se comprueba aca y no
// en el middleware para no consultar la base en cada request (ver lib/supabase/middleware).
export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const business = await getCurrentBusiness()
  if (!business) redirect("/onboarding")

  return <AppShell businessName={business.name}>{children}</AppShell>
}
