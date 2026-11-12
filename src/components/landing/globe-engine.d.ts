export interface GlobePin {
  id: string
  name: string
  coordinates: [longitude: number, latitude: number]
  description?: string
  /** Diametro del punto en px. */
  size?: number
  /** Solo se muestra al acercarse mas alla del encuadre del pais. */
  detail?: boolean
}

interface GlobeState {
  mode: "journey" | "explore"
  selectedPin: GlobePin | null
}

export interface GlobeControls {
  focus: (coordinates: GlobePin["coordinates"], zoom?: number, pinId?: string) => void
  zoomBy: (factor: number) => void
  selectPin: (id: string) => void
  setExploring: (value: boolean) => void
  destroy: () => void
}

export function mountGlobe(
  container: HTMLElement,
  options: {
    world: unknown
    panama: unknown
    pins: GlobePin[]
    scrollTarget: HTMLElement
    onChange: (state: GlobeState) => void
  },
): GlobeControls
