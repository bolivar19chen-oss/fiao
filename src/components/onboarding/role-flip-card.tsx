"use client"

import { motion, useReducedMotion } from "framer-motion"
import { ArrowRight, IdCard, RefreshCw, Store, User } from "lucide-react"
import { useState } from "react"

const FADE_UP = {
  hidden: { opacity: 0, y: 10 },
  show: { opacity: 1, y: 0, transition: { type: "spring" as const, bounce: 0.2 } },
}

const STAGGER = {
  hidden: {},
  show: { transition: { staggerChildren: 0.12 } },
}

export type Role = "business" | "customer"

export function RoleFlipCard({ onChoose }: { onChoose: (role: Role) => void }) {
  const [face, setFace] = useState<Role>("business")
  const reduced = useReducedMotion()
  const flipped = face === "customer"

  return (
    <div className="w-full max-w-md">
      {/* Sin perspective el giro se ve plano. */}
      <div className="[perspective:1600px]">
        <motion.div
          className="relative [transform-style:preserve-3d]"
          animate={reduced ? {} : { rotateY: flipped ? 180 : 0 }}
          transition={{ type: "spring", stiffness: 160, damping: 22 }}
        >
          <CardFace
            side="front"
            hidden={flipped}
            reduced={reduced}
            icon={<Store className="h-6 w-6" aria-hidden />}
            eyebrow="For shop owners"
            title="I run a business"
            description="Track inventory, sell on credit and keep every customer's payment history in one place."
            detailTitle="You'll need your RUC"
            detailNote="Plus your operating notice and the shop's address."
            cta="Set up my shop"
            accent="red"
            onChoose={() => onChoose("business")}
          />
          <CardFace
            side="back"
            hidden={!flipped}
            reduced={reduced}
            icon={<User className="h-6 w-6" aria-hidden />}
            eyebrow="For customers"
            title="I'm a customer"
            description="See what you owe at each shop, your payment history and your credit score there."
            detailTitle="You'll need your ID number"
            detailNote="And an invite from the shop that gives you credit."
            cta="Enter my invite code"
            accent="cream"
            onChoose={() => onChoose("customer")}
          />
        </motion.div>
      </div>

      {/* Fuera de la tarjeta: adentro gira con ella y deja de poder tocarse. */}
      <button
        type="button"
        onClick={() => setFace(flipped ? "business" : "customer")}
        className="btn btn-glass mx-auto mt-6 flex"
      >
        <RefreshCw className="h-4 w-4" aria-hidden />
        {flipped ? "I run a business instead" : "I'm a customer instead"}
      </button>
    </div>
  )
}

function CardFace({
  side,
  hidden,
  reduced,
  icon,
  eyebrow,
  title,
  description,
  detailTitle,
  detailNote,
  cta,
  accent,
  onChoose,
}: {
  side: "front" | "back"
  hidden: boolean
  reduced: boolean | null
  icon: React.ReactNode
  eyebrow: string
  title: string
  description: string
  detailTitle: string
  detailNote: string
  cta: string
  accent: "red" | "cream"
  onChoose: () => void
}) {
  const isBack = side === "back"

  return (
    <motion.div
      // inert saca la cara oculta del foco y del lector de pantalla. Mismo patron que
      // src/components/auth/auth-switch.tsx.
      inert={hidden}
      initial="hidden"
      animate="show"
      variants={STAGGER}
      style={{ backfaceVisibility: "hidden" }}
      className={[
        "glass overflow-hidden rounded-[2rem]",
        // La cara trasera va absoluta; la frontal define la altura. Las dos miden lo
        // mismo: misma cantidad de lineas en description y en detailNote.
        isBack ? "absolute inset-0 [transform:rotateY(180deg)]" : "",
        reduced && hidden ? "opacity-0" : "",
      ].join(" ")}
    >
      {/* Donde el diseno de referencia pone una foto va la marca: no hay imagen en el
          repo y una remota obligaria a declarar el dominio en next.config.mjs. */}
      <motion.div
        variants={FADE_UP}
        aria-hidden
        className={[
          "relative h-32 w-full",
          accent === "red"
            ? "bg-[radial-gradient(120%_140%_at_20%_0%,#cd2626_0%,#b91c1c_45%,#7f1d1d_100%)]"
            : "bg-[radial-gradient(120%_140%_at_20%_0%,#fff8e6_0%,#fef3c7_45%,#ffbf32_100%)]",
        ].join(" ")}
      >
        <span
          className={[
            "absolute bottom-4 left-8 grid h-12 w-12 place-items-center rounded-2xl",
            accent === "red" ? "bg-white/90 text-rojo" : "bg-marron text-crema",
          ].join(" ")}
        >
          {icon}
        </span>
      </motion.div>

      <div className="space-y-5 p-8">
        <motion.div variants={FADE_UP} className="space-y-2">
          <p className="eyebrow">{eyebrow}</p>
          <h2 className="font-display text-2xl font-semibold tracking-tight text-marron">{title}</h2>
          <p className="min-h-[4.5rem] text-[15px] leading-relaxed text-marron/70">{description}</p>
        </motion.div>

        <motion.div
          variants={FADE_UP}
          className="flex items-start gap-3 rounded-2xl border border-white/60 bg-white/50 p-4"
        >
          <IdCard className="mt-0.5 h-4 w-4 shrink-0 text-marron/60" aria-hidden />
          <span>
            <span className="block text-sm font-semibold text-marron">{detailTitle}</span>
            <span className="block text-xs leading-relaxed text-marron/60">{detailNote}</span>
          </span>
        </motion.div>

        <motion.div variants={FADE_UP}>
          <button type="button" onClick={onChoose} className="btn btn-glass-red w-full">
            {cta}
            <ArrowRight className="h-4 w-4" aria-hidden />
          </button>
        </motion.div>
      </div>
    </motion.div>
  )
}
