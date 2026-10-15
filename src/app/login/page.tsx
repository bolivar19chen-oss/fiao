import type { Metadata } from "next"
import { Aurora } from "@/components/ui/aurora"
import { LoginForm } from "./login-form"

export const metadata: Metadata = {
  title: "Log in - FIA'O",
}

export default function LoginPage() {
  return (
    <main className="relative isolate flex min-h-screen items-center overflow-hidden pb-20 pt-32">
      <Aurora />
      <div className="container-x">
        <div className="glass mx-auto w-full max-w-md rounded-[2rem] p-8 sm:p-10">
          <h1 className="font-display text-3xl font-semibold tracking-tight">Welcome back</h1>
          <p className="mt-2 text-marron/60">Log in to manage your store.</p>
          <LoginForm />
        </div>
      </div>
    </main>
  )
}
