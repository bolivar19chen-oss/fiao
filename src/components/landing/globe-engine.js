const radians = Math.PI / 180
const circle = Math.PI * 2
const startView = [-27, 22]
const defaultDestination = [-80.3, 8.55]
const minZoom = 0.78
const maxZoom = 70

const clamp = (number, min, max) => Math.max(min, Math.min(max, number))
const longitude = (number) => ((((number + 180) % 360) + 360) % 360) - 180
const smooth = (number) => {
  const value = clamp(number, 0, 1)
  return value * value * (3 - 2 * value)
}
const interpolate = (start, end, progress) => start + (end - start) * progress

function unitVector(coordinates) {
  const lng = coordinates[0] * radians
  const lat = coordinates[1] * radians
  const radius = Math.cos(lat)
  return [radius * Math.cos(lng), radius * Math.sin(lng), Math.sin(lat)]
}

function preparePath(coordinates) {
  const points = new Float32Array(coordinates.length * 3)
  const center = [0, 0, 0]
  for (let index = 0; index < coordinates.length; index += 1) {
    const point = unitVector(coordinates[index])
    points.set(point, index * 3)
    center[0] += point[0]
    center[1] += point[1]
    center[2] += point[2]
  }
  const length = Math.hypot(...center) || 1
  for (let axis = 0; axis < center.length; axis += 1) center[axis] /= length
  let limit = 1
  for (let index = 0; index < points.length; index += 3) {
    const distance = center[0] * points[index] + center[1] * points[index + 1] + center[2] * points[index + 2]
    limit = Math.min(limit, distance)
  }
  return { points, center, reach: Math.sqrt(2 - 2 * limit) + 0.001 }
}

function prepareGeoJSON(source) {
  if (!source) return []
  const features = source.type === "FeatureCollection" ? source.features : [source]
  return features.map((feature) => {
    const polygons = []
    const lines = []
    const properties = feature.properties ?? {}
    const areaName = String(properties.name ?? properties.NAME ?? "").toLowerCase()
    const countryCode = String(properties.iso_a3 ?? properties.ISO_A3 ?? feature.id ?? "")
    const layer = String(properties.layer ?? "land").toLowerCase()
    const isPanama = areaName === "panama" || areaName === "panamá" || countryCode === "PAN" || countryCode === "591"

    function addGeometry(geometry) {
      if (!geometry) return
      const { coordinates } = geometry
      switch (geometry.type) {
        case "Polygon":
          polygons.push(coordinates.map(preparePath))
          break
        case "MultiPolygon":
          for (const polygon of coordinates) polygons.push(polygon.map(preparePath))
          break
        case "LineString":
          lines.push(preparePath(coordinates))
          break
        case "MultiLineString":
          for (const line of coordinates) lines.push(preparePath(line))
          break
        case "GeometryCollection":
          for (const child of geometry.geometries) addGeometry(child)
          break
      }
    }

    addGeometry(feature.type === "Feature" ? feature.geometry : feature)
    return { polygons, lines, isPanama, layer }
  })
}

function prepareGraticule() {
  const lines = []
  for (let lng = -180; lng < 180; lng += 20) {
    lines.push(preparePath(Array.from({ length: 61 }, (_, index) => [lng, index * 3 - 90])))
  }
  for (let lat = -60; lat <= 60; lat += 20) {
    lines.push(preparePath(Array.from({ length: 121 }, (_, index) => [index * 3 - 180, lat])))
  }
  return lines
}

function projection(view, width, height, centerX, centerY, radiusFactor) {
  const lng = view.lng * radians
  const lat = view.lat * radians
  const east = [-Math.sin(lng), Math.cos(lng), 0]
  const down = [Math.sin(lat) * Math.cos(lng), Math.sin(lat) * Math.sin(lng), -Math.cos(lat)]
  const forward = unitVector([view.lng, view.lat])
  return {
    east,
    down,
    forward,
    width,
    height,
    cx: width * centerX,
    cy: height * centerY,
    radius: Math.min(width, height) * radiusFactor * view.zoom,
  }
}

function multiply(point, axis) {
  return point[0] * axis[0] + point[1] * axis[1] + point[2] * axis[2]
}

