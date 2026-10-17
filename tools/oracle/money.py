"""Aritmetica monetaria. Enteros, siempre.

En Python `int` no desborda, asi que no hay limite practico. Prohibido `float`,
`decimal.Decimal`, `pandas` y `numpy`: los dos primeros introducen un segundo modelo de
numero y los dos ultimos operan en coma flotante.
"""


def divide_round_half_up(numerator: int, denominator: int) -> int:
    """Division entera con redondeo a la mitad hacia arriba (hacia +infinito).

    `round()` de Python redondea al par mas cercano (banker's rounding): round(0.5) da 0
    y round(1.5) da 2. Esa no es la politica del documento, asi que no se usa.
    """
    quotient = numerator // denominator  # en Python, // ya es floor
    remainder = numerator - quotient * denominator
    return quotient + 1 if remainder * 2 >= denominator else quotient
