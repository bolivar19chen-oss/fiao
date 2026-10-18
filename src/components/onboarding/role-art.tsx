import { BRAND } from "@/lib/colors"

/**
 * Las marcas de los dos roles, dibujadas para este proyecto.
 *
 * Antes aca iban `Store` y `User` de lucide: dos glifos de contorno que se ven igual en
 * cualquier aplicacion. Estas no. Siguen el lenguaje del logo (`layout/logo.tsx`): formas
 * planas, geometricas, y el punto amarillo como firma de la marca.
 *
 * **Paleta.** Todos los colores son fijos, como `rojo-marca`: una marca no cambia de color
 * con el tema. Eso incluye el marron, que aqui solo aparece sobre crema (puerta, ventana,
 * canto) y nunca contra el fondo de la pagina, donde si desapareceria en oscuro. Ver
 * `CANTO`.
 *
 * **Tamano.** Dibujadas para aguantar desde 28px: pocas formas, bien separadas. A ese
 * tamano el detalle se vuelve ruido.
 */

/**
 * El canto de las superficies crema. La insignia que lleva estas marcas es `bg-fondo`:
 * blanca en claro y casi negra en oscuro. El crema es fijo, asi que sobre la insignia
 * blanca se perdia por completo (la ficha del cliente quedaba como un punto flotando).
 * Con un canto marron la forma se sostiene sobre las dos.
 *
 * Por lo mismo, lo que va *dentro* del crema (puerta, ventana) tambien es fijo: el crema
 * no cambia con el tema, asi que un hueco en `--fondo` solo funcionaba en oscuro.
 */
const CANTO = { stroke: BRAND.marron.DEFAULT, strokeWidth: 0.9, strokeOpacity: 0.55 }

/**
 * La calle del banner: una fila de mini supers con su toldo y su puerta.
 *
 * El diseno de referencia pone una foto decorativa en la banda superior. No hay ninguna
 * en el repo, y la del ejemplo vive en un CDN ajeno: habria que declarar ese dominio en
 * `next.config.mjs` y la tarjeta dependeria de un servidor que no es nuestro. Dibujada
 * pesa menos de 1 KB, escala a cualquier ancho y es de la marca, no de un banco de
 * imagenes.
 *
 * Una sola tinta por cara, con la opacidad haciendo la profundidad. Es ambiente, no
 * informacion: va `aria-hidden` y nada depende de verla.
 */
const LOCALES = [
  { x: -6, w: 86, h: 84 },
  { x: 84, w: 104, h: 108 },
  { x: 192, w: 78, h: 72 },
  { x: 274, w: 98, h: 98 },
  { x: 376, w: 78, h: 80 },
]

export function StreetArt({ tone }: { tone: "red" | "cream" }) {
  const tinta = tone === "red" ? BRAND.crema.DEFAULT : BRAND.marron.DEFAULT

  return (
    <svg
      viewBox="0 0 448 144"
      // meet anclado abajo: la calle entra entera y se apoya en el borde inferior. Con
      // slice, en pantalla angosta se recortaba y los locales de las puntas quedaban
      // partidos por la mitad, como un error de maquetacion.
      preserveAspectRatio="xMidYMax meet"
      className="absolute inset-0 h-full w-full"
      aria-hidden
    >
      <g fill={tinta}>
        {LOCALES.map(({ x, w, h }) => {
          const techo = 144 - h
          return (
            <g key={x}>
              <rect x={x} y={techo} width={w} height={h} rx="3" opacity={tone === "red" ? 0.16 : 0.13} />
              <path
                d={`M${x - 5} ${techo + 27} L${x + 7} ${techo + 9} H${x + w - 7} L${x + w + 5} ${techo + 27} Z`}
                opacity={tone === "red" ? 0.3 : 0.24}
              />
              <rect x={x + w / 2 - 12} y="118" width="24" height="26" rx="2" opacity={tone === "red" ? 0.3 : 0.24} />
            </g>
          )
        })}
      </g>
    </svg>
  )
}

/**
 * Las cinco franjas del toldo, de izquierda a derecha. Van escritas y no recortadas con
 * un `clipPath`: un `clipPath` necesita un `id` unico en todo el documento, y aca no hace
 * falta pagar ese precio. El toldo baja de 6.5-25.5 arriba a 2.5-29.5 abajo, asi que cada
 * franja es un trapecio.
 */
const TOLDO = [
  "M2.5 13 L6.5 5.5 H10.3 L7.9 13 Z",
  "M7.9 13 L10.3 5.5 H14.1 L13.3 13 Z",
  "M13.3 13 L14.1 5.5 H17.9 L18.7 13 Z",
  "M18.7 13 L17.9 5.5 H21.7 L24.1 13 Z",
  "M24.1 13 L21.7 5.5 H25.5 L29.5 13 Z",
]

/** Un mini super: toldo a rayas, pared, puerta y el punto de la marca. */
export function ShopArt({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 32 32" className={className} aria-hidden>
      <rect x="5" y="12" width="22" height="15.5" rx="1.25" fill={BRAND.crema.DEFAULT} {...CANTO} />
      <rect x="7.5" y="16.5" width="4" height="4" rx="0.75" fill={BRAND.marron.DEFAULT} />
      <rect x="12.5" y="18" width="7" height="9.5" rx="0.75" fill={BRAND.marron.DEFAULT} />
      <circle cx="23" cy="18.5" r="2" fill={BRAND.amarillo.DEFAULT} />

      {TOLDO.map((d, i) => (
        <path key={d} d={d} fill={i % 2 === 0 ? BRAND.rojo.DEFAULT : BRAND.crema.DEFAULT} />
      ))}
    </svg>
  )
}

/**
 * Un cliente sobre su ficha de credito.
 *
 * Simetrica a proposito, con la misma estructura que la tienda: una forma que corona y
 * otra que sostiene. Una primera version ponia la ficha al costado, en la mano, y la
 * marca quedaba volcada a la izquierda al lado del mini super.
 *
 * El hueco entre los hombros y la ficha es aire, no un borde dibujado: los hombros
 * terminan en y=19.5 y la ficha empieza en y=20.5.
 */
export function CustomerArt({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 32 32" className={className} aria-hidden>
      <circle cx="16" cy="8" r="4.5" fill={BRAND.rojo.DEFAULT} />
      <path d="M7 19.5 a9 9 0 0 1 18 0 Z" fill={BRAND.rojo.DEFAULT} />

      <rect x="5" y="20.5" width="22" height="7.5" rx="1.75" fill={BRAND.crema.DEFAULT} {...CANTO} />
      <rect x="7.5" y="23" width="8" height="1.75" rx="0.875" fill={BRAND.rojo.DEFAULT} />
      <circle cx="23" cy="24.25" r="1.75" fill={BRAND.amarillo.DEFAULT} />
    </svg>
  )
}
