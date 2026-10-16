"use client"

import { startTransition, useActionState } from "react"

export type FormState = { error: string } | { ok: string } | null

// Formulario para Server Actions. Se envia desde onSubmit y no con action={...} para que
// React no vacie los campos cuando el servidor devuelve un error.
export function ActionForm({
  action,
  submitLabel,
  pendingLabel,
  children,
}: {
  action: (prev: FormState, formData: FormData) => Promise<FormState>
  submitLabel: string
  pendingLabel: string
  children: React.ReactNode
}) {
  const [state, formAction, pending] = useActionState(action, null)

  return (
    <form
      aria-busy={pending}
      className="flex flex-col gap-4"
      onSubmit={(event) => {
        event.preventDefault()
        const formData = new FormData(event.currentTarget)
        startTransition(() => formAction(formData))
      }}
    >
      {children}
      {state && (
        <p
          role={"error" in state ? "alert" : "status"}
          className={`rounded-2xl px-4 py-3 text-sm ${"error" in state ? "bg-rojo/10 text-rojo" : "bg-amarillo/20 text-marron/85"}`}
        >
          {"error" in state ? state.error : state.ok}
        </p>
      )}
      {/* Deshabilitado mientras envia: un doble clic no debe insertar dos veces. */}
      <button type="submit" disabled={pending} className="btn btn-glass-red h-12 self-start px-7 disabled:opacity-70">
        {pending ? pendingLabel : submitLabel}
      </button>
    </form>
  )
}
