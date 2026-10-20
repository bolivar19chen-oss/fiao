import type { Metadata } from "next"

import { getMeData } from "../data"
import { ScreenTitle } from "../ui"
import { CreditorList } from "./creditor-list"

export const metadata: Metadata = { title: "Creditors - FIA'O" }

// Los acreedores: las tiendas que te fiaron. Una pantalla propia porque es la lista que
// se consulta de verdad, y porque con varias tiendas necesita buscador.
export default async function CreditorsPage() {
  const { creditors } = await getMeData()
  return (
    <>
      <ScreenTitle title="Creditors">Every shop that sells to you on credit, and what you owe each one.</ScreenTitle>
      <CreditorList creditors={creditors} />
    </>
  )
}
