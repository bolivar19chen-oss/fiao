"use client"

import Link from "next/link"
import { useState, type FormEvent } from "react"
import { Lock, Mail, UserRound, type LucideIcon } from "lucide-react"
import s from "./auth-switch.module.css"

// UI solamente. Supabase Auth se conecta en la Fase 2.
export function AuthSwitch() {
  const [isSignUp, setIsSignUp] = useState(false)
  const [notice, setNotice] = useState(false)

  const onSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setNotice(true)
  }

  const switchMode = (signUp: boolean) => {
    setIsSignUp(signUp)
    setNotice(false)
  }

  return (
    <div className={isSignUp ? `${s.container} ${s.signUpMode}` : s.container}>
      <div className={s.formsContainer}>
        <div className={s.signinSignup}>
          {/* inert: el formulario oculto no recibe foco ni clics */}
          <form className={`${s.form} ${s.signInForm}`} onSubmit={onSubmit} inert={isSignUp}>
            <h2 className={s.title}>Log in</h2>
            <Field icon={Mail} label="Email" type="email" name="email" autoComplete="email" />
            <Field icon={Lock} label="Password" type="password" name="password" autoComplete="current-password" />
            <button type="submit" className={s.submit}>
              Log in
            </button>
            {notice && !isSignUp && <Notice />}
          </form>

          <form className={`${s.form} ${s.signUpForm}`} onSubmit={onSubmit} inert={!isSignUp}>
            <h2 className={s.title}>Create account</h2>
            <Field icon={UserRound} label="Your name" type="text" name="name" autoComplete="name" />
            <Field icon={Mail} label="Email" type="email" name="email" autoComplete="email" />
            <Field icon={Lock} label="Password (8+ characters)" type="password" name="password" autoComplete="new-password" minLength={8} />
            <button type="submit" className={s.submit}>
              Sign up
            </button>
            <p className={s.hint}>
              By signing up you agree to our <Link href="/privacy">Privacy Policy</Link>.
            </p>
            {notice && isSignUp && <Notice />}
          </form>
        </div>
      </div>

      <div className={s.panelsContainer}>
        <div className={`${s.panel} ${s.leftPanel}`} inert={isSignUp}>
          <div className={s.content}>
            <h2>New to FIA&apos;O?</h2>
            <p>Create your store&apos;s account in minutes and bring your notebook online.</p>
            <button type="button" className={s.ghost} onClick={() => switchMode(true)}>
              Sign up
            </button>
          </div>
        </div>

        <div className={`${s.panel} ${s.rightPanel}`} inert={!isSignUp}>
          <div className={s.content}>
            <h2>Welcome back</h2>
            <p>Already have an account? Log in to manage your store.</p>
            <button type="button" className={s.ghost} onClick={() => switchMode(false)}>
              Log in
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

interface FieldProps {
  icon: LucideIcon
  label: string
  type: string
  name: string
  autoComplete: string
  minLength?: number
}

function Field({ icon: Icon, label, ...input }: FieldProps) {
  return (
    <label className={s.field}>
      <Icon className={s.fieldIcon} strokeWidth={1.75} aria-hidden />
      <span className="sr-only">{label}</span>
      <input {...input} placeholder={label} required />
    </label>
  )
}

function Notice() {
  return (
    <p role="status" className={s.notice}>
      Accounts open with the beta. Thanks for your interest.
    </p>
  )
}
