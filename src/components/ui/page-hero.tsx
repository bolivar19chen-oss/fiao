import Image, { type StaticImageData } from "next/image"

import { Aurora } from "./aurora"

interface PageHeroProps {
  eyebrow: string
  title: React.ReactNode
  lead: string
  /** Foto de fondo, solo en tema claro: ahi sustituye a la luz de color de la Aurora. */
  image?: StaticImageData
  /** object-position de la foto, para dejar a la vista el rotulo y no el techo. */
  imagePosition?: string
}

export function PageHero({ eyebrow, title, lead, image, imagePosition = "50% 50%" }: PageHeroProps) {
  return (
    <section className="relative isolate overflow-hidden pb-20 pt-36 sm:pt-44">
      <Aurora />
      {image && (
        // `--foto` es 1 en claro y 0 en oscuro (tailwind.config.ts). En oscuro la foto no se ve y
        // queda la Aurora: una foto clara por detras baja el rojo del eyebrow de 4.6:1 a 3.4:1, y
        // ningun velo razonable lo arregla sin esconderla.
        <div aria-hidden className="absolute inset-0 -z-10" style={{ opacity: "var(--foto)" }}>
          {/* Es la imagen mas grande de la pantalla, o sea la que mide el LCP: va en el HTML con
              prioridad alta y nunca diferida (R-40). Es decorativa, asi que alt vacio (R-39). La
              calidad baja a 40 porque queda bajo un velo del 75 al 85 %. Medido en produccion, a
              ancho completo baja de 156 KB (calidad 55) a 132 KB, y un celular pide la variante
              de 750 px, que pesa 36 KB. */}
          <Image
            src={image}
            alt=""
            priority
            // `priority` no lo emite en esta version de Next: se pide a mano (R-40).
            fetchPriority="high"
            quality={40}
            sizes="100vw"
            // Sin `fill`: asi el <img> conserva width y height en el HTML (R-40) y las clases lo
            // estiran a toda la cabecera.
            className="absolute inset-0 h-full w-full object-cover"
            style={{ objectPosition: imagePosition }}
          />
          {/* El velo es del color del fondo, asi que la tinta de arriba se lee y la foto se funde
              con la seccion que sigue. */}
          <div className="absolute inset-0 bg-gradient-to-b from-fondo/75 via-fondo/85 to-fondo" />
        </div>
      )}
      <div className="container-x max-w-4xl text-center">
        <p className="eyebrow">{eyebrow}</p>
        <h1 className="mt-4 font-display text-4xl font-semibold leading-[1.08] tracking-tight sm:text-6xl">{title}</h1>
        <p className="mx-auto mt-6 max-w-2xl text-lg leading-relaxed text-marron/70">{lead}</p>
      </div>
    </section>
  )
}
