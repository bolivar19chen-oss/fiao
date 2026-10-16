"use client"

import Link from "next/link"
import type { LucideIcon } from "lucide-react"
import {
  AnimatePresence,
  motion,
  useMotionValue,
  useSpring,
  useTransform,
  type MotionValue,
  type SpringOptions,
} from "framer-motion"
import { createContext, useContext, useRef, useState } from "react"

// Dock estilo macOS adaptado al header (base: componente "dock" de 21st.dev).
// Cambios: los iconos crecen hacia abajo, la etiqueta sale debajo y cada item es un Link.

interface DockContextValue {
  mouseX: MotionValue<number>
  spring: SpringOptions
  magnification: number
  distance: number
  baseSize: number
}

const DockContext = createContext<DockContextValue | null>(null)

interface DockProps {
  children: React.ReactNode
  className?: string
  baseSize?: number
  magnification?: number
  distance?: number
  spring?: SpringOptions
}

export function Dock({
  children,
  className = "",
  baseSize = 38,
  magnification = 54,
  distance = 110,
  spring = { mass: 0.1, stiffness: 150, damping: 12 },
}: DockProps) {
  const mouseX = useMotionValue(Infinity)

  return (
    <div
      onMouseMove={(e) => mouseX.set(e.clientX)}
      onMouseLeave={() => mouseX.set(Infinity)}
      className={`flex items-start gap-2.5 ${className}`}
      style={{ height: baseSize }}
    >
      <DockContext.Provider value={{ mouseX, spring, magnification, distance, baseSize }}>
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
  const { mouseX, spring, magnification, distance, baseSize } = dock

  const ref = useRef<HTMLDivElement>(null)
  const [showLabel, setShowLabel] = useState(false)

  // Distancia horizontal entre el mouse y el centro del item.
  const offset = useTransform(mouseX, (x) => {
    const rect = ref.current?.getBoundingClientRect()
    return rect ? x - rect.x - rect.width / 2 : Infinity
  })
  const size = useSpring(useTransform(offset, [-distance, 0, distance], [baseSize, magnification, baseSize]), spring)
  const iconSize = useTransform(size, (s) => s * 0.44)

  return (
    <motion.div ref={ref} style={{ width: size, height: size }} className="relative shrink-0">
      <Link
        href={href}
        aria-label={label}
        aria-current={active ? "page" : undefined}
        onMouseEnter={() => setShowLabel(true)}
        onMouseLeave={() => setShowLabel(false)}
        onFocus={() => setShowLabel(true)}
        onBlur={() => setShowLabel(false)}
        className={`glass grid h-full w-full place-items-center rounded-full transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rojo/40 ${
          active ? "text-rojo" : "text-marron/70 hover:text-rojo"
        }`}
      >
        <motion.span style={{ width: iconSize, height: iconSize }} className="block">
          <Icon className="h-full w-full" strokeWidth={1.75} aria-hidden />
        </motion.span>
      </Link>

      {active && (
        <span className="absolute -bottom-2 left-1/2 h-1 w-1 -translate-x-1/2 rounded-full bg-rojo" aria-hidden />
      )}

      <AnimatePresence>
        {showLabel && (
          <motion.span
            initial={{ opacity: 0, y: 0 }}
            animate={{ opacity: 1, y: 6 }}
            exit={{ opacity: 0, y: 0 }}
            transition={{ duration: 0.18 }}
            style={{ x: "-50%" }}
            className="glass pointer-events-none absolute left-1/2 top-full mt-2 whitespace-nowrap rounded-full px-3 py-1 text-xs font-semibold text-marron"
            aria-hidden
          >
            {label}
          </motion.span>
        )}
      </AnimatePresence>
    </motion.div>
  )
}
