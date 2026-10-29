"use client"

// 404 animado, adaptado de un componente de 21st.dev: el fondo rojo de marca se llena de
// circulos blancos hasta quedar en blanco, pasan las figuras y aparece el mensaje sobre
// cristal. Con prefers-reduced-motion se muestra directo el estado final.
import { useEffect, useRef, useState } from "react"
import Image from "next/image"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { ArrowLeft, House } from "lucide-react"

import { Aurora } from "@/components/ui/aurora"

function prefersReducedMotion() {
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches
}

export function NotFoundPage() {
  return (
    <div className="relative flex h-[100dvh] w-full items-center justify-center overflow-hidden bg-rojo-marca">
      <CircleAnimation />
      <CharactersAnimation />
      <MessageDisplay />
    </div>
  )
}

function MessageDisplay() {
  const router = useRouter()
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    const timer = setTimeout(() => setIsVisible(true), prefersReducedMotion() ? 0 : 1200)
    return () => clearTimeout(timer)
  }, [])

  // Si se llego por un enlace externo no hay historial propio: volver es ir al inicio.
  const goBack = () => (window.history.length > 1 ? router.back() : router.push("/"))

  return (
    <div
      className={`absolute inset-0 isolate z-[100] flex flex-col items-center justify-center px-4 text-center transition-opacity duration-500 ${
        isVisible ? "opacity-100" : "pointer-events-none opacity-0"
      }`}
    >
      <Aurora />
      <p className="eyebrow">Page not found</p>
      <h1 className="mt-3 font-display text-8xl font-bold tracking-tight text-rojo sm:text-9xl">404</h1>
      <p className="mt-4 max-w-md text-[15px] text-marron/70">
        The page you are looking for might have been removed, had its name changed, or is temporarily unavailable.
      </p>
      <div className="mt-8 flex flex-wrap justify-center gap-3">
        <button type="button" onClick={goBack} className="btn btn-glass h-12 px-6">
          <ArrowLeft className="h-4 w-4" aria-hidden />
          Go back
        </button>
        <Link href="/" className="btn btn-glass-red h-12 px-6">
          <House className="h-4 w-4" aria-hidden />
          Go home
        </Link>
      </div>
    </div>
  )
}

type StickFigure = {
  top?: string
  bottom?: string
  src: string
  rotate?: string
  // ms para cruzar la pantalla; 0 = quieta.
  speedX: number
  // ms por vuelta; sin valor = no gira.
  speedRotation?: number
}

const stickFigures: StickFigure[] = [
  { top: "0%", src: "/not-found/stick-block.svg", rotate: "-90deg", speedX: 1500 },
  { top: "10%", src: "/not-found/stick-1.svg", speedX: 3000, speedRotation: 2000 },
  { top: "20%", src: "/not-found/stick-2.svg", speedX: 5000, speedRotation: 1000 },
  { top: "25%", src: "/not-found/stick-block.svg", speedX: 2500, speedRotation: 1500 },
  { top: "35%", src: "/not-found/stick-block.svg", speedX: 2000, speedRotation: 300 },
  { bottom: "5%", src: "/not-found/stick-3.svg", speedX: 0 },
]

function CharactersAnimation() {
  const refs = useRef<(HTMLDivElement | null)[]>([])

  useEffect(() => {
    if (prefersReducedMotion()) return

    const animations = stickFigures.flatMap((figure, i) => {
      const el = refs.current[i]
      if (!el || figure.speedX === 0) return []
      const moves = [
        el.animate([{ left: "100%" }, { left: "-20%" }], {
          duration: figure.speedX,
          easing: "linear",
          fill: "forwards",
        }),
      ]
      if (figure.speedRotation) {
        moves.push(
          el.animate([{ transform: "rotate(0deg)" }, { transform: "rotate(-360deg)" }], {
            duration: figure.speedRotation,
            iterations: Infinity,
            easing: "linear",
          }),
        )
      }
      return moves
    })

    return () => animations.forEach((a) => a.cancel())
  }, [])

  return (
    <div className="absolute inset-0 motion-reduce:hidden" aria-hidden>
      {stickFigures.map((figure, i) => (
        <div
          key={i}
          ref={(el) => {
            refs.current[i] = el
          }}
          className="absolute h-[18%] w-[18%]"
          style={{
            top: figure.top,
            bottom: figure.bottom,
            // Las que cruzan arrancan fuera de pantalla, a la derecha.
            left: figure.speedX === 0 ? undefined : "100%",
            transform: figure.rotate ? `rotate(${figure.rotate})` : undefined,
          }}
        >
          <Image src={figure.src} alt="" fill unoptimized className="object-contain" />
        </div>
      ))}
    </div>
  )
}

type Circle = { x: number; y: number; size: number }

function CircleAnimation() {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    const context = canvas?.getContext("2d")
    if (!canvas || !context) return

    let frame = 0
    let requestId = 0
    let circles: Circle[] = []

    const start = () => {
      cancelAnimationFrame(requestId)
      canvas.width = window.innerWidth
      canvas.height = window.innerHeight
      context.fillStyle = "white"

      if (prefersReducedMotion()) {
        context.fillRect(0, 0, canvas.width, canvas.height)
        return
      }

      frame = 0
      // Nacen a la derecha, fuera de pantalla, y entran barriendo hacia la izquierda.
      circles = Array.from({ length: 300 }, () => ({
        x: canvas.width * 1.2 + Math.random() * canvas.width * 1.8,
        y: canvas.height * -0.2 + Math.random() * canvas.height * 1.2,
        size: Math.max(canvas.width, canvas.height) / 1000,
      }))
      draw()
    }

    const draw = () => {
      frame++
      const distanceX = canvas.width / 80
      // Con el lado mayor: en un celular vertical, escalar por el ancho deja huecos rojos
      // detras del texto.
      const growthRate = Math.max(canvas.width, canvas.height) / 1000

      context.clearRect(0, 0, canvas.width, canvas.height)
      for (const circle of circles) {
        if (frame < 65) {
          circle.x -= distanceX
          circle.size += growthRate
        } else {
          circle.x -= distanceX * 0.02
          circle.size += growthRate * 0.2
        }
        context.beginPath()
        context.arc(circle.x, circle.y, circle.size, 0, Math.PI * 2)
        context.fill()
      }

      if (frame < 500) requestId = requestAnimationFrame(draw)
    }

    start()
    window.addEventListener("resize", start)
    return () => {
      window.removeEventListener("resize", start)
      cancelAnimationFrame(requestId)
    }
  }, [])

  return <canvas ref={canvasRef} className="absolute inset-0 h-full w-full" aria-hidden />
}
