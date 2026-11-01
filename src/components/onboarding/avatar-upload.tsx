"use client"

import { useEffect, useRef, useState } from "react"
import { LoaderCircle, Upload, UserRound } from "lucide-react"

import { createClient } from "@/lib/supabase/client"

// Sube directo del navegador a Storage, con la sesion del propio usuario: la RLS de
// 20261018200000_avatars.sql autoriza y el bucket exige tipo y tamano. Pasarlo por una
// server action solo agregaria el limite de cuerpo de Next y una copia en memoria.
//
// La ruta es fija, asi que no hay nada que guardar en la base: si el objeto existe, hay
// avatar. La foto es opcional y nunca bloquea el alta.
const BUCKET = "avatars"
const MAX_BYTES = 2 * 1024 * 1024
const TYPES = ["image/png", "image/jpeg", "image/webp"]

const rutaDe = (uid: string) => `${uid}/avatar`

export function AvatarUpload() {
  const [url, setUrl] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [busy, setBusy] = useState(false)
  const input = useRef<HTMLInputElement>(null)

  // Reemplaza la vista previa y suelta la anterior: cada subida crea un blob: nuevo.
  const mostrar = (siguiente: string | null) =>
    setUrl((previo) => {
      if (previo?.startsWith("blob:")) URL.revokeObjectURL(previo)
      return siguiente
    })

  useEffect(() => {
    let vivo = true
    void (async () => {
      const supabase = createClient()
      const { data: auth } = await supabase.auth.getClaims()
      const uid = auth?.claims.sub
      if (!uid) return
      // Firmada y de vida corta: el bucket es privado a proposito.
      const { data } = await supabase.storage.from(BUCKET).createSignedUrl(rutaDe(uid), 60)
      if (vivo && data) setUrl(data.signedUrl)
    })()
    return () => {
      vivo = false
    }
  }, [])

  async function subir(file: File) {
    setError(null)
    // El bucket rechaza igual los dos casos. Esto solo evita subir 2 MB para nada.
    if (!TYPES.includes(file.type)) return setError("Use a PNG, JPG or WebP image.")
    if (file.size > MAX_BYTES) return setError("That image is larger than 2MB.")

    setBusy(true)
    const supabase = createClient()
    const { data: auth } = await supabase.auth.getClaims()
    const uid = auth?.claims.sub
    if (!uid) {
      setBusy(false)
      return setError("Your session expired. Log in again.")
    }

    const { error: fallo } = await supabase.storage
      .from(BUCKET)
      .upload(rutaDe(uid), file, { upsert: true, contentType: file.type })
    setBusy(false)
    if (fallo) return setError("We couldn't upload that photo. Try again.")
    mostrar(URL.createObjectURL(file))
  }

  async function quitar() {
    setError(null)
    setBusy(true)
    const supabase = createClient()
    const { data: auth } = await supabase.auth.getClaims()
    const uid = auth?.claims.sub
    if (!uid) {
      setBusy(false)
      return setError("Your session expired. Log in again.")
    }

    const { error: fallo } = await supabase.storage.from(BUCKET).remove([rutaDe(uid)])
    setBusy(false)
    if (fallo) return setError("We couldn't remove that photo. Try again.")
    mostrar(null)
    if (input.current) input.current.value = ""
  }

  return (
    <div>
      {/* Apilado en pantalla angosta: con los dos botones en la misma linea, dentro de una
          tarjeta de 375px el texto se quedaba sin sitio y caia a una palabra por renglon. */}
      <div className="flex flex-col items-start gap-3 rounded-lg border border-marron/10 bg-fondo/50 p-3 text-left sm:flex-row sm:items-center sm:justify-between">
        <span className="flex min-w-0 items-center gap-3">
          <span className="grid h-10 w-10 shrink-0 place-items-center overflow-hidden rounded-full bg-crema text-marron/70">
            {url ? (
              // next/image no aplica: la URL viene firmada y vence en 60 segundos, asi que
              // el optimizador la cachearia ya muerta.
              // eslint-disable-next-line @next/next/no-img-element
              <img src={url} alt="" className="h-full w-full object-cover" />
            ) : (
              <UserRound className="h-5 w-5" aria-hidden />
            )}
          </span>
          <span className="min-w-0">
            <span className="block text-sm font-medium text-marron">Your photo</span>
            <span className="block text-xs leading-relaxed text-marron/70">Optional. PNG or JPG, up to 2MB.</span>
          </span>
        </span>

        <span className="flex shrink-0 items-center gap-1.5">
          {url && !busy && (
            <button
              type="button"
              onClick={() => void quitar()}
              className="rounded-full px-2.5 py-1 text-xs font-medium text-marron/70 transition hover:text-rojo focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rojo/40"
            >
              Remove
            </button>
          )}
          <button
            type="button"
            onClick={() => input.current?.click()}
            disabled={busy}
            className="btn btn-glass h-9 px-3 text-xs disabled:opacity-70"
          >
            {busy ? (
              <LoaderCircle className="h-4 w-4 animate-spin" aria-hidden />
            ) : (
              <Upload className="h-4 w-4" aria-hidden />
            )}
            {busy ? "Saving" : url ? "Change" : "Upload"}
          </button>
        </span>

        <input
          ref={input}
          type="file"
          accept={TYPES.join(",")}
          className="sr-only"
          aria-label="Upload your photo"
          onChange={(event) => {
            const file = event.target.files?.[0]
            if (file) void subir(file)
          }}
        />
      </div>

      {error && (
        <p role="alert" className="mt-1.5 text-xs text-rojo">
          {error}
        </p>
      )}
    </div>
  )
}
