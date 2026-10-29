"use client"

import { useActionState } from "react"
import { Check, LoaderCircle, Smartphone } from "lucide-react"

import { Card, CardTitle, Field } from "@/components/app/ui"

import { createInvite, type InviteState } from "./actions"

export function InviteCard({ customerId, linked }: { customerId: string; linked: boolean }) {
  const [state, action, pending] = useActionState<InviteState, FormData>(createInvite, null)
  const issued = state && "code" in state ? state : null

  if (linked) {
    return (
      <Card>
        <CardTitle>FIA&apos;O account</CardTitle>
        <p className="flex items-center gap-2 text-[15px] text-marron/75">
          <Check className="h-4 w-4 shrink-0 text-estado-al-dia" aria-hidden />
          Linked. This customer can see their balance and payment history.
        </p>
      </Card>
    )
  }

  return (
    <Card>
      <CardTitle>FIA&apos;O account</CardTitle>

      {issued ? (
        <>
          <p className="text-[15px] text-marron/75">Read this code to them at the counter.</p>
          {/* Un campo de solo lectura y no un parrafo: se puede seleccionar y copiar.
              Se muestra una vez, porque la base guarda el hash y no el codigo. Por eso el
              boton de abajo se queda: si el cliente no alcanzo a anotarlo, se genera otro
              sin recargar la pagina. */}
          <Field
            label="Invite code"
            look="code"
            readOnly
            value={issued.code}
            onFocus={(e) => e.currentTarget.select()}
            hint={`Valid for ${issued.expiresInHours} hours, single use. It is not shown again.`}
          />
        </>
      ) : (
        <p className="text-[15px] text-marron/75">
          Not linked yet. Give them a code so they can see what they owe from their phone.
        </p>
      )}

      <form action={action} className="mt-3">
        <input type="hidden" name="customer_id" value={customerId} />
        <button type="submit" disabled={pending} className="btn btn-glass h-11 disabled:opacity-70">
          {pending ? (
            <LoaderCircle className="h-4 w-4 animate-spin" aria-hidden />
          ) : (
            <Smartphone className="h-4 w-4" aria-hidden />
          )}
          {pending ? "Creating..." : issued ? "Create another code" : "Create invite code"}
        </button>
      </form>

      {state && "error" in state && (
        <p role="alert" className="mt-3 rounded-2xl bg-amarillo/20 px-4 py-3 text-sm text-marron/85">
          {state.error}
        </p>
      )}
    </Card>
  )
}
