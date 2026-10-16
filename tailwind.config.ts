import type { Config } from "tailwindcss"

// Paleta en docs/DISENO.md
const config: Config = {
  content: ["./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        rojo: "#b91c1c",
        amarillo: "#ffbf32",
        crema: "#fef3c7",
        marron: "#482d1f",
      },
      fontFamily: {
        sans: ["var(--font-inter)", "sans-serif"],
        display: ["var(--font-poppins)", "sans-serif"],
      },
    },
  },
  plugins: [],
}
export default config
