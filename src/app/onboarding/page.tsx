import type { Metadata } from "next"
import { redirect } from "next/navigation"
import { Logo } from "@/components/layout/logo"
import { Aurora } from "@/components/ui/aurora"
import { getCurrentProfile } from "@/lib/profile"
import { createClient } from "@/lib/supabase/server"
import { OnboardingFlow } from "./onboarding-flow"

export const metadata: Metadata = { title: "Welcome - FIA'O" }

export default async function OnboardingPage() {
  // Quien ya eligio rol no vuelve a ver la tarjeta.
  const profile = await getCurrentProfile()
  if (profile) redirect(profile.role === "business" ? "/app" : "/me")

  const supabase = await createClient()
  const { data } = await supabase.auth.getClaims()
  const email = (data?.claims.email as string | undefined) ?? ""

  return (
    <main className="relative isolate flex min-h-[100dvh] flex-col items-center overflow-hidden px-4 py-14">
      <Aurora />
      <Logo className="mb-10" />
      <OnboardingFlow email={email} />
    </main>
  )
}
