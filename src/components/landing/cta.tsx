import Link from "next/link"
import { ArrowRight } from "lucide-react"

export function Cta() {
  return (
    <section className="container-x py-28">
      <div className="relative isolate overflow-hidden rounded-[2rem] bg-rojo-marca px-8 py-16 text-center sm:px-16">
        <div
          className="pointer-events-none absolute -right-20 -top-24 -z-10 h-80 w-80 rounded-full bg-amarillo/40 blur-[90px]"
          aria-hidden
        />
        <div
          className="pointer-events-none absolute -bottom-24 -left-20 -z-10 h-80 w-80 rounded-full bg-rojo-oscuro blur-[80px]"
          aria-hidden
        />
        <h2 className="mx-auto max-w-3xl font-display text-4xl leading-[1.08] tracking-[-0.03em] text-white sm:text-5xl">
          <span className="font-light">Bring your store&apos;s notebook</span>{" "}
          <span className="font-semibold">online.</span>
        </h2>
        <p className="mx-auto mt-4 max-w-xl text-white/80">
          Set up in minutes. Your customers, your data, always yours.
        </p>
        <Link
          href="/login"
          className="btn mt-8 h-12 border border-white/40 bg-white/15 px-7 text-[15px] text-white shadow-[inset_0_1px_0_rgb(255_255_255/0.45)] backdrop-blur-xl hover:bg-white/25"
        >
          Get started
          <ArrowRight className="h-4 w-4" aria-hidden />
        </Link>
      </div>
    </section>
  )
}
