import { describe, expect, it } from "vitest"

import { accrueInterest, accrueLateFee } from "./accrual"
import type { Installment, Movement } from "./types"

const sale = (date: string, cents: number): Movement => ({ date, cents })
const payment = (date: string, cents: number): Movement => ({ date, cents: -cents })

describe("accrueInterest", () => {
  it("charges nothing at a zero rate, whatever the balance", () => {
    const movements = [sale("2026-09-01", 500_000)]
    expect(accrueInterest({ movements, periodStart: "2026-10-01", periodEnd: "2026-10-30", monthlyRateBp: 0 })).toBe(0)
  })

  it("charges nothing on a zero balance, whatever the rate", () => {
    expect(
      accrueInterest({ movements: [], periodStart: "2026-10-01", periodEnd: "2026-10-30", monthlyRateBp: 900 }),
    ).toBe(0)
  })

  it("charges the monthly rate on a balance held for 30 days", () => {
    // 100.00 al 5% mensual durante 30 dias: 10000 * 30 * 500 / (30 * 10000) = 500.
    const movements = [sale("2026-09-01", 10_000)]
    expect(accrueInterest({ movements, periodStart: "2026-10-01", periodEnd: "2026-10-30", monthlyRateBp: 500 })).toBe(
      500,
    )
  })

  it("charges less when the balance drops mid-period", () => {
    const movements = [sale("2026-09-01", 10_000), payment("2026-10-16", 5_000)]
    const full = accrueInterest({
      movements: [sale("2026-09-01", 10_000)],
      periodStart: "2026-10-01",
      periodEnd: "2026-10-30",
      monthlyRateBp: 500,
    })
    const partial = accrueInterest({
      movements,
      periodStart: "2026-10-01",
      periodEnd: "2026-10-30",
      monthlyRateBp: 500,
    })
    expect(partial).toBeLessThan(full)
  })

  it("treats a negative day as zero, never as interest in the customer's favour", () => {
    // Pago de mas: el saldo queda negativo todo el periodo.
    const movements = [sale("2026-09-01", 1_000), payment("2026-09-02", 5_000)]
    expect(accrueInterest({ movements, periodStart: "2026-10-01", periodEnd: "2026-10-30", monthlyRateBp: 500 })).toBe(
      0,
    )
  })

  it("splits a period into halves within one cent of the whole", () => {
    const movements = [sale("2026-09-01", 73_333), payment("2026-10-11", 20_000)]
    const whole = accrueInterest({ movements, periodStart: "2026-10-01", periodEnd: "2026-10-30", monthlyRateBp: 437 })
    const first = accrueInterest({ movements, periodStart: "2026-10-01", periodEnd: "2026-10-15", monthlyRateBp: 437 })
    const second = accrueInterest({ movements, periodStart: "2026-10-16", periodEnd: "2026-10-30", monthlyRateBp: 437 })

    // Politica elegida: partir el periodo puede diferir en a lo sumo un centavo, porque
    // cada mitad redondea una vez.
    expect(Math.abs(first + second - whole)).toBeLessThanOrEqual(1)
  })

  it("never returns a negative charge", () => {
    const movements = [sale("2026-09-01", 100), payment("2026-09-02", 100)]
    expect(
      accrueInterest({ movements, periodStart: "2026-10-01", periodEnd: "2026-10-30", monthlyRateBp: 500 }),
    ).toBeGreaterThanOrEqual(0)
  })
})

const unpaid = (dueDate: string, amountCents: number): Installment => ({ dueDate, amountCents, paidDate: null })

describe("accrueLateFee", () => {
  it("charges nothing at a zero rate", () => {
    const installments = [unpaid("2026-09-01", 10_000)]
    expect(
      accrueLateFee({ installments, periodStart: "2026-10-01", periodEnd: "2026-10-30", lateRateBp: 0, graceDays: 0 }),
    ).toBe(0)
  })

  it("charges nothing on an installment that is not due yet", () => {
    const installments = [unpaid("2026-11-15", 10_000)]
    expect(
      accrueLateFee({
        installments,
        periodStart: "2026-10-01",
        periodEnd: "2026-10-30",
        lateRateBp: 500,
        graceDays: 0,
      }),
    ).toBe(0)
  })

  it("charges nothing on a paid installment", () => {
    const installments: Installment[] = [{ dueDate: "2026-09-01", amountCents: 10_000, paidDate: "2026-09-20" }]
    expect(
      accrueLateFee({
        installments,
        periodStart: "2026-10-01",
        periodEnd: "2026-10-30",
        lateRateBp: 500,
        graceDays: 0,
      }),
    ).toBe(0)
  })

  it("respects the grace days", () => {
    const installments = [unpaid("2026-10-10", 10_000)]
    const noGrace = accrueLateFee({
      installments,
      periodStart: "2026-10-01",
      periodEnd: "2026-10-30",
      lateRateBp: 500,
      graceDays: 0,
    })
    const withGrace = accrueLateFee({
      installments,
      periodStart: "2026-10-01",
      periodEnd: "2026-10-30",
      lateRateBp: 500,
      graceDays: 5,
    })
    expect(withGrace).toBeLessThan(noGrace)
  })

  it("does not charge on the due day itself with zero grace", () => {
    const installments = [unpaid("2026-10-30", 10_000)]
    expect(
      accrueLateFee({
        installments,
        periodStart: "2026-10-01",
        periodEnd: "2026-10-30",
        lateRateBp: 500,
        graceDays: 0,
      }),
    ).toBe(0)
  })

  it("charges one day when the period ends one day after the due date", () => {
    // 100.00 un dia al 5% mensual: 10000 * 1 * 500 / 300000 = 16,67 -> 17.
    const installments = [unpaid("2026-10-29", 10_000)]
    expect(
      accrueLateFee({
        installments,
        periodStart: "2026-10-01",
        periodEnd: "2026-10-30",
        lateRateBp: 500,
        graceDays: 0,
      }),
    ).toBe(17)
  })

  it("adds up several overdue installments", () => {
    const installments = [unpaid("2026-10-29", 10_000), unpaid("2026-10-29", 10_000)]
    expect(
      accrueLateFee({
        installments,
        periodStart: "2026-10-01",
        periodEnd: "2026-10-30",
        lateRateBp: 500,
        graceDays: 0,
      }),
    ).toBe(33)
  })
})
