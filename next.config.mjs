/** @type {import('next').NextConfig} */
const nextConfig = {
  // Hay un package-lock.json suelto en la carpeta del usuario; sin esto Next toma esa
  // carpeta como raiz del proyecto.
  outputFileTracingRoot: import.meta.dirname,
}

export default nextConfig
