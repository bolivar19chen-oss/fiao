"use client"

import { useActionState, useEffect, useState } from "react"
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
      {/* Control segmentado al estilo del sistema: UNA pastilla que se desliza entre las
          cuatro celdas. Era framer-motion con layoutId y costaba 43 kB en una pantalla que
          el dueno abre todo el dia; en CSS es un translateX compuesto por la GPU, y
          motion-reduce lo deja sin viaje. La rejilla de cuatro columnas fijas es lo que
          permite el desplazamiento: con flex-wrap la pastilla no sabria a donde ir. */}
      <div
        role="tablist"
        aria-label="Payment method"
        className="relative grid grid-cols-4 rounded-full bg-marron/[0.06] p-1"
      >
        <span
          aria-hidden
          className="absolute inset-y-1 left-1 rounded-full bg-fondo shadow-sm transition-transform duration-300 ease-apple motion-reduce:transition-none"
          style={{
            width: "calc(25% - 0.125rem)",
            transform: `translateX(${TABS.findIndex((tab) => tab.id === method) * 100}%)`,
          }}
        />
        {TABS.map((tab) => (
          <button
            key={tab.id}
            type="button"
            role="tab"
            aria-selected={method === tab.id}
            onClick={() => setMethod(tab.id)}
            className={`relative flex min-h-[44px] items-center justify-center gap-1.5 rounded-full px-1 text-[13px] font-semibold transition-colors sm:px-3 ${
              method === tab.id ? "text-marron" : "text-marron/70 hover:text-marron"
            }`}
          >
            <tab.Icon className="h-4 w-4 shrink-0" aria-hidden />
            <span className="truncate">{tab.label}</span>
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

        {method === "cash" && <p className="text-xs text-marron/70">{active.hint}</p>}

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
