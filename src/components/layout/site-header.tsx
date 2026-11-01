"use client"

import { useEffect, useRef, useState, useSyncExternalStore } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { House, Info, LayoutGrid, LogIn, Menu, ShieldCheck, X } from "lucide-react"

import { LiquidNavbar, type LiquidNavItem } from "@/components/ui/liquid-glass-navbar"

import { Logo } from "./logo"

const nav = [
  { href: "/", label: "Home", icon: House, fx: "glow" },
  { href: "/about", label: "About Us", icon: Info, fx: "pop" },
  { href: "/services", label: "Services", icon: LayoutGrid, fx: "spin" },
  { href: "/privacy", label: "Privacy Policy", icon: ShieldCheck, fx: "wave" },
] as const

const navItems: LiquidNavItem[] = nav.map(({ href, label, icon: Icon, fx }) => ({
  href,
  label,
  fx,
  icon: <Icon className="h-[18px] w-[18px]" strokeWidth={1.75} aria-hidden />,
}))

// La tinta de la barra sigue a la del tema (la variable ya cambia en oscuro), asi que no hay
// un color escrito aqui: el 70 % es el suelo que pasa AA, igual que en el resto de la app.
const NAV_INK = {
  "--n-fg": "rgb(var(--marron))",
  "--n-fg-soft": "rgb(var(--marron) / 0.7)",
} as React.CSSProperties

// El shader del agua necesita saber si el fondo es claro u oscuro. El tema vive en la clase
// de <html> (o en el sistema, si no hay clase), asi que se escuchan las dos.
function subscribeTone(notify: () => void) {
  const mq = window.matchMedia("(prefers-color-scheme: dark)")
  const observer = new MutationObserver(notify)
  observer.observe(document.documentElement, { attributes: true, attributeFilter: ["class"] })
  mq.addEventListener("change", notify)
  return () => {
    observer.disconnect()
    mq.removeEventListener("change", notify)
  }
}

function readTone(): "light" | "dark" {
  const root = document.documentElement.classList
  if (root.contains("dark")) return "dark"
  if (root.contains("light")) return "light"
  return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light"
}

export function SiteHeader() {
  const pathname = usePathname()
  const [scrolled, setScrolled] = useState(false)
  const [hidden, setHidden] = useState(false)
  const [open, setOpen] = useState(false)
  const lastY = useRef(0)
  const tone = useSyncExternalStore(subscribeTone, readTone, () => "light" as const)

  useEffect(() => {
    const onScroll = () => {
      const y = window.scrollY
      setScrolled(y > 8)
      // Baja y se esconde, sube y vuelve. `lastY` solo avanza cuando el movimiento pasa de
      // 6 px: un temblor del dedo o de la rueda no lo hace parpadear.
      const dy = y - lastY.current
      if (Math.abs(dy) < 6) return
      lastY.current = y
      setHidden(dy > 0 && y > 80)
    }
    onScroll()
    window.addEventListener("scroll", onScroll, { passive: true })
    return () => window.removeEventListener("scroll", onScroll)
  }, [])

  // Con el menu abierto no se esconde: seria tapar lo que el usuario acaba de abrir.
  const away = hidden && !open

  return (
    <header
      // Si el foco entra mientras esta escondido (Tab), reaparece: un control fuera de la
      // pantalla al que se llega con el teclado es un control perdido.
      onFocusCapture={() => setHidden(false)}
      className={`fixed inset-x-0 top-0 z-50 px-3 pt-3 transition-transform duration-300 ease-apple motion-reduce:transition-none ${
        away ? "-translate-y-[130%]" : ""
      }`}
    >
      <div
        className={`container-x flex h-14 items-center justify-between rounded-full transition-all duration-500 ${
          scrolled || open ? "glass" : "border border-transparent"
        }`}
      >
        <Link href="/" aria-label="FIA'O home" onClick={() => setOpen(false)}>
          <Logo />
        </Link>

        <div className="hidden md:block">
          {/* Por debajo de lg solo iconos: con etiquetas la pastilla no cabe entre el logo y Log in. */}
          <LiquidNavbar
            items={navItems}
            active={nav.findIndex((item) => item.href === pathname)}
            tone={tone}
            linkComponent={Link}
            style={NAV_INK}
            className="max-lg:[&_.nimbus-item]:px-[13px] max-lg:[&_.nimbus-label]:sr-only"
          />
        </div>

        <div className="flex items-center gap-2">
          <Link href="/login" className="btn btn-glass-red hidden h-10 sm:inline-flex">
            <LogIn className="h-4 w-4" strokeWidth={2} aria-hidden />
            Log in
          </Link>
          <button
            type="button"
            className="btn btn-glass h-10 w-10 px-0 md:hidden"
            aria-label={open ? "Close menu" : "Open menu"}
            aria-expanded={open}
            onClick={() => setOpen((v) => !v)}
          >
            {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>

      {open && (
        <nav className="glass container-x mt-2 rounded-3xl p-2 md:hidden" aria-label="Mobile">
          {nav.map(({ href, label, icon: Icon }) => (
            <Link
              key={href}
              href={href}
              onClick={() => setOpen(false)}
              className="flex items-center gap-3 rounded-2xl px-4 py-3 text-base font-medium text-marron hover:bg-fondo/60"
            >
              <Icon className="h-5 w-5 text-rojo" strokeWidth={1.75} aria-hidden />
              {label}
            </Link>
          ))}
          <Link href="/login" onClick={() => setOpen(false)} className="btn btn-glass-red mt-2 w-full sm:hidden">
            <LogIn className="h-4 w-4" aria-hidden />
            Log in
          </Link>
        </nav>
      )}
    </header>
  )
}
