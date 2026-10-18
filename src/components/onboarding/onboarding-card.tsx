"use client"

import { motion } from "framer-motion"
import type { ReactNode } from "react"

// La anatomia del diseno de referencia, con los tokens del proyecto.
//
// Por que no se instala shadcn/ui: sus componentes leen variables CSS
// (--background, --foreground, --muted-foreground, --input, --ring) que
// tailwind.config.ts no define, asi que se renderizarian sin color. Montarlas
// significaria mantener un segundo sistema de tokens al lado de rojo / amarillo /
// crema / marron. El mapeo es directo:
//
//   bg-background/60   -> .glass (blanco translucido con blur)
//   text-foreground    -> text-marron
//   text-muted-fg      -> text-marron/70
//   border-input       -> border-marron/10
//
// Lo que si se respeta tal cual del diseno: rounded-2xl, borde, sombra, blur,
// contenido CENTRADO, la fila interna con borde propio, el input con icono a la
// izquierda, el boton a todo el ancho, y la animacion escalonada de 0,15.

export const FADE_UP = {
  hidden: { opacity: 0, y: 10 },
  show: { opacity: 1, y: 0, transition: { type: "spring" as const, bounce: 0.2 } },
}

export const STAGGER = {
  hidden: {},
  show: { transition: { staggerChildren: 0.15 } },
}

/**
 * Banda superior. En el diseno original es una foto; no hay ninguna en el repo y una
 * remota obligaria a declarar el dominio en next.config.mjs, asi que va la marca.
 * Cuando haya una imagen propia se reemplaza solo esto.
 */
export function CardBanner({ tone, icon }: { tone: "red" | "cream"; icon: ReactNode }) {
  return (
    <motion.div
      variants={FADE_UP}
      aria-hidden
      className={[
        "relative h-36 w-full",
        tone === "red"
          ? "bg-[radial-gradient(120%_140%_at_20%_0%,theme(colors.rojo.claro)_0%,theme(colors.rojo.marca)_45%,theme(colors.rojo.oscuro)_100%)]"
          : "bg-[radial-gradient(120%_140%_at_20%_0%,theme(colors.crema.claro)_0%,theme(colors.crema.DEFAULT)_45%,theme(colors.amarillo.DEFAULT)_100%)]",
      ].join(" ")}
    >
      <div
        className="absolute inset-0 opacity-30"
        style={{
          backgroundImage:
            "linear-gradient(rgb(255 255 255 / 0.18) 1px, transparent 1px), linear-gradient(90deg, rgb(255 255 255 / 0.18) 1px, transparent 1px)",
          backgroundSize: "28px 28px",
          maskImage: "radial-gradient(ellipse 80% 70% at 30% 0%, black, transparent)",
          WebkitMaskImage: "radial-gradient(ellipse 80% 70% at 30% 0%, black, transparent)",
        }}
      />
      {/* Centrado, como el avatar del diseno original. */}
      <span
        className={[
          "absolute -bottom-7 left-1/2 grid h-14 w-14 -translate-x-1/2 place-items-center rounded-full ring-4 ring-fondo/70",
          tone === "red" ? "bg-fondo text-rojo" : "bg-marron text-crema",
        ].join(" ")}
      >
        {icon}
      </span>
    </motion.div>
  )
}

/** La caja de cristal: rounded-2xl, borde, sombra y blur, como el diseno. */
export function OnboardingCard({
  children,
  className = "",
  ...rest
}: { children: ReactNode; className?: string } & React.ComponentProps<typeof motion.div>) {
  return (
    <motion.div
      initial="hidden"
      animate="show"
      variants={STAGGER}
      className={`glass w-full max-w-md overflow-hidden rounded-2xl ${className}`}
      {...rest}
    >
      {children}
    </motion.div>
  )
}

/** Contenido centrado con el espaciado del diseno: space-y-6 p-8 text-center. */
export function CardBody({ children }: { children: ReactNode }) {
  return <div className="space-y-6 p-8 pt-12 text-center">{children}</div>
}

export function CardHeading({ title, description }: { title: string; description: string }) {
  return (
    <motion.div variants={FADE_UP} className="space-y-2">
      <h2 className="font-display text-2xl font-bold tracking-tight text-marron">{title}</h2>
      <p className="text-[15px] leading-relaxed text-marron/70">{description}</p>
    </motion.div>
  )
}

/** La fila interna con borde propio del diseno: justify-between, rounded-lg, p-3. */
export function CardNote({ icon, title, note }: { icon: ReactNode; title: string; note: string }) {
  return (
    <motion.div
      variants={FADE_UP}
      className="flex items-center gap-3 rounded-lg border border-marron/10 bg-fondo/50 p-3 text-left"
    >
      <span className="shrink-0 text-marron/60">{icon}</span>
      <span>
        <span className="block text-sm font-medium text-marron">{title}</span>
        <span className="block text-xs leading-relaxed text-marron/60">{note}</span>
      </span>
    </motion.div>
  )
}

/**
 * Input con el icono adentro, a la izquierda, como el diseno. El label existe y es
 * visible: un placeholder no es un label, y al escribir desaparece la unica pista de
 * que pedia ese campo.
 */
export function CardField({
  label,
  icon,
  hint,
  ...input
}: { label: string; icon: ReactNode; hint?: string } & React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <motion.label variants={FADE_UP} className="block text-left">
      <span className="text-sm font-medium text-marron">{label}</span>
      <span className="relative mt-1.5 block">
        <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-marron/45">{icon}</span>
        <input
          {...input}
          className="h-11 w-full rounded-lg border border-marron/10 bg-fondo/70 pl-9 pr-3 text-[15px] text-marron outline-none transition placeholder:text-marron/35 focus:border-rojo/40 focus:bg-fondo focus:ring-4 focus:ring-rojo/10"
        />
      </span>
      {hint && <span className="mt-1 block text-xs text-marron/55">{hint}</span>}
    </motion.label>
  )
}

export function CardError({ children }: { children: ReactNode }) {
  return (
    <p role="alert" className="rounded-lg bg-amarillo/20 px-4 py-3 text-sm text-marron/85">
      {children}
    </p>
  )
}
