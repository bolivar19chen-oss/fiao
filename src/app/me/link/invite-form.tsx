"use client"

import { ArrowLeft, ArrowRight, LoaderCircle, Store } from "lucide-react"
import Link from "next/link"
import { useActionState } from "react"
import { redeemInvite, type FormState } from "@/app/onboarding/actions"

export function InviteForm() {
  const [state, action, pending] = useActionState<FormState, FormData>(redeemInvite, null)

  return (
    <div className="glass w-full max-w-md rounded-[2rem] p-8">
      <Link href="/me" className="flex items-center gap-1.5 text-sm font-medium text-marron/60 hover:text-marron">
        <ArrowLeft className="h-4 w-4" aria-hidden />
        My accounts
      </Link>

      <span className="mt-6 grid h-12 w-12 place-items-center rounded-2xl bg-crema text-marron">
        <Store className="h-6 w-6" aria-hidden />
      </span>

      <p className="eyebrow mt-6">Link a shop</p>
      <h1 className="mt-2 font-display text-2xl font-semibold tracking-tight text-marron">Enter your invite code</h1>
      <p className="mt-2 text-[15px] leading-relaxed text-marron/70">
        Ask for it at the counter, next time you shop. It links your account to the notebook they already keep for you.
      </p>

      <form action={action} aria-busy={pending} className="mt-7 space-y-4">
        <label className="block">
          <span className="text-sm font-medium text-marron">Invite code</span>
          <input
            name="code"
            required
            autoComplete="off"
            autoCapitalize="characters"
            spellCheck={false}
            placeholder="A1B2C3D4E5F6"
            className="mt-1.5 h-14 w-full rounded-2xl border border-marron/10 bg-white/70 px-4 text-center font-display text-xl font-semibold uppercase tracking-[0.18em] text-marron outline-none transition placeholder:font-sans placeholder:text-base placeholder:font-normal placeholder:tracking-normal placeholder:text-marron/30 focus:border-rojo/40 focus:bg-white focus:ring-4 focus:ring-rojo/10"
          />
        </label>

        {state?.error && (
          <p role="alert" className="rounded-2xl bg-amarillo/20 px-4 py-3 text-center text-sm text-marron/85">
            {state.error}
          </p>
        )}

        <button type="submit" disabled={pending} className="btn btn-glass-red w-full disabled:opacity-70">
          {pending ? <LoaderCircle className="h-4 w-4 animate-spin" aria-hidden /> : null}
          {pending ? "Checking..." : "Link my account"}
          {!pending && <ArrowRight className="h-4 w-4" aria-hidden />}
        </button>
      </form>

      <p className="mt-6 text-center text-xs leading-relaxed text-marron/55">
        No code yet? You can keep using FIA&apos;O without one. Shops hand them out at the counter.
      </p>
    </div>
  )
}
