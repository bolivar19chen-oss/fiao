import type { Metadata } from "next"

import { ScreenTitle } from "../ui"
import { InviteForm } from "./invite-form"

export const metadata: Metadata = { title: "Link a shop - FIA'O" }

// Vive bajo /me y no en el registro a proposito: pedir el codigo no es un paso del alta.
// El cliente se registra desde su casa, mira la aplicacion, y vincula la tienda cuando
// pasa por el mostrador y le dan el codigo. Vuelve aca cada vez que suma una tienda.
//
// El guardia y el riel los pone el layout de /me: aca solo va el contenido.
export default function LinkShopPage() {
  return (
    <>
      <ScreenTitle title="Link a shop">Enter the invite code they give you at the counter.</ScreenTitle>
      <InviteForm />
    </>
  )
}
