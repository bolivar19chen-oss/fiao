"use client"

import { useEffect, useRef } from "react"

import { BRAND } from "@/lib/colors"

// Petalos cayendo sobre el hero.
//
// ## Por que esto y no un dragon
//
// Buena parte de las tiendas de barrio de Panama las llevan familias chino-panamenas, y
// el publico de FIA'O lo sabe. El guino se hace con lo que las dos culturas ya comparten
// y la marca ya tiene: el rojo, y el trazo de pincel de la firma. No con farolillos,
// dragones ni kanji de adorno, que serian disfraz.
//
// ## Por que canvas y no Motion
//
// Motion anima elementos del DOM. Veintitantos nodos moviendose a la vez en un Android
// barato, que es el telefono del publico, cuesta mas que un solo canvas. Motion sigue
// siendo lo correcto para una transicion de interfaz; para particulas, no.
//
// Decorativo y nada mas: aria-hidden y sin eventos. Si el sistema pide menos movimiento
// se dibuja una sola vez y se queda quieto.

const COLORES = [BRAND.rojo.suave, BRAND.rojo.medio, BRAND.amarillo.DEFAULT, BRAND.crema.DEFAULT]

type Petalo = {
  x: number
  y: number
  tam: number
  giro: number
  velGiro: number
  caida: number
  vaiven: number
  fase: number
  color: string
  alfa: number
}

function nuevo(ancho: number, alto: number, arriba: boolean): Petalo {
  return {
    x: Math.random() * ancho,
    y: arriba ? -20 - Math.random() * alto : Math.random() * alto,
    tam: 5 + Math.random() * 7,
    giro: Math.random() * Math.PI * 2,
    velGiro: (Math.random() - 0.5) * 0.02,
    caida: 0.25 + Math.random() * 0.45,
    vaiven: 0.4 + Math.random() * 0.9,
    fase: Math.random() * Math.PI * 2,
    color: COLORES[Math.floor(Math.random() * COLORES.length)],
    alfa: 0.18 + Math.random() * 0.3,
  }
}

// Un petalo: dos curvas que se encuentran en la punta. Mas barato que una imagen y
// escala sin pixelarse.
function dibujar(ctx: CanvasRenderingContext2D, p: Petalo) {
  ctx.save()
  ctx.translate(p.x, p.y)
  ctx.rotate(p.giro)
  ctx.globalAlpha = p.alfa
  ctx.fillStyle = p.color
  ctx.beginPath()
  ctx.moveTo(0, -p.tam)
  ctx.bezierCurveTo(p.tam * 0.9, -p.tam * 0.5, p.tam * 0.7, p.tam * 0.7, 0, p.tam)
  ctx.bezierCurveTo(-p.tam * 0.7, p.tam * 0.7, -p.tam * 0.9, -p.tam * 0.5, 0, -p.tam)
  ctx.fill()
  ctx.restore()
}

export function Petals() {
  const ref = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = ref.current
    if (!canvas) return
    const ctx = canvas.getContext("2d")
    if (!ctx) return

    const quieto = window.matchMedia("(prefers-reduced-motion: reduce)").matches
    let petalos: Petalo[] = []
    let ancho = 0
    let alto = 0
    let frame = 0
    let ultimo = performance.now()

    function medir() {
      if (!canvas || !ctx) return
      const rect = canvas.getBoundingClientRect()
      ancho = rect.width
      alto = rect.height
      // El dpr se topa en 2: a 3 el canvas de un movil gama alta cuesta el triple y no
      // se nota en una forma sin borde.
      const dpr = Math.min(window.devicePixelRatio || 1, 2)
      canvas.width = Math.round(ancho * dpr)
      canvas.height = Math.round(alto * dpr)
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
      // Menos petalos en pantalla estrecha: ahi el telefono es el mas lento.
      const cuantos = ancho < 640 ? 12 : ancho < 1024 ? 20 : 28
      petalos = Array.from({ length: cuantos }, () => nuevo(ancho, alto, false))
    }

    function pintar() {
      if (!ctx) return
      ctx.clearRect(0, 0, ancho, alto)
      for (const p of petalos) dibujar(ctx, p)
    }

    function paso(ahora: number) {
      // Delta en pasos de 60fps, acotado: si la pestana estuvo oculta, no saltan de golpe.
      const dt = Math.min((ahora - ultimo) / 16.67, 3)
      ultimo = ahora
      for (const p of petalos) {
        p.y += p.caida * dt
        p.fase += 0.012 * dt
        p.x += Math.sin(p.fase) * p.vaiven * dt
        p.giro += p.velGiro * dt
        if (p.y - p.tam > alto) Object.assign(p, nuevo(ancho, alto, true), { y: -p.tam })
        else if (p.x < -p.tam * 2) p.x = ancho + p.tam
        else if (p.x > ancho + p.tam * 2) p.x = -p.tam
      }
      pintar()
      frame = requestAnimationFrame(paso)
    }

    function arrancar() {
      cancelAnimationFrame(frame)
      if (quieto) return
      ultimo = performance.now()
      frame = requestAnimationFrame(paso)
    }

    function visibilidad() {
      if (document.hidden) cancelAnimationFrame(frame)
      else arrancar()
    }

    medir()
    pintar()
    arrancar()

    const observer = new ResizeObserver(() => {
      medir()
      pintar()
    })
    observer.observe(canvas)
    document.addEventListener("visibilitychange", visibilidad)

    return () => {
      cancelAnimationFrame(frame)
      observer.disconnect()
      document.removeEventListener("visibilitychange", visibilidad)
    }
  }, [])

  return <canvas ref={ref} aria-hidden className="pointer-events-none absolute inset-0 -z-10 h-full w-full" />
}
