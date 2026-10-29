import type { Metadata } from "next"

import { ActionForm } from "@/components/app/action-form"
import { Card, Field, PageHeader } from "@/components/app/ui"

import { createCustomer } from "../actions"

export const metadata: Metadata = { title: "New customer - FIA'O" }

export default function NewCustomerPage() {
  return (
    <div className="max-w-xl">
      <PageHeader title="New customer" back={{ href: "/app/customers", label: "Customers" }} />
      <Card>
        <ActionForm action={createCustomer} submitLabel="Save customer" pendingLabel="Saving...">
          <Field label="Name" name="name" required maxLength={120} autoComplete="off" />
          <Field label="Phone" name="phone" type="tel" inputMode="tel" autoComplete="off" hint="Optional" />
          <Field
            label="Notes"
            name="notes"
            maxLength={500}
            autoComplete="off"
            hint="Optional. For example, where they live."
          />
        </ActionForm>
      </Card>
    </div>
  )
}
