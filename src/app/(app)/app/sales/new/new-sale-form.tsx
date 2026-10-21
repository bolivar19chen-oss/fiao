"use client"

import { useMemo, useState } from "react"
import { Minus, Plus } from "lucide-react"

import { buildSchedule } from "@/lib/credit"
import { formatCents } from "@/lib/format"
import { ActionForm } from "@/components/app/action-form"
import { Card, CardTitle, Field } from "@/components/app/ui"

import { createSale } from "./actions"

const fecha = (iso: string) =>
  new Date(`${iso}T12:00:00Z`).toLocaleDateString("en-US", { month: "short", day: "numeric", timeZone: "UTC" })

export type SaleCustomer = { id: string; name: string }
export type SaleProduct = { id: string; name: string; priceCents: number; stock: number }

/**
 * El formulario de la venta a credito.
 *
 * El total y el calendario se calculan aca mientras se escribe, con el mismo motor que
 * usa el servidor. No es adorno: ADR 0009 dice que los terminos se ensenan antes de
 * guardar, en palabras y resueltos. El cliente firma sabiendo que firma.
 *
 * Lo que se calcula aca es para mirar. El servidor vuelve a leer los precios de la base
 * y la base vuelve a comprobar que las cuotas sumen el total: nada de esto se cree.
 */
export function NewSaleForm({
  customers,
  products,
  defaultInstallments,
  defaultDays,
  soldOn,
}: {
  customers: SaleCustomer[]
  products: SaleProduct[]
  defaultInstallments: number
  defaultDays: number
  /** Hoy, resuelto en el servidor: el navegador puede tener otra fecha. */
  soldOn: string
}) {
  const [quantities, setQuantities] = useState<Record<string, number>>({})
  const [count, setCount] = useState(defaultInstallments)
  const [everyDays, setEveryDays] = useState(defaultDays)

  const totalCents = useMemo(
    () => products.reduce((total, product) => total + (quantities[product.id] ?? 0) * product.priceCents, 0),
    [products, quantities],
  )

  const schedule = useMemo(() => {
    if (totalCents <= 0 || count < 1 || everyDays < 1) return []
    return buildSchedule({ totalCents, count, everyDays, soldOn })
  }, [totalCents, count, everyDays, soldOn])

  const change = (id: string, by: number, stock: number) =>
    setQuantities((current) => {
      const next = Math.min(Math.max((current[id] ?? 0) + by, 0), stock)
      return { ...current, [id]: next }
    })

  return (
    <ActionForm action={createSale} submitLabel="Record sale" pendingLabel="Recording...">
      <Card>
        <CardTitle>Who is buying</CardTitle>
        <label htmlFor="customer_id" className="block text-sm font-medium text-marron">
          Customer
        </label>
        <select
          id="customer_id"
          name="customer_id"
          required
          defaultValue=""
          className="mt-1.5 h-12 w-full rounded-2xl border border-marron/10 bg-papel px-4 text-[15px] text-marron outline-none transition focus:border-rojo/40 focus:bg-fondo focus:ring-4 focus:ring-rojo/10"
        >
          <option value="" disabled>
            Pick a customer
          </option>
          {customers.map((customer) => (
            <option key={customer.id} value={customer.id}>
              {customer.name}
            </option>
          ))}
        </select>
      </Card>

      <Card>
        <CardTitle>What they are taking</CardTitle>
        <ul className="divide-y divide-marron/[0.07]">
          {products.map((product) => {
            const quantity = quantities[product.id] ?? 0
            return (
              <li key={product.id} className="flex items-center gap-4 py-3.5 first:pt-0 last:pb-0">
                <span className="min-w-0 flex-1">
                  <span className="block truncate text-[15px] text-marron">{product.name}</span>
                  <span className="block text-[13px] text-marron/55">
                    {formatCents(product.priceCents)} - {product.stock} in stock
                  </span>
                </span>
                {/* El valor viaja en un campo oculto: los botones son la interfaz. */}
                <input type="hidden" name={`item_${product.id}`} value={quantity} />
                <span className="flex shrink-0 items-center gap-1">
                  <button
                    type="button"
                    onClick={() => change(product.id, -1, product.stock)}
                    disabled={quantity === 0}
                    aria-label={`One less ${product.name}`}
                    className="grid h-9 w-9 place-items-center rounded-full border border-marron/10 text-marron transition duration-200 ease-apple hover:bg-papel disabled:opacity-30"
                  >
                    <Minus className="h-4 w-4" aria-hidden />
                  </button>
                  <span className="w-8 text-center text-[15px] tabular-nums text-marron" aria-live="polite">
                    {quantity}
                  </span>
                  <button
                    type="button"
                    onClick={() => change(product.id, 1, product.stock)}
                    disabled={quantity >= product.stock}
                    aria-label={`One more ${product.name}`}
                    className="grid h-9 w-9 place-items-center rounded-full border border-marron/10 text-marron transition duration-200 ease-apple hover:bg-papel disabled:opacity-30"
                  >
                    <Plus className="h-4 w-4" aria-hidden />
                  </button>
                </span>
              </li>
            )
          })}
        </ul>
      </Card>

      <Card>
        <CardTitle>How they will pay</CardTitle>
        <div className="grid gap-4 sm:grid-cols-2">
          <Field
            label="Installments"
            name="installments"
            look="amount"
            inputMode="numeric"
            value={String(count)}
            onChange={(event) => setCount(Number(event.target.value) || 0)}
            hint="Your default comes from Settings."
          />
          <Field
            label="Days between installments"
            name="installment_days"
            look="amount"
            inputMode="numeric"
            value={String(everyDays)}
            onChange={(event) => setEveryDays(Number(event.target.value) || 0)}
            hint="15 is every two weeks."
          />
        </div>

        {/* ADR 0009: los terminos se ensenan antes de guardar, resueltos. */}
        <div className="mt-6 rounded-2xl bg-papel p-5">
          <p className="text-[13px] text-marron/55">Total</p>
          <p className="mt-1 font-display text-[28px] font-semibold tabular-nums leading-none tracking-[-0.015em] text-marron">
            {formatCents(totalCents)}
          </p>

          {schedule.length === 0 ? (
            <p className="mt-4 text-[15px] text-marron/60">Add a product to see the payment plan.</p>
          ) : (
            <ul className="mt-5 divide-y divide-marron/[0.07]">
              {schedule.map((installment) => (
                <li key={installment.number} className="flex items-center justify-between gap-3 py-2.5">
                  <span className="text-[15px] text-marron">
                    Payment {installment.number} of {schedule.length}
                  </span>
                  <span className="text-[13px] text-marron/55">{fecha(installment.dueDate)}</span>
                  <span className="text-[15px] tabular-nums text-marron">{formatCents(installment.amountCents)}</span>
                </li>
              ))}
            </ul>
          )}
        </div>
      </Card>
    </ActionForm>
  )
}
