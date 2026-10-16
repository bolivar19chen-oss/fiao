"use client"

import { useState } from "react"
import { RoleFlipCard, type Role } from "@/components/onboarding/role-flip-card"
import { BusinessForm } from "./business-form"
import { CustomerForm } from "./customer-form"

export function OnboardingFlow({ email }: { email: string }) {
  const [role, setRole] = useState<Role | null>(null)

  if (role === "business") return <BusinessForm onBack={() => setRole(null)} />
  if (role === "customer") return <CustomerForm email={email} onBack={() => setRole(null)} />

  return (
    <div className="flex flex-col items-center">
      <p className="eyebrow">Welcome</p>
      <h1 className="mt-2 text-center font-display text-3xl font-semibold tracking-tight text-marron">
        How will you use FIA&apos;O?
      </h1>
      <p className="mb-8 mt-2 max-w-sm text-center text-[15px] text-marron/70">
        You can be both. Plenty of shop owners also buy on credit somewhere else.
      </p>
      <RoleFlipCard onChoose={setRole} />
    </div>
  )
}
