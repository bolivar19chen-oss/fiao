import { cookies } from "next/headers"

import { DEFAULT_LANG, LANGS, type Lang } from "./i18n"

/**
 * El idioma elegido, leido de la cookie en el servidor.
 *
 * Cookie y no localStorage, al reves que el tema: el tema lo aplica una clase de CSS y
 * puede resolverse en el navegador, pero los TEXTOS se renderizan en el servidor. Si el
 * idioma viviera solo en el navegador, la primera pantalla llegaria siempre en ingles y
 * cambiaria de golpe al hidratar.
 *
 * Cualquier valor que no sea uno de los tres cae al ingles: una cookie la edita quien
 * quiera.
 */
export async function getLang(): Promise<Lang> {
  const value = (await cookies()).get("lang")?.value
  return LANGS.some((option) => option.value === value) ? (value as Lang) : DEFAULT_LANG
}
