"use client"

import { useEffect, useRef, useCallback } from "react"
import createGlobe from "cobe"

export interface GlobeMarker {
  id: string
  location: [number, number]
  size?: number
  label?: string
}

export interface GlobeArc {
  id: string
  from: [number, number]
  to: [number, number]
}

type RGB = [number, number, number]

interface GlobeProps {
  markers?: GlobeMarker[]
  arcs?: GlobeArc[]
  // [lat, lng] the globe faces on load. It sways around this point instead of spinning away.
  focus: [number, number]
  className?: string
}

// Brand colors as 0-1 RGB for WebGL. Module constants keep the effect from re-running.
const MARKER_COLOR: RGB = [185 / 255, 28 / 255, 28 / 255]
const ARC_COLOR: RGB = [1, 191 / 255, 50 / 255]
const BASE_COLOR: RGB = [1, 1, 1]
const GLOW_COLOR: RGB = [254 / 255, 243 / 255, 199 / 255]
const NO_ARCS: GlobeArc[] = []

const DEFAULT_SIZE = 0.03
const SWAY = 0.45
const SWAY_SPEED = 0.004

// From the cobe docs: angles that put a lat/lng in front of the camera.
function locationToAngles([lat, lng]: [number, number]): [number, number] {
  return [Math.PI - ((lng * Math.PI) / 180 - Math.PI / 2), (lat * Math.PI) / 180]
}

