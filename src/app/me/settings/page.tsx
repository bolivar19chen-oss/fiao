import type { Metadata } from "next"
import { LogOut } from "lucide-react"

import { provinceLabel } from "@/data/provinces"
import { t } from "@/lib/i18n"
import { getLang } from "@/lib/lang"
import { requireCustomer } from "@/lib/profile"
import { signOut } from "@/components/app/actions"
import { LangToggle } from "@/components/ui/lang-toggle"
import { ThemeToggle } from "@/components/ui/theme-toggle"

import { Panel, Row, Rows, ScreenTitle } from "../ui"

export const metadata: Metadata = { title: "Settings - FIA'O" }

export default async function SettingsPage() {
  const [profile, lang] = await Promise.all([requireCustomer(), getLang()])

  return (
    <>
      <ScreenTitle title={t(lang, "settings")} />

      <Panel title={t(lang, "yourDetails")}>
        <Rows>
          <Row>
            <span className="min-w-0 flex-1 text-[15px] text-marron">{t(lang, "name")}</span>
            <span className="min-w-0 shrink text-right text-[15px] text-marron/70">{profile.fullName}</span>
          </Row>
          <Row>
            <span className="min-w-0 flex-1 text-[15px] text-marron">{t(lang, "province")}</span>
            <span className="shrink-0 text-right text-[15px] text-marron/70">
              {/* Sin provincia el perfil es anterior a la migracion 20261020120000. */}
              {profile.province ? provinceLabel(profile.province) : t(lang, "notSet")}
            </span>
          </Row>
        </Rows>
        <p className="mt-5 text-[13px] leading-[18px] text-marron/55">{t(lang, "provinceNote")}</p>
      </Panel>

      <Panel className="mt-4" title={t(lang, "language")}>
        <LangToggle current={lang} />
      </Panel>

      <Panel className="mt-4" title={t(lang, "appearance")}>
        <ThemeToggle />
      </Panel>

      <Panel className="mt-4">
        <form action={signOut}>
          <button
            type="submit"
            className="flex h-11 items-center gap-3 rounded-full px-4 text-[15px] font-medium text-marron/75 transition duration-200 ease-apple hover:bg-papel hover:text-marron"
          >
            <LogOut className="h-[18px] w-[18px]" strokeWidth={1.5} aria-hidden />
            {t(lang, "logOut")}
          </button>
        </form>
      </Panel>
    </>
  )
}
