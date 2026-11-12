"use client"

import { useActionState, useState } from "react"
import Link from "next/link"
import { Eye, EyeOff, Lock, Mail, UserRound, type LucideIcon } from "lucide-react"

import { logIn, signInWithGoogle, signUp, type AuthState } from "./actions"
import s from "./auth-switch.module.css"

// Conectado a Supabase Auth via Server Actions. El aspecto es UI aprobada: no tocar el CSS.
export function AuthSwitch() {
  const [isSignUp, setIsSignUp] = useState(false)
  const [logInState, logInAction, loggingIn] = useActionState(logIn, null)
  const [signUpState, signUpAction, signingUp] = useActionState(signUp, null)

  return (
    <div className={isSignUp ? `${s.container} ${s.signUpMode}` : s.container}>
      <div className={s.formsContainer}>
        <div className={s.signinSignup}>
          {/* inert: el formulario oculto no recibe foco ni clics */}
          <form className={`${s.form} ${s.signInForm}`} action={logInAction} inert={isSignUp} aria-busy={loggingIn}>
            <h2 className={s.title}>Log in</h2>
            <Field
              icon={Mail}
              label="Email"
              type="email"
              name="email"
              autoComplete="email"
              defaultValue={logInState?.email}
            />
            <Field icon={Lock} label="Password" type="password" name="password" autoComplete="current-password" />
            <button type="submit" className={s.submit} disabled={loggingIn}>
              {loggingIn ? "Logging in..." : "Log in"}
            </button>
            <GoogleButton />
            <Notice state={logInState} />
          </form>

          <form className={`${s.form} ${s.signUpForm}`} action={signUpAction} inert={!isSignUp} aria-busy={signingUp}>
            <h2 className={s.title}>Create account</h2>
            <Field
              icon={UserRound}
              label="Your name"
              type="text"
              name="name"
              autoComplete="name"
              defaultValue={signUpState?.name}
            />
            <Field
              icon={Mail}
              label="Email"
              type="email"
              name="email"
              autoComplete="email"
              defaultValue={signUpState?.email}
            />
            <Field
              icon={Lock}
              label="Password (8+ characters)"
              type="password"
              name="password"
              autoComplete="new-password"
              minLength={8}
            />
            <button type="submit" className={s.submit} disabled={signingUp}>
              {signingUp ? "Signing up..." : "Sign up"}
            </button>
            <GoogleButton />
            <p className={s.hint}>
              By signing up you agree to our <Link href="/privacy">Privacy Policy</Link>.
            </p>
            <Notice state={signUpState} />
          </form>
        </div>
      </div>

      <div className={s.panelsContainer}>
        <div className={`${s.panel} ${s.leftPanel}`} inert={isSignUp}>
          <div className={s.content}>
            <h2>New to FIA&apos;O?</h2>
            <p>Create your store&apos;s account in minutes and bring your notebook online.</p>
            <button type="button" className={s.ghost} onClick={() => setIsSignUp(true)}>
              Sign up
            </button>
          </div>
        </div>

        <div className={`${s.panel} ${s.rightPanel}`} inert={!isSignUp}>
          <div className={s.content}>
            <h2>Welcome back</h2>
            <p>Already have an account? Log in to manage your store.</p>
            <button type="button" className={s.ghost} onClick={() => setIsSignUp(false)}>
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
  defaultValue?: string
}

function Field({ icon: Icon, label, type, ...input }: FieldProps) {
  const [visible, setVisible] = useState(false)
  const isPassword = type === "password"
  const Toggle = visible ? EyeOff : Eye
  return (
    <label className={s.field}>
      <Icon className={s.fieldIcon} strokeWidth={1.75} aria-hidden />
      <span className="sr-only">{label}</span>
      <input {...input} type={isPassword && visible ? "text" : type} placeholder={label} required />
      {isPassword && (
        <button
          type="button"
          className={s.reveal}
          onClick={() => setVisible(!visible)}
          aria-label={visible ? "Hide password" : "Show password"}
          aria-pressed={visible}
        >
          <Toggle size={18} strokeWidth={1.75} aria-hidden />
        </button>
      )}
    </label>
  )
}

// Va dentro del formulario pero con su propia action, y sin validar los campos: quien entra
// con Google no escribe correo ni clave.
function GoogleButton() {
  return (
    <button type="submit" formAction={signInWithGoogle} formNoValidate className={s.oauth}>
      Continue with Google
    </button>
  )
}

// Mismo globo de aviso que tenia la UI aprobada, ahora con el error o mensaje real.
function Notice({ state }: { state: AuthState }) {
  const text = state?.error ?? state?.message
  if (!text) return null
  return (
    <p role={state?.error ? "alert" : "status"} className={s.notice}>
      {text}
    </p>
  )
}
