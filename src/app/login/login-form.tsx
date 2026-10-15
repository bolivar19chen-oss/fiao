"use client"

import { useState } from "react"
import { LogIn } from "lucide-react"

const inputClass =
  "mt-2 block h-12 w-full rounded-2xl border border-marron/15 bg-white/70 px-4 text-marron outline-none transition placeholder:text-marron/35 focus:border-rojo/40 focus:ring-4 focus:ring-rojo/10"

// UI only. Supabase Auth is wired in Phase 2.
export function LoginForm() {
  const [notice, setNotice] = useState(false)

  return (
    <form
      className="mt-8 space-y-5"
      onSubmit={(e) => {
        e.preventDefault()
        setNotice(true)
      }}
    >
      <label className="block text-sm font-medium">
        Email
        <input type="email" name="email" required autoComplete="email" placeholder="you@store.com" className={inputClass} />
      </label>
      <label className="block text-sm font-medium">
        Password
        <input type="password" name="password" required autoComplete="current-password" className={inputClass} />
      </label>
      <button type="submit" className="btn btn-glass-red h-12 w-full text-[15px]">
        <LogIn className="h-4 w-4" aria-hidden />
        Log in
      </button>
      {notice && (
        <p role="status" className="rounded-2xl bg-amarillo/15 px-4 py-3 text-sm text-marron/80">
          Sign-in opens with the beta. Thanks for your interest.
        </p>
      )}
    </form>
  )
}
