import { describe, expect, it } from "vitest"
import { creditScore, type ScoreInput } from "./scoring"
import type { Installment } from "./types"

const paid = (dueDate: string, paidDate: string): Installment => ({ dueDate, amountCents: 10_000, paidDate })
const unpaid = (dueDate: string): Installment => ({ dueDate, amountCents: 10_000, paidDate: null })

const base: ScoreInput = {
  installments: [],
  currentBalanceCents: 0,
  creditLimitCents: 100_000,
  firstSaleDate: "2025-10-16",
  salesLast12Months: 6,
  asOf: "2026-10-16",
}

const sum = (b: { punctuality: number; debtRatio: number; tenure: number; frequency: number }) =>
  b.punctuality + b.debtRatio + b.tenure + b.frequency

describe("creditScore", () => {
  it("gives a perfect score to a punctual customer with no debt and long history", () => {
    const { score } = creditScore({
      ...base,
      installments: [paid("2026-01-01", "2026-01-01"), paid("2026-02-01", "2026-01-28")],
      currentBalanceCents: 0,
      firstSaleDate: "2024-01-01",
      salesLast12Months: 12,
    })
    expect(score).toBe(100)
  })

  it("treats an early payment as on time", () => {
    const early = creditScore({ ...base, installments: [paid("2026-02-01", "2026-01-20")] })
    const exact = creditScore({ ...base, installments: [paid("2026-02-01", "2026-02-01")] })
    expect(early.breakdown.punctuality).toBe(exact.breakdown.punctuality)
  })

  it("drops with 1, 7 and 30 days late, in that order", () => {
    const at = (paidDate: string) =>
      creditScore({ ...base, installments: [paid("2026-02-01", paidDate)] }).breakdown.punctuality

    const onTime = at("2026-02-01")
    const oneDay = at("2026-02-02")
    const sevenDays = at("2026-02-08")
    const thirtyDays = at("2026-03-03")

    expect(oneDay).toBeLessThan(onTime)
    expect(sevenDays).toBe(oneDay) // misma franja: 1 a 7 dias
    expect(thirtyDays).toBeLessThan(sevenDays)
  })

  it("scores an unpaid installment by how late it is right now", () => {
    const fresh = creditScore({ ...base, installments: [unpaid("2026-10-15")] })
    const old = creditScore({ ...base, installments: [unpaid("2026-01-01")] })
    expect(old.breakdown.punctuality).toBeLessThan(fresh.breakdown.punctuality)
  })

  it("lowers the debt ratio factor as the balance approaches the limit", () => {
    const light = creditScore({ ...base, currentBalanceCents: 10_000 }).breakdown.debtRatio
    const heavy = creditScore({ ...base, currentBalanceCents: 90_000 }).breakdown.debtRatio
    expect(heavy).toBeLessThan(light)
  })

  it("floors the debt ratio at zero when the balance passes the limit", () => {
    expect(creditScore({ ...base, currentBalanceCents: 200_000 }).breakdown.debtRatio).toBe(0)
  })

  it("caps the debt ratio when the customer overpaid, instead of going past its weight", () => {
    // limite - saldo con saldo negativo da mas que el limite. Sin tope, el factor se
    // lleva mas puntos de los que vale y el total se pasa de 100.
    const owing = creditScore({ ...base, currentBalanceCents: 0 })
    const overpaid = creditScore({ ...base, currentBalanceCents: -500_000 })
    expect(overpaid.breakdown.debtRatio).toBe(owing.breakdown.debtRatio)
    expect(overpaid.score).toBe(owing.score)
  })

  it("caps tenure at two years", () => {
    const twoYears = creditScore({ ...base, firstSaleDate: "2024-10-16" }).breakdown.tenure
    const tenYears = creditScore({ ...base, firstSaleDate: "2016-10-16" }).breakdown.tenure
    expect(tenYears).toBe(twoYears)
  })

  it("caps frequency at twelve sales", () => {
    const twelve = creditScore({ ...base, salesLast12Months: 12 }).breakdown.frequency
    const fifty = creditScore({ ...base, salesLast12Months: 50 }).breakdown.frequency
    expect(fifty).toBe(twelve)
  })

  it("returns null, not zero, for a customer with nothing to measure", () => {
    const { score, breakdown } = creditScore({
      ...base,
      installments: [],
      creditLimitCents: null,
      firstSaleDate: null,
      salesLast12Months: 0,
    })
    // Cero se lee como "paga pesimo". Lo que pasa es que no hay informacion.
    expect(score).toBeNull()
    expect(breakdown).toEqual({ punctuality: 0, debtRatio: 0, tenure: 0, frequency: 0 })
  })

  it("does not punish a customer for a limit the shop never set", () => {
    const withLimit = creditScore({
      ...base,
      installments: [paid("2026-01-01", "2026-01-01")],
      currentBalanceCents: 0,
      firstSaleDate: "2024-01-01",
      salesLast12Months: 12,
    })
    const withoutLimit = creditScore({
      ...base,
      installments: [paid("2026-01-01", "2026-01-01")],
      currentBalanceCents: 0,
      creditLimitCents: null,
      firstSaleDate: "2024-01-01",
      salesLast12Months: 12,
    })
    // El peso de los 30 puntos se reparte, no se pierde.
    expect(withoutLimit.score).toBe(withLimit.score)
    expect(withoutLimit.breakdown.debtRatio).toBe(0)
  })

  it("keeps the breakdown adding up to the score, in every case", () => {
    const cases: ScoreInput[] = [
      base,
      { ...base, installments: [paid("2026-02-01", "2026-02-09")] },
      { ...base, installments: [unpaid("2026-01-01"), paid("2026-02-01", "2026-02-02")] },
      { ...base, creditLimitCents: null },
      { ...base, firstSaleDate: null, salesLast12Months: 0 },
      { ...base, currentBalanceCents: 33_333, creditLimitCents: 99_999 },
      { ...base, installments: [paid("2026-01-01", "2026-01-03"), unpaid("2026-09-09")], salesLast12Months: 7 },
    ]

    for (const input of cases) {
      const { score, breakdown } = creditScore(input)
      if (score === null) expect(sum(breakdown)).toBe(0)
      else expect(sum(breakdown)).toBe(score)
    }
  })

  it("never leaves the 0 to 100 range", () => {
    const cases: ScoreInput[] = [
      { ...base, currentBalanceCents: 999_999_999, installments: [unpaid("2020-01-01")] },
      { ...base, salesLast12Months: 9999, firstSaleDate: "2000-01-01" },
      { ...base, currentBalanceCents: -50_000 },
    ]

    for (const input of cases) {
      const { score } = creditScore(input)
      if (score === null) continue
      expect(score).toBeGreaterThanOrEqual(0)
      expect(score).toBeLessThanOrEqual(100)
    }
  })
})
