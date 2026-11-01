// Fuente unica del color del proyecto. La referencia escrita esta en docs/DISENO.md.
//
// La leen dos consumidores:
//   1. tailwind.config.ts, que la convierte en clases (bg-rojo, text-marron, ...)
//   2. el codigo que necesita el valor como dato: atributos de SVG y props de Recharts,
//      donde una clase no aplica.
//
// Regla: ningun color se escribe a mano en un componente. Si hace falta un tono que no
// esta aca, se agrega aca primero.
//
// Grupos ordenados por rol; dentro de cada grupo, de claro a oscuro.

export const BRAND = {
  amarillo: { DEFAULT: "#ffbf32", oscuro: "#e0a21c" },
  crema: { claro: "#fff8ea", DEFAULT: "#fef3c7" },
  marron: { claro: "#8a6a5a", DEFAULT: "#482d1f" },
  rojo: { suave: "#e04848", medio: "#d64545", claro: "#cd2626", DEFAULT: "#b91c1c", oscuro: "#7f1d1d" },
} as const

/**
 * Colores de estado de cuenta, validados con el script de la guia de visualizacion y no
 * elegidos a ojo.
 *
 * **Reservados:** nunca se usan como color de serie en un grafico, y siempre van con
 * icono y etiqueta. En modo oscuro el ambar y el rojo no llegan a separarse lo suficiente
 * para daltonismo dentro de la banda de luminosidad que exige el fondo, asi que la
 * identidad no puede descansar en el color.
 */
export const ESTADO = {
  "al-dia": "#047857",
  "al-dia-oscuro": "#059669",
  "por-vencer": "#d97706",
  "por-vencer-oscuro": "#c08309",
  mora: "#b91c1c",
  "mora-oscuro": "#f43f5e",
} as const

/**
 * Superficies: el papel de una ficha y el blanco de un brillo.
 *
 * Separadas de BRAND porque no son marca: son el material sobre el que se apoya todo. El
 * blanco va escrito completo y no como `#fff` para que todos los valores del archivo se
 * lean igual.
 */
export const SUPERFICIE = {
  blanco: "#ffffff",
  papel: "#f6f4f1",
} as const

/**
 * Modo oscuro: solo los tokens que cambian, como [claro, oscuro].
 *
 * tailwind.config.ts los convierte en variables CSS (`--marron`, `--fondo`, ...) y la
 * clase de Tailwind lee la variable, asi que `text-marron` o `bg-fondo` cambian solos sin
 * una sola clase `dark:`. `marron` es el rol "tinta" y `fondo` el rol "superficie": en
 * oscuro la tinta es clara. Lo que no esta aca (amarillo, los rojos de los degradados)
 * se ve igual en los dos modos.
 *
 * El codigo que necesita el valor como dato (SVG, Recharts, CSS plano) escribe
 * `rgb(var(--marron) / 0.6)` y tambien cambia solo.
 *
 * Contrastes sobre `fondo` oscuro: tinta 15.5:1, tinta al 50% 4.6:1, rojo 4.6:1 (blanco
 * sobre ese rojo 4.1:1, valido para iconos y texto grande). El rojo oscuro es
 * `rojo.suave`: el `rojo` claro sobre fondo oscuro queda en 2.9:1.
 */
export const TEMA = {
  marron: [BRAND.marron.DEFAULT, "#f3e8dc"],
  "marron-claro": [BRAND.marron.claro, "#b39c8a"],
  crema: [BRAND.crema.DEFAULT, "#3a2b17"],
  "crema-claro": [BRAND.crema.claro, "#21180f"],
  rojo: [BRAND.rojo.DEFAULT, BRAND.rojo.suave],
  // El relleno de un boton rojo con texto blanco. Ni `rojo` ni `rojo-marca` sirven: con el
  // rojo claro de `rojo` el blanco cae a 4.05:1, y con `rojo-marca` el boton cae a 2.89:1
  // contra el fondo oscuro y deja de distinguirse. `rojo.claro` cumple los dos: 5.38 y 3.48.
  "rojo-panel": [BRAND.rojo.DEFAULT, BRAND.rojo.claro],
  fondo: [SUPERFICIE.blanco, "#17110d"],
  papel: [SUPERFICIE.papel, "#241b15"],
  // El canto con luz del cristal. En oscuro un blanco seria un marco duro: va un tono calido.
  brillo: [SUPERFICIE.blanco, "#4d3c30"],
  "estado-al-dia": [ESTADO["al-dia"], ESTADO["al-dia-oscuro"]],
  "estado-por-vencer": [ESTADO["por-vencer"], ESTADO["por-vencer-oscuro"]],
  "estado-mora": [ESTADO.mora, ESTADO["mora-oscuro"]],
} as const

/** Serie categorica para graficos. En orden fijo: nunca se cicla ni se genera un tono nuevo. */
export const SERIE = [BRAND.rojo.DEFAULT, BRAND.rojo.medio, BRAND.amarillo.oscuro, BRAND.amarillo.DEFAULT] as const
