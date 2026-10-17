"use client"

import { motion } from "framer-motion"
import { ArrowLeft, ArrowRight, AtSign, Calendar, IdCard, LoaderCircle, Phone, User } from "lucide-react"
import { useActionState } from "react"
import {
  CardBanner,
  CardBody,
  CardError,
  CardField,
  CardHeading,
  OnboardingCard,
} from "@/components/onboarding/onboarding-card"
import { completeCustomer, type FormState } from "./actions"

export function CustomerForm({ email, onBack }: { email: string; onBack: () => void }) {
  const [state, action, pending] = useActionState<FormState, FormData>(completeCustomer, null)

  return (
    <div className="w-full max-w-md">
      <button
        type="button"
        onClick={onBack}
        className="mb-4 flex items-center gap-1.5 text-sm font-medium text-marron/60 hover:text-marron"
      >
        <ArrowLeft className="h-4 w-4" aria-hidden />
        Back
      </button>

      <OnboardingCard>
        <CardBanner tone="cream" icon={<User className="h-6 w-6" aria-hidden />} />

        <CardBody>
          <CardHeading
            title="Your details"
            description="Your shop uses these to match you with the account they already keep for you."
          />

          {/* El boton se deshabilita mientras guarda: un doble clic crearia dos perfiles. */}
          <form action={action} aria-busy={pending} className="space-y-4">
            <CardField
              label="Full name"
              icon={<User className="h-4 w-4" aria-hidden />}
              name="full_name"
              required
              minLength={2}
              maxLength={120}
              autoComplete="name"
              placeholder="Maria Rodriguez"
            />
            <CardField
              label="National ID"
              icon={<IdCard className="h-4 w-4" aria-hidden />}
              name="national_id"
              required
              autoComplete="off"
              placeholder="8-123-4567"
              hint="Your cedula number."
            />
            <CardField
              label="Email"
              icon={<AtSign className="h-4 w-4" aria-hidden />}
              name="email"
              type="email"
              defaultValue={email}
              readOnly
              disabled
            />
            <CardField
              label="Phone"
              icon={<Phone className="h-4 w-4" aria-hidden />}
              name="phone"
              type="tel"
              required
              autoComplete="tel"
              placeholder="6123-4567"
            />
            <CardField
              label="Date of birth"
              icon={<Calendar className="h-4 w-4" aria-hidden />}
              name="date_of_birth"
              type="date"
              required
              hint="You must be 18 or older."
            />

            {state?.error && <CardError>{state.error}</CardError>}

            <motion.div variants={{ hidden: { opacity: 0, y: 10 }, show: { opacity: 1, y: 0 } }}>
              <button type="submit" disabled={pending} className="btn btn-glass-red w-full disabled:opacity-70">
                {pending ? <LoaderCircle className="h-4 w-4 animate-spin" aria-hidden /> : null}
                {pending ? "Saving..." : "Create my account"}
                {!pending && <ArrowRight className="h-4 w-4" aria-hidden />}
              </button>
            </motion.div>
          </form>
        </CardBody>
      </OnboardingCard>
    </div>
  )
}
