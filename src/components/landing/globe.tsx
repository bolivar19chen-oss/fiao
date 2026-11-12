"use client"

import dynamic from "next/dynamic"

import type { GlobePin } from "./globe-engine"

import "./globe-engine.css"
import "./coverage-map.css"

export type { GlobePin }

const Canvas = dynamic(() => import("./globe-canvas").then((module) => module.GlobeCanvas), {
  ssr: false,
  loading: () => <div className="coverage-map-journey" aria-hidden />,
})

export function Globe({ pins }: { pins: GlobePin[] }) {
  return <Canvas pins={pins} />
}
