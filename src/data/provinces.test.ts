import { describe, expect, it } from "vitest"

import { provinceLabel, PROVINCES } from "./provinces"
import { stores } from "./stores"

// PROVINCES esta escrito a mano para que el desplegable del alta no arrastre las 82
// tiendas al navegador. Esta prueba es lo que impide que se separe del directorio: si
// entra una tienda de una provincia nueva, falla aca y no en produccion.
describe("PROVINCES", () => {
  it("coincide con las provincias del directorio del MINSA", () => {
    const fromStores = [...new Set(stores.map((store) => store.province))].sort((a, b) => a.localeCompare(b, "es"))
    expect(PROVINCES).toEqual(fromStores)
  })
})

describe("provinceLabel", () => {
  it("pasa de mayusculas del PDF a caja de frase", () => {
    expect(provinceLabel("PANAMÁ OESTE")).toBe("Panamá Oeste")
    expect(provinceLabel("CHIRIQUÍ")).toBe("Chiriquí")
    expect(provinceLabel("BOCAS DEL TORO")).toBe("Bocas Del Toro")
  })
})
