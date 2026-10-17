import type { Metadata } from "next"
import { redirect } from "next/navigation"
import { Logo } from "@/components/layout/logo"
import { Aurora } from "@/components/ui/aurora"
import { getCurrentProfile } from "@/lib/profile"
import { InviteForm } from "./invite-form"

export const metadata: Metadata = { title: "Link a shop - FIA'O" }

// Vive bajo /me y no en el registro a proposito: pedir el codigo no es un paso del alta.
// El cliente se registra desde su casa, mira la app, y vincula la tienda cuando pasa por
// el mostrador y le dan el codigo. Puede volver aca cada vez que sume una tienda nueva.
export default async function LinkShopPage() {
  const profile = await getCurrentProfile()
  if (!profile) redirect("/onboarding")
  if (profile.role === "business") redirect("/app")

  return (
    <main className="relative isolate flex min-h-[100dvh] flex-col items-center overflow-hidden px-4 py-14">
      <Aurora />
      <Logo className="mb-10" />
      <InviteForm />
    </main>
  )
}
