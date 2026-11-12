import Image, { type StaticImageData } from "next/image"

import laConfianza from "@/assets/img/abarroteria-alto-de-la-estancia.webp"
import lolitas from "@/assets/img/abarroteria-san-juan-de-dios.webp"
import elLago from "@/assets/img/comercio-el-lago.webp"
import jose from "@/assets/img/legumbreria-jose.webp"
import sanJuan from "@/assets/img/minisuper-san-juan.webp"
import cristina from "@/assets/img/super-centro-cristina.webp"

interface Store {
  image: StaticImageData
  name: string
  place: string
  author: string
  license: string
  /** La pagina del archivo en Wikimedia Commons: la licencia exige enlazar la fuente. */
  source: string
}

const COMMONS = "https://commons.wikimedia.org/wiki/File:"

const stores: Store[] = [
  {
    image: laConfianza,
    name: "Abarrotería La Confianza",
    place: "Alto de la Estancia, Coclé",
    author: "Mitzi Valdés",
    license: "CC BY-SA 4.0",
    source: `${COMMONS}Abarroter%C3%ADa_de_la_comunidad_de_Alto_De_La_Estancia.jpg`,
  },
  {
    image: lolitas,
    name: "Abarrotería Lolitas",
    place: "San Juan de Dios, Coclé",
    author: "Mitzi Valdés",
    license: "CC BY-SA 4.0",
    source: `${COMMONS}Abarroter%C3%ADa_de_la_comunidad_de_San_Juan_De_Dios.jpg`,
  },
  {
    image: sanJuan,
    name: "Minisúper San Juan",
    place: "San Juan de Dios, Coclé",
    author: "Mitzi Valdés",
    license: "CC BY-SA 4.0",
    source: `${COMMONS}Min%C3%ADsuper_San_Juan.jpg`,
  },
  {
    image: jose,
    name: "Legumbrería José",
    place: "Isla Colón, Bocas del Toro",
    author: "JurriaanH",
    license: "CC BY-SA 3.0",
    source: `${COMMONS}Bocas_del_Toro_greengrocer.jpg`,
  },
  {
    image: cristina,
    name: "Super Centro Cristina",
    place: "Isla Colón, Bocas del Toro",
    author: "hh oldman",
    license: "CC BY 3.0",
    source: `${COMMONS}Super_Centro_Cristina_-_panoramio.jpg`,
  },
  {
    image: elLago,
    name: "Minisúper El Lago",
    place: "Isla Bastimentos, Bocas del Toro",
    author: "hh oldman",
    license: "CC BY 3.0",
    source: `${COMMONS}El_Lago_-_panoramio.jpg`,
  },
]

export function StoreGallery() {
  return (
    <section className="container-x py-24" aria-labelledby="stores-title">
      <p className="eyebrow">Who it&apos;s for</p>
      <h2 id="stores-title" className="section-title mt-3 max-w-2xl">
        The stores FIA&apos;O is built for.
      </h2>
      <ul className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {stores.map(({ image, name, place, author, license, source }) => (
          <li key={name}>
            <figure>
              <Image
                src={image}
                alt={`Storefront of ${name} in ${place}, Panama.`}
                sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
                className="aspect-[4/3] w-full rounded-3xl object-cover ring-1 ring-marron/10"
              />
              <figcaption className="mt-3">
                <p className="font-display font-semibold">{name}</p>
                <p className="text-sm text-marron/70">{place}</p>
                <p className="mt-1 text-xs text-marron/70">
                  Photo:{" "}
                  <a href={source} className="underline underline-offset-2">
                    {author}
                  </a>
                  , {license}. Resized.
                </p>
              </figcaption>
            </figure>
          </li>
        ))}
      </ul>
    </section>
  )
}