function pointOnScreen(point, camera) {
  return {
    x: camera.cx + multiply(point, camera.east) * camera.radius,
    y: camera.cy + multiply(point, camera.down) * camera.radius,
    front: multiply(point, camera.forward) >= 0,
  }
}

function visible(path, camera) {
  if (multiply(path.center, camera.forward) + path.reach < 0) return false
  const { x, y } = pointOnScreen(path.center, camera)
  const margin = path.reach * camera.radius + 3
  return x + margin >= 0 && x - margin <= camera.width && y + margin >= 0 && y - margin <= camera.height
}

function projectPath(path, camera, buffer) {
  const { points } = path
  const { east, down, forward } = camera
  const output = buffer.length >= points.length ? buffer : new Float32Array(points.length)
  for (let index = 0; index < points.length; index += 3) {
    const x = points[index]
    const y = points[index + 1]
    const z = points[index + 2]
    output[index] = x * east[0] + y * east[1]
    output[index + 1] = x * down[0] + y * down[1] + z * down[2]
    output[index + 2] = x * forward[0] + y * forward[1] + z * forward[2]
  }
  return output
}

function horizonAngle(points, previous, current) {
  const fraction = points[previous + 2] / (points[previous + 2] - points[current + 2])
  const x = interpolate(points[previous], points[current], fraction)
  const y = interpolate(points[previous + 1], points[current + 1], fraction)
  return Math.atan2(y, x)
}

function drawVertex(path, camera, x, y, move = false) {
  const screenX = camera.cx + x * camera.radius
  const screenY = camera.cy + y * camera.radius
  if (move) path.moveTo(screenX, screenY)
  else path.lineTo(screenX, screenY)
}

function appendRing(path, ring, camera, buffer) {
  if (!visible(ring, camera) || ring.points.length < 9) return buffer
  const points = projectPath(ring, camera, buffer)
  const length = ring.points.length
  let first = 0
  while (first < length && points[first + 2] < 0) first += 3
  if (first === length) return points

  let previous = first
  let exit = 0
  drawVertex(path, camera, points[first], points[first + 1], true)
  for (let step = 3; step <= length; step += 3) {
    const current = (first + step) % length
    const wasVisible = points[previous + 2] >= 0
    const isVisible = points[current + 2] >= 0
    if (wasVisible && !isVisible) {
      exit = horizonAngle(points, previous, current)
      drawVertex(path, camera, Math.cos(exit), Math.sin(exit))
    }
    if (!wasVisible && isVisible) {
      const entry = horizonAngle(points, previous, current)
      const turn = ((entry - exit + 3 * Math.PI) % circle) - Math.PI
      path.arc(camera.cx, camera.cy, camera.radius, exit, exit + turn, turn < 0)
    }
    if (isVisible) drawVertex(path, camera, points[current], points[current + 1])
    previous = current
  }
  path.closePath()
  return points
}

function appendLine(path, line, camera, buffer) {
  if (!visible(line, camera) || line.points.length < 6) return buffer
  const points = projectPath(line, camera, buffer)
  if (points[2] >= 0) drawVertex(path, camera, points[0], points[1], true)
  for (let current = 3; current < line.points.length; current += 3) {
    const previous = current - 3
    const wasVisible = points[previous + 2] >= 0
    const isVisible = points[current + 2] >= 0
    if (wasVisible !== isVisible) {
      const angle = horizonAngle(points, previous, current)
      drawVertex(path, camera, Math.cos(angle), Math.sin(angle), isVisible)
    }
    if (isVisible) drawVertex(path, camera, points[current], points[current + 1])
  }
  return points
}

function styleFrom(element) {
  const computed = getComputedStyle(element)
  const read = (name, fallback) => computed.getPropertyValue(`--fiao-${name}`).trim() || fallback
  return {
    ocean: read("ocean", "#fff"),
    rim: read("ocean-light", "#e5eee9"),
    land: read("land", "#26614e"),
    border: read("border", "rgba(34,91,70,0.18)"),
    grid: read("grid", "rgba(39,102,78,0.09)"),
    highlight: read("highlight", "#108257"),
    panama: read("panama", "#17754e"),
    detailLine: read("detail-line", "rgba(27,100,70,0.6)"),
  }
}

