"use server"

import { revalidatePath } from "next/cache"
import { cookies } from "next/headers"

import { LANGS, type Lang } from "./i18n"

/**
 * Guarda el idioma elegido.
 *
 * Se valida contra la lista aunque venga de un boton nuestro: una Server Action es una
 * entrada publica, y cualquiera puede llamarla con lo que quiera.
 *
 * `revalidatePath("/", "layout")` tira el cache de TODAS las rutas: los textos salen del
 * servidor, asi que cambiar de idioma invalida cada pantalla ya renderizada.
 */
export async function setLang(lang: Lang) {
  if (!LANGS.some((option) => option.value === lang)) return

  const store = await cookies()
  store.set("lang", lang, {
    path: "/",
    maxAge: 60 * 60 * 24 * 365,
    sameSite: "lax",
  })

  revalidatePath("/", "layout")
}
