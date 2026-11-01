"use client"

import { useState } from "react"
import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { motion, MotionConfig } from "framer-motion"
import { ChartColumn, LayoutDashboard, LogOut, Package, ReceiptText, Search, Settings, Users } from "lucide-react"

import { Logo } from "@/components/layout/logo"
import { Dock, DockItem } from "@/components/ui/dock"
import { ThemeToggle } from "@/components/ui/theme-toggle"

import { signOut } from "./actions"

// Armazon de la aplicacion, copiado de la estructura de DashSpace (TailGrids) y adaptado
// a FIA'O a peticion del usuario: lateral etiquetado con grupos, barra superior con
// titulo, buscador y cuenta, y pastilla tintada en el item activo.
//
// Se mantiene lo que ya habia y no estorba: el crossfade entre rutas, la pastilla como
// shared element que viaja (layoutId) y la lupa del icono bajo el cursor.

const GRUPOS = [
  {
    label: "Menu",
    items: [
      { href: "/app", label: "Dashboard", icon: LayoutDashboard },
      { href: "/app/customers", label: "Customers", icon: Users },
      { href: "/app/products", label: "Inventory", icon: Package },
      { href: "/app/sales", label: "Sales", icon: ReceiptText },
    ],
  },
  { label: "Insights", items: [{ href: "/app/reports", label: "Reports", icon: ChartColumn }] },
  { label: "Account", items: [{ href: "/app/settings", label: "Settings", icon: Settings }] },
]

const TODOS = GRUPOS.flatMap((grupo) => grupo.items)

const RESORTE = { type: "spring", stiffness: 420, damping: 36 } as const

export function AppShell({ businessName, children }: { businessName: string; children: React.ReactNode }) {
  const pathname = usePathname()
  const router = useRouter()
  const [query, setQuery] = useState("")

  const isActive = (href: string) => (href === "/app" ? pathname === href : pathname.startsWith(href))
  // El titulo de la barra sale de la ruta, como en el original: la pantalla se nombra sola.
  const actual = [...TODOS].reverse().find((item) => isActive(item.href))

  // El buscador busca EN la pantalla donde estas. Antes decia "Search customers" en
  // todas y siempre llevaba a clientes: en Inventory era una caja que buscaba otra cosa.
  // Donde no hay lista que filtrar no se ensena.
  const BUSQUEDA: Record<string, string> = {
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
      <div className="relative isolate min-h-[100dvh] bg-papel">
        {/* Lateral etiquetado, 248px, como el de la referencia. */}
        <aside className="fixed inset-y-0 left-0 z-40 hidden w-[248px] flex-col border-r border-marron/10 bg-fondo px-4 py-6 md:flex">
          <Link href="/app" aria-label="Dashboard" className="px-2">
            <Logo />
          </Link>

          <nav className="mt-8 flex flex-col gap-6 overflow-y-auto" aria-label="App">
            {GRUPOS.map((grupo) => (
              <div key={grupo.label}>
                {/* Minuscula y no mayusculas tracked: es el unico tell de la referencia
                    que no copio, porque empeora la legibilidad y no aporta nada. */}
                <p className="px-3 text-[12px] font-semibold text-marron/70">{grupo.label}</p>
                <ul className="mt-2 flex flex-col gap-0.5">
                  {grupo.items.map(({ href, label, icon: Icon }) => {
                    const active = isActive(href)
                    return (
                      <li key={href}>
                        <Link
                          href={href}
                          // prefetch "a secas" es prefetch completo: trae los datos del servidor antes del clic.
                          // Sin el, Next solo precarga el esqueleto y cada pestana espera a Supabase al pulsarla.
                          prefetch
                          aria-current={active ? "page" : undefined}
                          className={`relative flex h-10 items-center gap-3 rounded-lg px-3 text-sm font-medium transition-colors ${
                            active ? "text-rojo" : "text-marron/70 hover:bg-papel hover:text-marron"
                          }`}
                        >
                          {active && (
                            <motion.span
                              layoutId="nav-pill-desktop"
                              transition={RESORTE}
                              className="absolute inset-0 rounded-lg bg-rojo/[0.09]"
                            />
                          )}
                          <motion.span whileHover={{ scale: 1.2 }} transition={RESORTE} className="relative">
                            <Icon className="h-[18px] w-[18px]" strokeWidth={1.75} aria-hidden />
                          </motion.span>
                          <span className="relative">{label}</span>
                        </Link>
                      </li>
                    )
                  })}
                </ul>
              </div>
            ))}
          </nav>

          {/* Donde la referencia pone "Pro Plan - Upgrade Now" va el negocio y la salida:
              ese bloque alli es el negocio de TailGrids, no el nuestro. */}
          <div className="mt-auto rounded-xl bg-papel p-4">
            <p className="truncate text-sm font-semibold text-marron">{businessName}</p>
            <p className="mt-0.5 text-xs text-marron/70">Owner</p>
            <form action={signOut} className="mt-3">
              <button
                type="submit"
                className="flex h-9 w-full items-center gap-2 rounded-lg px-2 text-sm font-medium text-marron/70 transition hover:bg-fondo hover:text-marron"
              >
                <LogOut className="h-4 w-4" strokeWidth={1.75} aria-hidden />
                Log out
              </button>
            </form>
          </div>
        </aside>

        <div className="md:pl-[248px]">
          {/* Barra superior: titulo, buscador y cuenta. */}
          <header className="glass-bar sticky top-0 z-30 border-b border-marron/[0.07]">
            <div className="flex min-h-16 flex-wrap items-center gap-3 px-5 py-3 sm:px-6">
              <div className="min-w-0 flex-1">
                <p className="truncate text-[17px] font-semibold text-marron">{actual?.label ?? "Dashboard"}</p>
                <p className="truncate text-[13px] text-marron/70 md:hidden">{businessName}</p>
              </div>

              {/* Acceso rapido a las seis secciones sin bajar la vista al lateral. Solo desde xl:
                  por debajo no cabe junto al buscador, y ahi mandan el lateral y la barra inferior. */}
              <nav aria-label="Quick access" className="hidden xl:block">
                <Dock>
                  {TODOS.map((item) => (
                    <DockItem key={item.href} {...item} active={isActive(item.href)} />
                  ))}
                </Dock>
              </nav>

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
                      placeholder={`Search ${buscable}`}
                      aria-label={`Search ${buscable}`}
                      className="h-10 w-full rounded-lg border border-marron/10 bg-papel pl-10 pr-4 text-[15px] text-marron outline-none transition duration-200 ease-apple placeholder:text-marron/70 focus:border-rojo/40 focus:bg-fondo focus:ring-4 focus:ring-rojo/10 sm:w-64"
                    />
                  </div>
                </form>
              )}

              <ThemeToggle />
            </div>
          </header>

          <main className="px-5 pb-28 pt-6 sm:px-6 md:pb-10">
            {/* Crossfade entre rutas: la clave es la ruta, asi el contenido entra con
                opacidad en vez de aparecer de golpe. En CSS y no en framer-motion: este
                fade corre DESPUES de esperar al servidor, y 180ms de JS encima de una
                espera se sienten como lentitud. */}
            <div key={pathname} className="motion-safe:animate-entrada">
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
                <span className="relative w-full truncate text-center">{label}</span>
              </Link>
            )
          })}
        </nav>
      </div>
    </MotionConfig>
  )
}
