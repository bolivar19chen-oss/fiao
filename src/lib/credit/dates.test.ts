import { describe, expect, it } from "vitest"

import { addDays, daysBetween, eachDay, monthsBetween } from "./dates"

describe("daysBetween", () => {
  it("counts a single day", () => {
    expect(daysBetween("2026-10-01", "2026-10-02")).toBe(1)
  })

  it("is zero for the same day", () => {
    expect(daysBetween("2026-10-01", "2026-10-01")).toBe(0)
  })

  it("is negative going backwards", () => {
    expect(daysBetween("2026-10-02", "2026-10-01")).toBe(-1)
  })

  it("crosses months and years", () => {
    expect(daysBetween("2026-01-31", "2026-02-01")).toBe(1)
    expect(daysBetween("2026-12-31", "2027-01-01")).toBe(1)
  })

  it("counts a leap day", () => {
    expect(daysBetween("2028-02-28", "2028-03-01")).toBe(2)
    expect(daysBetween("2026-02-28", "2026-03-01")).toBe(1)
  })

  it("does not shift the date in a negative timezone", () => {
    // Parsear con `new Date("2026-10-16")` y leerlo en Panama (UTC-5) daria el 15.
    expect(daysBetween("2026-10-16", "2026-10-16")).toBe(0)
    expect(addDays("2026-10-16", 0)).toBe("2026-10-16")
  })
})

describe("addDays", () => {
  it("moves forward and backward", () => {
    expect(addDays("2026-10-01", 1)).toBe("2026-10-02")
    expect(addDays("2026-10-01", -1)).toBe("2026-09-30")
  })

  it("crosses month and year boundaries", () => {
    expect(addDays("2026-01-31", 1)).toBe("2026-02-01")
    expect(addDays("2026-12-31", 1)).toBe("2027-01-01")
  })
})

describe("eachDay", () => {
  it("includes both ends", () => {
    expect(eachDay("2026-10-01", "2026-10-03")).toEqual(["2026-10-01", "2026-10-02", "2026-10-03"])
  })

  it("returns one day when both ends are the same", () => {
    expect(eachDay("2026-10-01", "2026-10-01")).toEqual(["2026-10-01"])
  })

  it("returns nothing when the period is inverted", () => {
    expect(eachDay("2026-10-03", "2026-10-01")).toEqual([])
  })

  it("covers a full 31-day month", () => {
    expect(eachDay("2026-10-01", "2026-10-31")).toHaveLength(31)
  })
})

describe("monthsBetween", () => {
  it("counts only complete months", () => {
    expect(monthsBetween("2026-01-15", "2026-02-14")).toBe(0)
    expect(monthsBetween("2026-01-15", "2026-02-15")).toBe(1)
  })

  it("counts across a year", () => {
    expect(monthsBetween("2026-01-15", "2027-01-15")).toBe(12)
  })

  it("is zero for the same day", () => {
    expect(monthsBetween("2026-10-16", "2026-10-16")).toBe(0)
  })
})
