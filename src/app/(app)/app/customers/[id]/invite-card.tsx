"use client"

import { Check, LoaderCircle, Smartphone } from "lucide-react"
import { useActionState } from "react"
import { Card, CardTitle } from "@/components/app/ui"
import { createInvite, type InviteState } from "./actions"

export function InviteCard({ customerId, linked }: { customerId: string; linked: boolean }) {
  const [state, action, pending] = useActionState<InviteState, FormData>(createInvite, null)

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

      {state && "code" in state ? (
        <>
          <p className="text-[15px] text-marron/75">Read this code to them at the counter.</p>
          <p className="mt-3 rounded-2xl border border-marron/10 bg-white/70 py-4 text-center font-display text-2xl font-bold tracking-[0.18em] text-marron">
            {state.code}
          </p>
          {/* Se muestra una vez: la base guarda el hash, no el codigo. */}
          <p className="mt-2 text-xs text-marron/55">
            Valid for {state.expiresInHours} hours, single use. It is not shown again, but you can create another one.
          </p>
        </>
      ) : (
        <>
          <p className="text-[15px] text-marron/75">
            Not linked yet. Give them a code so they can see what they owe from their phone.
          </p>
          <form action={action} className="mt-3">
            <input type="hidden" name="customer_id" value={customerId} />
            <button type="submit" disabled={pending} className="btn btn-glass h-11 disabled:opacity-70">
              {pending ? (
                <LoaderCircle className="h-4 w-4 animate-spin" aria-hidden />
              ) : (
                <Smartphone className="h-4 w-4" aria-hidden />
              )}
              {pending ? "Creating..." : "Create invite code"}
            </button>
          </form>
          {state && "error" in state && (
            <p role="alert" className="mt-3 rounded-2xl bg-amarillo/20 px-4 py-3 text-sm text-marron/85">
              {state.error}
            </p>
          )}
        </>
      )}
    </Card>
  )
}
