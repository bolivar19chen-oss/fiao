import type { Config } from "tailwindcss"
import { BRAND, ESTADO } from "./src/lib/colors"

// Los valores no viven aca: vienen de src/lib/colors.ts, que es la fuente unica.
// Asi el mismo color que usa una clase de Tailwind lo puede leer tambien un atributo de
// SVG o una prop de Recharts, donde una clase no aplica.
//
// Antes de esto habia 14 valores sueltos en 8 archivos, con dos cremas casi iguales
// (#fff8ea y #fff8e6) que nadie habia notado.
const config: Config = {
  content: ["./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: { ...BRAND, estado: ESTADO },
      fontFamily: {
        display: ["var(--font-poppins)", "sans-serif"],
        sans: ["var(--font-inter)", "sans-serif"],
      },
    },
  },
  plugins: [],
}
export default config
