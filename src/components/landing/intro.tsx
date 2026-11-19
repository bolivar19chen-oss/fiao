"use client"

import { motion, useScroll, useTransform } from "framer-motion"

import { LOGO } from "@/lib/colors"

/**
 * Apertura del Home: el logo llena la pantalla y el primer scroll mete la camara por la O.
 * Lo que aparece al otro lado es la portada de siempre, con sus petalos.
 *
 * ## Como funciona el zoom
 *
 * No es un fundido: el rojo ES una forma del SVG, un rectangulo enorme con el hueco de la O
 * recortado (`fill-rule="evenodd"`, el mismo truco del anillo del logo). Al escalar, ese
 * hueco crece hasta pasarse de la pantalla, asi que la escena aparece POR DENTRO de la letra.
 * El `transform-origin` es el centro de la O sobre el viewBox, y como la O esta a la derecha,
 * escalar desde ahi arrastra el logo hacia la izquierda: el paneo sale solo.
 *
 * ## Por que lo conduce el scroll
 *
 * La cortina es fija y la primera pantalla de scroll es su escala; la portada (`children`)
 * se queda quieta debajo ese tramo. Nada secuestra la rueda: al terminar, la portada se suelta
 * y la pagina sigue bajando normal. Con `prefers-reduced-motion` no hay cortina.
 *
 * El transform va en un div y no en el <svg>: sobre un elemento SVG se cae a hilo principal y
 * rasteriza el vector en cada cuadro. La cortina es `aria-hidden`.
 */

// El viewBox del logo y el centro de su O: por ahi entra la camara.
const CAJA = { w: 599, h: 181 }
const O = { cx: 504.5, cy: 97 }

// Rectangulo de fondo con el hueco de la O. Va de -2000 a 2600 para cubrir cualquier
// pantalla con el logo a su tamano de reposo; el segundo trazo es la elipse interior del
// anillo, que con evenodd queda calada.
const FONDO = "M-2000,-2000H2600V2200H-2000ZM461,96.5a43,45.5 0 1 0 86,0a43,45.5 0 1 0 -86,0Z"

// En el servidor no hay ventana; alli el scroll vale 0 y cualquier alto sirve.
const alto = () => (typeof window === "undefined" ? 1 : window.innerHeight)

export function Intro({ children }: { children: React.ReactNode }) {
  const { scrollY } = useScroll()
  // El zoom dura una pantalla de scroll. Arranca lento y acelera, como una camara que empuja.
  const scale = useTransform(() => 1 + 25 * Math.min(scrollY.get() / alto(), 1) ** 3)
  // La tapa del hueco se va en cuanto empieza el empuje; la pista de scroll, con ella.
  const tapa = useTransform(() => Math.max(1 - scrollY.get() / (alto() * 0.06), 0))

  return (
    <div>
      {/* La portada se queda quieta mientras dura el zoom y despues baja normal: `sticky` la
          sujeta lo que mide el espaciador de abajo. */}
      <div className="motion-safe:sticky motion-safe:top-0">{children}</div>
      <div className="h-[100dvh] motion-reduce:hidden" />

      <div
        aria-hidden
        // Con movimiento reducido la cortina no existe (CSS, no JS: asi servidor y cliente pintan lo mismo).
        className="pointer-events-none fixed inset-0 z-[60] grid place-items-center overflow-hidden px-10 motion-reduce:hidden"
      >
        <motion.div
          className="w-full max-w-2xl"
          style={{
            scale,
            willChange: "transform",
            transformOrigin: `${(O.cx / CAJA.w) * 100}% ${(O.cy / CAJA.h) * 100}%`,
          }}
        >
          <svg viewBox={`0 0 ${CAJA.w} ${CAJA.h}`} className="w-full overflow-visible">
            <path d={FONDO} fillRule="evenodd" fill={LOGO.rojo} />
            <motion.circle cx={O.cx} cy={O.cy} r={44} fill={LOGO.rojo} style={{ opacity: tapa }} />
            <path
              fill={LOGO.claro}
              fillRule="evenodd"
              d="M10,19H118V46H46V82H109V109H46V159H10ZM142,19H178V159H142ZM196,159L258,19H293L355,159H319L307,131H243L231,159ZM254,105H296L275,52ZM385,9C397,9 406,17 406,29C406,39 401,49 397,58L387,81H368L376,49C377,47 375,47 373,46C367,43 365,36 365,29C365,17 373,9 385,9Z"
            />
            <path
              fill={LOGO.amarillo}
              fillRule="evenodd"
              d="M423,97a81.5,76 0 1 0 163,0a81.5,76 0 1 0 -163,0ZM461,96.5a43,45.5 0 1 0 86,0a43,45.5 0 1 0 -86,0Z"
            />
          </svg>
        </motion.div>
        <motion.p
          style={{ opacity: tapa, color: LOGO.claro }}
          className="absolute bottom-[28%] font-sub text-xs font-semibold uppercase tracking-[0.18em]"
        >
          Scroll
        </motion.p>
      </div>
    </div>
  )
}
