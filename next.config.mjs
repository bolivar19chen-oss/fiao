/**
 * Cabeceras de seguridad para todas las rutas.
 *
 * ## El CSP, y por que esta a medias a proposito
 *
 * Las directivas de abajo son las que NO pueden romper nada: no dicen nada sobre scripts
 * ni estilos, solo cierran vectores que la aplicacion no usa. Van en modo bloqueo.
 *
 * Lo que falta es `script-src` y `style-src` con nonce. Eso si puede dejar la pagina en
 * blanco: Next inyecta sus propios scripts en linea y Framer Motion escribe estilos en
 * linea, y los dos necesitan que el nonce les llegue. Se hace en el middleware, generando
 * un nonce por peticion, y hay que probarlo con sesion iniciada antes de activarlo.
 * Mientras no este probado no se pone: un CSP mal puesto rompe produccion en silencio.
 */
const csp = [
  // Solo formularios hacia este mismo origen: frena el robo de credenciales por un
  // `action` inyectado que apunte a otro sitio.
  "form-action 'self'",
  // Nadie reescribe la base de las URLs relativas.
  "base-uri 'self'",
  // Nadie mete FIA'O en un iframe. Es el X-Frame-Options de abajo, en version moderna;
  // se dejan los dos porque los navegadores viejos solo entienden el otro.
  "frame-ancestors 'none'",
  // La aplicacion no usa <object>, <embed> ni applets.
  "object-src 'none'",
].join("; ")

const securityHeaders = [
  { key: "Content-Security-Policy", value: csp },
  // Nadie puede meter el login dentro de un iframe (clickjacking).
  { key: "X-Frame-Options", value: "DENY" },
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=()" },
]

/** @type {import('next').NextConfig} */
const nextConfig = {
  // Hay un package-lock.json suelto en la carpeta del usuario; sin esto Next toma esa
  // carpeta como raiz del proyecto.
  outputFileTracingRoot: import.meta.dirname,
  // `pnpm build` escribe en .next-build y no en .next (ver el script en package.json).
  // Compartir carpeta con el servidor de desarrollo le borra los chunks en caliente: la
  // pagina queda sin CSS y la consola tira "Cannot find module './221.js'".
  distDir: process.env.NEXT_DIST_DIR || ".next",
  poweredByHeader: false,
  experimental: {
    // Cache del router en el cliente. Por defecto es 0: volver a una pantalla que acabas
    // de ver la pedia entera otra vez al servidor. Con esto, ir y venir entre pestanas es
    // instantaneo durante 30s. Las mutaciones llaman revalidatePath, que lo tira.
    staleTimes: { dynamic: 30, static: 180 },
  },
  async headers() {
    return [{ source: "/:path*", headers: securityHeaders }]
  },
}

export default nextConfig
