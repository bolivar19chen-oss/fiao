import { render, screen } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { describe, expect, it, vi } from "vitest"

// La accion vive del lado del servidor y arrastra next/headers y el cliente de Supabase,
// que no existen en jsdom. Se simula: lo que se prueba aca es la pantalla, no la accion.
vi.mock("./actions", () => ({
  recordPayment: vi.fn(async () => null),
  METHODS: ["cash", "yappy", "card", "paypal"],
}))

const { RecordPayment } = await import("./record-payment")

describe("RecordPayment", () => {
  it("does not offer a form on a sale that is already paid", () => {
    render(<RecordPayment saleId="s1" balanceCents={0} />)
    expect(screen.getByText("This sale is fully paid.")).toBeInTheDocument()
    expect(screen.queryByRole("button", { name: "Record payment" })).not.toBeInTheDocument()
  })

  it("offers the four ways a customer can pay", () => {
    render(<RecordPayment saleId="s1" balanceCents={5000} />)
    for (const name of ["Cash", "Yappy", "Card", "PayPal"]) {
      expect(screen.getByRole("tab", { name })).toBeInTheDocument()
    }
  })

  it("starts on cash and asks for no reference", () => {
    render(<RecordPayment saleId="s1" balanceCents={5000} />)
    expect(screen.getByRole("tab", { name: "Cash" })).toHaveAttribute("aria-selected", "true")
    expect(screen.queryByLabelText("Reference")).not.toBeInTheDocument()
  })

  it("asks for the reference once the money came in from somewhere else", async () => {
    const user = userEvent.setup()
    render(<RecordPayment saleId="s1" balanceCents={5000} />)

    await user.click(screen.getByRole("tab", { name: "Yappy" }))

    expect(screen.getByRole("tab", { name: "Yappy" })).toHaveAttribute("aria-selected", "true")
    expect(screen.getByLabelText("Reference")).toBeRequired()
    expect(screen.getByText("Reference from your Yappy app.")).toBeInTheDocument()
  })

  it("tells the shop what is still owed on this sale", () => {
    render(<RecordPayment saleId="s1" balanceCents={41275} />)
    expect(screen.getByText("Balance on this sale: 412.75")).toBeInTheDocument()
  })

  it("carries a fresh idempotency token, so a double click cannot charge twice", () => {
    const { container } = render(<RecordPayment saleId="s1" balanceCents={5000} />)
    const token = container.querySelector<HTMLInputElement>('input[name="client_token"]')
    expect(token?.value).toMatch(/^[0-9a-f-]{36}$/)
  })
})
