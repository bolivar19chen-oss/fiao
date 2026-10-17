import {
  accountStatus,
  balanceFrom,
  creditScore,
  settleInstallments,
  type AccountStatus,
  type Installment,
  type IsoDate,
  type Movement,
  type ScoreBreakdown,
} from "@/lib/credit"

// Adaptador entre las filas de la base y el motor puro.
//
// Vive fuera de src/lib/credit/ a proposito: aca si se lee el reloj y se conocen los
// nombres de las columnas. El motor no sabe nada de ninguna de las dos cosas, y por eso
// se puede probar sin base de datos.

/** Fecha de hoy en Panama. El motor nunca la calcula: la recibe. */
export function today(): IsoDate {
  // en-CA da ISO (2026-10-17); la zona fija evita que el servidor en UTC adelante el dia.
  return new Date().toLocaleDateString("en-CA", { timeZone: "America/Panama" })
}

export type SaleRow = {
  id: string
  total_cents: number
  created_at: string
  payments: { amount_cents: number; paid_at: string }[]
  installments?: { due_date: string; amount_cents: number }[]
}

export type CustomerAccount = {
  balanceCents: number
  status: AccountStatus
  score: number | null
  breakdown: ScoreBreakdown
  installments: Installment[]
}

const dateOf = (timestamp: string): IsoDate => timestamp.slice(0, 10)

/**
 * Calcula el estado de cuenta de un cliente con el motor.
 *
 * Dos cosas quedan en su valor por defecto hasta que exista la migracion de intereses
 * (docs/MODELO-CREDITO.md seccion 5):
 * - `creditLimitCents` es null porque la columna todavia no existe. El motor lo maneja:
 *   saca ese factor del reparto en vez de contarlo como cero.
 * - `graceDays` es 0 porque tampoco existe la columna del negocio.
 */
export function customerAccount(sales: SaleRow[], asOf: IsoDate = today()): CustomerAccount {
  const movements: Movement[] = []
  const pending: Omit<Installment, "paidDate">[] = []
  const payments: { date: IsoDate; cents: number }[] = []

  for (const sale of sales) {
    movements.push({ date: dateOf(sale.created_at), cents: sale.total_cents })
    for (const payment of sale.payments) {
      movements.push({ date: dateOf(payment.paid_at), cents: -payment.amount_cents })
      payments.push({ date: dateOf(payment.paid_at), cents: payment.amount_cents })
    }
    for (const installment of sale.installments ?? []) {
      pending.push({ dueDate: installment.due_date, amountCents: installment.amount_cents })
    }
  }

  const installments = settleInstallments(pending, payments)
  const balanceCents = balanceFrom(movements)

  const firstSale = sales.map((sale) => dateOf(sale.created_at)).sort()[0] ?? null
  const yearAgo = `${Number(asOf.slice(0, 4)) - 1}${asOf.slice(4)}`
  const salesLast12Months = sales.filter((sale) => dateOf(sale.created_at) >= yearAgo).length

  const { score, breakdown } = creditScore({
    installments,
    currentBalanceCents: balanceCents,
    creditLimitCents: null,
    firstSaleDate: firstSale,
    salesLast12Months,
    asOf,
  })

  return {
    balanceCents,
    status: accountStatus({ balanceCents, installments, graceDays: 0, asOf }),
    score,
    breakdown,
    installments,
  }
}
