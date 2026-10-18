import { render, screen } from "@testing-library/react"
import { describe, expect, it, vi } from "vitest"

// La accion vive del lado del servidor. Se simula: lo que se prueba es la pantalla.
vi.mock("./actions", () => ({ createInvite: vi.fn(async () => null) }))

const { InviteCard } = await import("./invite-card")

describe("InviteCard", () => {
  it("does not offer a code to someone already linked", () => {
    render(<InviteCard customerId="c1" linked />)
    expect(screen.getByText(/Linked\./)).toBeInTheDocument()
    expect(screen.queryByRole("button")).not.toBeInTheDocument()
  })

  it("offers a code to someone who is not linked yet", () => {
    render(<InviteCard customerId="c1" linked={false} />)
    expect(screen.getByRole("button", { name: /Create invite code/ })).toBeInTheDocument()
  })

  it("carries the customer it would invite", () => {
    const { container } = render(<InviteCard customerId="c1" linked={false} />)
    expect(container.querySelector<HTMLInputElement>('input[name="customer_id"]')?.value).toBe("c1")
  })
})
