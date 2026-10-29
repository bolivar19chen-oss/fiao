"use client"

import { useEffect, useState } from "react"
import Link from "next/link"

const KEY = "fiao.cookie-notice.seen"

// Aviso, no muro de consentimiento: hoy el proyecto usa solo las cookies de sesion de
// Supabase, que son estrictamente necesarias para que el login funcione y no requieren
// consentimiento. Pedirlo seria molestar por algo que no se puede rechazar.
//
// El dia que entre analitica o un pixel de terceros esto cambia: pasa a consentimiento
// real, con rechazar tan visible como aceptar, y nada se carga antes del si.
export function CookieNotice() {
  // Arranca oculto y se decide despues de montar: leer localStorage en el render del
  // servidor no es posible y daria un desajuste de hidratacion.
  const [show, setShow] = useState(false)

  useEffect(() => {
    try {
      if (!localStorage.getItem(KEY)) setShow(true)
    } catch {
      // Modo privado o almacenamiento bloqueado: no se muestra y no se rompe nada.
    }
  }, [])

  if (!show) return null

  const dismiss = () => {
    try {
      localStorage.setItem(KEY, "1")
    } catch {
      // Si no se puede recordar, al menos se cierra en esta visita.
    }
    setShow(false)
  }

  return (
    // No bloquea la pagina ni atrapa el foco: es una banda, no un dialogo.
    //
    // z-[70]: por encima de la cabecera fija (z-50) Y de la intro (z-[60]), que ocupa la
    // pantalla entera. Con z-50 el aviso quedaba debajo de la intro en la primera visita:
    // invisible e imposible de aceptar hasta bajar. Un consentimiento tapado no se da.
    <div className="fixed inset-x-0 bottom-0 z-[70] p-4" role="region" aria-label="Cookie notice">
      <div className="glass mx-auto flex w-full max-w-3xl flex-col items-start gap-3 rounded-2xl p-4 sm:flex-row sm:items-center sm:gap-5 sm:p-5">
        <p className="text-sm leading-relaxed text-marron/80">
          FIA&apos;O only uses the cookies needed to keep you signed in. No tracking, no advertising.{" "}
          <Link href="/privacy" className="font-medium text-rojo hover:underline">
            Read more
          </Link>
          .
        </p>
        <button type="button" onClick={dismiss} className="btn btn-glass h-10 shrink-0 px-5 text-sm sm:ml-auto">
          Got it
        </button>
      </div>
    </div>
  )
}
