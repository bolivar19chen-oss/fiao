import { defineConfig, devices } from "@playwright/test"

// End-to-end contra el proyecto de Supabase de .env.local. No hay base local (sin Docker)
// ni base en CI, asi que se corren a mano con `pnpm e2e`. Cada corrida crea un usuario y
// un negocio nuevos en ese proyecto.
//
// Un solo proyecto, en celular: el publico usa celulares de gama baja (PLAN.md).
export default defineConfig({
  testDir: "e2e",
  timeout: 240_000,
  // En desarrollo la primera visita a cada ruta la compila: puede pasar de 30 segundos.
  expect: { timeout: 60_000 },
  use: { baseURL: "http://localhost:3000", trace: "retain-on-failure" },
  projects: [{ name: "mobile", use: { ...devices["Pixel 7"] } }],
  // Si ya hay un servidor de desarrollo arriba se usa ese: dos a la vez se pisan .next.
  webServer: { command: "pnpm dev", url: "http://localhost:3000", reuseExistingServer: true, timeout: 180_000 },
})
