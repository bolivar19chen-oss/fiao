/**
 * Bandas del puntaje: tres tramos con nombre, para agrupar y para mostrar.
 *
 * **No son una decision de credito.** Quien decide a quien le fia es el dueno, que
 * conoce a su gente; esto solo ordena la lista y senala a quien conviene mirar antes de
 * que se atrase. Por eso la banda baja se llama "watch" y no "bad": nombra que hacer,
 * no juzga a la persona.
 *
 * Los cortes son de presentacion, no de dinero: mover un umbral cambia como se agrupa,
 * nunca cuanto se debe. El calculo del puntaje esta en scoring.ts.
 */
export type ScoreBand = "good" | "fair" | "watch" | "new"

const GOOD_FROM = 70
const FAIR_FROM = 40

/** `new` cuando el cliente todavia no tiene historial del que sacar un puntaje. */
export function scoreBand(score: number | null): ScoreBand {
  if (score === null) return "new"
  if (score >= GOOD_FROM) return "good"
  if (score >= FAIR_FROM) return "fair"
  return "watch"
}
