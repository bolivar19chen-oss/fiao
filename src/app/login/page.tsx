import type { Metadata } from "next"
import { AuthSwitch } from "@/components/auth/auth-switch"
import { Aurora } from "@/components/ui/aurora"

export const metadata: Metadata = {
  title: "Log in - FIA'O",
}

export default function LoginPage() {
  return (
    <main className="relative isolate flex min-h-screen items-center overflow-hidden pb-20 pt-28">
      <Aurora />
      <div className="container-x">
        <h1 className="sr-only">Log in or create your FIA&apos;O account</h1>
        <AuthSwitch />
      </div>
    </main>
  )
}
