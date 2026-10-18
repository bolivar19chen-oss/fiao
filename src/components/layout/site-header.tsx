"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { useEffect, useState } from "react"
import { House, Info, LayoutGrid, LogIn, Menu, ShieldCheck, X } from "lucide-react"
import { Dock, DockItem } from "@/components/ui/dock"
import { Logo } from "./logo"

const nav = [
  { href: "/", label: "Home", icon: House },
  { href: "/about", label: "About Us", icon: Info },
  { href: "/services", label: "Services", icon: LayoutGrid },
  { href: "/privacy", label: "Privacy Policy", icon: ShieldCheck },
]

export function SiteHeader() {
  const pathname = usePathname()
  const [scrolled, setScrolled] = useState(false)
  const [open, setOpen] = useState(false)

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8)
    onScroll()
    window.addEventListener("scroll", onScroll, { passive: true })
    return () => window.removeEventListener("scroll", onScroll)
  }, [])

  return (
    <header className="fixed inset-x-0 top-0 z-50 px-3 pt-3">
      <div
        className={`container-x flex h-14 items-center justify-between rounded-full transition-all duration-500 ${
          scrolled || open ? "glass" : "border border-transparent"
        }`}
      >
        <Link href="/" aria-label="FIA'O home" onClick={() => setOpen(false)}>
          <Logo />
        </Link>

        <nav className="hidden md:block" aria-label="Main">
          <Dock>
            {nav.map((item) => (
              <DockItem key={item.href} {...item} active={pathname === item.href} />
            ))}
          </Dock>
        </nav>

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
