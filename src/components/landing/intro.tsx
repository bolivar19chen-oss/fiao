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
// La firma esta dibujada a mano, siguiendo una muestra de caligrafia inglesa. Cada trazo
// es un `path` y se anima `pathLength` de 0 a 1, que es como Motion dibuja una linea.
//
// **El contraste.** En la caligrafia real la pluma engorda al bajar y adelgaza al subir
// DENTRO de cada letra. Un `stroke` de SVG tiene un solo grosor, asi que eso no se puede
// copiar sin convertir cada letra en una silueta rellena, y una silueta rellena ya no se
// puede dibujar con pathLength. El contraste que si se consigue es entre trazos: los
// rasgos (entrada, salida, travesano) van en pelo fino y las letras en trazo grueso.
//
// **El gesto que manda** es el ultimo: el ovalo que sale de la o, se va a la derecha y
// vuelve por debajo de toda la palabra. Sin el, la firma es solo letra inclinada.

const INCLINACION = -20

const TRAZOS = [
  // Rasgo de entrada: viene de lejos por la izquierda y remonta hacia el bucle de la f.
  { d: "M140 262C168 226 164 192 208 198C242 203 252 224 236 242", delay: 0, duracion: 0.75, grosor: 3 },
  // La f: bucle alto, asta larga cruzando la linea, y bucle de pie que baja y vuelve.
  {
    d:
      "M236 242C246 202 256 150 272 120C282 100 304 96 304 118C304 142 284 170 270 208" +
      "C256 246 242 300 238 334C234 366 246 386 264 381C282 376 290 352 280 330",
    delay: 0.65,
    duracion: 1.15,
    grosor: 10,
  },
  // Travesano de la f, en pelo fino.
  { d: "M222 208C250 197 290 197 318 206", delay: 1.7, duracion: 0.3, grosor: 4 },
  // i y a de corrido: asta de la i, enlace, bucle de la a y salida.
  {
    d:
      "M314 254C328 226 345 190 352 173C355 197 355 226 360 245C364 263 380 265 392 250C409 229 409 193 385 191C361 188 346 216 356 239C366 260 394 254 404 227C411 205 411 228 416 248C421 265 438 268 452 251",
    delay: 1.95,
    duracion: 1.05,
    grosor: 9,
  },
  // La o, que entra desde el enlace de la a.
  {
    d: "M452 251C474 230 481 196 462 186C440 175 418 199 426 226C433 253 462 258 476 235",
    delay: 2.95,
    duracion: 0.55,
    grosor: 9,
  },
  // El gesto: sale de la o, se abre a la derecha y vuelve por debajo de la palabra.
  {
    d: "M476 235C512 220 562 214 598 231C627 244 631 272 606 286C569 304 494 306 426 295C374 288 330 279 304 269",
    delay: 3.45,
    duracion: 1.1,
    grosor: 3.5,
  },
  // El apostrofo de FIA'O.
  { d: "M409 157C414 170 411 184 404 193", delay: 4.45, duracion: 0.22, grosor: 5 },
  // El punto de la i.
  { d: "M352 151C354 151 355 151 356 151", delay: 4.65, duracion: 0.18, grosor: 7 },
]

const FIN = 4.9

export function Intro() {
  const reducido = useReducedMotion()

  return (
    <section
      aria-label="Welcome"
      className="relative z-[60] flex h-[100dvh] flex-col items-center justify-center gap-10 bg-fondo px-6"
    >
      <svg
        // Medido sobre el svg ya inclinado, no a ojo: getBBox del grupo devuelve la caja
        // de antes de su propio skew y deja el encuadre corrido.
        viewBox="-11 91 608 303"
        className="w-full max-w-2xl text-marron"
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
