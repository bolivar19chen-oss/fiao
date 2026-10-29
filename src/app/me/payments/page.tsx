import type { Metadata } from "next"
import { Banknote, CreditCard, Smartphone } from "lucide-react"

import { t, type Key } from "@/lib/i18n"
import { getLang } from "@/lib/lang"

import { Panel, Row, Rows, ScreenTitle } from "../ui"
import { CardFace } from "./card-face"

export const metadata: Metadata = { title: "Payments - FIA'O" }

// Cada metodo lleva su clave, no su texto.
const METHODS: { id: string; label: Key; Icon: typeof Banknote; ready: boolean }[] = [
  { id: "cash", label: "cashAtCounter", Icon: Banknote, ready: true },
  { id: "yappy", label: "yappy", Icon: Smartphone, ready: false },
  { id: "card", label: "card", Icon: CreditCard, ready: false },
]

export default async function PaymentsPage() {
  const lang = await getLang()

  return (
    <>
      <ScreenTitle title={t(lang, "payments")}>{t(lang, "paymentsIntro")}</ScreenTitle>

      <Panel title={t(lang, "methods")}>
        <Rows>
          {METHODS.map(({ id, label, Icon, ready }) => (
            <Row key={id}>
              <Icon className="h-[18px] w-[18px] shrink-0 text-marron/40" strokeWidth={1.5} aria-hidden />
              <span className="min-w-0 flex-1">
                <span className="block text-[15px] text-marron">{t(lang, label)}</span>
                <span className="block text-[13px] text-marron/55">
                  {t(lang, ready ? "alwaysAvailable" : "waitingOnShop")}
                </span>
              </span>
              <span className={`shrink-0 text-[13px] ${ready ? "text-estado-al-dia" : "text-marron/45"}`}>
                {t(lang, ready ? "on" : "off")}
              </span>
            </Row>
          ))}
        </Rows>
      </Panel>

      <Panel className="mt-4" title={t(lang, "savedCards")}>
        <CardFace lang={lang} />
        <p className="mt-6 text-[13px] leading-[18px] text-marron/55">{t(lang, "cardNote")}</p>
      </Panel>
    </>
  )
}
