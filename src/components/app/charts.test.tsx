import { render, screen } from "@testing-library/react"
import { describe, expect, it } from "vitest"
import { StatusBar, TopDebtors, WeekColumns } from "./charts"

// Se prueba lo que el usuario ve y lo que lee un lector de pantalla, nunca clases de CSS.
//
// Recharts no dibuja en jsdom: su contenedor mide 0 y no pinta nada. Por eso los dos
// graficos que lo usan se comprueban por su equivalente en texto, que es justamente la
// parte que tiene que funcionar para quien no puede leer la forma.

describe("StatusBar", () => {
  it("says so instead of drawing an empty bar when nothing is owed", () => {
    render(<StatusBar slices={[{ key: "on-time", cents: 0 }]} />)
    expect(screen.getByText("Nothing owed right now.")).toBeInTheDocument()
    expect(screen.queryByRole("img")).not.toBeInTheDocument()
  })

  it("names every amount in the label of the bar", () => {
    render(
      <StatusBar
        slices={[
          { key: "on-time", cents: 7500 },
          { key: "overdue", cents: 2500 },
        ]}
      />,
    )
    const bar = screen.getByRole("img")
    expect(bar).toHaveAccessibleName("Portfolio by status: On time $75.00, Overdue $25.00")
  })

  it("shows each share as a percentage of the total", () => {
    render(
      <StatusBar
        slices={[
          { key: "on-time", cents: 7500 },
          { key: "overdue", cents: 2500 },
        ]}
      />,
    )
    expect(screen.getByText("$75.00 - 75%")).toBeInTheDocument()
    expect(screen.getByText("$25.00 - 25%")).toBeInTheDocument()
  })

  it("keeps a zero slice in the legend, so the shop sees the state exists", () => {
    render(
      <StatusBar
        slices={[
          { key: "on-time", cents: 1000 },
          { key: "overdue", cents: 0 },
        ]}
      />,
    )
    expect(screen.getByText("Overdue")).toBeInTheDocument()
    expect(screen.getByText("$0.00 - 0%")).toBeInTheDocument()
  })
})

describe("WeekColumns", () => {
  it("reads out every day and its amount", () => {
    const days = [
      { label: "Mon", cents: 1000 },
      { label: "Tue", cents: 0 },
      { label: "Wed", cents: 2550 },
    ]
    render(<WeekColumns days={days} />)
    expect(screen.getByText("Mon: $10.00. Tue: $0.00. Wed: $25.50")).toBeInTheDocument()
  })
})

describe("TopDebtors", () => {
  it("reads out every debtor and what they owe", () => {
    render(
      <TopDebtors
        debtors={[
          { id: "a", name: "Maria Rodriguez", cents: 41275 },
          { id: "b", name: "Luis Chen", cents: 16890 },
        ]}
      />,
    )
    expect(screen.getByText("Maria Rodriguez: $412.75. Luis Chen: $168.90")).toBeInTheDocument()
  })
})
