import { addDays } from "./dates"
import { divideRoundHalfUp } from "./money"
import type { IsoDate } from "./types"

/** Una cuota del calendario, antes de existir en la base. */
export type ScheduledInstallment = {
  /** 1, 2, 3... Es el `number` de la tabla `installments`. */
  number: number
  dueDate: IsoDate
  amountCents: number
}

export type ScheduleInput = {
  totalCents: number
  /** Cuantas cuotas. Lo propone el negocio y lo puede cambiar por venta (ADR 0009). */
  count: number
  /** Dias entre una cuota y la siguiente. 15 es quincenal. */
  everyDays: number
  /** Fecha de la venta. La primera cuota vence `everyDays` despues. */
  soldOn: IsoDate
}

/**
 * Reparte el total de una venta en su calendario de cuotas.
 *
 * **Las cuotas suman el total, siempre.** Se reparte con la unica funcion de redondeo
 * del sistema y la ultima absorbe el resto. Repartir 1000 en 3 da 333, 333 y 334, no
 * tres de 333.33: en centavos enteros no existe el tercio, y perder un centavo por
 * venta es perder dinero de verdad.
 *
 * La primera cuota vence `everyDays` despues de la venta, no el mismo dia: fiar y cobrar
 * en el acto no es fiar.
 *
 * Puro, como el resto del motor: la fecha entra como argumento y no toca la base.
 */
export function buildSchedule({ totalCents, count, everyDays, soldOn }: ScheduleInput): ScheduledInstallment[] {
  if (!Number.isInteger(totalCents) || totalCents <= 0) {
    throw new Error("buildSchedule: el total va en centavos enteros y positivos")
  }
  if (!Number.isInteger(count) || count < 1) {
    throw new Error("buildSchedule: hacen falta una cuota o mas")
  }
  if (!Number.isInteger(everyDays) || everyDays < 1) {
    throw new Error("buildSchedule: los dias entre cuotas son un entero positivo")
  }

  const each = divideRoundHalfUp(totalCents, count)
  const schedule: ScheduledInstallment[] = []
  let assigned = 0

  for (let n = 1; n < count; n++) {
    schedule.push({ number: n, dueDate: addDays(soldOn, everyDays * n), amountCents: each })
    assigned += each
  }

  // La ultima recoge lo que falte para cuadrar. Puede ser mayor o menor que las otras.
  schedule.push({
    number: count,
    dueDate: addDays(soldOn, everyDays * count),
    amountCents: totalCents - assigned,
  })

  return schedule
}
