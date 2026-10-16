import { headers } from "next/headers"

// A donde vuelven los enlaces que se mandan por correo (confirmacion de cuenta, recuperar
// contrasena).
//
// No se puede usar solo la cabecera origin: es el puerto donde corria el servidor cuando
// se envio el correo. Si Next arranco en 3001 porque el 3000 estaba ocupado, el enlace
// queda apuntando al 3001 y al hacer clic un rato despues no hay nada escuchando ahi.
// El sintoma es "localhost rechazo la conexion".
//
// Orden: la variable explicita manda; origin solo como respaldo en desarrollo.
export async function siteUrl(): Promise<string> {
  const configured = process.env.NEXT_PUBLIC_SITE_URL?.trim()
  if (configured) return configured.replace(/\/+$/, "")

  const origin = (await headers()).get("origin")
  if (origin) return origin.replace(/\/+$/, "")

  return "http://localhost:3000"
}
