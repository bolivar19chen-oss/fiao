import { expect, test } from "@playwright/test"

// La eleccion explicita manda sobre prefers-color-scheme, sobrevive a recargar y ya esta
// aplicada cuando llega el HTML: si dependiera de React, la pagina pintaria primero en el
// modo del sistema y despues saltaria (el parpadeo).
test("an explicit theme wins over the system one and is applied before React loads", async ({ page }) => {
  await page.emulateMedia({ colorScheme: "dark" })
  await page.goto("/")
  // En el celular el aviso de cookies tapa el selector del pie.
  await page.getByRole("button", { name: "Got it" }).click()
  const background = () => page.evaluate(() => getComputedStyle(document.body).backgroundColor)
  expect(await background()).toBe("rgb(23, 17, 13)")

  await page.getByRole("button", { name: "Light theme" }).click()
  expect(await background()).toBe("rgb(255, 255, 255)")

  // Sin JavaScript de la aplicacion: solo el script inline del <head> puede aplicar el tema.
  await page.route(/\/_next\/static\/chunks\//, (route) => route.abort())
  await page.reload()
  await expect(page.locator("html")).toHaveClass(/\blight\b/)
  expect(await background()).toBe("rgb(255, 255, 255)")
  await page.unroute(/\/_next\/static\/chunks\//)

  // Volver a "sistema" borra la eleccion.
  await page.reload()
  await page.getByRole("button", { name: "Use system theme" }).click()
  expect(await background()).toBe("rgb(23, 17, 13)")
  await expect(page.getByRole("button", { name: "Use system theme" })).toHaveAttribute("aria-pressed", "true")
})
