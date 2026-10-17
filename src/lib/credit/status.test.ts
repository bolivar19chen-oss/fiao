import { describe, expect, it } from "vitest"
import { accountStatus } from "./status"
import type { Installment } from "./types"

const unpaid = (dueDate: string): Installment => ({ dueDate, amountCents: 10_000, paidDate: null })
const paid = (dueDate: string, paidDate: string): Installment => ({ dueDate, amountCents: 10_000, paidDate })

describe("accountStatus", () => {
  it("is NO_DEBT at a zero balance", () => {
    expect(accountStatus({ balanceCents: 0, installments: [], graceDays: 0, asOf: "2026-10-16" })).toBe("NO_DEBT")
  })

  it("is NO_DEBT when the customer overpaid", () => {
    expect(
      accountStatus({ balanceCents: -500, installments: [unpaid("2026-01-01")], graceDays: 0, asOf: "2026-10-16" }),
    ).toBe("NO_DEBT")
  })

  it("is CURRENT with debt and nothing overdue", () => {
    expect(
      accountStatus({ balanceCents: 10_000, installments: [unpaid("2026-11-01")], graceDays: 0, asOf: "2026-10-16" }),
    ).toBe("CURRENT")
  })

  it("is CURRENT on the due day itself with no grace", () => {
    expect(
      accountStatus({ balanceCents: 10_000, installments: [unpaid("2026-10-16")], graceDays: 0, asOf: "2026-10-16" }),
    ).toBe("CURRENT")
  })

  it("is OVERDUE the day after the due date with no grace", () => {
    expect(
      accountStatus({ balanceCents: 10_000, installments: [unpaid("2026-10-15")], graceDays: 0, asOf: "2026-10-16" }),
    ).toBe("OVERDUE")
  })

  it("is CURRENT on the last day of grace", () => {
    expect(
      accountStatus({ balanceCents: 10_000, installments: [unpaid("2026-10-13")], graceDays: 3, asOf: "2026-10-16" }),
    ).toBe("CURRENT")
  })

  it("is OVERDUE the day after grace runs out", () => {
    expect(
      accountStatus({ balanceCents: 10_000, installments: [unpaid("2026-10-12")], graceDays: 3, asOf: "2026-10-16" }),
    ).toBe("OVERDUE")
  })

  it("ignores installments that were already paid, however late", () => {
    expect(
      accountStatus({
        balanceCents: 10_000,
        installments: [paid("2026-01-01", "2026-09-30"), unpaid("2026-11-01")],
        graceDays: 0,
        asOf: "2026-10-16",
      }),
    ).toBe("CURRENT")
  })

  it("is OVERDUE when any one installment is late", () => {
    expect(
      accountStatus({
        balanceCents: 10_000,
        installments: [unpaid("2026-11-01"), unpaid("2026-09-01"), unpaid("2026-12-01")],
        graceDays: 0,
        asOf: "2026-10-16",
      }),
    ).toBe("OVERDUE")
  })
})
