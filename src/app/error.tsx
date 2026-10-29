"use client"

import { useEffect } from "react"
import Link from "next/link"
import { RotateCcw } from "lucide-react"

// Red de seguridad para un fallo en marcha. No es el 404: not-found.tsx atiende rutas
// que no existen, esto atiende codigo que revento, y lo que el usuario puede hacer es
// distinto. reset() vuelve a montar el arbol que fallo sin recargar la pagina.
//
// No sustituye arreglar la causa: por eso el fallo queda escrito en la consola.
export default function Error({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => {
    // Sin esto el fallo desaparece sin dejar rastro en produccion.
    console.error("Unhandled error:", error)
  }, [error])

  return (
    <main className="flex min-h-[100dvh] flex-col items-center justify-center bg-papel px-6 text-center">
      <h1 className="font-display text-[34px] font-bold leading-[41px] tracking-[-0.015em] text-marron">
        Something broke
      </h1>
      <p className="mt-3 max-w-md text-[17px] leading-[22px] text-marron/65">
        Not your fault. Nothing you had recorded was lost: try again, and if it keeps happening tell us.
      </p>

      <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
        <button type="button" onClick={reset} className="btn btn-glass-red">
          <RotateCcw className="h-4 w-4" strokeWidth={2} aria-hidden />
          Try again
        </button>
        <Link href="/" className="btn btn-glass">
          Go home
        </Link>
      </div>

      {/* El digest es lo unico que identifica este fallo concreto en los registros del
          servidor. Sin el, un reporte de usuario es imposible de cruzar con nada. */}
      {error.digest && <p className="mt-8 text-[13px] text-marron/45">Reference: {error.digest}</p>}
    </main>
  )
}
