// Borra los builds y caches de Next: .next, .next-build, .next-turbo...
//
// Todo eso se regenera solo. La cache de webpack de `next build` crece sin limite: llego a
// 686 MB para un build real de 8 MB, y cada `pnpm build` suma otro paquete encima.
//
// Corre con los servidores parados: un `pnpm dev` o `pnpm start` en marcha lee de estas
// carpetas y se quedaria sin chunks.
import { readdirSync, rmSync } from "node:fs"

for (const name of readdirSync(".")) {
  if (!/^\.next(-.+)?$/.test(name)) continue
  rmSync(name, { recursive: true, force: true })
  console.log(`removed ${name}`)
}
