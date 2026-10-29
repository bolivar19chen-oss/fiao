import type { Metadata } from "next"

import { t } from "@/lib/i18n"
import { getLang } from "@/lib/lang"

import { getMeData } from "../data"
import { ScreenTitle } from "../ui"
import { CreditorList } from "./creditor-list"

export const metadata: Metadata = { title: "Creditors - FIA'O" }

// Los acreedores: las tiendas que te fiaron. Una pantalla propia porque es la lista que
// se consulta de verdad, y porque con varias tiendas necesita buscador.
export default async function CreditorsPage() {
  const { creditors } = await getMeData()
  const lang = await getLang()
  return (
    <>
      <ScreenTitle title={t(lang, "creditors")}>{t(lang, "creditorsIntro")}</ScreenTitle>
      <CreditorList creditors={creditors} lang={lang} />
    </>
  )
}
