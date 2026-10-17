"""Aritmetica de dias calendario sobre fechas ISO.

`datetime.date` no tiene zona horaria, asi que aca no aparece el problema que obliga al
lado TypeScript a pasar siempre por Date.UTC.
"""

from datetime import date, timedelta

IsoDate = str


def parse(value: IsoDate) -> date:
    return date.fromisoformat(value)


def days_between(start: IsoDate, end: IsoDate) -> int:
    return (parse(end) - parse(start)).days


def add_days(value: IsoDate, days: int) -> IsoDate:
    return (parse(value) + timedelta(days=days)).isoformat()


def each_day(start: IsoDate, end: IsoDate) -> list[IsoDate]:
    """Todos los dias del periodo, incluidos los dos extremos."""
    total = days_between(start, end)
    if total < 0:
        return []
    return [add_days(start, offset) for offset in range(total + 1)]


def months_between(start: IsoDate, end: IsoDate) -> int:
    """Meses completos. Del 15 de enero al 14 de febrero son 0; al 15, 1."""
    a, b = parse(start), parse(end)
    months = (b.year - a.year) * 12 + (b.month - a.month)
    return months - 1 if b.day < a.day else months
