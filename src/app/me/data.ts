import { cache } from "react"

import { addDays, eachDay } from "@/lib/credit"
import { customerAccount, today, type SaleRow } from "@/lib/credit-account"
import type { ScoreBreakdown } from "@/lib/credit/scoring"
import { requireCustomer, type Profile } from "@/lib/profile"
import { createClient } from "@/lib/supabase/server"

const DAYS_SHOWN = 7

export type Creditor = {
  id: string
  name: string
  balanceCents: number
  score: number | null
  breakdown: ScoreBreakdown
  weights: ScoreBreakdown
  overdue: boolean
}

export type NextPayment = { shop: string; dueDate: string; amountCents: number; overdue: boolean }
export type Day = { label: string; cents: number }

export type MeData = {
  profile: Profile
  creditors: Creditor[]
  totalCents: number
  overdueCents: number
  next: NextPayment | null
  week: Day[]
}

type AccountRow = {
  id: string
  business_id: string
  credit_score: number | null
  sales: SaleRow[]
}

const weekdayOf = (iso: string) =>
  // Mediodia UTC: la fecha ya viene resuelta en Panama, y asi ningun huso la corre un dia.
  new Date(`${iso}T12:00:00Z`).toLocaleDateString("en-US", { weekday: "short", timeZone: "UTC" })

/**
 * Todo lo que las pantallas de /me necesitan, en una sola consulta.
 *
 * `cache()` la deja correr una vez por request aunque la pidan el layout y la pagina, que
 * es exactamente lo que pasa ahora que cada icono es una ruta. Sin esto, cinco pantallas
 * serian cinco consultas iguales.
 *
 * El estado lo decide el motor, no la consulta: es el mismo calculo que ve el dueno. Si
 * las dos pantallas dijeran cosas distintas, el mostrador se convierte en discusion.
 */
export const getMeData = cache(async (): Promise<MeData> => {
  const profile = await requireCustomer()

  const supabase = await createClient()
  const asOf = today()

  // La RLS limita a las filas del propio cliente: no hace falta filtrar por user_id.
  //
  // El nombre de la tienda NO sale de un join embebido. `businesses_select` exige ser
  // miembro del negocio y un cliente no lo es, asi que el join devolvia null y la
  // pantalla entera decia "Shop". Viene de my_shop_names(), que devuelve solo id y
  // nombre de las tiendas a las que este usuario esta vinculado.
  const [{ data }, { data: shops }] = await Promise.all([
    supabase
      .from("customers")
      .select(
        "id, business_id, credit_score, sales(id, total_cents, created_at, payments(amount_cents, paid_at), installments(due_date, amount_cents))",
      ),
    supabase.rpc("my_shop_names"),
  ])

  const rows = (data ?? []) as unknown as AccountRow[]
  const shopName = new Map((shops ?? []).map((shop) => [shop.business_id, shop.name]))

  const creditors: Creditor[] = []
  let next: NextPayment | null = null

  for (const row of rows) {
    const name = shopName.get(row.business_id) ?? "Shop"
    const account = customerAccount(row.sales, asOf)

    creditors.push({
      id: row.id,
      name,
      balanceCents: account.balanceCents,
      score: account.score,
      breakdown: account.breakdown,
      weights: account.weights,
      overdue: account.status === "OVERDUE",
    })

    // La cuota sin pagar mas proxima, de todas las tiendas: es lo que trae al cliente.
    for (const installment of account.installments) {
      if (installment.paidDate !== null) continue
      if (next === null || installment.dueDate < next.dueDate) {
        next = {
          shop: name,
          dueDate: installment.dueDate,
          amountCents: installment.amountCents,
          overdue: installment.dueDate < asOf,
        }
      }
    }
  }

  const owing = creditors.filter((c) => c.balanceCents > 0)
  const totalCents = owing.reduce((sum, c) => sum + c.balanceCents, 0)
  const overdueCents = owing.filter((c) => c.overdue).reduce((sum, c) => sum + c.balanceCents, 0)

  const days = eachDay(addDays(asOf, -(DAYS_SHOWN - 1)), asOf)
  const paidOn = new Map<string, number>(days.map((day) => [day, 0]))
  for (const row of rows) {
    for (const sale of row.sales) {
      for (const payment of sale.payments) {
        const day = payment.paid_at.slice(0, 10)
        const current = paidOn.get(day)
        if (current !== undefined) paidOn.set(day, current + payment.amount_cents)
      }
    }
  }

  return {
    profile,
    creditors,
    totalCents,
    overdueCents,
    next,
    week: days.map((day) => ({ label: weekdayOf(day), cents: paidOn.get(day) ?? 0 })),
  }
})
