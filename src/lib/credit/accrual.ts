import { dailyBalances } from "./balance"
import { daysBetween } from "./dates"
import { divideRoundHalfUp } from "./money"
import type { Installment, IsoDate, Movement } from "./types"

// Tasa diaria = tasa mensual / 30, en dias calendario. El 10.000 convierte los puntos
// base a proporcion: 500 bp = 5% = 500/10.000.
const DAYS_PER_MONTH = 30
const BASIS_POINTS = 10_000

export type AccrualInput = {
  movements: Movement[]
  periodStart: IsoDate
  periodEnd: IsoDate
  /** Tasa mensual en puntos base. 5% mensual = 500. */
  monthlyRateBp: number
}

/**
 * Interes simple sobre saldo diario. El interes no genera interes: lo que se devenga en
 * el periodo sale del saldo de cada dia, no de un saldo que ya incluya intereses previos.
 *
 * Un solo redondeo, al final. Redondear dia por dia acumula error: treinta redondeos
 * sobre un saldo chico pueden desviarse varios centavos respecto del total real.
 */
export function accrueInterest({ movements, periodStart, periodEnd, monthlyRateBp }: AccrualInput): number {
  if (monthlyRateBp === 0) return 0

  const balances = dailyBalances(movements, periodStart, periodEnd)
  // Un dia con saldo negativo aporta cero, no negativo: el cliente que pago de mas no
  // gana intereses a su favor. Es una decision de negocio, no de aritmetica.
  const total = balances.reduce((sum, balance) => sum + Math.max(balance, 0), 0)

  return divideRoundHalfUp(total * monthlyRateBp, DAYS_PER_MONTH * BASIS_POINTS)
}

export type LateFeeInput = {
  installments: Installment[]
  periodStart: IsoDate
  periodEnd: IsoDate
  /** Tasa de mora mensual en puntos base. */
  lateRateBp: number
  graceDays: number
}

/**
 * Mora sobre la porcion vencida, con el mismo metodo y el mismo redondeo que el interes
 * corriente.
 *
 * Solo corre sobre cuotas impagas y solo despues de los dias de gracia. Una cuota pagada
 * no devenga mora aunque se haya pagado tarde: la mora del atraso ya corrio en los
 * periodos en que estuvo impaga.
 */
export function accrueLateFee({ installments, periodStart, periodEnd, lateRateBp, graceDays }: LateFeeInput): number {
  if (lateRateBp === 0) return 0

  let total = 0
  for (const installment of installments) {
    if (installment.paidDate !== null) continue

    // Primer dia en mora: el siguiente al vencimiento mas la gracia.
    const firstLateDay = daysBetween(periodStart, installment.dueDate) + graceDays + 1
    const lastDay = daysBetween(periodStart, periodEnd)

    const from = Math.max(firstLateDay, 0)
    if (from > lastDay) continue

    total += installment.amountCents * (lastDay - from + 1)
  }

  return divideRoundHalfUp(total * lateRateBp, DAYS_PER_MONTH * BASIS_POINTS)
}
