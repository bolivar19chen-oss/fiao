"""Propiedades que tienen que valer siempre, con casos generados.

Esto es lo que Python aporta de verdad y no como decoracion: hypothesis arma periodos con
saldos que cambian todos los dias, tasas en los limites y cronogramas raros que nadie
escribiria a mano.

Un caso que encuentre una discrepancia se agrega a cases.json y queda como regresion
permanente del contraste con el lado TypeScript.
"""

from datetime import date, timedelta

from hypothesis import given, settings
from hypothesis import strategies as st

from oracle import engine
from oracle.money import divide_round_half_up

PERIOD_START = "2026-10-01"
PERIOD_END = "2026-10-30"

cents = st.integers(min_value=-500_000, max_value=500_000)
rates = st.integers(min_value=0, max_value=5_000)


def days_in_period(count: int) -> list[str]:
    start = date.fromisoformat(PERIOD_START)
    return [(start + timedelta(days=offset)).isoformat() for offset in range(count)]


movements = st.lists(
    st.builds(lambda d, c: {"date": d, "cents": c}, st.sampled_from(days_in_period(30)), cents),
    max_size=12,
)


@given(numerator=st.integers(min_value=-10**12, max_value=10**12), denominator=st.integers(min_value=1, max_value=10**6))
def test_rounding_never_drifts_more_than_half(numerator, denominator):
    """El redondeo nunca se aleja mas de medio paso del valor exacto."""
    result = divide_round_half_up(numerator, denominator)
    assert abs(result * denominator - numerator) * 2 <= denominator


@given(movements=movements)
def test_zero_rate_never_charges(movements):
    assert engine.accrue_interest(movements, PERIOD_START, PERIOD_END, 0) == 0


@given(rate=rates)
def test_zero_balance_never_charges(rate):
    assert engine.accrue_interest([], PERIOD_START, PERIOD_END, rate) == 0


@given(movements=movements, rate=rates)
def test_interest_is_never_negative(movements, rate):
    assert engine.accrue_interest(movements, PERIOD_START, PERIOD_END, rate) >= 0


@given(movements=movements, amount=st.integers(min_value=1, max_value=100_000))
def test_payment_plus_reversal_leaves_the_balance_untouched(movements, amount):
    before = engine.balance_from(movements)
    after = engine.balance_from(
        [*movements, {"date": "2026-10-15", "cents": -amount}, {"date": "2026-10-16", "cents": amount}]
    )
    assert after == before


@given(
    installments=st.lists(
        st.builds(
            lambda d, a: {"dueDate": d, "amountCents": a},
            st.sampled_from(days_in_period(30)),
            st.integers(min_value=1, max_value=50_000),
        ),
        max_size=6,
    ),
    payments=st.lists(
        st.builds(
            lambda d, c: {"date": d, "cents": c},
            st.sampled_from(days_in_period(30)),
            st.integers(min_value=1, max_value=50_000),
        ),
        max_size=6,
    ),
)
def test_settled_installments_never_exceed_what_was_paid(installments, payments):
    """Lo saldado nunca puede valer mas que lo que entro."""
    settled = engine.settle_installments(installments, payments)
    covered = sum(i["amountCents"] for i in settled if i["paidDate"] is not None)
    assert covered <= sum(p["cents"] for p in payments)


score_installments = st.lists(
    st.builds(
        lambda d, a, p: {"dueDate": d, "amountCents": a, "paidDate": p},
        st.sampled_from(days_in_period(30)),
        st.integers(min_value=1, max_value=50_000),
        st.one_of(st.none(), st.sampled_from(days_in_period(30))),
    ),
    max_size=8,
)


@settings(max_examples=300)
@given(
    installments=score_installments,
    balance=cents,
    limit=st.one_of(st.none(), st.integers(min_value=1, max_value=1_000_000)),
    first_sale=st.one_of(st.none(), st.sampled_from(["2020-01-01", "2025-06-15", "2026-10-01"])),
    sales=st.integers(min_value=0, max_value=100),
)
def test_breakdown_always_adds_up_and_stays_in_range(installments, balance, limit, first_sale, sales):
    result = engine.credit_score(installments, balance, limit, first_sale, sales, "2026-10-16")
    total = sum(result["breakdown"].values())

    if result["score"] is None:
        assert total == 0
    else:
        assert total == result["score"]
        assert 0 <= result["score"] <= 100
