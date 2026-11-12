"use client"

import { useState } from "react"
import { motion, useReducedMotion } from "framer-motion"
import { ArrowRight, IdCard, RefreshCw } from "lucide-react"

import { CardBanner, CardBody, CardHeading, CardNote, OnboardingCard } from "./onboarding-card"

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
            title="I run a business"
            description="Track inventory, sell on credit and keep every customer's payment history in one place."
            noteTitle="You'll need your RUC"
            note="Plus your operating notice and the shop's address."
            cta="Set up my shop"
            tone="red"
            onChoose={() => onChoose("business")}
          />
          <CardFace
            side="back"
            hidden={!flipped}
            reduced={reduced}
            title="I'm a customer"
            description="See what you owe at each shop, your payment history and your credit score there."
            noteTitle="You'll need your ID number"
            note="And an invite from the shop that gives you credit."
            cta="Create my account"
            tone="cream"
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
  title,
  description,
  noteTitle,
  note,
  cta,
  tone,
  onChoose,
}: {
  side: "front" | "back"
  hidden: boolean
  reduced: boolean | null
  title: string
  description: string
  noteTitle: string
  note: string
  cta: string
  tone: "red" | "cream"
  onChoose: () => void
}) {
  const isBack = side === "back"

  return (
    <OnboardingCard
      // inert saca la cara oculta del foco y del lector de pantalla. Mismo patron que
      // src/components/auth/auth-switch.tsx.
      inert={hidden}
      style={{ backfaceVisibility: "hidden" }}
      className={[
        // La cara trasera va absoluta; la frontal define la altura. Las dos miden lo
        // mismo: igual cantidad de lineas en description y en note.
        isBack ? "absolute inset-0 [transform:rotateY(180deg)]" : "",
        reduced && hidden ? "opacity-0" : "",
      ].join(" ")}
    >
      <CardBanner tone={tone} />

      <CardBody>
        <CardHeading title={title} description={description} />
        <CardNote icon={<IdCard className="h-4 w-4" aria-hidden />} title={noteTitle} note={note} />

        <motion.div variants={{ hidden: { opacity: 0, y: 10 }, show: { opacity: 1, y: 0 } }}>
          <button type="button" onClick={onChoose} className="btn btn-glass-red w-full">
            {cta}
            <ArrowRight className="h-4 w-4" aria-hidden />
          </button>
        </motion.div>
      </CardBody>
    </OnboardingCard>
  )
}
