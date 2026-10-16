const usd = new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" })

// Display only. Amounts are stored and computed as integer cents.
export function formatCents(cents: number): string {
  return usd.format(cents / 100)
}

const count = new Intl.NumberFormat("en-US")

export function formatCount(n: number): string {
  return count.format(n)
}

// "12", "12.5" o "1,200.50" -> centavos enteros. Sin pasar por float: se arma con los
// digitos. null si no es un monto valido.
export function parseCents(input: string): number | null {
  const match = input
    .trim()
    .replace(/,/g, "")
    .match(/^\$?(\d{1,9})(?:\.(\d{1,2}))?$/)
  if (!match) return null
  return Number(match[1]) * 100 + Number((match[2] ?? "").padEnd(2, "0"))
}

// La zona del negocio, no la del servidor: una venta de las 9 p.m. no debe salir con fecha
// de manana.
const date = new Intl.DateTimeFormat("en-US", { dateStyle: "medium", timeZone: "America/Panama" })

export function formatDate(iso: string): string {
  return date.format(new Date(iso))
}

// Inverso de parseCents para precargar inputs: 150 -> "1.50".
export function centsToInput(cents: number): string {
  return `${Math.trunc(cents / 100)}.${String(cents % 100).padStart(2, "0")}`
}
