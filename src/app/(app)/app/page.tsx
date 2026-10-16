import type { Metadata } from "next"

export const metadata: Metadata = { title: "Dashboard - FIA'O" }

// Contenedor. Las tarjetas con datos reales llegan en el punto 6 del brief de Fase 2.
export default function DashboardPage() {
  return (
    <main className="container-x py-10">
      <h1 className="section-title">Dashboard</h1>
    </main>
  )
}
