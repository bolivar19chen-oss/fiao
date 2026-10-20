import { render, screen } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { describe, expect, it } from "vitest"

import { CustomerFolder } from "./customer-folder"

const CUSTOMERS = [
  { id: "a", name: "Maria Rodriguez", balanceCents: 41275 },
  { id: "b", name: "Luis Chen", balanceCents: 16890 },
]

describe("CustomerFolder", () => {
  it("announces what it holds and whether it opens or closes", () => {
    render(<CustomerFolder label="Overdue" tone="alert" customers={CUSTOMERS} />)
    expect(screen.getByRole("button", { name: "Open Overdue, 2 customers" })).toBeInTheDocument()
  })

  it("says one customer, not one customers", () => {
    render(<CustomerFolder label="Watch" tone="warn" customers={[CUSTOMERS[0]]} />)
    expect(screen.getByRole("button", { name: "Open Watch, 1 customer" })).toBeInTheDocument()
  })

  it("adds up what the group owes", () => {
    render(<CustomerFolder label="Overdue" tone="alert" customers={CUSTOMERS} />)
    expect(screen.getByText("2 customers - $581.65")).toBeInTheDocument()
  })

  it("keeps the customers out of reach while it is closed", () => {
    const { container } = render(<CustomerFolder label="Overdue" tone="alert" customers={CUSTOMERS} />)
    // inert saca todo el contenido del foco y del lector de pantalla: cerrada, las
    // fichas no se ven, asi que tampoco se puede tabular hasta ellas.
    expect(container.querySelector(".cf-files")).toHaveAttribute("inert")
  })

  it("opens on click and lets the customers be reached", async () => {
    const user = userEvent.setup()
    const { container } = render(<CustomerFolder label="Overdue" tone="alert" customers={CUSTOMERS} />)

    await user.click(screen.getByRole("button", { name: /^Open Overdue/ }))

    expect(screen.getByRole("button", { name: /^Close Overdue/ })).toBeInTheDocument()
    expect(container.querySelector(".cf-files")).not.toHaveAttribute("inert")
  })

  it("links each customer to their own page", () => {
    render(<CustomerFolder label="Overdue" tone="alert" customers={CUSTOMERS} />)
    expect(screen.getByRole("link", { name: /Maria Rodriguez/ })).toHaveAttribute("href", "/app/customers/a")
  })

  it("shows at most four, so the pocket never overflows", () => {
    const many = Array.from({ length: 7 }, (_, i) => ({ id: String(i), name: `Customer ${i}`, balanceCents: 100 }))
    render(<CustomerFolder label="Overdue" tone="alert" customers={many} />)
    expect(screen.getAllByRole("link")).toHaveLength(4)
    // El recuento sigue diciendo la verdad aunque se dibujen menos.
    expect(screen.getByRole("button", { name: "Open Overdue, 7 customers" })).toBeInTheDocument()
  })
})
