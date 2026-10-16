import { Package, Plus } from "lucide-react"
import { AppShell } from "@/components/app/app-shell"
import { Badge, ButtonLink, Card, CardTitle, EmptyState, PageHeader, Stat, Table } from "@/components/app/ui"

// Vista previa temporal con datos de ejemplo. No se commitea.
export default function P() {
  const rows = [
    ["Ana Gutierrez", "6123-4567", "$45.20"],
    ["Luis Chen", "6987-1122", "$0.00"],
    ["Maria Rodriguez", "-", "$128.75"],
  ]
  return (
    <AppShell businessName="Mini Super La Esquina">
      <header className="mb-6">
        <p className="eyebrow">Mini Super La Esquina</p>
        <h1 className="section-title mt-1">Dashboard</h1>
      </header>
      <div className="grid gap-4 sm:grid-cols-3">
        <Stat label="Outstanding credit" value="$1,284.50" note="Total owed across open sales" />
        <Stat label="Customers with debt" value="17" />
        <Stat label="Collected this week" value="$312.00" note="Payments in the last 7 days" />
      </div>
      <div className="mt-6">
        <PageHeader title="Customers" description="Everyone you sell to on credit." action={<ButtonLink href="#"><Plus className="h-4 w-4" />Add customer</ButtonLink>} />
        <Card>
          <Table head={["Name", "Phone", "Balance"]}>
            {rows.map(([n, p, b]) => (
              <tr key={n}><td className="px-2 py-3 font-medium">{n}</td><td className="px-2 py-3 text-right text-marron/70">{p}</td><td className="px-2 py-3 text-right font-semibold text-rojo">{b}</td></tr>
            ))}
          </Table>
        </Card>
      </div>
      <Card className="mt-4">
        <CardTitle>Inventory</CardTitle>
        <div className="mb-4 flex gap-2"><Badge tone="red">Out of stock</Badge><Badge tone="yellow">Low stock</Badge><Badge tone="neutral">Paid</Badge></div>
        <EmptyState icon={Package} title="No products yet" body="Add what you sell so you can track stock and use it in credit sales." action={{ href: "#", label: "Add your first product" }} />
      </Card>
    </AppShell>
  )
}
