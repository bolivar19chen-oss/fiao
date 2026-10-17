import type { Installment, IsoDate } from "./types"

export type PaymentEntry = {
  date: IsoDate
  /** Monto abonado, positivo. */
  cents: number
}

/**
 * Imputa los abonos a las cuotas, la mas vieja primero, y devuelve cada cuota con la
 * fecha en que quedo saldada.
 *
 * Hace falta porque los abonos se registran contra la venta, no contra una cuota: el
 * cliente paga "veinte dolares", no "la cuota 3". Sin esta regla no hay forma de saber
 * si una cuota se pago tarde, y la puntualidad es el 40% del puntaje.
 *
 * La regla es la mas comun y la mas facil de explicar: lo que entra tapa lo que vence
 * antes. Un abono parcial no salda la cuota; la cuota se da por pagada el dia en que los
 * abonos acumulados llegan a cubrirla entera.
 */
export function settleInstallments(
  installments: Omit<Installment, "paidDate">[],
  payments: PaymentEntry[],
): Installment[] {
  const ordered = [...installments].sort((a, b) => a.dueDate.localeCompare(b.dueDate))
  const byDate = [...payments].sort((a, b) => a.date.localeCompare(b.date))

  let paidSoFar = 0
  let nextPayment = 0
  let owedUpToHere = 0

  return ordered.map((installment) => {
    owedUpToHere += installment.amountCents

    // Avanza por los abonos hasta cubrir todo lo vencido hasta esta cuota inclusive.
    while (paidSoFar < owedUpToHere && nextPayment < byDate.length) {
      paidSoFar += byDate[nextPayment].cents
      nextPayment++
    }

    // El dia que la salda es el del ultimo abono que hizo falta.
    const paidDate = paidSoFar >= owedUpToHere ? byDate[nextPayment - 1].date : null
    return { ...installment, paidDate }
  })
}
