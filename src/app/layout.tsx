import type { Metadata } from "next"
import { DM_Sans, Inter, Montserrat } from "next/font/google"

import "./globals.css"

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" })
// Titulos: Montserrat, la alternativa libre a Gotham (Gotham es de pago y no se puede
// distribuir sin licencia). Subtitulos: DM Sans. El cuerpo sigue en Inter hasta tener los
// archivos de Garet, que no esta en Google Fonts.
const titulo = Montserrat({ subsets: ["latin"], variable: "--font-titulo" })
const subtitulo = DM_Sans({ subsets: ["latin"], variable: "--font-subtitulo" })

// Corre antes de pintar: si el usuario eligio un tema, su clase gana sobre el sistema.
// Sin eleccion no hace nada y manda prefers-color-scheme (tailwind.config.ts). Va inline y
// sincronico a proposito: un efecto de React llegaria tarde y la pagina parpadearia.
//
// Tambien pone el idioma del documento, leido de la cookie `lang`: sin esto un lector de
// pantalla lee el espanol con fonetica inglesa. Se hace aca y no con cookies() en el layout
// porque leer una cookie en el layout raiz vuelve dinamicas TODAS las rutas: la landing se
// generaba en el servidor en cada visita (0.7 a 1.1 s) en vez de servirse ya hecha.
const THEME_SCRIPT = `try{var d=document.documentElement,t=localStorage.getItem("theme");if(t==="light"||t==="dark")d.classList.add(t);var l=document.cookie.match(/(?:^|; )lang=(es|zh)/);if(l)d.lang=l[1];var f=localStorage.getItem("fondo");if(f)d.dataset.fondo=f}catch(e){}`

export const metadata: Metadata = {
  title: "FIA'O - Credit sales for small businesses",
  description:
    "Inventory, credit sales, payment history and a store credit score for every customer of a corner store.",
  // La aplicacion ya tiene su propio selector de idioma: la traduccion automatica del
  // navegador sobra, y ademas rompe. Chrome traduce reescribiendo los nodos de texto por
  // debajo de React, y entonces React intenta quitar un nodo que ya no es suyo:
  // "Failed to execute 'removeChild' on 'Node'". Con tres idiomas propios esto importa
  // mas que antes, no menos.
  other: { google: "notranslate" },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    // suppressHydrationWarning: el script cambia la clase y el lang de <html> antes de que React hidrate.
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
      <body className={`${inter.variable} ${titulo.variable} ${subtitulo.variable} font-sans antialiased`}>
        {children}
      </body>
    </html>
  )
}
