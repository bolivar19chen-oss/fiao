"""Segunda implementacion del motor de credito, escrita desde docs/MODELO-CREDITO.md.

No es una traduccion del codigo TypeScript: traducir heredaria los mismos errores de
interpretacion y el contraste no verificaria nada. Lo que se lee para escribir esto es el
documento de reglas, no src/lib/credit/.

Ver tools/README.md para la advertencia honesta sobre quien escribio cada lado.
"""

from .dates import days_between, each_day, months_between
from .money import divide_round_half_up

DAYS_PER_MONTH = 30
BASIS_POINTS = 10_000

WEIGHTS = {"punctuality": 40, "debtRatio": 30, "tenure": 20, "frequency": 10}
TENURE_CAP_MONTHS = 24
FREQUENCY_CAP_SALES = 12


# --- Saldo -----------------------------------------------------------------------


def balance_from(movements: list[dict]) -> int:
    return sum(movement["cents"] for movement in movements)


def daily_balances(movements: list[dict], start: str, end: str) -> list[int]:
    """Saldo al cierre de cada dia, arrancando del saldo anterior al periodo."""
    opening = sum(m["cents"] for m in movements if days_between(m["date"], start) > 0)

    by_day: dict[str, int] = {}
    for movement in movements:
        by_day[movement["date"]] = by_day.get(movement["date"], 0) + movement["cents"]

    running = opening
    result = []
    for day in each_day(start, end):
        running += by_day.get(day, 0)
        result.append(running)
    return result


def verify_balance(movements: list[dict], cached_cents: int) -> dict:
    expected = balance_from(movements)
    return {"expectedCents": expected, "cachedCents": cached_cents, "matches": expected == cached_cents}


# --- Imputacion de abonos --------------------------------------------------------


def settle_installments(installments: list[dict], payments: list[dict]) -> list[dict]:
    """Lo que entra tapa lo que vence antes. Un abono parcial no salda la cuota."""
    ordered = sorted(installments, key=lambda i: i["dueDate"])
    by_date = sorted(payments, key=lambda p: p["date"])

    paid_so_far = 0
    next_payment = 0
    owed_up_to_here = 0
    result = []

    for installment in ordered:
        owed_up_to_here += installment["amountCents"]
        while paid_so_far < owed_up_to_here and next_payment < len(by_date):
            paid_so_far += by_date[next_payment]["cents"]
            next_payment += 1

        paid_date = by_date[next_payment - 1]["date"] if paid_so_far >= owed_up_to_here else None
        result.append({**installment, "paidDate": paid_date})

    return result


# --- Intereses -------------------------------------------------------------------


def accrue_interest(movements: list[dict], start: str, end: str, monthly_rate_bp: int) -> int:
    """Interes simple sobre saldo diario, con un solo redondeo al final."""
    if monthly_rate_bp == 0:
        return 0

    # Un dia con saldo negativo aporta cero: el pago de mas no genera interes a favor.
    total = sum(max(balance, 0) for balance in daily_balances(movements, start, end))
    return divide_round_half_up(total * monthly_rate_bp, DAYS_PER_MONTH * BASIS_POINTS)


def accrue_late_fee(installments: list[dict], start: str, end: str, late_rate_bp: int, grace_days: int) -> int:
    if late_rate_bp == 0:
        return 0

    total = 0
    last_day = days_between(start, end)

    for installment in installments:
        if installment.get("paidDate") is not None:
            continue
        first_late_day = days_between(start, installment["dueDate"]) + grace_days + 1
        begin = max(first_late_day, 0)
        if begin > last_day:
            continue
        total += installment["amountCents"] * (last_day - begin + 1)

    return divide_round_half_up(total * late_rate_bp, DAYS_PER_MONTH * BASIS_POINTS)


# --- Estado ----------------------------------------------------------------------


def account_status(balance_cents: int, installments: list[dict], grace_days: int, as_of: str) -> str:
    if balance_cents <= 0:
        return "NO_DEBT"

    overdue = any(
        installment.get("paidDate") is None and days_between(installment["dueDate"], as_of) > grace_days
        for installment in installments
    )
    return "OVERDUE" if overdue else "CURRENT"


# --- Puntaje ---------------------------------------------------------------------


def _punctuality_tenths(installment: dict, as_of: str) -> int:
    reference = installment.get("paidDate") or as_of
    days_late = days_between(installment["dueDate"], reference)
    if days_late <= 0:
        return 10
    if days_late <= 7:
        return 7
    if days_late <= 30:
        return 3
    return 0


def credit_score(
    installments: list[dict],
    current_balance_cents: int,
    credit_limit_cents: int | None,
    first_sale_date: str | None,
    sales_last_12_months: int,
    as_of: str,
) -> dict:
    """Puntaje con renormalizacion: un factor que no se puede calcular sale del reparto."""
    factors: dict[str, tuple[int, int] | None] = {}

    if installments:
        numerator = sum(_punctuality_tenths(i, as_of) for i in installments)
        factors["punctuality"] = (numerator, len(installments) * 10)
    else:
        factors["punctuality"] = None

    if credit_limit_cents is not None and credit_limit_cents > 0:
        # Acotado por los dos lados: con saldo negativo, limite - saldo pasa el limite.
        unused = min(max(credit_limit_cents - current_balance_cents, 0), credit_limit_cents)
        factors["debtRatio"] = (unused, credit_limit_cents)
    else:
        factors["debtRatio"] = None

    if first_sale_date is not None:
        months = min(max(months_between(first_sale_date, as_of), 0), TENURE_CAP_MONTHS)
        factors["tenure"] = (months, TENURE_CAP_MONTHS)
        sales = min(max(sales_last_12_months, 0), FREQUENCY_CAP_SALES)
        factors["frequency"] = (sales, FREQUENCY_CAP_SALES)
    else:
        factors["tenure"] = None
        factors["frequency"] = None

    available = sum(WEIGHTS[key] for key, value in factors.items() if value is not None)

    breakdown = {"punctuality": 0, "debtRatio": 0, "tenure": 0, "frequency": 0}
    if available == 0:
        return {"score": None, "breakdown": breakdown}

    for key, value in factors.items():
        if value is None:
            continue
        numerator, denominator = value
        breakdown[key] = divide_round_half_up(numerator * WEIGHTS[key] * 100, denominator * available)

    return {"score": sum(breakdown.values()), "breakdown": breakdown}
