import type { Metadata } from "next"

import { requireBusiness } from "@/lib/business"
import { basisPointsToInput, formatDate } from "@/lib/format"
import { createClient } from "@/lib/supabase/server"
import { ActionForm } from "@/components/app/action-form"
import { Badge, Card, CardTitle, Field, PageHeader } from "@/components/app/ui"
import { AvatarField } from "@/components/onboarding/avatar-field"
import { ThemeToggle } from "@/components/ui/theme-toggle"

import { updateBusinessName, updateCreditTerms } from "./actions"

export const metadata: Metadata = { title: "Settings - FIA'O" }

export default async function SettingsPage() {
  const business = await requireBusiness()
  const supabase = await createClient()
  const { data } = await supabase
    .from("business_members")
    .select("user_id, role, created_at")
    .eq("business_id", business.id)
    .order("created_at")
  const members = data ?? []

  // Los terminos del credito. requireBusiness() solo trae identidad y rol.
  const { data: row } = await supabase
    .from("businesses")
    .select("monthly_rate_bp, late_rate_bp, grace_days, default_installments, installment_days")
    .eq("id", business.id)
    .single()
  const terms = row ?? {
    monthly_rate_bp: 0,
    late_rate_bp: 0,
    grace_days: 0,
    default_installments: 2,
    installment_days: 15,
  }

  return (
    <div className="max-w-2xl">
      <PageHeader title="Settings" />
      <Card>
        <CardTitle>Store</CardTitle>
        {business.role === "owner" ? (
          <ActionForm action={updateBusinessName} submitLabel="Save name" pendingLabel="Saving...">
            <Field label="Store name" name="name" required maxLength={80} defaultValue={business.name} />
          </ActionForm>
        ) : (
          <p className="text-[15px] text-marron">{business.name}</p>
        )}
      </Card>

      <Card className="mt-4">
        <CardTitle>Your photo</CardTitle>
        <AvatarField />
      </Card>

      <Card className="mt-4">
        <CardTitle>Team</CardTitle>
        {/* Los emails viven en auth.users, que no se expone al cliente: se muestra el rol. */}
        <ul className="divide-y divide-marron/[0.07]">
          {members.map((m) => (
            <li key={m.user_id} className="flex items-center justify-between gap-3 py-3">
              <div>
                <p className="font-medium text-marron">{m.user_id === business.userId ? "You" : "Team member"}</p>
                <p className="text-xs text-marron/55">Joined {formatDate(m.created_at)}</p>
              </div>
              <Badge tone={m.role === "owner" ? "red" : "neutral"}>{m.role === "owner" ? "Owner" : "Staff"}</Badge>
            </li>
          ))}
        </ul>
      </Card>

      <Card className="mt-4">
        <CardTitle>Appearance</CardTitle>
        <div className="flex flex-wrap items-center justify-between gap-3">
          <p className="text-sm text-marron/65">Follows your device unless you pick light or dark.</p>
          <ThemeToggle />
        </div>
      </Card>

      <Card className="mt-4">
        <CardTitle>Credit terms</CardTitle>
        {/* ADR 0009: los pone la tienda. FIA'O no trae ninguno y no comprueba que sean
            legales, asi que lo dice donde se configuran. */}
        <p className="mb-6 text-sm text-marron/65">
          These are your terms, not ours. FIA&apos;O records what you and your customer agree on; it does not check them
          against the law where you sell. Leave the rates at zero if you do not charge interest.
        </p>
        {business.role === "owner" ? (
          <ActionForm action={updateCreditTerms} submitLabel="Save terms" pendingLabel="Saving...">
            <div className="grid gap-4 sm:grid-cols-2">
              <Field
                label="Monthly interest"
                name="monthly_rate"
                look="amount"
                inputMode="decimal"
                defaultValue={basisPointsToInput(terms.monthly_rate_bp)}
                hint="Percent per month. 0 means you charge none."
              />
              <Field
                label="Late fee"
                name="late_rate"
                look="amount"
                inputMode="decimal"
                defaultValue={basisPointsToInput(terms.late_rate_bp)}
                hint="Percent added once a payment is overdue."
              />
              <Field
                label="Grace period"
                name="grace_days"
                look="amount"
                inputMode="numeric"
                defaultValue={String(terms.grace_days)}
                hint="Days after the due date before a payment counts as late."
              />
              <Field
                label="Installments"
                name="default_installments"
                look="amount"
                inputMode="numeric"
                defaultValue={String(terms.default_installments)}
                hint="How many payments a sale is split into by default."
              />
              <Field
                label="Days between installments"
                name="installment_days"
                look="amount"
                inputMode="numeric"
                defaultValue={String(terms.installment_days)}
                hint="15 is every two weeks."
              />
            </div>
          </ActionForm>
        ) : (
          <p className="text-[15px] text-marron/70">Only the owner can change the credit terms.</p>
        )}
        <p className="mt-5 text-xs text-marron/55">
          Changing these does not touch sales you already recorded: each sale keeps the terms it was made under.
        </p>
      </Card>
    </div>
  )
}
