import type { Metadata } from "next"
import { redirect } from "next/navigation"

import { getCurrentBusiness } from "@/lib/business"
import { getCurrentProfile } from "@/lib/profile"
import { createClient } from "@/lib/supabase/server"
import { Logo } from "@/components/layout/logo"
import { Aurora } from "@/components/ui/aurora"

import { OnboardingFlow } from "./onboarding-flow"

export const metadata: Metadata = { title: "Welcome - FIA'O" }

export default async function OnboardingPage() {
  // Quien ya eligio rol no vuelve a ver la tarjeta.
  // Perfil y negocio a la vez: en serie eran dos viajes a Supabase en la pantalla por la
  // que pasa todo inicio de sesion.
  const [profile, business] = await Promise.all([getCurrentProfile(), getCurrentBusiness()])
  if (profile?.role === "customer") redirect("/me")

  // El perfil de negocio solo sale de aca si ademas TIENE negocio. Sin esta condicion
  // hay un bucle sin salida: (app) manda aca por no tener negocio y aca se devolvia a
  // /app por tener perfil. El perfil huerfano es alcanzable (ver la migracion
  // 20261016231500), y en ese caso lo que corresponde es volver a mostrar el formulario:
  // complete_business_onboarding es reentrante y lo completa sin duplicar nada.
  if (profile?.role === "business" && business) redirect("/app")

  const supabase = await createClient()
  const { data } = await supabase.auth.getClaims()
  const email = (data?.claims.email as string | undefined) ?? ""

  return (
    <main className="relative isolate flex min-h-[100dvh] flex-col items-center overflow-hidden px-4 py-14">
      <Aurora />
      <Logo className="mb-10" />
      <OnboardingFlow email={email} />
      <p className="mt-8 text-xs text-marron/70">
        Photos:{" "}
        <a
          href="https://commons.wikimedia.org/wiki/File:Abarroter%C3%ADa_de_la_comunidad_de_San_Juan_De_Dios.jpg"
          className="underline underline-offset-2"
        >
          Lolitas
        </a>{" "}
        and{" "}
        <a
          href="https://commons.wikimedia.org/wiki/File:Abarroter%C3%ADa_de_la_comunidad_de_Alto_De_La_Estancia.jpg"
          className="underline underline-offset-2"
        >
          La Confianza
        </a>{" "}
        by Mitzi Valdés, CC BY-SA 4.0. Cropped.
      </p>
    </main>
  )
}
