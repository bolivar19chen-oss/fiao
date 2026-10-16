import type { Metadata } from "next"
import { redirect } from "next/navigation"
import { Logo } from "@/components/layout/logo"
import { Aurora } from "@/components/ui/aurora"
import { getCurrentProfile } from "@/lib/profile"
import { InviteForm } from "./invite-form"

export const metadata: Metadata = { title: "Enter your invite code - FIA'O" }

export default async function InvitePage() {
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
