"use client"

import { useEffect, useState } from "react"

import { BRAND } from "@/lib/colors"

/**
 * Pantalla de entrada: el logo aguanta unos segundos y la camara entra por la O.
 *
 * ## Como funciona el zoom
 *
 * No es un fundido del logo sobre la pagina: el rojo ES una forma del SVG, un rectangulo
 * enorme con el hueco de la O recortado (`fill-rule="evenodd"`, el mismo truco que usa el
 * anillo del logo). Al escalar, ese hueco crece hasta pasarse de la pantalla, asi que la
 * landing aparece POR DENTRO de la letra. Por eso no hace falta animar opacidad: cuando el
 * hueco tapa el viewport ya no queda nada del rojo que ocultar.
 *
 * El `transform-origin` sale del centro de la O calculado sobre el viewBox, no de un
 * porcentaje a ojo. Como la O esta a la derecha, escalar desde ahi arrastra el logo hacia
 * la izquierda: el paneo sale del propio encuadre, sin animar posicion aparte.
 *
 * Una advertencia: un `transform` escala el mapa de bits ya rasterizado, asi que al final
 * el borde del anillo se ve blando. Se nota poco porque lo ultimo que llena la pantalla
 * son dos colores planos, y las letras solo se leen mientras la escala es baja.
 *
 * ## Por que se quita sola
 *
 * Antes era una seccion del flujo de la que se salia bajando, para que nadie quedara
 * encerrado esperando. Esta se va sola a los 3.6s y se la salta cualquier gesto (clic,
 * rueda, dedo o tecla). Con `prefers-reduced-motion` no se ve: ahi no hay animacion que
 * valga la pena y un cartel inmovil tres segundos es solo una puerta cerrada.
 *
 * Va `aria-hidden`: la pagina real esta debajo y montada, asi que un lector de pantalla
 * la lee desde el primer momento en vez de anunciar una cortina.
 *
 * El logo es el de `logo/alta-resolucion/fiao-transparente-alta-resolucion.svg`, en linea:
 * 600 bytes de trazos, sin peticion de red y sin pixelarse al crecer 26 veces. Sustituye a
 * `firma.png`, que eran 79 kB y pedia un preload para no hundir el LCP.
 */

// El viewBox del logo y el centro de su O: por ahi entra la camara.
const CAJA = { w: 599, h: 181 }
const O = { cx: 504.5, cy: 97 }

// Lo que tarda la animacion completa, igual que en tailwind.config.ts.
const DURACION = 2400

// Rectangulo de fondo con el hueco de la O. Va de -2000 a 2600 para cubrir cualquier
// pantalla con el logo a su tamano de reposo; el segundo trazo es la elipse interior del
// anillo, que con evenodd queda calada.
const FONDO = "M-2000,-2000H2600V2200H-2000ZM461,96.5a43,45.5 0 1 0 86,0a43,45.5 0 1 0 -86,0Z"

export function Intro() {
  const [visible, setVisible] = useState(true)

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      setVisible(false)
      return
    }
    const fin = setTimeout(() => setVisible(false), DURACION)
    const saltar = () => setVisible(false)
    window.addEventListener("keydown", saltar)
    return () => {
      clearTimeout(fin)
      window.removeEventListener("keydown", saltar)
    }
  }, [])

  if (!visible) return null

  return (
    <div
      aria-hidden
      onPointerDown={() => setVisible(false)}
      onWheel={() => setVisible(false)}
      onTouchMove={() => setVisible(false)}
      className="fixed inset-0 z-[60] grid place-items-center overflow-hidden px-10"
    >
      {/* El transform va en el div y no en el <svg>: un transform sobre un elemento SVG se
          cae a hilo principal y rasteriza el vector en cada cuadro, que en un telefono de
          gama baja a 26 aumentos es justo donde aparece el tiron. Sobre un elemento HTML
          el navegador promueve la capa y escala el bitmap en el compositor. */}
      <div
        className="w-full max-w-2xl animate-intro"
        style={{ transformOrigin: `${(O.cx / CAJA.w) * 100}% ${(O.cy / CAJA.h) * 100}%` }}
      >
        <svg
          viewBox={`0 0 ${CAJA.w} ${CAJA.h}`}
          // El rectangulo del fondo se sale del viewBox a proposito: sin esto, el SVG lo
          // recorta y el rojo solo cubriria la franja del logo.
          className="w-full overflow-visible"
        >
          <path d={FONDO} fillRule="evenodd" fill={BRAND.rojo.DEFAULT} />
          {/* Tapa el hueco mientras el logo esta quieto: si no, se leen los titulares de la
            landing dentro de la O y parece un fallo de pintado. Se va justo cuando
            arranca el empuje, que es cuando el hueco pasa a ser la puerta. */}
          <circle cx={O.cx} cy={O.cy} r={44} fill={BRAND.rojo.DEFAULT} className="animate-intro-ojo" />
          <path
            fill="#fff"
            fillRule="evenodd"
            d="M10,19H118V46H46V82H109V109H46V159H10ZM142,19H178V159H142ZM196,159L258,19H293L355,159H319L307,131H243L231,159ZM254,105H296L275,52ZM385,9C397,9 406,17 406,29C406,39 401,49 397,58L387,81H368L376,49C377,47 375,47 373,46C367,43 365,36 365,29C365,17 373,9 385,9Z"
          />
          <path
            fill={BRAND.amarillo.DEFAULT}
            fillRule="evenodd"
            d="M423,97a81.5,76 0 1 0 163,0a81.5,76 0 1 0 -163,0ZM461,96.5a43,45.5 0 1 0 86,0a43,45.5 0 1 0 -86,0Z"
          />
        </svg>
      </div>
    </div>
  )
}
