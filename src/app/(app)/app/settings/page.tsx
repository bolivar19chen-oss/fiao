import type { Metadata } from "next"

import { requireBusiness } from "@/lib/business"
import { formatDate } from "@/lib/format"
import { createClient } from "@/lib/supabase/server"
import { ActionForm } from "@/components/app/action-form"
import { Badge, Card, CardTitle, Field, PageHeader } from "@/components/app/ui"
import { AvatarField } from "@/components/onboarding/avatar-field"
import { ThemeToggle } from "@/components/ui/theme-toggle"

import { updateBusinessName } from "./actions"

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
        <CardTitle>Interest rates</CardTitle>
        <p className="text-sm text-marron/65">You will set your credit interest rates here once credit sales open.</p>
      </Card>
    </div>
  )
}
