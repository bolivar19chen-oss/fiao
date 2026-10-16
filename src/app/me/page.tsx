import type { Metadata } from "next"
import Link from "next/link"
import { redirect } from "next/navigation"
import { Logo } from "@/components/layout/logo"
import { Aurora } from "@/components/ui/aurora"
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

        <p className="eyebrow mt-10">My accounts</p>
        <h1 className="mt-2 font-display text-3xl font-semibold tracking-tight text-marron">
          Hello, {profile.fullName.split(" ")[0]}
        </h1>

        {cards.length === 0 ? (
          <div className="glass mt-8 rounded-[2rem] p-8 text-center">
            <p className="text-[15px] leading-relaxed text-marron/70">
              You are not linked to any shop yet. Ask the shop that gives you credit for an invite code.
            </p>
            <Link href="/onboarding/invite" className="btn btn-glass-red mt-6 inline-flex">
              Enter an invite code
            </Link>
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
      </div>
    </main>
  )
}
