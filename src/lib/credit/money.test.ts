import { describe, expect, it } from "vitest"
import { divideRoundHalfUp } from "./money"

describe("divideRoundHalfUp", () => {
  it("divides exactly when there is no remainder", () => {
    expect(divideRoundHalfUp(10, 2)).toBe(5)
    expect(divideRoundHalfUp(0, 7)).toBe(0)
  })

  it("rounds down below the half", () => {
    expect(divideRoundHalfUp(4, 3)).toBe(1)
    expect(divideRoundHalfUp(149, 100)).toBe(1)
  })

  it("rounds up at exactly the half", () => {
    expect(divideRoundHalfUp(5, 2)).toBe(3)
    expect(divideRoundHalfUp(150, 100)).toBe(2)
  })

  it("rounds up above the half", () => {
    expect(divideRoundHalfUp(151, 100)).toBe(2)
  })

  it("rounds negatives toward positive infinity, so -2.5 becomes -2", () => {
    expect(divideRoundHalfUp(-5, 2)).toBe(-2)
    expect(divideRoundHalfUp(-150, 100)).toBe(-1)
  })

  it("rounds negatives below the half away from zero", () => {
    expect(divideRoundHalfUp(-151, 100)).toBe(-2)
    expect(divideRoundHalfUp(-4, 3)).toBe(-1)
  })

  it("stays exact where floating point would not", () => {
    // 0.1 + 0.2 !== 0.3, pero aca no hay fracciones: todo es entero.
    expect(divideRoundHalfUp(1, 3)).toBe(0)
    expect(divideRoundHalfUp(2, 3)).toBe(1)
  })

  it("handles the magnitudes the engine actually reaches", () => {
    // Saldo de un millon de dolares durante 31 dias, al 5% mensual.
    const dailyBalanceSum = 100_000_000 * 31
    expect(divideRoundHalfUp(dailyBalanceSum * 500, 30 * 10_000)).toBe(5_166_667)
  })
})
