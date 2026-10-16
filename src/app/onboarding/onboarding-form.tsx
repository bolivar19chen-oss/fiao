"use client"

import { useActionState } from "react"
import { ArrowRight, Store } from "lucide-react"
import { createBusiness } from "./actions"

export function OnboardingForm() {
  const [state, action, pending] = useActionState(createBusiness, null)

  return (
    // El boton se deshabilita mientras crea: un doble clic crearia dos negocios.
    <form action={action} aria-busy={pending} className="mt-8 flex flex-col gap-3">
      <label className="flex h-14 items-center gap-3 rounded-full border border-marron/10 bg-white/70 px-5 transition focus-within:border-rojo/40 focus-within:bg-white focus-within:ring-4 focus-within:ring-rojo/10">
        <Store className="h-5 w-5 shrink-0 text-marron/50" strokeWidth={1.75} aria-hidden />
        <span className="sr-only">Store name</span>
        <input
          name="name"
          required
          maxLength={80}
          autoComplete="organization"
          placeholder="Store name"
          defaultValue={state?.name}
          className="w-full bg-transparent text-[15px] font-medium text-marron outline-none placeholder:font-normal placeholder:text-marron/40"
        />
      </label>
      {state?.error && (
        <p role="alert" className="rounded-2xl bg-amarillo/20 px-4 py-3 text-center text-sm text-marron/85">
          {state.error}
        </p>
      )}
      <button type="submit" disabled={pending} className="btn btn-glass-red h-12 disabled:opacity-70">
        {pending ? "Creating your store..." : "Create store"}
        {!pending && <ArrowRight className="h-4 w-4" aria-hidden />}
      </button>
    </form>
  )
}
