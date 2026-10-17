"""Corre cases.json contra el oraculo y escribe py-results.json.

El lado TypeScript hace lo mismo con el mismo archivo de casos y compara. Ninguno de los
dos ve el resultado del otro antes de producir el suyo: por eso el contraste sirve.

    python -m oracle.emit
"""

import json
from pathlib import Path

from . import engine

HERE = Path(__file__).parent
CASES = HERE / "cases.json"
OUTPUT = HERE / "py-results.json"


def run(case: dict):
    op, data = case["op"], case["input"]

    if op == "balance":
        return engine.balance_from(data["movements"])
    if op == "dailyBalances":
        return engine.daily_balances(data["movements"], data["from"], data["to"])
    if op == "settle":
        return engine.settle_installments(data["installments"], data["payments"])
    if op == "accrue":
        return engine.accrue_interest(
            data["movements"], data["periodStart"], data["periodEnd"], data["monthlyRateBp"]
        )
    if op == "lateFee":
        return engine.accrue_late_fee(
            data["installments"], data["periodStart"], data["periodEnd"], data["lateRateBp"], data["graceDays"]
        )
    if op == "status":
        return engine.account_status(
            data["balanceCents"], data["installments"], data["graceDays"], data["asOf"]
        )
    if op == "score":
        return engine.credit_score(
            data["installments"],
            data["currentBalanceCents"],
            data["creditLimitCents"],
            data["firstSaleDate"],
            data["salesLast12Months"],
            data["asOf"],
        )

    raise ValueError(f"unknown op: {op}")


def main() -> None:
    cases = json.loads(CASES.read_text(encoding="utf-8"))
    results = {case["id"]: run(case) for case in cases}
    OUTPUT.write_text(json.dumps(results, indent=2, sort_keys=True) + "\n", encoding="utf-8")
    print(f"{len(results)} casos -> {OUTPUT.name}")


if __name__ == "__main__":
    main()
