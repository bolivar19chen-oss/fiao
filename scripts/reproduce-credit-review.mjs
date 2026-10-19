// Casos diagnosticos de la revision del 2026-10-19. No escribe en Supabase.
// Imprime resultado actual y esperado; no es una suite de regresion que acepte los bugs.
import { readFileSync, existsSync } from "node:fs"
import path from "node:path"
import vm from "node:vm"
import ts from "typescript"

const cache = new Map()
function loadTs(name, from = process.cwd()) {
  const target = name.startsWith("@/") ? path.resolve("src", name.slice(2)) : path.resolve(from, name)
  const file = [target + ".ts", path.join(target, "index.ts")].find(existsSync)
  if (!file) throw new Error(`Cannot resolve ${name}`)
  if (cache.has(file)) return cache.get(file).exports
  const module = { exports: {} }
  cache.set(file, module)
  const code = ts.transpileModule(readFileSync(file, "utf8"), {
    compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2020 },
  }).outputText
  vm.runInThisContext(`(function(require,module,exports){${code}\n})`, { filename: file })(
    (specifier) => loadTs(specifier, path.dirname(file)),
    module,
    module.exports,
  )
  return module.exports
}
const { customerAccount } = loadTs("@/lib/credit-account")
const { accrueInterest, accrueLateFee, creditScore } = loadTs("@/lib/credit")
const { parseCents } = loadTs("@/lib/format")
const cases = []
const report = (name, actual, expected) =>
  cases.push({ name, actual, expected, matches: JSON.stringify(actual) === JSON.stringify(expected) })
const sale = (id, due, payments = []) => ({
  id,
  total_cents: 10000,
  created_at: "2026-09-01T17:00:00Z",
  payments,
  installments: [{ due_date: due, amount_cents: 10000 }],
})
report(
  "abono de B no debe saldar A",
  customerAccount(
    [sale("A", "2026-10-01"), sale("B", "2026-11-01", [{ amount_cents: 10000, paid_at: "2026-10-10T17:00:00Z" }])],
    "2026-10-19",
  ).status,
  "OVERDUE",
)
const nightPayment = customerAccount(
  [sale("A", "2026-10-18", [{ amount_cents: 10000, paid_at: "2026-10-19T04:30:00Z" }])],
  "2026-10-19",
)
report("pago a las 23:30 de Panama", nightPayment.installments[0].paidDate, "2026-10-18")
const partial = customerAccount(
  [sale("A", "2026-10-20", [{ amount_cents: 6000, paid_at: "2026-10-18T17:00:00Z" }])],
  "2026-10-19",
)
report(
  "due this week despues de abono parcial",
  partial.installments
    .filter((i) => i.paidDate === null && i.dueDate >= "2026-10-19" && i.dueDate <= "2026-10-26")
    .reduce((sum, i) => sum + i.amountCents, 0),
  4000,
)
report(
  "mora pagada dentro del mismo corte",
  accrueLateFee({
    installments: [{ dueDate: "2026-09-30", amountCents: 10000, paidDate: "2026-10-16" }],
    periodStart: "2026-10-01",
    periodEnd: "2026-10-30",
    lateRateBp: 500,
    graceDays: 0,
  }),
  250,
)
report(
  "interes previo no debe capitalizarse",
  accrueInterest({
    movements: [
      { date: "2026-09-01", cents: 10000 },
      { date: "2026-09-30", cents: 500 },
    ],
    periodStart: "2026-10-01",
    periodEnd: "2026-10-30",
    monthlyRateBp: 500,
  }),
  500,
)
const input = {
  installments: [{ dueDate: "2026-10-19", amountCents: 10000, paidDate: "2026-10-19" }],
  currentBalanceCents: 0,
  creditLimitCents: null,
  firstSaleDate: "2024-10-19",
  salesLast12Months: 12,
  asOf: "2026-10-19",
}
const punctuality = creditScore(input).breakdown.punctuality
report("UI divide puntualidad por 40 con peso renormalizado", `${punctuality}/40`, `${punctuality} points`)
report("coma decimal introducida por el usuario", parseCents("1,50"), null)
console.log(JSON.stringify(cases, null, 2))
