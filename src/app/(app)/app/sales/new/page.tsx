import type { Metadata } from "next"
import { CalendarClock, ClipboardCheck, ShoppingBasket, UserRound } from "lucide-react"
import { Card, PageHeader } from "@/components/app/ui"

export const metadata: Metadata = { title: "New sale - FIA'O" }

// Contenedor con los pasos. El flujo (con intereses y cronograma) es de la fase siguiente:
// se registra en una sola transaccion del servidor, no desde aca.
const steps = [
  { icon: UserRound, title: "Customer", body: "Pick who is buying on credit." },
  { icon: ShoppingBasket, title: "Products", body: "Add items and quantities from your inventory." },
  { icon: CalendarClock, title: "Payment plan", body: "Choose the installments and due dates." },
  { icon: ClipboardCheck, title: "Review", body: "Confirm the total and save the sale." },
]

export default function NewSalePage() {
  return (
    <div className="max-w-2xl">
      <PageHeader title="New sale" back={{ href: "/app/sales", label: "Sales" }} />
      <Card>
        <ol className="flex flex-col gap-3">
          {steps.map(({ icon: Icon, title, body }, i) => (
            <li key={title} className="flex items-center gap-4 rounded-2xl bg-white/50 p-4">
              <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-rojo/10 text-rojo">
                <Icon className="h-5 w-5" strokeWidth={1.75} aria-hidden />
              </span>
              <div>
                <p className="font-display font-semibold text-marron">
                  {i + 1}. {title}
                </p>
                <p className="text-sm text-marron/65">{body}</p>
              </div>
            </li>
          ))}
        </ol>
        <p role="status" className="mt-5 rounded-2xl bg-amarillo/20 px-4 py-3 text-sm text-marron/85">
          Recording credit sales arrives in the next update.
        </p>
      </Card>
    </div>
  )
}
