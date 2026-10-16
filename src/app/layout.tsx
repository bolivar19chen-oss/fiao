import type { Metadata } from "next"
import { Inter, Poppins } from "next/font/google"
import { CookieNotice } from "@/components/layout/cookie-notice"
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
      <body className={`${inter.variable} ${poppins.variable} font-sans antialiased`}>
        {children}
        <CookieNotice />
      </body>
    </html>
  )
}
