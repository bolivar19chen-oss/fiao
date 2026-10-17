// Corre `next <comando>` con NEXT_DIST_DIR apuntando a una carpeta propia del build,
// separada de la que usa el servidor de desarrollo.
//
// Por que: `next build` y `next dev` compartiendo .next se pisan. El build le borra los
// chunks en caliente al dev server y la pagina queda sin CSS, con "Cannot find module
// './221.js'" en la consola. Paso dos veces en este proyecto.
//
// En CI y en Vercel se deja .next: ahi no hay servidor de desarrollo con el que chocar,
// y la plataforma espera la salida en la carpeta por defecto.
//
// Va en un archivo y no en una linea de package.json porque poner una variable de
// entorno delante del comando no funciona igual en Windows que en un shell POSIX.
import { spawnSync } from "node:child_process"
import { createRequire } from "node:module"

const require = createRequire(import.meta.url)
const args = process.argv.slice(2)

const distDir = process.env.NEXT_DIST_DIR || (process.env.CI ? ".next" : ".next-build")

const result = spawnSync(process.execPath, [require.resolve("next/dist/bin/next"), ...args], {
  stdio: "inherit",
  env: { ...process.env, NEXT_DIST_DIR: distDir },
})

process.exit(result.status ?? 1)
