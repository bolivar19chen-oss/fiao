"use client"

import { useActionState, useEffect, useId, useState } from "react"
import { motion, useReducedMotion } from "framer-motion"
import { Banknote, Check, CreditCard, LoaderCircle, Smartphone, Wallet } from "lucide-react"

import { centsToInput } from "@/lib/format"
import { Card, CardTitle, Field } from "@/components/app/ui"

import { recordPayment, type Method, type PaymentState } from "./actions"

const TABS: { id: Method; label: string; Icon: typeof Banknote; hint: string }[] = [
  { id: "cash", label: "Cash", Icon: Banknote, hint: "Paid at the counter." },
  { id: "yappy", label: "Yappy", Icon: Smartphone, hint: "Reference from your Yappy app." },
  { id: "card", label: "Card", Icon: CreditCard, hint: "Reference from the card terminal receipt." },
  { id: "paypal", label: "PayPal", Icon: Wallet, hint: "Transaction ID from PayPal." },
]

export function RecordPayment({ saleId, balanceCents }: { saleId: string; balanceCents: number }) {
  const [state, action, pending] = useActionState<PaymentState, FormData>(recordPayment, null)
  const [method, setMethod] = useState<Method>("cash")
  const [token, setToken] = useState("")
  const reduced = useReducedMotion()
  const group = useId()

  // Un token por intento, generado en el navegador. Se renueva al registrar: el
  // siguiente abono es otro pago, no un reintento del anterior.
  useEffect(() => {
    setToken(crypto.randomUUID())
  }, [state])

  if (balanceCents <= 0) {
    return (
      <Card>
        <CardTitle>Payments</CardTitle>
        <p className="flex items-center gap-2 text-[15px] text-marron/75">
          <Check className="h-4 w-4 shrink-0 text-estado-al-dia" aria-hidden />
          This sale is fully paid.
        </p>
      </Card>
    )
  }

  const active = TABS.find((tab) => tab.id === method)!

  return (
    <Card>
      <CardTitle>Record a payment</CardTitle>

      {/* El metodo no cobra: lo deja anotado. El dinero va directo del cliente al
          negocio (ADR 0007), asi que aca solo se registra como entro. */}
      <div
        role="tablist"
        aria-label="Payment method"
        className="flex flex-wrap gap-1 rounded-full bg-marron/[0.06] p-1"
      >
        {TABS.map((tab) => (
          <button
            key={tab.id}
            type="button"
            role="tab"
            aria-selected={method === tab.id}
            onClick={() => setMethod(tab.id)}
            className={`relative flex min-h-[44px] flex-1 items-center justify-center gap-2 rounded-full px-3 text-[13px] font-semibold transition ${
              method === tab.id ? "text-marron" : "text-marron/60 hover:text-marron"
            }`}
          >
            {method === tab.id && (
              <motion.span
                layoutId={`${group}-tab`}
                className="absolute inset-0 rounded-full bg-fondo shadow-sm"
                transition={reduced ? { duration: 0 } : { type: "spring", stiffness: 380, damping: 30 }}
              />
            )}
            <tab.Icon className="relative h-4 w-4 shrink-0" aria-hidden />
            <span className="relative">{tab.label}</span>
          </button>
        ))}
      </div>

      <form action={action} aria-busy={pending} className="mt-4 space-y-4">
        <input type="hidden" name="sale_id" value={saleId} />
        <input type="hidden" name="method" value={method} />
        <input type="hidden" name="client_token" value={token} />

        <Field
          label="Amount"
          look="amount"
          name="amount"
          required
          inputMode="decimal"
          placeholder={centsToInput(balanceCents)}
          hint={`Balance on this sale: ${centsToInput(balanceCents)}`}
        />

        {/* El mismo numero dos veces no cobra dos veces: la base lo rechaza. */}
        {method !== "cash" && (
          <Field
            label="Reference"
            name="provider_ref"
            required
            autoComplete="off"
            placeholder="Receipt or transaction number"
            hint={active.hint}
          />
        )}

        {method === "cash" && <p className="text-xs text-marron/55">{active.hint}</p>}

        {state && "error" in state && (
          <p role="alert" className="rounded-2xl bg-amarillo/20 px-4 py-3 text-sm text-marron/85">
            {state.error}
          </p>
        )}
        {state && "ok" in state && (
          <p
            role="status"
            className="flex items-center gap-2 rounded-2xl bg-estado-al-dia/10 px-4 py-3 text-sm text-marron/85"
          >
            <Check className="h-4 w-4 shrink-0 text-estado-al-dia" aria-hidden />
            Payment recorded.
          </p>
        )}

        <button type="submit" disabled={pending} className="btn btn-glass-red h-11 w-full disabled:opacity-70">
          {pending ? <LoaderCircle className="h-4 w-4 animate-spin" aria-hidden /> : null}
          {pending ? "Recording..." : "Record payment"}
        </button>
      </form>
    </Card>
  )
}
