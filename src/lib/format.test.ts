import { describe, expect, it } from "vitest"

import { centsToInput, formatCents, formatCount, formatDate, parseCents } from "./format"

describe("formatCents", () => {
  it("formats whole dollars", () => {
    expect(formatCents(120000)).toBe("$1,200.00")
  })

  it("keeps the cents", () => {
    expect(formatCents(1750)).toBe("$17.50")
  })

  it("formats zero", () => {
    expect(formatCents(0)).toBe("$0.00")
  })

  it("formats a single cent", () => {
    expect(formatCents(1)).toBe("$0.01")
  })

  it("formats negative amounts, used by reversals", () => {
    expect(formatCents(-5000)).toBe("-$50.00")
  })
})

describe("formatCount", () => {
  it("groups thousands", () => {
    expect(formatCount(27000000)).toBe("27,000,000")
  })
})

describe("parseCents", () => {
  it("reads whole dollars", () => {
    expect(parseCents("12")).toBe(1200)
  })

  it("reads one decimal as tens of cents", () => {
    expect(parseCents("12.5")).toBe(1250)
  })

  it("reads two decimals exactly, without float drift", () => {
    expect(parseCents("0.29")).toBe(29)
    expect(parseCents("1.15")).toBe(115)
  })

  it("accepts a dollar sign, thousands separators and spaces", () => {
    expect(parseCents(" $1,200.50 ")).toBe(120050)
  })

  it("rejects negatives, letters, extra decimals and empty input", () => {
    expect(parseCents("-5")).toBeNull()
    expect(parseCents("abc")).toBeNull()
    expect(parseCents("1.234")).toBeNull()
    expect(parseCents("")).toBeNull()
  })
})

describe("formatDate", () => {
  it("uses the Panama date, not UTC", () => {
    // 02:00 UTC del 16 = 21:00 del 15 en Panama.
    expect(formatDate("2026-10-16T02:00:00Z")).toBe("Oct 15, 2026")
  })
})

describe("centsToInput", () => {
  it("writes cents as a plain decimal that parseCents reads back", () => {
    expect(centsToInput(150)).toBe("1.50")
    expect(centsToInput(5)).toBe("0.05")
    expect(centsToInput(120000)).toBe("1200.00")
    expect(parseCents(centsToInput(98765))).toBe(98765)
  })
})
