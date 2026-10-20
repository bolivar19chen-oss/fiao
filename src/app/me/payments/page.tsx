import type { Metadata } from "next"
import { Banknote, CreditCard, Smartphone } from "lucide-react"

import { Panel, Row, Rows, ScreenTitle } from "../ui"
import { CardFace } from "./card-face"

export const metadata: Metadata = { title: "Payments - FIA'O" }

const METHODS = [
  { id: "cash", label: "Cash at the counter", hint: "Always available", Icon: Banknote, ready: true },
  { id: "yappy", label: "Yappy", hint: "Waiting on the shop", Icon: Smartphone, ready: false },
  { id: "card", label: "Card", hint: "Waiting on the shop", Icon: CreditCard, ready: false },
]

export default function PaymentsPage() {
  return (
    <>
      <ScreenTitle title="Payments">How you can pay what you owe, and the cards you have saved.</ScreenTitle>

      <Panel title="Methods">
        <Rows>
          {METHODS.map(({ id, label, hint, Icon, ready }) => (
            <Row key={id}>
              <Icon className="h-[18px] w-[18px] shrink-0 text-marron/40" strokeWidth={1.5} aria-hidden />
              <span className="min-w-0 flex-1">
                <span className="block text-[15px] text-marron">{label}</span>
                <span className="block text-[13px] text-marron/55">{hint}</span>
              </span>
              <span className={`shrink-0 text-[13px] ${ready ? "text-estado-al-dia" : "text-marron/45"}`}>
                {ready ? "On" : "Off"}
              </span>
            </Row>
          ))}
        </Rows>
      </Panel>

      <Panel className="mt-4" title="Saved cards">
        <CardFace />
        <p className="mt-6 text-[13px] leading-[18px] text-marron/55">
          Card payments open once your shop connects its own merchant account. Your card details go straight to the
          payment provider, never to FIA&apos;O.
        </p>
      </Panel>
    </>
  )
}
