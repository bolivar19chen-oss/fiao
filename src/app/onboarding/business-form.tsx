"use client"

import { ArrowLeft, ArrowRight, LoaderCircle } from "lucide-react"
import { useActionState, useState } from "react"
import { Field } from "@/components/app/ui"
import { completeBusiness, type FormState } from "./actions"

export function BusinessForm({ onBack }: { onBack: () => void }) {
  const [state, action, pending] = useActionState<FormState, FormData>(completeBusiness, null)
  const [step, setStep] = useState<1 | 2>(1)
  const [structure, setStructure] = useState<"natural" | "corporation">("natural")
  const [nationalId, setNationalId] = useState("")

  return (
    <div className="glass w-full max-w-lg rounded-[2rem] p-8">
      <button
        type="button"
        onClick={() => (step === 1 ? onBack() : setStep(1))}
        className="flex items-center gap-1.5 text-sm font-medium text-marron/60 hover:text-marron"
      >
        <ArrowLeft className="h-4 w-4" aria-hidden />
        Back
      </button>

      <div className="mt-6 flex items-center gap-3">
        <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-marron/10">
          <div
            className="h-full rounded-full bg-rojo transition-all duration-500"
            style={{ width: step === 1 ? "50%" : "100%" }}
          />
        </div>
        <span className="text-xs font-semibold text-marron/55">Step {step} of 2</span>
      </div>

      <p className="eyebrow mt-6">For shop owners</p>
      <h1 className="mt-2 font-display text-2xl font-semibold tracking-tight text-marron">
        {step === 1 ? "Your details" : "Your business"}
      </h1>

      {/* Un solo form para los dos pasos: el paso 1 queda montado y oculto para que sus
          campos viajen en el envio. Si se desmontara, se perderian. */}
      <form action={action} aria-busy={pending} className="mt-7">
        <div className={step === 1 ? "space-y-4" : "hidden"} inert={step !== 1}>
          <Field label="Full name" name="full_name" required minLength={2} maxLength={120} autoComplete="name" />
          <Field
            label="National ID"
            name="national_id"
            required
            autoComplete="off"
            hint="Your cedula number."
            value={nationalId}
            onChange={(e) => setNationalId(e.target.value)}
          />
          <Field label="Phone" name="phone" type="tel" required autoComplete="tel" />
          <Field label="Date of birth" name="date_of_birth" type="date" required hint="You must be 18 or older." />

          <button type="button" onClick={() => setStep(2)} className="btn btn-glass-red w-full">
            Continue
            <ArrowRight className="h-4 w-4" aria-hidden />
          </button>
        </div>

        <div className={step === 2 ? "space-y-4" : "hidden"} inert={step !== 2}>
          <fieldset className="rounded-2xl border border-white/60 bg-white/50 p-4">
            <legend className="px-1 text-sm font-medium text-marron">Legal structure</legend>
            <div className="mt-2 flex gap-4">
              {(["natural", "corporation"] as const).map((value) => (
                <label key={value} className="flex items-center gap-2 text-sm text-marron">
                  <input
                    type="radio"
                    name="legal_structure"
                    value={value}
                    checked={structure === value}
                    onChange={() => setStructure(value)}
                    className="h-4 w-4 accent-rojo"
                  />
                  {value === "natural" ? "Sole proprietor" : "Corporation"}
                </label>
              ))}
            </div>
          </fieldset>

          <Field
            label="Trade name"
            name="trade_name"
            required
            maxLength={80}
            autoComplete="organization"
            hint="The name on the shop."
          />

          {structure === "corporation" && (
            <>
              <Field label="Registered legal name" name="legal_name" required />
              <Field label="Legal representative" name="legal_rep_name" required />
              <Field label="Legal representative ID" name="legal_rep_id" required />
            </>
          )}

          <div className="grid gap-4 sm:grid-cols-[1fr_6rem]">
            {/* En persona natural el RUC suele coincidir con la cedula: se prellena y se
                deja editar. */}
            <Field
              label="RUC"
              name="ruc"
              required
              defaultValue={structure === "natural" ? nationalId : undefined}
              key={structure + nationalId}
            />
            <Field label="DV" name="ruc_dv" required maxLength={3} />
          </div>

          <Field label="Operating notice no." name="operating_notice" required hint="Aviso de operacion." />

          {/* Campos de texto hasta que panama_divisions tenga el catalogo oficial
              cargado: entonces pasan a selects en cascada (ONBOARDING.md paso 5). */}
          <div className="grid gap-4 sm:grid-cols-3">
            <Field label="Province" name="province_code" required />
            <Field label="District" name="district_code" required />
            <Field label="Corregimiento" name="corregimiento_code" required />
          </div>

          <Field label="Address" name="address" required autoComplete="street-address" />

          {state?.error && (
            <p role="alert" className="rounded-2xl bg-amarillo/20 px-4 py-3 text-center text-sm text-marron/85">
              {state.error}
            </p>
          )}

          <button type="submit" disabled={pending} className="btn btn-glass-red w-full disabled:opacity-70">
            {pending ? <LoaderCircle className="h-4 w-4 animate-spin" aria-hidden /> : null}
            {pending ? "Setting up your shop..." : "Create my shop"}
            {!pending && <ArrowRight className="h-4 w-4" aria-hidden />}
          </button>
        </div>
      </form>
    </div>
  )
}
