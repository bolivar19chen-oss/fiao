import { daysBetween, eachDay } from "./dates"
import type { IsoDate, Movement } from "./types"

/** Saldo acumulado de todos los movimientos. */
export function balanceFrom(movements: Movement[]): number {
  return movements.reduce((total, movement) => total + movement.cents, 0)
}

/**
 * Saldo al cierre de cada dia del periodo, incluidos los dos extremos.
 *
 * Arranca del saldo que exista antes de `from`: los movimientos anteriores al periodo
 * cuentan para el saldo inicial aunque no caigan dentro de el. Sin esto, el devengo del
 * segundo mes ignoraria toda la deuda del primero.
 */
export function dailyBalances(movements: Movement[], from: IsoDate, to: IsoDate): number[] {
  const opening = balanceFrom(movements.filter((movement) => daysBetween(movement.date, from) > 0))

  const byDay = new Map<IsoDate, number>()
  for (const movement of movements) {
    byDay.set(movement.date, (byDay.get(movement.date) ?? 0) + movement.cents)
  }

  let running = opening
  return eachDay(from, to).map((day) => {
    running += byDay.get(day) ?? 0
    return running
  })
}

/**
 * Compara el saldo cacheado contra el historial.
 *
 * sales.balance_cents es un cache para no recorrer el libro en cada consulta de cartera.
 * Un cache sin verificacion es donde nacen los descuadres, asi que tiene que poder
 * demostrarse en cualquier momento.
 */
export function verifyBalance(
  movements: Movement[],
  cachedCents: number,
): { expectedCents: number; cachedCents: number; matches: boolean } {
  const expectedCents = balanceFrom(movements)
  return { expectedCents, cachedCents, matches: expectedCents === cachedCents }
}
