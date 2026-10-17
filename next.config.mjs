// Cabeceras de seguridad basicas para todas las rutas. Sin CSP por ahora: Next, Framer
// Motion y los estilos en linea necesitan nonces, y eso se configura aparte.
const securityHeaders = [
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
  async headers() {
    return [{ source: "/:path*", headers: securityHeaders }]
  },
}

export default nextConfig
