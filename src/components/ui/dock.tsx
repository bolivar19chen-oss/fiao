"use client"

import { createContext, useContext, useRef, useState } from "react"
import Link from "next/link"
import {
  AnimatePresence,
  motion,
  useMotionValue,
  useSpring,
  useTransform,
  type MotionValue,
  type SpringOptions,
} from "framer-motion"
import type { LucideIcon } from "lucide-react"

// Dock estilo macOS (base: componente "dock" de 21st.dev). En la app va `vertical`, como
// riel del costado: los iconos crecen hacia la derecha y la etiqueta sale a su lado. Cada item
// es un Link. Superficie solida y no cristal: el riel ya es cristal, y seis circulos mas de
// cristal encima son la dosis que R-10 pide no pasar.

interface DockContextValue {
  /** Posicion del cursor sobre el eje del dock: X en horizontal, Y en vertical. */
  mouse: MotionValue<number>
  vertical: boolean
  spring: SpringOptions
  magnification: number
  distance: number
  baseSize: number
}

const DockContext = createContext<DockContextValue | null>(null)

interface DockProps {
  children: React.ReactNode
  className?: string
  vertical?: boolean
  baseSize?: number
  magnification?: number
  distance?: number
  spring?: SpringOptions
}

export function Dock({
  children,
  className = "",
  vertical = false,
  baseSize = 38,
  magnification = 54,
  distance = 110,
  spring = { mass: 0.1, stiffness: 150, damping: 12 },
}: DockProps) {
  const mouse = useMotionValue(Infinity)

  return (
    <div
      onMouseMove={(e) => mouse.set(vertical ? e.clientY : e.clientX)}
      onMouseLeave={() => mouse.set(Infinity)}
      className={`flex items-start gap-2.5 ${vertical ? "flex-col" : ""} ${className}`}
      style={vertical ? { width: baseSize } : { height: baseSize }}
    >
      <DockContext.Provider value={{ mouse, vertical, spring, magnification, distance, baseSize }}>
        {children}
      </DockContext.Provider>
    </div>
  )
}

interface DockItemProps {
  href: string
  label: string
  icon: LucideIcon
  active?: boolean
}

export function DockItem({ href, label, icon: Icon, active = false }: DockItemProps) {
  const dock = useContext(DockContext)
  if (!dock) throw new Error("DockItem must be used inside Dock")
  const { mouse, vertical, spring, magnification, distance, baseSize } = dock

  const ref = useRef<HTMLDivElement>(null)
  const [showLabel, setShowLabel] = useState(false)

  // Distancia entre el cursor y el centro del item, sobre el eje del dock.
  const offset = useTransform(mouse, (position) => {
    const rect = ref.current?.getBoundingClientRect()
    if (!rect) return Infinity
    return vertical ? position - rect.y - rect.height / 2 : position - rect.x - rect.width / 2
  })
  const size = useSpring(useTransform(offset, [-distance, 0, distance], [baseSize, magnification, baseSize]), spring)
  const iconSize = useTransform(size, (s) => s * 0.44)

  return (
    <motion.div ref={ref} style={{ width: size, height: size }} className="relative shrink-0">
      <Link
        href={href}
        // Igual que el lateral: con prefetch completo la pantalla ya esta cargada al pulsar.
        prefetch
        aria-label={label}
        aria-current={active ? "page" : undefined}
        onMouseEnter={() => setShowLabel(true)}
        onMouseLeave={() => setShowLabel(false)}
        onFocus={() => setShowLabel(true)}
        onBlur={() => setShowLabel(false)}
        className={`grid h-full w-full place-items-center rounded-full border border-marron/10 bg-papel transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rojo/40 ${
          active ? "text-rojo" : "text-marron/70 hover:text-rojo"
        }`}
      >
        <motion.span style={{ width: iconSize, height: iconSize }} className="block">
          <Icon className="h-full w-full" strokeWidth={1.75} aria-hidden />
        </motion.span>
      </Link>

      {active && (
        <span
          className={`absolute h-1 w-1 rounded-full bg-rojo ${
            vertical ? "-left-2 top-1/2 -translate-y-1/2" : "-bottom-2 left-1/2 -translate-x-1/2"
          }`}
          aria-hidden
        />
      )}

      <AnimatePresence>
        {showLabel && (
          <motion.span
            initial={{ opacity: 0, [vertical ? "x" : "y"]: 0 }}
            animate={{ opacity: 1, [vertical ? "x" : "y"]: 6 }}
            exit={{ opacity: 0, [vertical ? "x" : "y"]: 0 }}
            transition={{ duration: 0.18 }}
            style={vertical ? { y: "-50%" } : { x: "-50%" }}
            className={`pointer-events-none absolute whitespace-nowrap ${vertical ? "left-full top-1/2 ml-2" : "left-1/2 top-full mt-2"} rounded-full border border-marron/10 bg-fondo px-3 py-1 text-xs font-semibold text-marron shadow-sm`}
            aria-hidden
          >
            {label}
          </motion.span>
        )}
      </AnimatePresence>
    </motion.div>
  )
}
