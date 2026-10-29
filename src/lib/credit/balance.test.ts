import { describe, expect, it } from "vitest"

import { balanceFrom, dailyBalances, verifyBalance } from "./balance"
import type { Movement } from "./types"

const sale = (date: string, cents: number): Movement => ({ date, cents })
const payment = (date: string, cents: number): Movement => ({ date, cents: -cents })

describe("balanceFrom", () => {
  it("is zero with no movements", () => {
    expect(balanceFrom([])).toBe(0)
  })

  it("adds sales and subtracts payments", () => {
    expect(balanceFrom([sale("2026-10-01", 12000), payment("2026-10-05", 5000)])).toBe(7000)
  })

  it("leaves the balance untouched after a payment and its reversal", () => {
    const before = balanceFrom([sale("2026-10-01", 12000)])
    const after = balanceFrom([
      sale("2026-10-01", 12000),
      payment("2026-10-05", 5000),
      sale("2026-10-06", 5000), // la reversion entra con el signo contrario
    ])
    expect(after).toBe(before)
  })

  it("can go negative when the customer overpays", () => {
    expect(balanceFrom([sale("2026-10-01", 1000), payment("2026-10-02", 1500)])).toBe(-500)
  })
})

describe("dailyBalances", () => {
  it("returns one balance per day, both ends included", () => {
    expect(dailyBalances([sale("2026-10-01", 1000)], "2026-10-01", "2026-10-03")).toEqual([1000, 1000, 1000])
  })

  it("applies each movement on its own day", () => {
    const movements = [sale("2026-10-01", 1000), payment("2026-10-02", 400)]
    expect(dailyBalances(movements, "2026-10-01", "2026-10-03")).toEqual([1000, 600, 600])
  })

  it("carries the balance from before the period", () => {
    const movements = [sale("2026-09-15", 5000), payment("2026-10-02", 2000)]
    expect(dailyBalances(movements, "2026-10-01", "2026-10-03")).toEqual([5000, 3000, 3000])
  })

  it("adds several movements landing on the same day", () => {
    const movements = [sale("2026-10-01", 1000), sale("2026-10-01", 500), payment("2026-10-01", 200)]
    expect(dailyBalances(movements, "2026-10-01", "2026-10-01")).toEqual([1300])
  })

  it("ignores movements after the period", () => {
    const movements = [sale("2026-10-01", 1000), sale("2026-11-05", 9999)]
    expect(dailyBalances(movements, "2026-10-01", "2026-10-02")).toEqual([1000, 1000])
  })

  it("returns nothing for an inverted period", () => {
    expect(dailyBalances([sale("2026-10-01", 1000)], "2026-10-03", "2026-10-01")).toEqual([])
  })
})

describe("verifyBalance", () => {
  it("matches when the cache agrees with the ledger", () => {
    const movements = [sale("2026-10-01", 12000), payment("2026-10-05", 5000)]
    expect(verifyBalance(movements, 7000)).toEqual({ expectedCents: 7000, cachedCents: 7000, matches: true })
  })

  it("reports the difference when the cache drifted", () => {
    const movements = [sale("2026-10-01", 12000), payment("2026-10-05", 5000)]
    expect(verifyBalance(movements, 7001)).toEqual({ expectedCents: 7000, cachedCents: 7001, matches: false })
  })

  it("catches a drift of a single cent", () => {
    expect(verifyBalance([sale("2026-10-01", 1)], 0).matches).toBe(false)
  })
})
