import Link from "next/link"
import { ThemeToggle } from "@/components/ui/theme-toggle"
import { Logo } from "./logo"

const links = [
  { href: "/", label: "Home" },
  { href: "/about", label: "About Us" },
  { href: "/services", label: "Services" },
  { href: "/privacy", label: "Privacy Policy" },
  { href: "/login", label: "Log in" },
]

export function SiteFooter() {
  return (
    <footer className="border-t border-marron/10">
      <div className="container-x flex flex-col gap-8 py-12 md:flex-row md:items-center md:justify-between">
        <div className="space-y-2">
          <Logo />
          <p className="text-sm text-marron/60">Your business, better organized.</p>
        </div>
        <nav className="flex flex-wrap gap-x-6 gap-y-2 text-sm text-marron/70" aria-label="Footer">
          {links.map((l) => (
            <Link key={l.href} href={l.href} className="hover:text-rojo">
              {l.label}
            </Link>
          ))}
        </nav>
      </div>
      <div className="container-x flex items-center justify-between gap-4 pb-10">
        <p className="text-xs text-marron/45">© 2026 FIA&apos;O. All rights reserved.</p>
        <ThemeToggle />
      </div>
    </footer>
  )
}