function dots(context, color, size, radius) {
  const tile = document.createElement("canvas")
  const scale = 2
  tile.width = size * scale
  tile.height = size * scale
  const pixel = tile.getContext("2d")
  pixel.scale(scale, scale)
  pixel.fillStyle = color
  pixel.beginPath()
  pixel.arc(size / 2, size / 2, radius, 0, circle)
  pixel.fill()
  const pattern = context.createPattern(tile, "repeat")
  pattern.setTransform(new DOMMatrix().scale(1 / scale))
  return pattern
}

function eventDistance(pointers) {
  const [first, second] = pointers.values()
  return first && second ? Math.hypot(first.x - second.x, first.y - second.y) : 0
}

export function mountGlobe(
  container,
  {
    world,
    panama,
    pins = [],
    scrollTarget,
    onChange,
    centerX = 0.5,
    centerY = 0.5,
    radiusFactor = 0.41,
    destination = defaultDestination,
    destinationZoom,
    fitWidth = 0.72,
    labels = {},
  } = {},
) {
  const worldFeatures = prepareGeoJSON(world)
  const panamaFeatures = prepareGeoJSON(panama)
  const waterFeatures = panamaFeatures.filter(({ layer }) => layer === "water")
  const provinceFeatures = panamaFeatures.filter(({ layer }) =>
    ["province", "provinces", "boundary", "boundaries"].includes(layer),
  )
  const landFeatures = panamaFeatures.filter(
    (feature) => !waterFeatures.includes(feature) && !provinceFeatures.includes(feature),
  )
  const graticule = prepareGraticule()
  const destinationPoint = unitVector(destination)
  const media = matchMedia("(prefers-reduced-motion: reduce)")
  const canvas = document.createElement("canvas")
  const instructions = document.createElement("span")
  const markerLayer = document.createElement("div")
  const context = canvas.getContext("2d")
  const listeners = new AbortController()
  let width = 0
  let height = 0
  let pixelRatio = 1
  let palette
  let landDots
  let panamaDots
  let progress = 0
  let exploring = false
  let selectedPin = null
  let fitOnResize = false
  let frame = 0
  let lastFrame = 0
  let buffer = new Float32Array()
  let target = { lng: startView[0], lat: startView[1], zoom: 1 }
  let current = { ...target }
  const activePointers = new Map()
  let moved = false

  if (!context) throw new Error("Canvas 2D is unavailable")
  container.classList.add("fiao-globe-stage")
  canvas.className = "fiao-globe-canvas"
  canvas.tabIndex = 0
  canvas.setAttribute("role", "region")
  canvas.setAttribute("aria-label", labels.globe ?? "Interactive globe")
  instructions.id = `fiao-globe-instructions-${Math.random().toString(36).slice(2)}`
  instructions.className = "fiao-globe-instructions"
  instructions.textContent =
    labels.instructions ??
    "Use the arrow keys to move the globe, plus and minus to zoom, and Home or Escape to return to the tour."
  canvas.setAttribute("aria-describedby", instructions.id)
  markerLayer.className = "fiao-globe-markers"
  container.append(canvas, markerLayer, instructions)

  const markers = pins
    .filter((pin) => pin && Array.isArray(pin.coordinates))
    .map((pin, index) => {
      const button = document.createElement("button")
      const label = document.createElement("span")
      const identifiedPin = { ...pin, id: pin.id ?? String(index) }
      button.className = "fiao-globe-pin"
      button.type = "button"
      button.hidden = true
      if (pin.size) button.style.setProperty("--pin-size", `${pin.size}px`)
      button.setAttribute("aria-label", identifiedPin.name)
      button.setAttribute("aria-pressed", "false")
      label.className = "fiao-globe-pin-label"
      label.textContent = identifiedPin.name
      label.setAttribute("aria-hidden", "true")
      button.append(label)
      button.addEventListener("click", () => selectPin(identifiedPin.id), { signal: listeners.signal })
      markerLayer.append(button)
      return { pin: identifiedPin, button, point: unitVector(identifiedPin.coordinates) }
    })

  function measure() {
    const bounds = container.getBoundingClientRect()
    const nextRatio = Math.min(window.devicePixelRatio || 1, 2)
    if (palette && width === bounds.width && height === bounds.height && pixelRatio === nextRatio) return
    width = bounds.width
    height = bounds.height
    pixelRatio = nextRatio
    canvas.width = Math.round(width * pixelRatio)
    canvas.height = Math.round(height * pixelRatio)
    palette = styleFrom(container)
    landDots = dots(context, palette.land, 5, 0.93)
    panamaDots = dots(context, palette.panama, 5, 1.12)
    if (!exploring) applyJourney()
    else if (fitOnResize) target.zoom = zoomForDestination()
    schedule()
  }

  function zoomForDestination() {
    if (destinationZoom !== undefined) return destinationZoom
    const baseRadius = Math.min(width, height) * radiusFactor
    if (!baseRadius) return 16.5
    const countryWidth = Math.sin(5.9 * radians) * Math.cos(destination[1] * radians)
    const countryHeight = Math.sin(3.1 * radians)
    const fitRadius = Math.min((width * fitWidth) / countryWidth, (height * 0.81) / countryHeight)
    return clamp(fitRadius / baseRadius, 8, 52)
  }

  function getState() {
    return {
      coordinates: [longitude(current.lng), current.lat],
      zoom: current.zoom,
      progress,
      mode: exploring ? "explore" : "journey",
      selectedPin,
    }
  }

  function drawLand(features, camera, pattern, border, lineWidth, alpha, panamaOnly = null) {
    const fill = new Path2D()
    const lines = new Path2D()
    for (const feature of features) {
      if (panamaOnly !== null && feature.isPanama !== panamaOnly) continue
      for (const polygon of feature.polygons) {
        if (!visible(polygon[0], camera)) continue
        for (const ring of polygon) buffer = appendRing(fill, ring, camera, buffer)
      }
      for (const line of feature.lines) buffer = appendLine(lines, line, camera, buffer)
    }
    context.globalAlpha = alpha
    context.fillStyle = pattern
    context.strokeStyle = border
    context.lineWidth = lineWidth
    context.fill(fill, "evenodd")
    if (lineWidth > 0) {
      context.stroke(fill)
      context.stroke(lines)
    }
    context.globalAlpha = 1
  }

  function placeMarkers(camera) {
    const shown = []
    const activeMarker = markers.find(({ pin }) => pin.id === selectedPin?.id)
    const ordered = activeMarker ? [activeMarker, ...markers.filter((marker) => marker !== activeMarker)] : markers
    for (const marker of ordered) {
      const { button, point, pin } = marker
      const { x, y, front } = pointOnScreen(point, camera)
      const active = marker === activeMarker
      // Un pin de detalle solo aparece al acercarse mas alla del encuadre del pais, o si es el
      // elegido: con todo el pais en pantalla solo se ven los principales.
      const floor = pin.detail && !active ? zoomForDestination() * 1.3 : (pin.minZoom ?? 7.5)
      const allowed = current.zoom >= floor && front && x >= 16 && x <= width - 16 && y >= 16 && y <= height - 16
      const separated = shown.every(([left, top]) => (x - left) ** 2 + (y - top) ** 2 > 22 ** 2)
      button.hidden = !(allowed && separated)
      if (!button.hidden) {
        shown.push([x, y])
        button.style.transform = `translate3d(${x}px, ${y}px, 0) translate(-50%, -50%)`
        button.classList.toggle("is-near-right", x > width - 160)
        button.setAttribute("aria-pressed", String(active))
      }
    }
  }

  function draw() {
    if (!width || !height) return
    const camera = projection(current, width, height, centerX, centerY, radiusFactor)
    const { cx, cy, radius } = camera
    context.setTransform(pixelRatio, 0, 0, pixelRatio, 0, 0)
    context.clearRect(0, 0, width, height)
    context.save()
    context.beginPath()
    context.arc(cx, cy, radius, 0, circle)
    context.fillStyle = palette.ocean
    context.fill()
    context.clip()

    if (current.zoom < 3.5) {
      const grid = new Path2D()
      for (const line of graticule) buffer = appendLine(grid, line, camera, buffer)
      context.strokeStyle = palette.grid
      context.lineWidth = 0.65
      context.globalAlpha = 1 - smooth((current.zoom - 1.2) / 2.3)
      context.stroke(grid)
      context.globalAlpha = 1
    }

    const detail = panamaFeatures.length ? smooth((current.zoom - 3) / 4) : 0
    drawLand(worldFeatures, camera, landDots, palette.border, 0.65, 1, false)
    if (detail < 1) drawLand(worldFeatures, camera, landDots, palette.border, 0.65, 1 - detail, true)
    if (detail > 0) {
      drawLand(landFeatures, camera, panamaDots, palette.detailLine, 0.8, detail)
      drawLand(waterFeatures, camera, palette.ocean, palette.border, 0.6, detail)
      drawLand(provinceFeatures, camera, "transparent", palette.detailLine, 0.75, detail * 0.55)
    }
    context.restore()

    if (current.zoom < 2.4) {
      context.strokeStyle = palette.rim
      context.lineWidth = 1
      context.beginPath()
      context.arc(cx, cy, radius, 0, circle)
      context.stroke()
    }

    const beacon = pointOnScreen(destinationPoint, camera)
    if (current.zoom < 7 && beacon.front) {
      context.strokeStyle = palette.highlight
      context.fillStyle = palette.highlight
      context.globalAlpha = 0.85 * (1 - smooth((current.zoom - 5) / 2))
      context.beginPath()
      context.arc(beacon.x, beacon.y, 8.5, 0, circle)
      context.stroke()
      context.beginPath()
      context.arc(beacon.x, beacon.y, 3.2, 0, circle)
      context.fill()
      context.globalAlpha = 1
    }
    placeMarkers(camera)
  }

  function schedule() {
    if (!frame) frame = requestAnimationFrame(render)
  }

  function render(time) {
    frame = 0
    const elapsed = lastFrame ? Math.min(time - lastFrame, 50) : 16
    lastFrame = time
    const remaining =
      Math.abs(target.lng - current.lng) +
      Math.abs(target.lat - current.lat) +
      Math.abs(Math.log(target.zoom / current.zoom))
    if (remaining > 0.015 && !media.matches) {
      const mix = 1 - Math.exp(-elapsed / (activePointers.size ? 35 : 70))
      current.lng = interpolate(current.lng, target.lng, mix)
      current.lat = interpolate(current.lat, target.lat, mix)
      current.zoom *= (target.zoom / current.zoom) ** mix
      schedule()
    } else {
      current = { ...target }
      lastFrame = 0
    }
    draw()
    onChange?.(getState())
  }

  function readScroll() {
    if (!scrollTarget) return 0
    const bounds = scrollTarget.getBoundingClientRect()
    const available = Math.max(1, bounds.height - window.innerHeight)
    return clamp(-bounds.top / available, 0, 1)
  }

  function applyJourney() {
    const orbit = smooth(progress / 0.66)
    const approach = smooth((progress - 0.22) / 0.72)
    const desiredLng = interpolate(startView[0], destination[0], orbit)
    target = {
      lng: current.lng + longitude(desiredLng - current.lng),
      lat: interpolate(startView[1], destination[1], orbit),
      zoom: zoomForDestination() ** approach,
    }
  }

  function updateScroll() {
    const next = readScroll()
    if (next === progress) return
    progress = next
    if (!exploring) {
      if (progress < 0.55) selectedPin = null
      applyJourney()
    }
    schedule()
  }

  function setExploring(value) {
    const mode = Boolean(value)
    if (mode === exploring) return
    exploring = mode
    fitOnResize = false
    container.classList.toggle("is-exploring", exploring)
    if (exploring) target = { ...current }
    else {
      selectedPin = null
      applyJourney()
    }
    schedule()
  }

  function reset() {
    if (exploring) setExploring(false)
    else {
      selectedPin = null
      applyJourney()
      schedule()
    }
  }

  function rotateBy(lngDelta, latDelta) {
    setExploring(true)
    target.lng += lngDelta
    target.lat = clamp(target.lat + latDelta, -86, 86)
    schedule()
  }

  function zoomBy(factor) {
    if (!Number.isFinite(factor) || factor <= 0) return
    setExploring(true)
    fitOnResize = false
    target.zoom = clamp(target.zoom * factor, minZoom, maxZoom)
    schedule()
  }

  function focus(coordinates, zoom, pinId) {
    setExploring(true)
    fitOnResize = zoom === undefined
    target.lng += longitude(coordinates[0] - target.lng)
    target.lat = clamp(coordinates[1], -86, 86)
    target.zoom = clamp(zoom ?? zoomForDestination(), minZoom, maxZoom)
    if (pinId !== undefined) selectPin(pinId)
    schedule()
  }

  function selectPin(id) {
    selectedPin = markers.find(({ pin }) => pin.id === id)?.pin ?? null
    schedule()
  }

  function startDrag(event) {
    if (event.pointerType === "mouse" && event.button !== 0) return
    if (!activePointers.size) moved = false
    activePointers.set(event.pointerId, { x: event.clientX, y: event.clientY })
    canvas.setPointerCapture(event.pointerId)
  }

  function drag(event) {
    const previous = activePointers.get(event.pointerId)
    if (!previous) return
    const oldDistance = eventDistance(activePointers)
    const dx = event.clientX - previous.x
    const dy = event.clientY - previous.y
    if (!moved && Math.hypot(dx, dy) < 3 && !oldDistance) return
    activePointers.set(event.pointerId, { x: event.clientX, y: event.clientY })
    const newDistance = eventDistance(activePointers)
    if (oldDistance && newDistance) {
      zoomBy(newDistance / oldDistance)
    } else {
      if (event.pointerType === "touch" && !exploring && Math.abs(dx) < Math.abs(dy)) return
      const scale = 1 / (Math.min(width, height) * radiusFactor * current.zoom * radians)
      const latitudeScale = Math.max(0.25, Math.cos(current.lat * radians))
      rotateBy((-dx * scale) / latitudeScale, dy * scale)
    }
    moved = true
    container.classList.add("is-dragging")
  }

  function endDrag(event) {
    activePointers.delete(event.pointerId)
    if (!activePointers.size) container.classList.remove("is-dragging")
  }

  function wheel(event) {
    if (!exploring && !event.ctrlKey && !event.metaKey) return
    event.preventDefault()
    const unit = event.deltaMode === 1 ? 16 : event.deltaMode === 2 ? height : 1
    zoomBy(Math.exp(clamp(-event.deltaY * unit * 0.0018, -0.35, 0.35)))
  }

  function keyboard(event) {
    const degrees = 12 / Math.max(1, target.zoom)
    switch (event.key) {
      case "ArrowLeft":
        rotateBy(-degrees, 0)
        break
      case "ArrowRight":
        rotateBy(degrees, 0)
        break
      case "ArrowUp":
        rotateBy(0, degrees)
        break
      case "ArrowDown":
        rotateBy(0, -degrees)
        break
      case "+":
      case "=":
        zoomBy(1.28)
        break
      case "-":
      case "_":
        zoomBy(1 / 1.28)
        break
      case "Home":
      case "Escape":
        reset()
        break
      default:
        return
    }
    event.preventDefault()
  }

  const { signal } = listeners
  const observer = new ResizeObserver(() => {
    measure()
    updateScroll()
  })
  observer.observe(container)
  if (scrollTarget && scrollTarget !== container) observer.observe(scrollTarget)
  window.addEventListener("scroll", updateScroll, { passive: true, signal })
  canvas.addEventListener("pointerdown", startDrag, { signal })
  canvas.addEventListener("pointermove", drag, { signal })
  canvas.addEventListener("pointerup", endDrag, { signal })
  canvas.addEventListener("pointercancel", endDrag, { signal })
  canvas.addEventListener("lostpointercapture", endDrag, { signal })
  canvas.addEventListener("wheel", wheel, { passive: false, signal })
  canvas.addEventListener("keydown", keyboard, { signal })
  progress = readScroll()
  measure()
  current = { ...target }

  return {
    destroy() {
      listeners.abort()
      observer.disconnect()
      cancelAnimationFrame(frame)
      canvas.remove()
      markerLayer.remove()
      instructions.remove()
      container.classList.remove("fiao-globe-stage", "is-exploring", "is-dragging")
    },
    reset,
    focus,
    getState,
    setExploring,
    selectPin,
    rotateBy,
    zoomBy,
  }
}
