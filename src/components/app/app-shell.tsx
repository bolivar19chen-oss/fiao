"use client"

import { useState } from "react"
import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { motion, MotionConfig } from "framer-motion"
import { ChartColumn, LayoutDashboard, LogOut, Package, ReceiptText, Search, Settings, Users } from "lucide-react"

import { t, type Key, type Lang } from "@/lib/i18n"
import { Logo } from "@/components/layout/logo"
import { Dock, DockItem } from "@/components/ui/dock"

import { signOut } from "./actions"

// Armazon de la aplicacion: riel de iconos al costado (dock vertical), barra superior con
// el negocio y el buscador, y en movil la navegacion abajo con pastilla tintada.
//
// Se mantiene lo que ya habia y no estorba: el crossfade entre rutas, la pastilla como
// shared element que viaja (layoutId) y la lupa del icono bajo el cursor.

const TODOS: { href: string; label: Key; icon: typeof Users }[] = [
  { href: "/app", label: "navDashboard", icon: LayoutDashboard },
  { href: "/app/customers", label: "navCustomers", icon: Users },
  { href: "/app/products", label: "navInventory", icon: Package },
  { href: "/app/sales", label: "navSales", icon: ReceiptText },
  { href: "/app/reports", label: "navReports", icon: ChartColumn },
  { href: "/app/settings", label: "navSettings", icon: Settings },
]

const BUSCAR = { customers: "searchCustomers", products: "searchProducts", sales: "searchSales" } as const

const RESORTE = { type: "spring", stiffness: 420, damping: 36 } as const

export function AppShell({
  businessName,
  lang,
  children,
}: {
  businessName: string
  lang: Lang
  children: React.ReactNode
}) {
  const tr = (key: Key) => t(lang, key)
  const pathname = usePathname()
  const router = useRouter()
  const [query, setQuery] = useState("")

  const isActive = (href: string) => (href === "/app" ? pathname === href : pathname.startsWith(href))
  // El titulo de la barra sale de la ruta, como en el original: la pantalla se nombra sola.
  const actual = [...TODOS].reverse().find((item) => isActive(item.href))

  // El buscador busca EN la pantalla donde estas. Antes decia "Search customers" en
  // todas y siempre llevaba a clientes: en Inventory era una caja que buscaba otra cosa.
  // Donde no hay lista que filtrar no se ensena.
  const BUSQUEDA: Record<string, "products" | "sales" | "customers"> = {
    "/app/products": "products",
    "/app/sales": "sales",
    "/app/customers": "customers",
    "/app": "customers",
  }
  const buscable = BUSQUEDA[actual?.href ?? ""]

  function buscar(event: React.FormEvent) {
    event.preventDefault()
    if (!buscable) return
    const needle = query.trim()
    const destino = `/app/${buscable === "customers" ? "customers" : buscable}`
    router.push(needle ? `${destino}?q=${encodeURIComponent(needle)}` : destino)
  }

  return (
    <MotionConfig reducedMotion="user">
      <div className="app-fondo relative isolate min-h-[100dvh]">
        {/* Riel del costado: las seis secciones como dock vertical. Reemplaza al lateral con
            texto, que repetia la misma navegacion. El nombre de cada seccion sale al pasar el
            cursor o al enfocar, y siempre esta en el aria-label. */}
        <aside className="app-lateral fixed left-4 top-1/2 z-40 hidden -translate-y-1/2 flex-col items-center gap-5 rounded-[2rem] border border-marron/10 bg-fondo p-3 md:flex">
          <Link href="/app" aria-label={tr("navDashboard")}>
            <Logo mark />
          </Link>

          <nav aria-label="App">
            <Dock vertical>
              {TODOS.map((item) => (
                <DockItem key={item.href} {...item} label={tr(item.label)} active={isActive(item.href)} />
              ))}
            </Dock>
          </nav>

          <form action={signOut}>
            <button
              type="submit"
              aria-label={tr("logOut")}
              title={tr("logOut")}
              className="grid h-[38px] w-[38px] place-items-center rounded-full text-marron/70 transition-colors hover:text-rojo focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rojo/40"
            >
              <LogOut className="h-[18px] w-[18px]" strokeWidth={1.75} aria-hidden />
            </button>
          </form>
        </aside>

        <div className="md:pl-[92px]">
          {/* Barra superior: de quien es la cuenta y el buscador, nada mas. */}
          <header className="glass-bar sticky top-0 z-30 border-b border-marron/[0.07]">
            <div className="flex min-h-16 flex-wrap items-center gap-3 px-5 py-3 sm:px-6">
              <div className="min-w-0 flex-1">
                <p className="truncate text-[17px] font-semibold text-marron">{businessName}</p>
                <p className="truncate text-[13px] text-marron/70">{tr("owner")}</p>
              </div>

              {buscable && (
                <form onSubmit={buscar} className="order-last w-full sm:order-none sm:w-auto">
                  <div className="relative">
                    <Search
                      className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-marron/70"
                      strokeWidth={1.75}
                      aria-hidden
                    />
                    <input
                      id="app-search"
                      type="search"
                      value={query}
                      onChange={(event) => setQuery(event.target.value)}
                      placeholder={tr(BUSCAR[buscable])}
                      aria-label={tr(BUSCAR[buscable])}
                      className="h-10 w-full rounded-lg border border-marron/10 bg-papel pl-10 pr-4 text-[15px] text-marron outline-none transition duration-200 ease-apple placeholder:text-marron/70 focus:border-rojo/40 focus:bg-fondo focus:ring-4 focus:ring-rojo/10 sm:w-80"
                    />
                  </div>
                </form>
              )}
            </div>
          </header>

          <main className="px-5 pb-28 pt-6 sm:px-6 md:pb-10">
            {/* Crossfade entre rutas: la clave es la ruta, asi el contenido entra con
                opacidad en vez de aparecer de golpe. En CSS y no en framer-motion: este
                fade corre DESPUES de esperar al servidor, y 180ms de JS encima de una
                espera se sienten como lentitud. */}
            <div key={pathname} className="app-panel motion-safe:animate-entrada">
              {children}
            </div>
          </main>
        </div>

        {/* Movil: la navegacion abajo. El lateral de la referencia no cabe en un telefono. */}
        <nav
          className="glass-bar fixed inset-x-3 bottom-3 z-40 grid grid-cols-6 rounded-[1.5rem] p-1.5 md:hidden"
          style={{ paddingBottom: "max(0.375rem, env(safe-area-inset-bottom))" }}
          aria-label="App"
        >
          {TODOS.map(({ href, label, icon: Icon }) => {
            const active = isActive(href)
            return (
              <Link
                key={href}
                href={href}
                prefetch
                aria-current={active ? "page" : undefined}
                className={`relative flex min-h-14 flex-col items-center justify-center gap-1 rounded-2xl px-0.5 text-[11px] font-medium leading-tight transition-colors ${
                  active ? "text-rojo" : "text-marron/70"
                }`}
              >
                {active && (
                  <motion.span
                    layoutId="nav-pill-movil"
                    transition={RESORTE}
                    className="absolute inset-0 rounded-2xl bg-rojo/[0.09]"
                  />
                )}
                <motion.span animate={{ scale: active ? 1.12 : 1 }} transition={RESORTE} className="relative">
                  <Icon className="h-5 w-5" strokeWidth={1.75} aria-hidden />
                </motion.span>
                <span className="relative w-full truncate text-center">{tr(label)}</span>
              </Link>
            )
          })}
        </nav>
      </div>
    </MotionConfig>
  )
}
