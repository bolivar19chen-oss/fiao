/** Una fecha sin hora, en formato ISO: "2026-10-16". */
export type IsoDate = string

/**
 * Movimiento del libro. Positivo sube la deuda (venta, interes), negativo la baja
 * (abono). Una reversion es un movimiento con el signo contrario al que corrige.
 */
export type Movement = {
  date: IsoDate
  cents: number
}

export type AccountStatus = "NO_DEBT" | "CURRENT" | "OVERDUE"

export type Installment = {
  dueDate: IsoDate
  amountCents: number
  /** null mientras no se pago. */
  paidDate: IsoDate | null
}
