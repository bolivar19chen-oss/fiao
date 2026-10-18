"use client"

import { motion, useReducedMotion } from "framer-motion"
import { ChevronDown } from "lucide-react"
import { useId } from "react"

// Pantalla de entrada: el fondo limpio y la firma escribiendose. Despues se baja y
// empieza el sitio.
//
// Es una seccion normal del flujo, no una capa que tapa y desaparece sola: asi se sale de
// ella bajando, y nadie queda encerrado esperando a que termine una animacion. z-[60] la
// pone por encima de la cabecera fija (z-50) mientras se ve.
//
// ## Como funciona
//
// La firma es `public/firma.png`, caligrafia de verdad: el trazo engorda al bajar y se
// afila al subir. Eso no se puede dibujar con un `stroke` de SVG, que tiene un grosor
// unico. Pero tampoco se puede animar una imagen como si se escribiera, porque la
// escritura no va de izquierda a derecha: la f baja hasta abajo del todo y vuelve a
// subir, y el ovalo final sale a la derecha y regresa por debajo de la palabra. Un
// barrido se veria mal justo en los dos gestos que la hacen.
//
// La solucion son dos mascaras:
//
//   1. `tinta`  - la imagen. Recorta la forma, y debajo va un rectangulo en currentColor.
//                 Por eso el color es una clase y no un archivo, y sigue al tema solo.
//   2. `escritura` - los trazos de abajo, en orden de escritura, animando pathLength.
//                 Revelan la imagen a su paso. Nadie los ve: solo son la mano.
//
// ## Los trazos
//
// Son la linea de centro de cada trazo de la pluma, medidos sobre la imagen con
// `scripts/firma/overlay.py`, que los dibuja encima de la tinta para corregirlos mirando.
// **Si cambia `public/firma.png`, hay que volver a trazarlos con esa herramienta.**
//
// `grosor` es el ancho de la mascara, no del trazo: tiene que cubrir lo mas gordo que
// tape. El asta de la f llega a 104px de tinta, de ahi que sea 125. Los rasgos finos van
// estrechos a proposito, porque una mascara ancha revelaria de paso lo que tiene al lado.

const TRAZOS = [
  // Rasgo de entrada: el ovalo grande de la izquierda.
  { d: "M240 230C160 212 50 240 18 310C-2 370 70 405 150 400C205 396 250 410 272 440", delay: 0, dur: 0.6, grosor: 90 },
  // El lazo bajo con el que la entrada se cierra.
  { d: "M272 440C292 472 258 502 218 492C180 482 178 440 206 418", delay: 0.55, dur: 0.25, grosor: 90 },
  // La f: bucle alto, el asta gruesa en diagonal, y el bucle de pie.
  {
    d:
      "M385 205C368 150 392 60 448 28C478 10 508 14 505 30C480 60 440 85 420 110" +
      "C392 155 364 205 350 250C322 330 300 368 280 405C252 462 230 502 210 540" +
      "C180 598 155 642 140 668C120 702 116 742 142 764C176 790 226 774 240 730C250 700 244 668 234 648",
    delay: 0.75,
    dur: 0.95,
    grosor: 210,
  },
  // La i.
  {
    d: "M425 285C455 350 482 420 512 465C536 500 570 506 600 482C624 462 646 450 660 440",
    delay: 1.65,
    dur: 0.3,
    grosor: 230,
  },
  // La a.
  {
    d: "M660 440C650 400 640 350 662 310C682 276 716 272 716 302C716 342 692 382 702 422C714 464 762 470 786 430C800 406 796 362 800 342C806 372 812 400 826 418",
    delay: 1.9,
    dur: 0.4,
    grosor: 180,
  },
  // La o.
  {
    d: "M826 418C858 372 890 290 932 260C976 236 1002 272 986 332C970 392 920 442 896 430C876 420 882 396 902 380",
    delay: 2.25,
    dur: 0.35,
    grosor: 160,
  },
  // El apostrofo de FIA'O.
  { d: "M880 140C895 170 890 220 862 262", delay: 2.6, dur: 0.18, grosor: 110 },
  // El punto de la i.
  { d: "M552 198C556 198 560 198 564 198", delay: 2.75, dur: 0.12, grosor: 90 },
  // Rasgo de salida, hacia la derecha.
  { d: "M1000 340C1080 280 1200 220 1300 228C1370 234 1392 270 1382 300", delay: 2.85, dur: 0.5, grosor: 140 },
  // El gesto final: el ovalo que vuelve por debajo de toda la palabra.
  {
    d: "M376 688C500 620 700 540 900 512C1050 492 1160 530 1152 582C1144 640 1000 678 860 690C800 696 740 690 722 662",
    delay: 3.3,
    dur: 0.7,
    grosor: 140,
  },
]

const FIN = 4.1
const ANCHO = 1400
const ALTO = 785

export function Intro() {
  const reducido = useReducedMotion()
  const uid = useId()
  const escritura = `escritura-${uid}`
  const tinta = `tinta-${uid}`

  return (
    <section
      aria-label="Welcome"
      className="relative z-[60] flex h-[100dvh] flex-col items-center justify-center gap-10 bg-fondo px-6"
    >
      <svg viewBox={`0 0 ${ANCHO} ${ALTO}`} className="w-full max-w-2xl text-rojo" role="img" aria-label="FIA'O">
        <defs>
          <mask id={escritura}>
            {TRAZOS.map((trazo) => (
              <motion.path
                key={trazo.d}
                d={trazo.d}
                fill="none"
                stroke="white"
                strokeWidth={trazo.grosor}
                strokeLinecap="round"
                strokeLinejoin="round"
                // strokeDasharray="0 1" es lo que deja a pathLength controlar el dibujo.
                strokeDasharray="0 1"
                initial={reducido ? false : { pathLength: 0 }}
                animate={{ pathLength: 1 }}
                transition={reducido ? { duration: 0 } : { delay: trazo.delay, duration: trazo.dur, ease: "easeInOut" }}
              />
            ))}
          </mask>

          <mask id={tinta}>
            {/* La imagen es blanca sobre transparente, asi que vale como mascara por
                luminancia sin depender de mask-type: alpha. */}
            <image href="/firma.png" width={ANCHO} height={ALTO} />
          </mask>
        </defs>

        <g mask={`url(#${escritura})`}>
          <rect width={ANCHO} height={ALTO} fill="currentColor" mask={`url(#${tinta})`} />
        </g>
      </svg>

      {/* Aparece cuando la firma termina: antes no hay nada que hacer todavia. */}
      <motion.span
        initial={reducido ? false : { opacity: 0, y: -6 }}
        animate={{ opacity: 1, y: 0 }}
        transition={reducido ? { duration: 0 } : { delay: FIN, duration: 0.5 }}
        className="flex flex-col items-center gap-1 text-xs font-semibold uppercase tracking-[0.18em] text-marron/45"
      >
        Scroll
        <ChevronDown className="h-4 w-4" aria-hidden />
      </motion.span>
    </section>
  )
}
