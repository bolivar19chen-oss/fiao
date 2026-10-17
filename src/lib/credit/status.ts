import { daysBetween } from "./dates"
import type { AccountStatus, Installment, IsoDate } from "./types"

/**
 * Estado de la cuenta, derivado y nunca almacenado.
 *
 * Depende de que dia es hoy: guardarlo obligaria a un trabajo que lo refresque y a vivir
 * con que quede viejo entre corrida y corrida. Por eso `asOf` entra como argumento, que
 * ademas es lo que hace la funcion pura y comprobable.
 */
export function accountStatus({
  balanceCents,
  installments,
  graceDays,
  asOf,
}: {
  balanceCents: number
  installments: Installment[]
  graceDays: number
  asOf: IsoDate
}): AccountStatus {
  // Saldo negativo es un pago de mas, no una deuda.
  if (balanceCents <= 0) return "NO_DEBT"

  const overdue = installments.some((installment) => {
    if (installment.paidDate !== null) return false
    // Vence el dia 10 con 0 de gracia: el 10 todavia esta al dia, el 11 esta en mora.
    return daysBetween(installment.dueDate, asOf) > graceDays
  })

  return overdue ? "OVERDUE" : "CURRENT"
}
