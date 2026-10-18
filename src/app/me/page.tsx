import type { Metadata } from "next"
import { Plus } from "lucide-react"
import Link from "next/link"
import { redirect } from "next/navigation"
import { Logo } from "@/components/layout/logo"
import { Aurora } from "@/components/ui/aurora"
import { AvatarField } from "@/components/onboarding/avatar-field"
import { formatCents } from "@/lib/format"
import { getCurrentProfile } from "@/lib/profile"
import { createClient } from "@/lib/supabase/server"

export const metadata: Metadata = { title: "My accounts - FIA'O" }

export default async function MePage() {
  const profile = await getCurrentProfile()
  if (!profile) redirect("/onboarding")
  if (profile.role === "business") redirect("/app")

  // La RLS limita a las filas del propio cliente: no hace falta filtrar por user_id.
  const supabase = await createClient()
  const { data: accounts } = await supabase
    .from("customers")
    .select("id, business_id, businesses(name), sales(balance_cents)")

  const cards = (accounts ?? []).map((account) => ({
    id: account.id,
    name: account.businesses?.name ?? "Shop",
    balance: (account.sales ?? []).reduce((total, sale) => total + sale.balance_cents, 0),
  }))

  return (
    <main className="relative isolate min-h-[100dvh] overflow-hidden px-4 py-14">
      <Aurora />
      <div className="mx-auto w-full max-w-xl">
        <Logo />

        <div className="glass mt-8 rounded-[1.75rem] p-3">
          <AvatarField />
        </div>

        <p className="eyebrow mt-10">My accounts</p>
        <h1 className="mt-2 font-display text-3xl font-semibold tracking-tight text-marron">
          Hello, {profile.fullName.split(" ")[0]}
        </h1>

        {cards.length === 0 ? (
          <div className="glass mt-8 rounded-[2rem] p-8 text-center">
            <p className="text-[15px] leading-relaxed text-marron/70">
              You are not linked to any shop yet. Next time you buy on credit, ask for an invite code at the counter.
            </p>
          </div>
        ) : (
          <ul className="mt-8 space-y-4">
            {cards.map((card) => (
              <li key={card.id} className="glass rounded-[2rem] p-6">
                <p className="font-display text-lg font-semibold text-marron">{card.name}</p>
                <p className="mt-1 text-sm text-marron/60">You owe</p>
                <p className="mt-1 font-display text-3xl font-bold tracking-tight text-marron">
                  {formatCents(card.balance)}
                </p>
              </li>
            ))}
          </ul>
        )}

        {/* Siempre disponible, con cuentas o sin ellas: un cliente suma tiendas con el
            tiempo, y cada una trae su propio codigo. */}
        <Link
          href="/me/link"
          className="glass mt-4 flex items-center gap-4 rounded-[2rem] p-6 transition hover:-translate-y-px"
        >
          <span className="grid h-11 w-11 shrink-0 place-items-center rounded-2xl bg-crema text-marron">
            <Plus className="h-5 w-5" aria-hidden />
          </span>
          <span>
            <span className="block font-display text-base font-semibold text-marron">Link a shop</span>
            <span className="block text-sm text-marron/60">Enter the invite code they give you at the counter.</span>
          </span>
        </Link>
      </div>
    </main>
  )
}
