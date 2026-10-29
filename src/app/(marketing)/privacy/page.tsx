import type { Metadata } from "next"

import { Aurora } from "@/components/ui/aurora"

export const metadata: Metadata = {
  title: "Privacy Policy - FIA'O",
}

// DRAFT: pending legal review before launch.
const sections = [
  {
    title: "Who we are",
    body: [
      "FIA'O is a web platform that helps small businesses manage credit sales, inventory, customer payment history and customer credit scores.",
    ],
  },
  {
    title: "Information we collect",
    body: [
      "Account data: the name, email address and password you use to create an account. Passwords are never stored in plain text.",
      "An optional profile photo. You choose whether to add one, it is stored privately so only you can see it, and you can remove it at any time from your settings.",
      "Business data: the products, customers, sales, installments and payments that your store records in FIA'O.",
      "Technical data: the minimum needed to keep the service running and secure, such as session cookies and error logs.",
    ],
  },
  {
    title: "How we use it",
    body: [
      "To provide the service: record sales and payments, calculate balances and credit scores, and generate reports for your store.",
      "To send the payment reminders your store configures.",
      "We do not sell your data or your customers' data, and we do not use it for advertising.",
    ],
  },
  {
    title: "Each store's data stays with that store",
    body: [
      "Data isolation is enforced by the database itself through row-level security. A store can only read and change its own records, even if someone tries to bypass the interface.",
      "Credit scores are calculated only from the payment history recorded by the store that owns the customer. Scores are not shared between stores.",
    ],
  },
  {
    title: "Your customers' information",
    body: [
      "Stores are responsible for having a legitimate reason to record their customers' information and for keeping it accurate. FIA'O processes that information on the store's behalf.",
    ],
  },
  {
    title: "Retention and deletion",
    body: [
      "We keep your data while your account is active. If you close your account, your store's data is deleted, except where the law requires us to keep it longer.",
    ],
  },
  {
    title: "Your rights",
    body: [
      "You can access, correct and delete your personal data, and object to its processing, in line with Panama's personal data protection law (Law 81 of 2019).",
    ],
  },
  {
    title: "Changes to this policy",
    body: ["If we make material changes, we will notify you in the app before they take effect."],
  },
]

export default function PrivacyPage() {
  return (
    <main className="relative isolate overflow-hidden pb-28 pt-36">
      <Aurora className="h-[36rem] opacity-60" />
      <div className="container-x max-w-3xl">
        <p className="eyebrow">Legal</p>
        <h1 className="mt-3 font-display text-4xl font-semibold tracking-tight sm:text-5xl">Privacy Policy</h1>
        <p className="mt-4 text-sm text-marron/55">Last updated: October 15, 2026</p>

        <div className="glass mt-12 rounded-[2rem] p-8 sm:p-12">
          <div className="space-y-10">
            {sections.map((s, i) => (
              <section key={s.title}>
                <h2 className="flex items-baseline gap-3 font-display text-xl font-semibold">
                  <span className="text-sm tabular-nums text-rojo">{String(i + 1).padStart(2, "0")}</span>
                  {s.title}
                </h2>
                <div className="mt-3 space-y-3 leading-relaxed text-marron/70">
                  {s.body.map((p) => (
                    <p key={p}>{p}</p>
                  ))}
                </div>
              </section>
            ))}
          </div>
        </div>
      </div>
    </main>
  )
}
