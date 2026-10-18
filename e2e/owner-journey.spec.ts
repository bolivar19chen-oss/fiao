import { expect, test } from "@playwright/test"

// El recorrido completo de un dueno de tienda, de punta a punta y contra la base real:
// registro, alta del negocio, primer cliente y codigo de invitacion. Lo que ninguna
// prueba de componente cubre: que las pantallas, las server actions, RLS y las funciones
// de la base funcionen juntas.
test("a shop owner signs up, sets up the shop, adds a customer and creates an invite code", async ({ page }) => {
  const stamp = Date.now()

  await test.step("sign up", async () => {
    await page.goto("/login")
    await page.getByRole("button", { name: "Got it" }).click()
    // Hay dos "Sign up": el del panel que cambia de modo y el envio del formulario. El
    // formulario oculto lleva `inert`, pero Playwright no lo saca de la busqueda por rol.
    await page
      .locator("div")
      .filter({ has: page.getByRole("heading", { name: "New to FIA'O?" }) })
      .last()
      .getByRole("button", { name: "Sign up" })
      .click()

    const form = page.locator("form").filter({ has: page.getByRole("heading", { name: "Create account" }) })
    await form.getByLabel("Your name").fill("E2E Owner")
    await form.getByLabel("Email").fill(`e2e+${stamp}@example.com`)
    await form.getByLabel("Password").fill("e2e-password-1234")
    await form.getByRole("button", { name: "Sign up" }).click()

    await expect(page).toHaveURL(/\/onboarding$/)
  })

  await test.step("set up the shop", async () => {
    await page.getByRole("button", { name: "Set up my shop" }).click()

    await page.getByLabel("Full name").fill("E2E Owner")
    await page.getByLabel("National ID").fill("8-123-4567")
    await page.getByLabel("Phone").fill("6555-0134")
    await page.getByLabel("Date of birth").fill("1990-05-01")
    await page.getByRole("button", { name: "Continue" }).click()

    // El RUC llega prellenado desde la cedula en persona natural.
    await expect(page.getByLabel("RUC")).toHaveValue("8-123-4567")
    await page.getByLabel("Trade name").fill(`E2E Shop ${stamp}`)
    await page.getByLabel("DV").fill("12")
    await page.getByLabel("Operating notice no.").fill("2026-000123")
    await page.getByLabel("Province").fill("8")
    await page.getByLabel("District").fill("8-1")
    await page.getByLabel("Corregimiento").fill("8-1-1")
    await page.getByLabel("Address").fill("Calle 50, local 3")
    await page.getByRole("button", { name: "Create my shop" }).click()

    await expect(page).toHaveURL(/\/app$/)
  })

  await test.step("add a customer", async () => {
    await page.getByRole("navigation", { name: "App" }).getByRole("link", { name: "Customers" }).click()
    await page.getByRole("link", { name: "Add your first customer" }).click()

    await page.getByLabel("Name").fill("Rosa Martinez")
    await page.getByLabel("Phone").fill("6555-0199")
    await page.getByRole("button", { name: "Save customer" }).click()

    await expect(page).toHaveURL(/\/app\/customers\/[0-9a-f-]{36}$/)
    await expect(page.getByRole("heading", { level: 1, name: "Rosa Martinez" })).toBeVisible()
  })

  await test.step("create an invite code", async () => {
    await page.getByRole("button", { name: "Create invite code" }).click()

    const code = page.getByLabel("Invite code")
    await expect(code).not.toHaveValue("")
    // Se muestra una sola vez y se puede generar otro sin recargar.
    await expect(page.getByText("It is not shown again.")).toBeVisible()
    await expect(page.getByRole("button", { name: "Create another code" })).toBeVisible()
  })
})
