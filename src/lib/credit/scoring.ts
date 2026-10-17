import { daysBetween, monthsBetween } from "./dates"
import { divideRoundHalfUp } from "./money"
import type { Installment, IsoDate } from "./types"

// Pesos de PLAN.md Fase 0. Suman 100.
const WEIGHTS = { punctuality: 40, debtRatio: 30, tenure: 20, frequency: 10 } as const

const TENURE_CAP_MONTHS = 24
const FREQUENCY_CAP_SALES = 12

export type ScoreInput = {
  installments: Installment[]
  currentBalanceCents: number
  /** null si el negocio no fijo limite. */
  creditLimitCents: number | null
  /** null si el cliente nunca compro. */
  firstSaleDate: IsoDate | null
  salesLast12Months: number
  asOf: IsoDate
}

export type ScoreBreakdown = {
  punctuality: number
  debtRatio: number
  tenure: number
  frequency: number
}

/**
 * Una fraccion exacta, en enteros. Nada de 0.7: el puntaje se calcula sin coma flotante
 * para que el desglose sume siempre el total.
 */
type Fraction = { numerator: number; denominator: number } | null

/**
 * Factor de puntualidad por cuota, en decimos. Una cuota impaga usa su atraso al dia de
 * `asOf`: no pagar es peor que pagar tarde, no neutral.
 */
function punctualityTenths(installment: Installment, asOf: IsoDate): number {
  const reference = installment.paidDate ?? asOf
  const daysLate = daysBetween(installment.dueDate, reference)

  if (daysLate <= 0) return 10
  if (daysLate <= 7) return 7
  if (daysLate <= 30) return 3
  return 0
}

function punctuality(installments: Installment[], asOf: IsoDate): Fraction {
  if (installments.length === 0) return null
  const numerator = installments.reduce((sum, installment) => sum + punctualityTenths(installment, asOf), 0)
  return { numerator, denominator: installments.length * 10 }
}

function debtRatio(balanceCents: number, limitCents: number | null): Fraction {
  if (limitCents === null || limitCents <= 0) return null
  // Menos deuda usada, mejor. Acotado a [0, limite] por los dos lados: por encima del
  // limite el factor es cero, y un saldo negativo (pago de mas) no puede pasar de 1, que
  // empujaria el puntaje por encima de 100.
  const unused = Math.min(Math.max(limitCents - balanceCents, 0), limitCents)
  return { numerator: unused, denominator: limitCents }
}

function tenure(firstSaleDate: IsoDate | null, asOf: IsoDate): Fraction {
  if (firstSaleDate === null) return null
  const months = Math.min(Math.max(monthsBetween(firstSaleDate, asOf), 0), TENURE_CAP_MONTHS)
  return { numerator: months, denominator: TENURE_CAP_MONTHS }
}

function frequency(salesLast12Months: number, firstSaleDate: IsoDate | null): Fraction {
  // Sin primera venta no hay historial que medir. Contar cero compras como "frecuencia
  // cero" castigaria a un cliente nuevo por no tener pasado, que no es lo mismo que
  // comprar poco.
  if (firstSaleDate === null) return null
  const sales = Math.min(Math.max(salesLast12Months, 0), FREQUENCY_CAP_SALES)
  return { numerator: sales, denominator: FREQUENCY_CAP_SALES }
}

/**
 * Puntaje de reputacion dentro de la tienda, de 0 a 100, con su desglose.
 *
 * `score` es null cuando no hay nada que medir: cliente nuevo, sin compras, sin cuotas y
 * sin limite fijado. Devolver 0 seria mentir, porque 0 se lee como "paga pesimo" y lo que
 * pasa es que no hay informacion. La interfaz tiene que mostrar esa diferencia.
 *
 * **Renormalizacion:** un factor que no se puede calcular se saca del reparto y su peso
 * se reparte entre los demas, en lugar de contar como cero. Sin esto, un cliente al que
 * el negocio no le fijo limite perderia 30 puntos por una decision que no es suya.
 *
 * **El desglose suma el puntaje, siempre.** Se redondea cada parte y el total es la suma
 * de las partes ya redondeadas, nunca al reves. Si la suma no diera, la explicacion que
 * ve el dueno seria falsa.
 */
export function creditScore(input: ScoreInput): { score: number | null; breakdown: ScoreBreakdown } {
  const factors = {
    punctuality: punctuality(input.installments, input.asOf),
    debtRatio: debtRatio(input.currentBalanceCents, input.creditLimitCents),
    tenure: tenure(input.firstSaleDate, input.asOf),
    frequency: frequency(input.salesLast12Months, input.firstSaleDate),
  }

  const availableWeight = (Object.keys(factors) as (keyof typeof factors)[]).reduce(
    (sum, key) => (factors[key] === null ? sum : sum + WEIGHTS[key]),
    0,
  )

  const breakdown: ScoreBreakdown = { punctuality: 0, debtRatio: 0, tenure: 0, frequency: 0 }
  if (availableWeight === 0) return { score: null, breakdown }

  for (const key of Object.keys(factors) as (keyof typeof factors)[]) {
    const fraction = factors[key]
    if (fraction === null) continue
    // peso efectivo = WEIGHTS[key] * 100 / availableWeight, resuelto dentro de la misma
    // division para no redondear dos veces.
    breakdown[key] = divideRoundHalfUp(fraction.numerator * WEIGHTS[key] * 100, fraction.denominator * availableWeight)
  }

  const score = breakdown.punctuality + breakdown.debtRatio + breakdown.tenure + breakdown.frequency
  return { score, breakdown }
}
