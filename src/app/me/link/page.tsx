import type { Metadata } from "next"

import { t } from "@/lib/i18n"
import { getLang } from "@/lib/lang"

import { ScreenTitle } from "../ui"
import { InviteForm } from "./invite-form"

export const metadata: Metadata = { title: "Link a shop - FIA'O" }

// Vive bajo /me y no en el registro a proposito: pedir el codigo no es un paso del alta.
// El cliente se registra desde su casa, mira la aplicacion, y vincula la tienda cuando
// pasa por el mostrador y le dan el codigo. Vuelve aca cada vez que suma una tienda.
//
// El guardia y el riel los pone el layout de /me: aca solo va el contenido.
export default async function LinkShopPage() {
  const lang = await getLang()

  return (
    <>
      <ScreenTitle title={t(lang, "linkShop")}>{t(lang, "linkIntro")}</ScreenTitle>
      <InviteForm />
    </>
  )
}
