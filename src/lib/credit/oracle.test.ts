import { existsSync, readFileSync } from "node:fs"
import { join } from "node:path"
import { describe, expect, it } from "vitest"

import { accrueInterest, accrueLateFee } from "./accrual"
import { settleInstallments } from "./allocation"
import { balanceFrom, dailyBalances } from "./balance"
import { creditScore } from "./scoring"
import { accountStatus } from "./status"

// Prueba diferencial contra el oraculo Python de tools/oracle/.
//
// Dos implementaciones independientes de docs/MODELO-CREDITO.md, corridas sobre el mismo
// archivo de casos. Un error de interpretacion de la regla se cuela en una
// implementacion; que se cuele identico en dos escritas por separado es mucho menos
// probable.
//
// Para generar el lado Python:  cd tools && python -m oracle.emit
// En CI ese paso corre antes que las pruebas, asi que alli nunca se saltea.

const ORACLE = join(process.cwd(), "tools", "oracle")
const CASES = join(ORACLE, "cases.json")
const PY_RESULTS = join(ORACLE, "py-results.json")

type Case = { id: string; op: string; input: Record<string, never> }

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function run(testCase: Case): any {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const data = testCase.input as any

  switch (testCase.op) {
    case "balance":
      return balanceFrom(data.movements)
    case "dailyBalances":
      return dailyBalances(data.movements, data.from, data.to)
    case "settle":
      return settleInstallments(data.installments, data.payments)
    case "accrue":
      return accrueInterest(data)
    case "lateFee":
      return accrueLateFee(data)
    case "status":
      return accountStatus(data)
    case "score":
      return creditScore(data)
    default:
      throw new Error(`unknown op: ${testCase.op}`)
  }
}

const cases: Case[] = JSON.parse(readFileSync(CASES, "utf8"))

describe("differential check against the Python oracle", () => {
  if (!existsSync(PY_RESULTS)) {
    it.skip("skipped: run `cd tools && python -m oracle.emit` first", () => {})
    return
  }

  const expected: Record<string, unknown> = JSON.parse(readFileSync(PY_RESULTS, "utf8"))

  it("covers every case in cases.json", () => {
    expect(Object.keys(expected).sort()).toEqual(cases.map((c) => c.id).sort())
  })

  for (const testCase of cases) {
    it(`agrees on ${testCase.id}`, () => {
      // Pasa por JSON para comparar la forma, no la identidad de los objetos.
      expect(JSON.parse(JSON.stringify(run(testCase)))).toEqual(expected[testCase.id])
    })
  }
})
