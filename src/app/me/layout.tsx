import { getMeData } from "./data"
import { MeShell } from "./me-shell"

// El guardia vive aca y no en cada pantalla: getMeData redirige si no hay perfil o si el
// perfil es de negocio. Esta cacheado por request, asi que la pagina de dentro vuelve a
// pedirlo sin que cueste una segunda consulta.
export default async function MeLayout({ children }: { children: React.ReactNode }) {
  await getMeData()
  return <MeShell>{children}</MeShell>
}
