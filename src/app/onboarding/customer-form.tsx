"use client"

import { ArrowLeft, ArrowRight, LoaderCircle } from "lucide-react"
import { useActionState } from "react"
import { Field } from "@/components/app/ui"
import { completeCustomer, type FormState } from "./actions"

export function CustomerForm({ email, onBack }: { email: string; onBack: () => void }) {
  const [state, action, pending] = useActionState<FormState, FormData>(completeCustomer, null)

  return (
    <div className="glass w-full max-w-md rounded-[2rem] p-8">
      <button
        type="button"
        onClick={onBack}
        className="flex items-center gap-1.5 text-sm font-medium text-marron/60 hover:text-marron"
      >
        <ArrowLeft className="h-4 w-4" aria-hidden />
        Back
      </button>

      <p className="eyebrow mt-6">For customers</p>
      <h1 className="mt-2 font-display text-2xl font-semibold tracking-tight text-marron">Your details</h1>
      <p className="mt-2 text-[15px] text-marron/70">
        Your shop uses these to match you with the account they already keep for you.
      </p>

      {/* El boton se deshabilita mientras guarda: un doble clic crearia dos perfiles. */}
      <form action={action} aria-busy={pending} className="mt-7 space-y-4">
        <Field label="Full name" name="full_name" required minLength={2} maxLength={120} autoComplete="name" />
        <Field label="National ID" name="national_id" required autoComplete="off" hint="Your cedula number." />
        <Field label="Email" name="email" type="email" defaultValue={email} readOnly disabled />
        <Field label="Phone" name="phone" type="tel" required autoComplete="tel" />
        <Field label="Date of birth" name="date_of_birth" type="date" required hint="You must be 18 or older." />

        {state?.error && (
          <p role="alert" className="rounded-2xl bg-amarillo/20 px-4 py-3 text-center text-sm text-marron/85">
            {state.error}
          </p>
        )}

        <button type="submit" disabled={pending} className="btn btn-glass-red w-full disabled:opacity-70">
          {pending ? <LoaderCircle className="h-4 w-4 animate-spin" aria-hidden /> : null}
          {pending ? "Saving..." : "Continue"}
          {!pending && <ArrowRight className="h-4 w-4" aria-hidden />}
        </button>
      </form>
    </div>
  )
}
