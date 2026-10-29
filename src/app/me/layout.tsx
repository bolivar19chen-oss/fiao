import { getLang } from "@/lib/lang"
import { requireCustomer } from "@/lib/profile"

import { MeShell } from "./me-shell"

// El guardia vive aca y no en cada pantalla. Pide el perfil, no la cartera: el layout
// bloquea el stream, asi que lo que espere aca retrasa hasta el esqueleto. Antes llamaba
// a getMeData() y /me/settings, /me/link y /me/payments pagaban la consulta grande sin
// usarla. Las pantallas que si la necesitan la piden ellas, y cache() la comparte.
export default async function MeLayout({ children }: { children: React.ReactNode }) {
  const [, lang] = await Promise.all([requireCustomer(), getLang()])
  return <MeShell lang={lang}>{children}</MeShell>
}
