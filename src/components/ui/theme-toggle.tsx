"use client"

import { useEffect, useState } from "react"
import { Monitor, Moon, Sun } from "lucide-react"

const OPTIONS = [
  { value: "system", label: "Use system theme", icon: Monitor },
  { value: "light", label: "Light theme", icon: Sun },
  { value: "dark", label: "Dark theme", icon: Moon },
] as const

type Theme = (typeof OPTIONS)[number]["value"]

// La eleccion vive en localStorage("theme") y en la clase de <html>. El script de
// src/app/layout.tsx la aplica antes de pintar; aca solo se lee y se cambia.
export function ThemeToggle({ className = "" }: { className?: string }) {
  const [theme, setTheme] = useState<Theme>("system")

  // Leer la clase despues de montar: en el servidor no existe y el primer render tiene que
  // coincidir con el HTML.
  useEffect(() => {
    const root = document.documentElement.classList
    setTheme(root.contains("dark") ? "dark" : root.contains("light") ? "light" : "system")
  }, [])

  function choose(next: Theme) {
    setTheme(next)
    const root = document.documentElement.classList
    root.remove("light", "dark")
    if (next !== "system") root.add(next)
    try {
      if (next === "system") localStorage.removeItem("theme")
      else localStorage.setItem("theme", next)
    } catch {
      // Sin almacenamiento (modo privado estricto) el tema vale para esta visita.
    }
  }

  return (
    <div role="group" aria-label="Theme" className={`glass inline-flex rounded-full p-1 ${className}`}>
      {OPTIONS.map(({ value, label, icon: Icon }) => (
        <button
          key={value}
          type="button"
          aria-label={label}
          aria-pressed={theme === value}
          onClick={() => choose(value)}
          className={`grid h-10 w-10 place-items-center rounded-full transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rojo/40 ${
            theme === value ? "bg-marron/10 text-marron" : "text-marron/60 hover:text-marron"
          }`}
        >
          <Icon className="h-[18px] w-[18px]" strokeWidth={1.75} aria-hidden />
        </button>
      ))}
    </div>
  )
}
