import type { Metadata } from "next"
import { Inter, Poppins } from "next/font/google"

import "./globals.css"

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" })
const poppins = Poppins({
  subsets: ["latin"],
  weight: ["300", "500", "600", "700"],
  variable: "--font-poppins",
})

// Corre antes de pintar: si el usuario eligio un tema, su clase gana sobre el sistema.
// Sin eleccion no hace nada y manda prefers-color-scheme (tailwind.config.ts). Va inline y
// sincronico a proposito: un efecto de React llegaria tarde y la pagina parpadearia.
const THEME_SCRIPT = `try{var t=localStorage.getItem("theme");if(t==="light"||t==="dark")document.documentElement.classList.add(t)}catch(e){}`

export const metadata: Metadata = {
  title: "FIA'O - Credit sales for small businesses",
  description:
    "Inventory, credit sales, payment history and a store credit score for every customer of a corner store.",
  // UI siempre en ingles: evita que Chrome ofrezca o aplique traduccion automatica.
  other: { google: "notranslate" },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    // suppressHydrationWarning: el script cambia la clase de <html> antes de que React hidrate.
    <html lang="en" translate="no" suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: THEME_SCRIPT }} />
      </head>
      {/*
        CookieNotice NO va aca. Un componente cliente en el layout raiz, junto con el
        not-found.tsx raiz, rompe el build de produccion:
        "Invariant: no direct app page entry found for /_not-found".
        Verificado aislandolo: sin el, el build pasa. Vive en los layouts de grupo.
      */}
      <body className={`${inter.variable} ${poppins.variable} font-sans antialiased`}>{children}</body>
    </html>
  )
}
