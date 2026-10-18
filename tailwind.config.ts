import type { Config } from "tailwindcss"
import plugin from "tailwindcss/plugin"
import { BRAND, ESTADO, TEMA } from "./src/lib/colors"

// Los valores no viven aca: vienen de src/lib/colors.ts, que es la fuente unica.
// Asi el mismo color que usa una clase de Tailwind lo puede leer tambien un atributo de
// SVG o una prop de Recharts, donde una clase no aplica.
//
// Antes de esto habia 14 valores sueltos en 8 archivos, con dos cremas casi iguales
// (#fff8ea y #fff8e6) que nadie habia notado.

// Los tokens de TEMA se leen de una variable CSS para que cambien con el modo oscuro.
// Van como canales "r g b" para que sigan funcionando los modificadores (text-marron/60).
const v = (token: keyof typeof TEMA) => `rgb(var(--${token}) / <alpha-value>)`
const channels = (hex: string) => [1, 3, 5].map((i) => parseInt(hex.slice(i, i + 2), 16)).join(" ")
const vars = (mode: 0 | 1) =>
  Object.fromEntries(Object.entries(TEMA).map(([token, pair]) => [`--${token}`, channels(pair[mode])]))

const config: Config = {
  content: ["./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        ...BRAND,
        marron: { claro: v("marron-claro"), DEFAULT: v("marron") },
        crema: { claro: v("crema-claro"), DEFAULT: v("crema") },
        // `rojo-marca` es el rojo fijo de los paneles con texto blanco (CTA, 404, banners):
        // el `rojo` que se aclara en oscuro bajaria el blanco de ese texto a 4.1:1.
        rojo: { ...BRAND.rojo, DEFAULT: v("rojo"), marca: BRAND.rojo.DEFAULT },
        fondo: v("fondo"),
        papel: v("papel"),
        estado: {
          ...ESTADO,
          "al-dia": v("estado-al-dia"),
          "por-vencer": v("estado-por-vencer"),
          mora: v("estado-mora"),
        },
      },
      fontFamily: {
        display: ["var(--font-poppins)", "sans-serif"],
        sans: ["var(--font-inter)", "sans-serif"],
      },
    },
  },
  plugins: [
    // Sin eleccion guardada manda el sistema; la clase .light o .dark en <html> (la pone
    // el script de src/app/layout.tsx antes de pintar) gana sobre el sistema.
    plugin(({ addBase }) =>
      addBase({
        ":root": { ...vars(0), colorScheme: "light" },
        "@media (prefers-color-scheme: dark)": { ":root:not(.light)": { ...vars(1), colorScheme: "dark" } },
        ":root.dark": { ...vars(1), colorScheme: "dark" },
      }),
    ),
  ],
}
export default config
