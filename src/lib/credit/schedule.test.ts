import { describe, expect, it } from "vitest"

import { buildSchedule } from "./schedule"

const sum = (cents: number[]) => cents.reduce((total, c) => total + c, 0)

describe("buildSchedule", () => {
  it("reparte en partes iguales cuando el total divide exacto", () => {
    const schedule = buildSchedule({ totalCents: 3000, count: 3, everyDays: 15, soldOn: "2026-10-01" })
    expect(schedule.map((i) => i.amountCents)).toEqual([1000, 1000, 1000])
  })

  it("deja el resto en la ultima cuota, nunca lo pierde", () => {
    // 1000 entre 3 no existe en centavos enteros. Tres de 333 perderian un centavo.
    const schedule = buildSchedule({ totalCents: 1000, count: 3, everyDays: 15, soldOn: "2026-10-01" })
    expect(schedule.map((i) => i.amountCents)).toEqual([333, 333, 334])
  })

  it("las cuotas suman el total, con cualquier reparto", () => {
    for (let total = 1; total <= 400; total++) {
      for (const count of [1, 2, 3, 4, 7, 12]) {
        const schedule = buildSchedule({ totalCents: total, count, everyDays: 15, soldOn: "2026-10-01" })
        expect(sum(schedule.map((i) => i.amountCents))).toBe(total)
      }
    }
  })

  it("la primera cuota vence despues de la venta, no el mismo dia", () => {
    const schedule = buildSchedule({ totalCents: 3000, count: 3, everyDays: 15, soldOn: "2026-10-01" })
    expect(schedule.map((i) => i.dueDate)).toEqual(["2026-10-16", "2026-10-31", "2026-11-15"])
  })

  it("numera las cuotas desde uno y en orden", () => {
    const schedule = buildSchedule({ totalCents: 500, count: 4, everyDays: 7, soldOn: "2026-10-01" })
    expect(schedule.map((i) => i.number)).toEqual([1, 2, 3, 4])
  })

  it("una sola cuota es el total entero", () => {
    const schedule = buildSchedule({ totalCents: 1234, count: 1, everyDays: 30, soldOn: "2026-10-01" })
    expect(schedule).toEqual([{ number: 1, dueDate: "2026-10-31", amountCents: 1234 }])
  })

  it("ninguna cuota sale en cero ni negativa", () => {
    // El caso que lo provocaria: muchas cuotas para un total chico.
    const schedule = buildSchedule({ totalCents: 5, count: 4, everyDays: 15, soldOn: "2026-10-01" })
    expect(sum(schedule.map((i) => i.amountCents))).toBe(5)
    // Con 5 entre 4 el reparto da 1,1,1,2: el `check (amount_cents > 0)` de la base
    // aguanta. Si alguna vez diera cero, la insercion reventaria, asi que se vigila.
    expect(schedule.every((i) => i.amountCents > 0)).toBe(true)
  })

  it("rechaza entradas que no son centavos enteros positivos", () => {
    expect(() => buildSchedule({ totalCents: 0, count: 2, everyDays: 15, soldOn: "2026-10-01" })).toThrow()
    expect(() => buildSchedule({ totalCents: 10.5, count: 2, everyDays: 15, soldOn: "2026-10-01" })).toThrow()
    expect(() => buildSchedule({ totalCents: 100, count: 0, everyDays: 15, soldOn: "2026-10-01" })).toThrow()
    expect(() => buildSchedule({ totalCents: 100, count: 2, everyDays: 0, soldOn: "2026-10-01" })).toThrow()
  })
})
