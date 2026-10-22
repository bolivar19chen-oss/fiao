"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { CreditCard, LayoutDashboard, Plus, Settings, Store, TrendingUp } from "lucide-react"

import { t, type Key, type Lang } from "@/lib/i18n"
import { Logo } from "@/components/layout/logo"

// Riel de iconos en escritorio, barra abajo en movil. Cada item es OTRA pantalla, nunca
// un ancla dentro de esta: un lateral que persigue secciones de la misma pagina es el
// defecto que la guia de pantallas de aplicacion marca primero.
//
// El activo es una pastilla gris neutra. En esta parte de la aplicacion el color esta
// reservado para los datos (la mora, el estado de cuenta), no para el cromado.
// Cada item lleva su CLAVE, no su texto: el idioma se resuelve al pintar. `short` es
// la version que cabe en la barra de movil, donde la celda mide unos 62px.
const NAV: { href: string; key: Key; short: Key; icon: typeof LayoutDashboard }[] = [
  { href: "/me", key: "overview", short: "overview", icon: LayoutDashboard },
  { href: "/me/creditors", key: "creditors", short: "creditors", icon: Store },
  { href: "/me/credit", key: "credit", short: "credit", icon: TrendingUp },
  { href: "/me/payments", key: "payments", short: "payments", icon: CreditCard },
  { href: "/me/link", key: "linkShop", short: "linkShort", icon: Plus },
  { href: "/me/settings", key: "settings", short: "settings", icon: Settings },
]

export function MeShell({ lang, children }: { lang: Lang; children: React.ReactNode }) {
  const pathname = usePathname()
  const isActive = (href: string) => (href === "/me" ? pathname === href : pathname.startsWith(href))

  return (
    <div className="relative isolate min-h-[100dvh] bg-papel">
      <aside className="fixed inset-y-3 left-3 z-40 hidden w-[72px] flex-col items-center rounded-[1.75rem] border border-marron/10 bg-fondo py-4 md:flex">
        <Link href="/me" aria-label="FIA'O" className="mb-6">
          <Logo mark />
        </Link>
        <nav className="flex flex-col gap-1" aria-label={t(lang, "myAccounts")}>
          {NAV.map(({ href, key, icon: Icon }) => {
            const active = isActive(href)
            const label = t(lang, key)
            return (
              <Link
                key={href}
                href={href}
                aria-label={label}
                title={label}
                aria-current={active ? "page" : undefined}
                className={`grid h-11 w-11 place-items-center rounded-2xl transition duration-200 ease-apple ${
                  active ? "bg-marron/[0.08] text-marron" : "text-marron/55 hover:bg-papel hover:text-marron"
                }`}
              >
                <Icon className="h-[18px] w-[18px]" strokeWidth={1.5} aria-hidden />
              </Link>
            )
          })}
        </nav>
      </aside>

      <div className="md:pl-[88px]">
        <main className="mx-auto w-full max-w-4xl px-5 pb-28 pt-8 sm:px-6 md:pb-12 md:pt-10">{children}</main>
      </div>

      <nav
        className="glass-bar fixed inset-x-3 bottom-3 z-40 grid grid-cols-6 rounded-[1.5rem] p-1.5 md:hidden"
        style={{ paddingBottom: "max(0.375rem, env(safe-area-inset-bottom))" }}
        aria-label={t(lang, "myAccounts")}
      >
        {NAV.map(({ href, short, icon: Icon }) => {
          const active = isActive(href)
          return (
            <Link
              key={href}
              href={href}
              aria-current={active ? "page" : undefined}
              className={`flex min-h-14 flex-col items-center justify-center gap-1 rounded-2xl px-0.5 text-[11px] font-medium leading-tight transition duration-200 ease-apple ${
                active ? "bg-marron/[0.08] text-marron" : "text-marron/65"
              }`}
            >
              <Icon className="h-5 w-5" strokeWidth={1.5} aria-hidden />
              <span className="truncate">{t(lang, short)}</span>
            </Link>
          )
        })}
      </nav>
    </div>
  )
}
