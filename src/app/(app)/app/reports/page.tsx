import type { Metadata } from "next"
import { ChartColumn } from "lucide-react"
import { Card, EmptyState, PageHeader } from "@/components/app/ui"

export const metadata: Metadata = { title: "Reports - FIA'O" }

// Contenedor vacio a proposito: las graficas (Recharts) son de una fase posterior.
export default function ReportsPage() {
  return (
    <>
      <PageHeader title="Reports" description="Sales, collections and overdue accounts over time." />
      <Card>
        <EmptyState
          icon={ChartColumn}
          title="Reports are coming soon"
          body="Charts for your sales, collections and late payments arrive in a later update."
        />
      </Card>
    </>
  )
}
