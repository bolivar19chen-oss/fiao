import { describe, expect, it } from "vitest"
import { settleInstallments, type PaymentEntry } from "./allocation"

const due = (dueDate: string, amountCents: number) => ({ dueDate, amountCents })
const pay = (date: string, cents: number): PaymentEntry => ({ date, cents })

describe("settleInstallments", () => {
  it("leaves everything unpaid when there are no payments", () => {
    const result = settleInstallments([due("2026-10-01", 5_000), due("2026-11-01", 5_000)], [])
    expect(result.map((i) => i.paidDate)).toEqual([null, null])
  })

  it("settles the first installment with an exact payment", () => {
    const result = settleInstallments([due("2026-10-01", 5_000), due("2026-11-01", 5_000)], [pay("2026-10-01", 5_000)])
    expect(result.map((i) => i.paidDate)).toEqual(["2026-10-01", null])
  })

  it("does not settle anything with a partial payment", () => {
    const result = settleInstallments([due("2026-10-01", 5_000)], [pay("2026-10-01", 4_999)])
    expect(result[0].paidDate).toBeNull()
  })

  it("settles on the day the accumulated payments finally cover it", () => {
    const result = settleInstallments([due("2026-10-01", 5_000)], [pay("2026-10-01", 2_000), pay("2026-10-20", 3_000)])
    // Pagada el 20, no el 1: ese dia completo el monto. Y queda 19 dias tarde.
    expect(result[0].paidDate).toBe("2026-10-20")
  })

  it("applies payments oldest first, across installments", () => {
    const result = settleInstallments(
      [due("2026-10-01", 5_000), due("2026-11-01", 5_000), due("2026-12-01", 5_000)],
      [pay("2026-10-05", 12_000)],
    )
    expect(result.map((i) => i.paidDate)).toEqual(["2026-10-05", "2026-10-05", null])
  })

  it("settles everything when payments cover the whole schedule", () => {
    const result = settleInstallments(
      [due("2026-10-01", 5_000), due("2026-11-01", 5_000)],
      [pay("2026-10-01", 5_000), pay("2026-10-28", 5_000)],
    )
    expect(result.map((i) => i.paidDate)).toEqual(["2026-10-01", "2026-10-28"])
  })

  it("ignores the excess when the customer overpays", () => {
    const result = settleInstallments([due("2026-10-01", 5_000)], [pay("2026-10-01", 99_000)])
    expect(result[0].paidDate).toBe("2026-10-01")
  })

  it("orders installments by due date, whatever order they arrive in", () => {
    const result = settleInstallments(
      [due("2026-12-01", 5_000), due("2026-10-01", 5_000), due("2026-11-01", 5_000)],
      [pay("2026-10-02", 5_000)],
    )
    expect(result.map((i) => i.dueDate)).toEqual(["2026-10-01", "2026-11-01", "2026-12-01"])
    expect(result.map((i) => i.paidDate)).toEqual(["2026-10-02", null, null])
  })

  it("orders payments by date, whatever order they arrive in", () => {
    const result = settleInstallments([due("2026-10-01", 10_000)], [pay("2026-10-20", 5_000), pay("2026-10-05", 5_000)])
    expect(result[0].paidDate).toBe("2026-10-20")
  })

  it("handles no installments at all", () => {
    expect(settleInstallments([], [pay("2026-10-01", 5_000)])).toEqual([])
  })
})
