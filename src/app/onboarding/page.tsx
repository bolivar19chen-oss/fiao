import type { Metadata } from "next"
import { redirect } from "next/navigation"
import { Logo } from "@/components/layout/logo"
import { Aurora } from "@/components/ui/aurora"
import { getCurrentBusiness } from "@/lib/business"
import { OnboardingForm } from "./onboarding-form"

export const metadata: Metadata = { title: "Set up your store - FIA'O" }

export default async function OnboardingPage() {
  if (await getCurrentBusiness()) redirect("/app")

  return (
    <main className="relative isolate flex min-h-[100dvh] items-center justify-center overflow-hidden px-4 py-16">
      <Aurora />
      <div className="glass w-full max-w-md rounded-[2rem] p-8 sm:p-10">
        <Logo />
        <p className="eyebrow mt-8">Welcome</p>
        <h1 className="mt-2 font-display text-3xl font-semibold tracking-tight text-marron">Name your store</h1>
        <p className="mt-2 text-[15px] text-marron/70">
          This is how your store shows up in FIA&apos;O. You can change it later in Settings.
        </p>
        <OnboardingForm />
      </div>
    </main>
  )
}
