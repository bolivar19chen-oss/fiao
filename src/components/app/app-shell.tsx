"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { ChartColumn, LayoutDashboard, LogOut, Package, ReceiptText, Settings, Users } from "lucide-react"
import { Logo } from "@/components/layout/logo"
import { Aurora } from "@/components/ui/aurora"
import { signOut } from "./actions"

const nav = [
  { href: "/app", label: "Dashboard", icon: LayoutDashboard },
  { href: "/app/customers", label: "Customers", icon: Users },
  { href: "/app/products", label: "Inventory", icon: Package },
  { href: "/app/sales", label: "Sales", icon: ReceiptText },
  { href: "/app/reports", label: "Reports", icon: ChartColumn },
  { href: "/app/settings", label: "Settings", icon: Settings },
]

// Shell de la aplicacion: barra lateral en escritorio, barra inferior en movil (el movil
// manda: el publico usa celulares de gama baja). El dock de la landing es de marketing y
// no se reutiliza aca.
export function AppShell({ businessName, children }: { businessName: string; children: React.ReactNode }) {
  const pathname = usePathname()
  const isActive = (href: string) => (href === "/app" ? pathname === href : pathname.startsWith(href))

  return (
    <div className="relative isolate min-h-[100dvh]">
      <div className="fixed inset-0 -z-10" aria-hidden>
        <Aurora />
      </div>

      {/* Escritorio */}
      <aside className="fixed inset-y-3 left-3 z-40 hidden w-60 flex-col rounded-[1.75rem] p-4 md:flex glass">
        <Link href="/app" aria-label="Dashboard" className="px-2 pt-1">
          <Logo />
        </Link>
        <p className="mt-6 truncate px-3 text-xs font-semibold uppercase tracking-[0.14em] text-marron/50">
          {businessName}
        </p>
        <nav className="mt-2 flex flex-col gap-1" aria-label="App">
          {nav.map(({ href, label, icon: Icon }) => {
            const active = isActive(href)
            return (
              <Link
                key={href}
                href={href}
                aria-current={active ? "page" : undefined}
                className={`flex h-11 items-center gap-3 rounded-full px-4 text-sm font-medium transition ${
                  active ? "btn-glass-red" : "text-marron/75 hover:bg-fondo/70 hover:text-marron"
                }`}
              >
                <Icon className="h-[18px] w-[18px]" strokeWidth={1.75} aria-hidden />
                {label}
              </Link>
            )
          })}
        </nav>
        <form action={signOut} className="mt-auto">
          <button
            type="submit"
            className="flex h-11 w-full items-center gap-3 rounded-full px-4 text-sm font-medium text-marron/75 transition hover:bg-fondo/70 hover:text-marron"
          >
            <LogOut className="h-[18px] w-[18px]" strokeWidth={1.75} aria-hidden />
            Log out
          </button>
        </form>
      </aside>

      {/* Movil: arriba negocio y salir, abajo la navegacion */}
      <header className="sticky top-0 z-40 px-3 pt-3 md:hidden">
        <div className="glass flex h-14 items-center justify-between gap-3 rounded-full pl-3 pr-1.5">
          <Link href="/app" aria-label="Dashboard" className="flex min-w-0 items-center gap-2">
            <Logo />
            <span className="truncate text-sm font-medium text-marron/60">{businessName}</span>
          </Link>
          <form action={signOut}>
            <button type="submit" className="btn btn-glass h-11 w-11 px-0" aria-label="Log out">
              <LogOut className="h-[18px] w-[18px]" strokeWidth={1.75} aria-hidden />
            </button>
          </form>
        </div>
      </header>

      <nav
        className="glass fixed inset-x-3 bottom-3 z-40 grid grid-cols-6 rounded-[1.5rem] p-1.5 md:hidden"
        style={{ paddingBottom: "max(0.375rem, env(safe-area-inset-bottom))" }}
        aria-label="App"
      >
        {nav.map(({ href, label, icon: Icon }) => {
          const active = isActive(href)
          return (
            <Link
              key={href}
              href={href}
              aria-current={active ? "page" : undefined}
              className={`flex min-h-14 flex-col items-center justify-center gap-1 rounded-2xl text-[10px] font-medium transition ${
                active ? "btn-glass-red" : "text-marron/70"
              }`}
            >
              <Icon className="h-5 w-5" strokeWidth={1.75} aria-hidden />
              {label}
            </Link>
          )
        })}
      </nav>

      <main className="px-4 pb-28 pt-6 md:pb-10 md:pl-[17.5rem] md:pr-8 md:pt-10">{children}</main>
    </div>
  )
}