export function Globe({ markers = [], arcs = NO_ARCS, focus, className = "" }: GlobeProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const pointerInteracting = useRef<{ x: number; y: number } | null>(null)
  const lastPointer = useRef<{ x: number; y: number; t: number } | null>(null)
  const dragOffset = useRef({ phi: 0, theta: 0 })
  const velocity = useRef({ phi: 0, theta: 0 })
  const phiOffsetRef = useRef(0)
  const thetaOffsetRef = useRef(0)
  const isPausedRef = useRef(false)
  const [focusLat, focusLng] = focus

  const handlePointerDown = useCallback((e: React.PointerEvent) => {
    pointerInteracting.current = { x: e.clientX, y: e.clientY }
    if (canvasRef.current) canvasRef.current.style.cursor = "grabbing"
    isPausedRef.current = true
  }, [])

  const handlePointerMove = useCallback((e: PointerEvent) => {
    if (pointerInteracting.current === null) return
    const deltaX = e.clientX - pointerInteracting.current.x
    const deltaY = e.clientY - pointerInteracting.current.y
    dragOffset.current = { phi: deltaX / 300, theta: deltaY / 1000 }
    const now = Date.now()
    if (lastPointer.current) {
      const dt = Math.max(now - lastPointer.current.t, 1)
      const maxVelocity = 0.15
      velocity.current = {
        phi: Math.max(-maxVelocity, Math.min(maxVelocity, ((e.clientX - lastPointer.current.x) / dt) * 0.3)),
        theta: Math.max(-maxVelocity, Math.min(maxVelocity, ((e.clientY - lastPointer.current.y) / dt) * 0.08)),
      }
    }
    lastPointer.current = { x: e.clientX, y: e.clientY, t: now }
  }, [])

  const handlePointerUp = useCallback(() => {
    if (pointerInteracting.current !== null) {
      phiOffsetRef.current += dragOffset.current.phi
      thetaOffsetRef.current += dragOffset.current.theta
      dragOffset.current = { phi: 0, theta: 0 }
      lastPointer.current = null
    }
    pointerInteracting.current = null
    if (canvasRef.current) canvasRef.current.style.cursor = "grab"
    isPausedRef.current = false
  }, [])

  useEffect(() => {
    window.addEventListener("pointermove", handlePointerMove, { passive: true })
    window.addEventListener("pointerup", handlePointerUp, { passive: true })
    return () => {
      window.removeEventListener("pointermove", handlePointerMove)
      window.removeEventListener("pointerup", handlePointerUp)
    }
  }, [handlePointerMove, handlePointerUp])

  useEffect(() => {
    if (!canvasRef.current) return
    const canvas = canvasRef.current
    let globe: ReturnType<typeof createGlobe> | null = null
    let animationId = 0
    let ro: ResizeObserver | null = null
    let t = 0
    const [basePhi, baseTheta] = locationToAngles([focusLat, focusLng])
    const cobeMarkers = markers.map((m) => ({ location: m.location, size: m.size ?? DEFAULT_SIZE, id: m.id }))
    const cobeArcs = arcs.map((a) => ({ from: a.from, to: a.to, id: a.id }))

    function init() {
      const width = canvas.offsetWidth
      if (width === 0 || globe) return

      globe = createGlobe(canvas, {
        devicePixelRatio: Math.min(window.devicePixelRatio || 1, 2),
        width,
        height: width,
        phi: basePhi,
        theta: baseTheta,
        dark: 0,
        diffuse: 1.4,
        mapSamples: 20000,
        mapBrightness: 6,
        baseColor: BASE_COLOR,
        markerColor: MARKER_COLOR,
        glowColor: GLOW_COLOR,
        markerElevation: 0.02,
        markers: cobeMarkers,
        arcs: cobeArcs,
        arcColor: ARC_COLOR,
        arcWidth: 0.6,
        arcHeight: 0.18,
        opacity: 0.85,
      })

      function animate() {
        if (!isPausedRef.current) {
          t += SWAY_SPEED
          if (Math.abs(velocity.current.phi) > 0.0001 || Math.abs(velocity.current.theta) > 0.0001) {
            phiOffsetRef.current += velocity.current.phi
            thetaOffsetRef.current += velocity.current.theta
            velocity.current.phi *= 0.95
            velocity.current.theta *= 0.95
          }
          const thetaMin = -0.4
          const thetaMax = 0.4
          if (thetaOffsetRef.current < thetaMin) {
            thetaOffsetRef.current += (thetaMin - thetaOffsetRef.current) * 0.1
          } else if (thetaOffsetRef.current > thetaMax) {
            thetaOffsetRef.current += (thetaMax - thetaOffsetRef.current) * 0.1
          }
        }
        globe!.update({
          phi: basePhi + Math.sin(t) * SWAY + phiOffsetRef.current + dragOffset.current.phi,
          theta: baseTheta + thetaOffsetRef.current + dragOffset.current.theta,
        })
        animationId = requestAnimationFrame(animate)
      }
      animate()
      setTimeout(() => (canvas.style.opacity = "1"))
    }

    if (canvas.offsetWidth > 0) {
      init()
    } else {
      ro = new ResizeObserver((entries) => {
        if (entries[0]?.contentRect.width > 0) {
          ro?.disconnect()
          init()
        }
      })
      ro.observe(canvas)
    }

    return () => {
      ro?.disconnect()
      cancelAnimationFrame(animationId)
      globe?.destroy()
    }
  }, [markers, arcs, focusLat, focusLng])

  return (
    <div className={`relative aspect-square select-none ${className}`}>
      <canvas
        ref={canvasRef}
        onPointerDown={handlePointerDown}
        style={{
          width: "100%",
          height: "100%",
          cursor: "grab",
          opacity: 0,
          transition: "opacity 1.2s ease",
          borderRadius: "50%",
          touchAction: "none",
        }}
      />
      {/* Labels follow their marker via CSS Anchor Positioning (Chromium). Elsewhere they stay hidden. */}
      {markers
        .filter((m) => m.label)
        .map((m) => (
          <div
            key={m.id}
            className="glass pointer-events-none absolute whitespace-nowrap rounded-full px-3 py-1 text-[11px] font-semibold tracking-wide text-marron"
            style={{
              positionAnchor: `--cobe-${m.id}`,
              bottom: "anchor(top)",
              left: "anchor(center)",
              translate: "-50% 0",
              marginBottom: 10,
              opacity: `var(--cobe-visible-${m.id}, 0)`,
              filter: `blur(calc((1 - var(--cobe-visible-${m.id}, 0)) * 8px))`,
              transition: "opacity 0.8s, filter 0.8s",
            }}
          >
            {m.label}
          </div>
        ))}
    </div>
  )
}
