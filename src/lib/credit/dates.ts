import type { IsoDate } from "./types"

// Aritmetica de dias calendario sobre fechas ISO.
//
// Todo pasa por Date.UTC y nunca por `new Date(texto)`: parsear "2026-10-16" con el
// constructor lo interpreta en la zona horaria local, y en Panama (UTC-5) eso corre la
// fecha un dia para atras en parte del dia. Los errores de un dia son el bug clasico del
// calculo de mora.
//
// Date.UTC es aritmetica pura, no lee el reloj.

const MS_PER_DAY = 86_400_000

function toUtcMillis(date: IsoDate): number {
  const [year, month, day] = date.split("-").map(Number)
  return Date.UTC(year, month - 1, day)
}

function fromUtcMillis(millis: number): IsoDate {
  return new Date(millis).toISOString().slice(0, 10)
}

/** Dias de `from` a `to`. Negativo si `to` es anterior. */
export function daysBetween(from: IsoDate, to: IsoDate): number {
  return (toUtcMillis(to) - toUtcMillis(from)) / MS_PER_DAY
}

export function addDays(date: IsoDate, days: number): IsoDate {
  return fromUtcMillis(toUtcMillis(date) + days * MS_PER_DAY)
}

/** Todos los dias del periodo, incluidos los dos extremos. */
export function eachDay(from: IsoDate, to: IsoDate): IsoDate[] {
  const total = daysBetween(from, to)
  if (total < 0) return []

  const days: IsoDate[] = []
  for (let offset = 0; offset <= total; offset++) days.push(addDays(from, offset))
  return days
}

/**
 * Meses completos de `from` a `to`. El 15 de enero al 14 de febrero son 0 meses; al 15
 * de febrero, 1.
 */
export function monthsBetween(from: IsoDate, to: IsoDate): number {
  const [fromYear, fromMonth, fromDay] = from.split("-").map(Number)
  const [toYear, toMonth, toDay] = to.split("-").map(Number)

  const months = (toYear - fromYear) * 12 + (toMonth - fromMonth)
  return toDay < fromDay ? months - 1 : months
}
