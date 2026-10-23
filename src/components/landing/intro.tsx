import { useId } from "react"
import { ChevronDown } from "lucide-react"

// Pantalla de entrada: el fondo limpio y la firma. Despues se baja y empieza el sitio.
//
// Es una seccion normal del flujo, no una capa que tapa y desaparece sola: asi se sale de
// ella bajando, y nadie queda encerrado esperando. z-[60] la pone por encima de la
// cabecera fija (z-50) mientras se ve.
//
// ## Como funciona
//
// La firma es `public/firma.png`, caligrafia de verdad: el trazo engorda al bajar y se
// afila al subir. Eso no se puede dibujar con un `stroke` de SVG, que tiene un grosor
// unico, asi que la imagen entra como mascara de luminancia (es blanca sobre
// transparente) sobre un rectangulo en currentColor. Por eso el color es una clase y no
// un archivo: sigue al tema solo.
//
// El PNG es gris de 8 bits, no RGBA: la mascara solo lee luminancia, asi que los tres
// canales de blanco constante eran 49 kB que no dibujaban nada.
//
// Antes se escribia sola, revelada por una segunda mascara de diez trazos medidos a mano
// con `scripts/firma/overlay.py`. Se quito a peticion: la firma aparece y ya. Los trazos
// siguen en el historial (commit 7088113) si alguna vez vuelve.

const ANCHO = 1400
const ALTO = 785

export function Intro() {
  const uid = useId()
  const tinta = `tinta-${uid}`

  return (
    <section
      aria-label="Welcome"
      className="relative z-[60] flex h-[100dvh] flex-col items-center justify-center gap-10 bg-fondo px-6"
    >
      {/* La firma es el elemento mas grande de la primera pantalla, o sea el que mide el
          LCP, y va dentro de un <mask>: el escaner de precarga del navegador no mira ahi,
          asi que no empezaba a bajarla hasta terminar de montar el SVG. React 19 sube este
          link al head solo. */}
      <link rel="preload" as="image" href="/firma.png" fetchPriority="high" />

      <svg viewBox={`0 0 ${ANCHO} ${ALTO}`} className="w-full max-w-2xl text-rojo" role="img" aria-label="FIA'O">
        <defs>
          <mask id={tinta}>
            <image href="/firma.png" width={ANCHO} height={ALTO} />
          </mask>
        </defs>
        <rect width={ANCHO} height={ALTO} fill="currentColor" mask={`url(#${tinta})`} />
      </svg>

      <span className="flex flex-col items-center gap-1 text-xs font-semibold uppercase tracking-[0.18em] text-marron/45">
        Scroll
        <ChevronDown className="h-4 w-4" aria-hidden />
      </span>
    </section>
  )
}
