"use client"

import { useTransition } from "react"

import { LANGS, type Lang } from "@/lib/i18n"
import { setLang } from "@/lib/lang-actions"

/**
 * Selector de idioma. Misma piel que ThemeToggle, distinto mecanismo.
 *
 * El tema se resuelve en el navegador; el idioma no puede, porque los textos los pinta
 * el servidor. Por eso esto llama a una Server Action en vez de escribir en
 * localStorage, y por eso recibe `current` como prop: el servidor ya sabe cual es.
 *
 * `useTransition` deja el boton marcado como ocupado mientras el servidor vuelve a
 * renderizar, sin congelar la pantalla.
 */
export function LangToggle({ current, className = "" }: { current: Lang; className?: string }) {
  const [pending, startTransition] = useTransition()

  return (
    <div role="group" aria-label="Language" className={`glass-bar inline-flex rounded-full p-1 ${className}`}>
      {LANGS.map(({ value, label }) => (
        <button
          key={value}
          type="button"
          lang={value}
          aria-pressed={current === value}
          disabled={pending}
          onClick={() => startTransition(() => setLang(value))}
          className={`h-10 rounded-full px-4 text-[13px] font-semibold transition duration-200 ease-apple focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rojo/40 disabled:opacity-60 ${
            current === value ? "bg-marron/10 text-marron" : "text-marron/60 hover:text-marron"
          }`}
        >
          {label}
        </button>
      ))}
    </div>
  )
}
