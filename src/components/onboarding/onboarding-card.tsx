"use client"

import type { ReactNode } from "react"
import Image from "next/image"
import { motion } from "framer-motion"
import { ChevronDown } from "lucide-react"

import laConfianza from "@/assets/img/abarroteria-alto-de-la-estancia.webp"
import lolitas from "@/assets/img/abarroteria-san-juan-de-dios.webp"

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
 * Banda superior: la foto decorativa del diseno de referencia. Cada rol lleva la suya, las
 * dos de tiendas reales de Cocle (credito en la pagina de onboarding).
 */
export function CardBanner({ tone }: { tone: "red" | "cream" }) {
  return (
    <motion.div variants={FADE_UP} aria-hidden>
      <Image
        src={tone === "red" ? lolitas : laConfianza}
        alt=""
        priority
        sizes="(min-width: 448px) 448px, 100vw"
        className="h-40 w-full object-cover"
      />
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
  return <div className="space-y-6 p-8 text-center">{children}</div>
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
      // items-start y no items-center: en pantalla angosta el titulo ocupa tres lineas y
      // el icono se iba a flotar a la mitad del bloque, lejos de lo que nombra.
      className="flex items-start gap-3 rounded-lg border border-marron/10 bg-fondo/50 p-3 text-left"
    >
      <span className="mt-0.5 shrink-0 text-marron/70">{icon}</span>
      <span>
        <span className="block text-sm font-medium text-marron">{title}</span>
        <span className="block text-xs leading-relaxed text-marron/70">{note}</span>
      </span>
    </motion.div>
  )
}

/**
 * Input con el icono adentro, a la izquierda, como el diseno. El label existe y es
 * visible: un placeholder no es un label, y al escribir desaparece la unica pista de
 * que pedia ese campo.
 */
const slug = (text: string) =>
  text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")

/**
 * Campo con etiqueta, icono y pista.
 *
 * La etiqueta se ata con `htmlFor` y no envolviendo al input. Envuelto, el nombre
 * accesible se comia tambien la pista y un lector de pantalla leia "Reference Reference
 * from your Yappy app.". La pista va aparte con `aria-describedby`, que es lo que
 * corresponde: describe, no nombra. Mismo arreglo que ya tienen `Field` y `CardSelect`.
 */
export function CardField({
  label,
  icon,
  hint,
  ...input
}: { label: string; icon: ReactNode; hint?: string } & React.InputHTMLAttributes<HTMLInputElement>) {
  const id = input.id ?? input.name ?? slug(label)
  const hintId = `${id}-hint`

  return (
    <motion.div variants={FADE_UP} className="block text-left">
      <label htmlFor={id} className="text-sm font-medium text-marron">
        {label}
      </label>
      <span className="relative mt-1.5 block">
        <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-marron/70">{icon}</span>
        <input
          {...input}
          id={id}
          aria-describedby={hint ? hintId : undefined}
          className="h-11 w-full rounded-lg border border-marron/10 bg-fondo/70 pl-9 pr-3 text-[15px] text-marron outline-none transition placeholder:text-marron/70 focus:border-rojo/40 focus:bg-fondo focus:ring-4 focus:ring-rojo/10"
        />
      </span>
      {hint && (
        <span id={hintId} className="mt-1 block text-xs text-marron/70">
          {hint}
        </span>
      )}
    </motion.div>
  )
}

export function CardError({ children }: { children: ReactNode }) {
  return (
    <p role="alert" className="rounded-lg bg-amarillo/20 px-4 py-3 text-sm text-marron/85">
      {children}
    </p>
  )
}

/**
 * Desplegable con la misma piel que CardField.
 *
 * A diferencia de CardField, la etiqueta se ata con `htmlFor` y no envolviendo al
 * control: envuelta, el nombre accesible se come tambien la pista y un lector de
 * pantalla lee la etiqueta y la ayuda de corrido. Es el mismo arreglo que ya tiene
 * `Field` en components/app/ui.tsx.
 */
export function CardSelect({
  label,
  icon,
  hint,
  options,
  placeholder,
  ...select
}: {
  label: string
  icon: ReactNode
  hint?: string
  /** `value` es lo que se envia; `label` lo que se lee. */
  options: { value: string; label: string }[]
  placeholder: string
} & React.SelectHTMLAttributes<HTMLSelectElement>) {
  const id = select.id ?? select.name ?? slug(label)
  const hintId = `${id}-hint`

  return (
    <motion.div variants={FADE_UP} className="block text-left">
      <label htmlFor={id} className="text-sm font-medium text-marron">
        {label}
      </label>
      <span className="relative mt-1.5 block">
        <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-marron/70">{icon}</span>
        <select
          {...select}
          id={id}
          aria-describedby={hint ? hintId : undefined}
          className="h-11 w-full appearance-none rounded-lg border border-marron/10 bg-fondo/70 pl-9 pr-9 text-[15px] text-marron outline-none transition focus:border-rojo/40 focus:bg-fondo focus:ring-4 focus:ring-rojo/10"
        >
          <option value="">{placeholder}</option>
          {options.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
        <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-marron/70">
          <ChevronDown className="h-4 w-4" aria-hidden />
        </span>
      </span>
      {hint && (
        <span id={hintId} className="mt-1 block text-xs text-marron/70">
          {hint}
        </span>
      )}
    </motion.div>
  )
}
