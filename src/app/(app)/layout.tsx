import { redirect } from "next/navigation"

import { getCurrentBusiness } from "@/lib/business"
import { getLang } from "@/lib/lang"
import { AppShell } from "@/components/app/app-shell"
import { CookieNotice } from "@/components/layout/cookie-notice"

// La sesion ya la exige el middleware. La pertenencia a un negocio se comprueba aca y no
// en el middleware para no consultar la base en cada request (ver lib/supabase/middleware).
export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const [business, lang] = await Promise.all([getCurrentBusiness(), getLang()])
  if (!business) redirect("/onboarding")

  return (
    <>
      <AppShell businessName={business.name} lang={lang}>
        {children}
      </AppShell>
      <CookieNotice />
    </>
  )
}
