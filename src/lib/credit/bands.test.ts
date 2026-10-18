import { describe, expect, it } from "vitest"
import { scoreBand } from "./bands"

describe("scoreBand", () => {
  it("has no band for a customer without history", () => {
    expect(scoreBand(null)).toBe("new")
  })

  it("splits on the documented cuts", () => {
    expect(scoreBand(100)).toBe("good")
    expect(scoreBand(70)).toBe("good")
    expect(scoreBand(69)).toBe("fair")
    expect(scoreBand(40)).toBe("fair")
    expect(scoreBand(39)).toBe("watch")
    expect(scoreBand(0)).toBe("watch")
  })
})
