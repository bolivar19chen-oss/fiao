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

/** Serie categorica para graficos. En orden fijo: nunca se cicla ni se genera un tono nuevo. */
export const SERIE = [BRAND.rojo.DEFAULT, BRAND.rojo.medio, BRAND.amarillo.oscuro, BRAND.amarillo.DEFAULT] as const
