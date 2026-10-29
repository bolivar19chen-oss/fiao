import { NextResponse, type NextRequest } from "next/server"
import type { Database } from "@shared/types/database"
import { createServerClient } from "@supabase/ssr"

// Refresca la sesion y aplica las redirecciones que solo dependen de tener sesion o no.
// La pertenencia a un negocio NO se comprueba aca: costaria una consulta a la base en cada
// request. La hace el layout de (app), que solo corre en paginas de la aplicacion.
export async function updateSession(request: NextRequest) {
  let response = NextResponse.next({ request })

  const supabase = createServerClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet, headers) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value))
          response = NextResponse.next({ request })
          cookiesToSet.forEach(({ name, value, options }) => response.cookies.set(name, value, options))
          Object.entries(headers).forEach(([key, value]) => response.headers.set(key, value))
        },
      },
    },
  )

  // getClaims valida el JWT; getSession no lo hace y no sirve para decidir acceso.
  const { data } = await supabase.auth.getClaims()
  const signedIn = Boolean(data?.claims)

  // El matcher ya acota las rutas: todo lo que llega aca es protegido menos /login.
  const { pathname } = request.nextUrl

  if (!signedIn && pathname !== "/login") return redirect(request, response, "/login")
  // A /onboarding y no a /app: es la unica pagina que sabe enrutar por rol, y aca no se
  // puede saber cual es sin consultar la base. Mandar a /app hacia que un cliente diera
  // tres saltos (/app -> /onboarding -> /me) antes de llegar.
  if (signedIn && pathname === "/login") return redirect(request, response, "/onboarding")

  return response
}

// La redireccion tiene que llevar las cookies refrescadas, o la sesion se pierde.
function redirect(request: NextRequest, from: NextResponse, pathname: string) {
  const url = request.nextUrl.clone()
  url.pathname = pathname
  url.search = ""
  const to = NextResponse.redirect(url)
  from.cookies.getAll().forEach((cookie) => to.cookies.set(cookie))
  return to
}
