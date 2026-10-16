import { describe, expect, it } from "vitest"
import { formatCents, formatCount } from "./format"

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
