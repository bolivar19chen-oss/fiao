"use client"

import { motion, useReducedMotion } from "framer-motion"
import { ChevronDown } from "lucide-react"

// Pantalla de entrada: el fondo limpio y la firma escribiendose. Despues se baja y
// empieza el sitio.
//
// Es una seccion normal del flujo, no una capa que tapa y desaparece sola: asi se sale de
// ella bajando, que es lo que se pidio, y nadie queda encerrado esperando a que termine
// una animacion. z-[60] la pone por encima de la cabecera fija (z-50) mientras se ve; en
// cuanto se sube, la cabecera aparece.
//
// La firma esta dibujada a mano. Cada trazo es un `path` y se anima `pathLength` de 0 a 1,
// que es como Motion dibuja una linea.
//
// Inclinada y ligada, estilo caligrafico: la `f` sube a un bucle alto y baja a otro bajo,
// las letras van unidas por sus enlaces, y el grosor cambia segun el trazo. Los gruesos
// son el cuerpo de la letra y los finos los rasgos de union y de salida, que es como se
// comporta una pluma. La inclinacion la da el skew del grupo, no las coordenadas: asi se
// puede ajustar en un solo numero.

const INCLINACION = -14

const TRAZOS = [
  // La f: sube al bucle alto, baja cruzando la linea y cierra en el bucle de pie.
  {
    d:
      "M60 128C70 102 80 62 94 38C102 24 124 20 120 40C116 60 94 76 86 102" +
      "C78 126 81 145 93 147C103 148 109 138 105 129",
    delay: 0,
    duracion: 1.15,
    grosor: 7,
  },
  // Travesano de la f, fino.
  { d: "M66 94C82 86 106 85 126 90", delay: 1.05, duracion: 0.3, grosor: 5 },
  // i y a, de corrido: enlace, asta de la i, enlace, bucle de la a y salida.
  {
    d:
      "M105 129C115 112 127 90 134 74C136 91 136 110 141 125C146 136 157 138 166 127" +
      "C178 114 178 90 162 88C145 86 136 104 143 119C150 134 169 131 176 112" +
      "C181 97 181 114 186 127C191 137 204 139 215 127",
    delay: 1.3,
    duracion: 1.05,
    grosor: 7,
  },
  // La o, que entra desde el enlace de la a.
  {
    d: "M215 127C229 115 234 94 222 87C208 80 194 95 199 112C204 128 222 131 232 116",
    delay: 2.3,
    duracion: 0.6,
    grosor: 7,
  },
  // Rasgo de salida: largo y fino, con el remonte del final.
  { d: "M232 116C249 110 272 104 295 110C308 113 314 106 312 98", delay: 2.85, duracion: 0.55, grosor: 4.5 },
  // El apostrofo de FIA'O.
  { d: "M196 62C199 69 198 76 194 82", delay: 3.4, duracion: 0.22, grosor: 5 },
  // El punto de la i.
  { d: "M134 56C135 56 136 56 137 56", delay: 3.6, duracion: 0.18, grosor: 6 },
]

const FIN = 3.8

export function Intro() {
  const reducido = useReducedMotion()

  return (
    <section
      aria-label="Welcome"
      className="relative z-[60] flex h-[100dvh] flex-col items-center justify-center gap-10 bg-fondo px-6"
    >
      <svg
        // Medido sobre el svg ya inclinado, no a ojo. getBBox del grupo no sirve: devuelve
        // la caja antes de su propio skew.
        viewBox="15 18 299 137"
        className="w-full max-w-lg text-marron"
        role="img"
        aria-label="FIA'O"
        fill="none"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <g transform={`skewX(${INCLINACION})`}>
          {TRAZOS.map((trazo) => (
            <motion.path
              key={trazo.d}
              d={trazo.d}
              strokeWidth={trazo.grosor}
              // strokeDasharray="0 1" es lo que deja a pathLength controlar el dibujo.
              strokeDasharray="0 1"
              initial={reducido ? false : { pathLength: 0 }}
              animate={{ pathLength: 1 }}
              transition={
                reducido ? { duration: 0 } : { delay: trazo.delay, duration: trazo.duracion, ease: "easeInOut" }
              }
            />
          ))}
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
