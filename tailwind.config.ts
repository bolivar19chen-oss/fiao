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
      // La curva del sistema de Apple. Todo lo que responde a un dedo o a un cursor sale
      // con esta: arranca rapido y se asienta, sin rebote. Es la mitad de por que una
      // interfaz de iOS se siente cara.
      transitionTimingFunction: { apple: "cubic-bezier(0.28, 0.11, 0.32, 1)" },
      // Crossfade de llegada entre rutas. Era framer-motion en el armazon; en CSS cuesta
      // cero JS y respeta prefers-reduced-motion sin codigo.
      keyframes: {
        entrada: { from: { opacity: "0" }, to: { opacity: "1" } },
        // La entrada del logo: se asienta con la curva de Apple, aguanta, y la ultima
        // parte acelera, que es como se siente una camara que empuja en vez de un
        // elemento que crece. Ver src/components/landing/intro.tsx.
        intro: {
          "0%": { opacity: "0", transform: "scale(1.06)" },
          "14%": { opacity: "1", transform: "scale(1)" },
          "66%": { transform: "scale(1)", animationTimingFunction: "cubic-bezier(0.6, 0, 0.85, 0.4)" },
          "100%": { transform: "scale(26)" },
        },
        // La tapa del hueco de la O, que se abre justo cuando empieza el empuje.
        "intro-ojo": { "0%, 60%": { opacity: "1" }, "72%, 100%": { opacity: "0" } },
      },
      animation: {
        entrada: "entrada 140ms cubic-bezier(0.28, 0.11, 0.32, 1) both",
        intro: "intro 2400ms cubic-bezier(0.28, 0.11, 0.32, 1) both",
        "intro-ojo": "intro-ojo 2400ms linear both",
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
