"""Puente de Python al nucleo en C++ (credit.cpp), con ctypes y sin dependencias.

    python -m native.build     # compila la biblioteca al lado de este archivo

Las firmas reciben y devuelven lo mismo que oracle/, para poder compararlos caso a caso.
"""

import ctypes
from datetime import date
from pathlib import Path

LIBRARY = Path(__file__).with_name("fiao_credit.bin")
_i64 = ctypes.c_int64
_lib = None


def _load() -> ctypes.CDLL:
    global _lib
    if _lib is None:
        _lib = ctypes.CDLL(str(LIBRARY))
        _array = ctypes.POINTER(_i64)
        _lib.fiao_divide_round_half_up.argtypes = [_i64, _i64]
        _lib.fiao_days_from_civil.argtypes = [_i64, _i64, _i64]
        _lib.fiao_accrue_interest.argtypes = [_array, _array, ctypes.c_size_t, _i64, _i64, _i64]
        for name in ("fiao_divide_round_half_up", "fiao_days_from_civil", "fiao_accrue_interest"):
            getattr(_lib, name).restype = _i64
    return _lib


def divide_round_half_up(numerator: int, denominator: int) -> int:
    return _load().fiao_divide_round_half_up(numerator, denominator)


def days_from_civil(value: str) -> int:
    day = date.fromisoformat(value)
    return _load().fiao_days_from_civil(day.year, day.month, day.day)


def accrue_interest(movements: list[dict], start: str, end: str, monthly_rate_bp: int) -> int:
    count = len(movements)
    days = (_i64 * count)(*(days_from_civil(m["date"]) for m in movements))
    cents = (_i64 * count)(*(m["cents"] for m in movements))
    return _load().fiao_accrue_interest(
        days, cents, count, days_from_civil(start), days_from_civil(end), monthly_rate_bp
    )
