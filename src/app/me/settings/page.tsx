import type { Metadata } from "next"
import { LogOut } from "lucide-react"

import { provinceLabel } from "@/data/stores"
import { signOut } from "@/components/app/actions"
import { ThemeToggle } from "@/components/ui/theme-toggle"

import { getMeData } from "../data"
import { Panel, Row, Rows, ScreenTitle } from "../ui"

export const metadata: Metadata = { title: "Settings - FIA'O" }

export default async function SettingsPage() {
  const { profile } = await getMeData()

  return (
    <>
      <ScreenTitle title="Settings" />

      <Panel title="Your details">
        <Rows>
          <Row>
            <span className="min-w-0 flex-1 text-[15px] text-marron">Name</span>
            <span className="min-w-0 shrink text-right text-[15px] text-marron/70">{profile.fullName}</span>
          </Row>
          <Row>
            <span className="min-w-0 flex-1 text-[15px] text-marron">Province</span>
            <span className="shrink-0 text-right text-[15px] text-marron/70">
              {/* Sin provincia el perfil es anterior a la migracion 20261020120000. */}
              {profile.province ? provinceLabel(profile.province) : "Not set"}
            </span>
          </Row>
        </Rows>
        <p className="mt-5 text-[13px] leading-[18px] text-marron/55">
          Your province decides which shops can sell to you on credit. Ask us to change it if you move.
        </p>
      </Panel>

      <Panel className="mt-4" title="Appearance">
        <ThemeToggle />
      </Panel>

      <Panel className="mt-4">
        <form action={signOut}>
          <button
            type="submit"
            className="flex h-11 items-center gap-3 rounded-full px-4 text-[15px] font-medium text-marron/75 transition duration-200 ease-apple hover:bg-papel hover:text-marron"
          >
            <LogOut className="h-[18px] w-[18px]" strokeWidth={1.5} aria-hidden />
            Log out
          </button>
        </form>
      </Panel>
    </>
  )
}
