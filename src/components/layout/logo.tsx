import Image from "next/image"

// El logo original de FIA'O, sin retocar: public/brand/fiao-logo.svg, con las letras claras y
// la O amarilla sobre su placa roja. Los colores viven en el archivo, no aqui, porque son los
// del logo y no los del tema. La placa roja se lee igual en claro que en oscuro.
//
// `mark` es solo la F, recortada de ese mismo archivo (public/brand/fiao-mark.svg): el logo
// completo mide 3.3 veces mas de ancho que de alto y en el riel de 72 px del panel del
// cliente quedaria con letras de 10 px. Es un recorte del original, no un logo nuevo.
//
// `loading="eager"`: pesa 600 bytes y esta siempre en la cabecera, no vale la pena diferirlo.
export function Logo({ className = "", mark = false }: { className?: string; mark?: boolean }) {
  return mark ? (
    <Image
      src="/brand/fiao-mark.svg"
      alt="FIA'O"
      width={181}
      height={181}
      loading="eager"
      className={`h-10 w-10 rounded-lg ${className}`}
    />
  ) : (
    <Image
      src="/brand/fiao-logo.svg"
      alt="FIA'O"
      width={599}
      height={181}
      loading="eager"
      className={`h-9 w-auto rounded-lg ${className}`}
    />
  )
}
