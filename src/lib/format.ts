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

// Un porcentaje con dos decimales y los puntos base son la misma aritmetica que un monto
// y sus centavos: "1.50" -> 150. Se reusa el mismo parser en vez de escribir otro igual,
// y se renombra porque `parseCents(tasa)` en codigo de intereses despista al que lo lee.
export const parseBasisPoints = parseCents
export const basisPointsToInput = centsToInput

/** Variacion lista para pintar, o null cuando no hay con que compararla. */
export type Delta = { text: string; good: boolean | null }

// Pasado este salto el porcentaje deja de informar: cobrar 71 donde se cobro 5 da
// +1381%, que es cierto y no dice nada. A partir de aqui se dice de donde se venia.
const SALTO_MUDO = 200

/**
 * La variacion de un indicador entre dos periodos.
 *
 * Tres casos, y los tres salen de haber visto "+1381%" en pantalla:
 *
 * - **Sin periodo anterior** (`before` en cero): null. Un "+100%" nacido de la nada se
 *   lee como una mejora y es solo el primer dato que existe.
 * - **Salto enorme**: se cambia el porcentaje por el punto de partida. El color se
 *   queda, porque la noticia sigue siendo buena o mala; lo que se tira es el numero.
 * - **Normal**: el porcentaje, redondeado a entero.
 *
 * `goodWhenUp` dice en que direccion es buena la noticia: la mora que sube es mala
 * aunque el numero crezca. `good` en null pinta neutro, nunca verde ni rojo.
 */
export function kpiDelta(nowCents: number, beforeCents: number, goodWhenUp = true): Delta | null {
  if (beforeCents <= 0) return null

  const percent = Math.round(((nowCents - beforeCents) / beforeCents) * 100)
  if (percent === 0) return { text: "0%", good: null }

  const good = percent > 0 === goodWhenUp
  if (Math.abs(percent) > SALTO_MUDO) return { text: `from ${formatCents(beforeCents)}`, good }
  return { text: `${percent > 0 ? "+" : ""}${percent}%`, good }
}
