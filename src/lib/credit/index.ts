// Superficie publica del motor de credito.
//
// El modulo es puro: no toca la base de datos, no lee el reloj y no tiene dependencias
// de npm. La fecha de referencia entra siempre como argumento. Quien llama trae los
// datos y persiste el resultado.
//
// Reglas del dominio en docs/MODELO-CREDITO.md. Por que vive aca y no en un servicio
// aparte, en docs/adr/0005-calculo-en-typescript-python-como-herramienta.md.

export { settleInstallments } from "./allocation"
export type { PaymentEntry } from "./allocation"
export { balanceFrom, dailyBalances, verifyBalance } from "./balance"
export { accrueInterest, accrueLateFee } from "./accrual"
export type { AccrualInput, LateFeeInput } from "./accrual"
export { addDays, daysBetween, eachDay } from "./dates"
export { accountStatus } from "./status"
export { creditScore } from "./scoring"
export type { ScoreBreakdown, ScoreInput } from "./scoring"
export type { AccountStatus, Installment, IsoDate, Movement } from "./types"
