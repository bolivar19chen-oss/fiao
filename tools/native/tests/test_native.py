"""El nucleo en C++ tiene que dar el mismo resultado que el oraculo de Python, siempre."""

from datetime import date, timedelta

import pytest
from hypothesis import given
from hypothesis import strategies as st

import native
from oracle import engine
from oracle.money import divide_round_half_up

# Sin compilar no hay nada que comparar: en el CI se compila antes, asi que ahi nunca se salta.
pytestmark = pytest.mark.skipif(not native.LIBRARY.exists(), reason="python -m native.build")

dates = st.dates(min_value=date(1900, 1, 1), max_value=date(2200, 12, 31))
movements = st.lists(
    st.builds(
        lambda offset, cents: {"date": (date(2026, 9, 20) + timedelta(days=offset)).isoformat(), "cents": cents},
        st.integers(min_value=0, max_value=50),
        st.integers(min_value=-500_000, max_value=500_000),
    ),
    max_size=40,
)


@given(st.integers(min_value=-(10**15), max_value=10**15), st.integers(min_value=1, max_value=10**9))
def test_division_matches_python(numerator, denominator):
    assert native.divide_round_half_up(numerator, denominator) == divide_round_half_up(numerator, denominator)


@given(dates)
def test_day_number_matches_python_calendar(day):
    assert native.days_from_civil(day.isoformat()) == (day - date(1970, 1, 1)).days


@given(movements, st.integers(min_value=0, max_value=5_000))
def test_interest_matches_oracle(items, rate_bp):
    period = ("2026-10-01", "2026-10-30")
    assert native.accrue_interest(items, *period, rate_bp) == engine.accrue_interest(items, *period, rate_bp)
