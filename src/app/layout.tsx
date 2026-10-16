import type { Metadata } from "next"
import { Inter, Poppins } from "next/font/google"
import "./globals.css"

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" })
const poppins = Poppins({
  subsets: ["latin"],
  weight: ["300", "500", "600", "700"],
  variable: "--font-poppins",
})

export const metadata: Metadata = {
  title: "FIA'O - Credit sales for small businesses",
  description: "Inventory, credit sales, payment history and customer credit scores for corner stores.",
  // UI siempre en ingles: evita que Chrome ofrezca o aplique traduccion automatica.
  other: { google: "notranslate" },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" translate="no">
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
