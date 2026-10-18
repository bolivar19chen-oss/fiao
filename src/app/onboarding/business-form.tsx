"use client"

import { motion } from "framer-motion"
import {
  ArrowLeft,
  ArrowRight,
  Building,
  Calendar,
  FileText,
  Hash,
  IdCard,
  LoaderCircle,
  MapPin,
  Phone,
  Store,
  User,
} from "lucide-react"
import { useActionState, useState } from "react"
import {
  CardBanner,
  CardBody,
  CardError,
  CardField,
  CardHeading,
  FADE_UP,
  OnboardingCard,
} from "@/components/onboarding/onboarding-card"
import { AvatarField } from "@/components/onboarding/avatar-field"
import { ShopArt } from "@/components/onboarding/role-art"
import { completeBusiness, type FormState } from "./actions"

export function BusinessForm({ onBack }: { onBack: () => void }) {
  const [state, action, pending] = useActionState<FormState, FormData>(completeBusiness, null)
  const [step, setStep] = useState<1 | 2>(1)
  const [structure, setStructure] = useState<"natural" | "corporation">("natural")
  const [nationalId, setNationalId] = useState("")

  return (
    <div className="w-full max-w-md">
      <button
        type="button"
        onClick={() => (step === 1 ? onBack() : setStep(1))}
        className="mb-4 flex items-center gap-1.5 text-sm font-medium text-marron/60 hover:text-marron"
      >
        <ArrowLeft className="h-4 w-4" aria-hidden />
        Back
      </button>

      <OnboardingCard>
        <CardBanner tone="red" icon={<ShopArt className="h-9 w-9" />} />

        <CardBody>
          <motion.div variants={FADE_UP} className="flex items-center gap-3">
            <span className="h-1.5 flex-1 overflow-hidden rounded-full bg-marron/10">
              <span
                className="block h-full rounded-full bg-rojo transition-all duration-500"
                style={{ width: step === 1 ? "50%" : "100%" }}
              />
            </span>
            <span className="text-xs font-semibold text-marron/55">Step {step} of 2</span>
          </motion.div>

          <CardHeading
            title={step === 1 ? "Your details" : "Your business"}
            description={
              step === 1
                ? "We need the owner's details before setting up the shop."
                : "The legal details that go on every receipt."
            }
          />

          {/* Un solo form para los dos pasos: el paso 1 queda montado y oculto para que
              sus campos viajen en el envio. Si se desmontara, se perderian. */}
          <form action={action} aria-busy={pending}>
            <div className={step === 1 ? "space-y-4" : "hidden"} inert={step !== 1}>
              <AvatarField />
              <CardField
                label="Full name"
                icon={<User className="h-4 w-4" aria-hidden />}
                name="full_name"
                required
                minLength={2}
                maxLength={120}
                autoComplete="name"
                placeholder="Juan Chen"
              />
              <CardField
                label="National ID"
                icon={<IdCard className="h-4 w-4" aria-hidden />}
                name="national_id"
                required
                autoComplete="off"
                placeholder="8-123-4567"
                hint="Your cedula number."
                value={nationalId}
                onChange={(event) => setNationalId(event.target.value)}
              />
              <CardField
                label="Phone"
                icon={<Phone className="h-4 w-4" aria-hidden />}
                name="phone"
                type="tel"
                required
                autoComplete="tel"
                placeholder="6555-0134"
              />
              <CardField
                label="Date of birth"
                icon={<Calendar className="h-4 w-4" aria-hidden />}
                name="date_of_birth"
                type="date"
                required
                hint="You must be 18 or older."
              />

              <button type="button" onClick={() => setStep(2)} className="btn btn-glass-red w-full">
                Continue
                <ArrowRight className="h-4 w-4" aria-hidden />
              </button>
            </div>

            <div className={step === 2 ? "space-y-4" : "hidden"} inert={step !== 2}>
              <fieldset className="rounded-lg border border-marron/10 bg-fondo/50 p-3 text-left">
                <legend className="px-1 text-sm font-medium text-marron">Legal structure</legend>
                <div className="mt-1 flex gap-4">
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

              <CardField
                label="Trade name"
                icon={<Store className="h-4 w-4" aria-hidden />}
                name="trade_name"
                required
                maxLength={80}
                autoComplete="organization"
                placeholder="Mini Super La Esquina"
                hint="The name on the shop."
              />

              {structure === "corporation" && (
                <>
                  <CardField
                    label="Registered legal name"
                    icon={<Building className="h-4 w-4" aria-hidden />}
                    name="legal_name"
                    required
                  />
                  <CardField
                    label="Legal representative"
                    icon={<User className="h-4 w-4" aria-hidden />}
                    name="legal_rep_name"
                    required
                  />
                  <CardField
                    label="Legal representative ID"
                    icon={<IdCard className="h-4 w-4" aria-hidden />}
                    name="legal_rep_id"
                    required
                  />
                </>
              )}

              <div className="grid gap-4 sm:grid-cols-[1fr_6.5rem]">
                {/* En persona natural el RUC suele coincidir con la cedula: se prellena y
                    se deja editar. */}
                <CardField
                  key={structure + nationalId}
                  label="RUC"
                  icon={<Hash className="h-4 w-4" aria-hidden />}
                  name="ruc"
                  required
                  defaultValue={structure === "natural" ? nationalId : undefined}
                />
                <CardField
                  label="DV"
                  icon={<Hash className="h-4 w-4" aria-hidden />}
                  name="ruc_dv"
                  required
                  maxLength={3}
                />
              </div>

              <CardField
                label="Operating notice no."
                icon={<FileText className="h-4 w-4" aria-hidden />}
                name="operating_notice"
                required
                hint="Aviso de operacion."
              />

              {/* Campos de texto hasta que panama_divisions tenga el catalogo oficial
                  cargado: entonces pasan a selects en cascada (ONBOARDING.md paso 5). */}
              <div className="grid gap-4 sm:grid-cols-3">
                <CardField
                  label="Province"
                  icon={<MapPin className="h-4 w-4" aria-hidden />}
                  name="province_code"
                  required
                />
                <CardField
                  label="District"
                  icon={<MapPin className="h-4 w-4" aria-hidden />}
                  name="district_code"
                  required
                />
                <CardField
                  label="Corregimiento"
                  icon={<MapPin className="h-4 w-4" aria-hidden />}
                  name="corregimiento_code"
                  required
                />
              </div>

              <CardField
                label="Address"
                icon={<MapPin className="h-4 w-4" aria-hidden />}
                name="address"
                required
                autoComplete="street-address"
              />

              {state?.error && <CardError>{state.error}</CardError>}

              <button type="submit" disabled={pending} className="btn btn-glass-red w-full disabled:opacity-70">
                {pending ? <LoaderCircle className="h-4 w-4 animate-spin" aria-hidden /> : null}
                {pending ? "Setting up your shop..." : "Create my shop"}
                {!pending && <ArrowRight className="h-4 w-4" aria-hidden />}
              </button>
            </div>
          </form>
        </CardBody>
      </OnboardingCard>
    </div>
  )
}
