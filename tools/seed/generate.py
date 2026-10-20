"""Genera un negocio de demostracion: clientes, productos, ventas, cuotas y abonos.

Reglas que hereda del proyecto:

- **Dinero en centavos, enteros.** Nada de float. Las cuotas se reparten con
  `divide_round_half_up` del oraculo, igual que el motor, y la ultima absorbe el resto
  para que la suma cuadre exactamente con el total.
- **No lee el reloj.** La fecha de referencia entra como argumento, igual que en
  `src/lib/credit/`.
- **Determinista.** Misma semilla, mismos datos. Asi una captura de pantalla de ayer se
  puede reproducir hoy.

No toca la base de datos: devuelve estructuras. Quien las vuelca es `render_sql.py`.
"""

from __future__ import annotations

from dataclasses import dataclass
from random import Random

from oracle.dates import add_days
from oracle.money import divide_round_half_up

# Catalogo de una tienda de barrio. Precios en centavos.
PRODUCTS = [
    ("Rice, 5 lb", 425, 60),
    ("Cooking oil, 1 L", 310, 40),
    ("Sugar, 2 lb", 185, 50),
    ("Coffee, 250 g", 395, 25),
    ("Powdered milk, 400 g", 540, 20),
    ("Pasta, 500 g", 120, 80),
    ("Black beans, 1 lb", 165, 45),
    ("Laundry soap", 275, 30),
    ("Toilet paper, 4 rolls", 340, 35),
    ("Bread, loaf", 150, 18),
]

CUSTOMERS = [
    ("Maricel Sanchez", "6612-4480"),
    ("Jose Batista", "6701-9932"),
    ("Yarielis Quintero", "6433-2017"),
    ("Ramon Pinzon", "6008-7741"),
    ("Dalys Moreno", "6529-3365"),
    ("Edwin Caballero", "6144-8820"),
    ("Nitzia Rodriguez", "6875-1194"),
    ("Abdiel Jaen", "6260-5503"),
    ("Suleika Mendoza", "6391-6678"),
    ("Hector Villarreal", "6782-2246"),
    ("Griselda Atencio", "6055-9081"),
    ("Omar Tejeira", "6917-3350"),
]

METHODS = ("cash", "cash", "cash", "yappy", "card")


@dataclass(frozen=True)
class Item:
    product_index: int
    quantity: int
    unit_price_cents: int


@dataclass(frozen=True)
class Installment:
    number: int
    due_date: str
    amount_cents: int


@dataclass(frozen=True)
class Payment:
    amount_cents: int
    paid_at: str
    method: str


@dataclass(frozen=True)
class Sale:
    customer_index: int
    created_at: str
    total_cents: int
    balance_cents: int
    items: list[Item]
    installments: list[Installment]
    payments: list[Payment]


@dataclass(frozen=True)
class Dataset:
    today: str
    customers: list[tuple[str, str]]
    products: list[tuple[str, int, int]]
    sales: list[Sale]


def split_cents(total_cents: int, parts: int) -> list[int]:
    """Reparte un total en cuotas enteras que suman exactamente el total.

    Todas iguales menos la ultima, que recoge el resto. Es lo que hace el motor, y es la
    unica forma de que no se pierda ni se invente un centavo.
    """
    each = divide_round_half_up(total_cents, parts)
    head = [each] * (parts - 1)
    return head + [total_cents - sum(head)]


def generate(today: str, seed: int = 19) -> Dataset:
    """Construye el conjunto completo. `today` es la fecha de referencia, en ISO."""
    rng = Random(seed)
    sales: list[Sale] = []

    # Una venta por cliente y una segunda para la mitad de ellos: suficiente para que el
    # panel tenga morosos, cobros de la semana y cuotas por vencer sin parecer un banco.
    plan = list(range(len(CUSTOMERS))) + list(range(0, len(CUSTOMERS), 2))

    for position, customer_index in enumerate(plan):
        # Las ventas se reparten hacia atras en el tiempo: las primeras del plan son las
        # mas viejas, asi que son las que acumulan mora.
        age_days = 85 - position * 4
        created_at = add_days(today, -age_days)

        items = [
            Item(
                product_index=p,
                quantity=rng.randint(1, 4),
                unit_price_cents=PRODUCTS[p][1],
            )
            for p in rng.sample(range(len(PRODUCTS)), rng.randint(2, 4))
        ]
        total_cents = sum(i.quantity * i.unit_price_cents for i in items)

        count = rng.choice((2, 3, 4))
        amounts = split_cents(total_cents, count)
        installments = [
            Installment(
                number=n + 1,
                # Quincenal desde la venta, que es como cobra una tienda de barrio.
                due_date=add_days(created_at, 15 * (n + 1)),
                amount_cents=amount,
            )
            for n, amount in enumerate(amounts)
        ]

        payments = _payments_for(rng, today, created_at, amounts, position)
        paid = sum(p.amount_cents for p in payments)
        sales.append(
            Sale(
                customer_index=customer_index,
                created_at=created_at,
                total_cents=total_cents,
                balance_cents=total_cents - paid,
                items=items,
                installments=installments,
                payments=payments,
            )
        )

    dataset = Dataset(today=today, customers=CUSTOMERS, products=PRODUCTS, sales=sales)
    _check(dataset)
    return dataset


def _payments_for(
    rng: Random, today: str, created_at: str, amounts: list[int], position: int
) -> list[Payment]:
    """Abonos de una venta.

    Tres comportamientos, repartidos en ciclo para que el panel muestre los tres estados:
    quien paga todo, quien va a medias y quien no ha pagado nada.
    """
    behaviour = position % 3
    if behaviour == 0:  # no ha pagado: este es el moroso
        return []

    covered = len(amounts) if behaviour == 1 else max(1, len(amounts) // 2)
    payments = []
    for n in range(covered):
        # Puntual o con unos dias de atraso, nunca antes de la venta.
        due = add_days(created_at, 15 * (n + 1))
        paid_at = add_days(due, rng.randint(-2, 6))
        if paid_at > today:
            break
        payments.append(
            Payment(
                amount_cents=amounts[n],
                paid_at=paid_at,
                method=rng.choice(METHODS),
            )
        )
    return payments


def _check(dataset: Dataset) -> None:
    """Invariantes que la base de datos tambien exige. Mejor reventar aca que en el SQL."""
    for sale in dataset.sales:
        assert sale.total_cents > 0, "una venta sin monto no existe"
        assert sale.total_cents == sum(
            i.quantity * i.unit_price_cents for i in sale.items
        ), "el total no cuadra con las lineas"
        assert sale.total_cents == sum(
            i.amount_cents for i in sale.installments
        ), "las cuotas no suman el total"
        assert all(i.amount_cents > 0 for i in sale.installments), "cuota en cero"
        assert 0 <= sale.balance_cents <= sale.total_cents, "saldo fuera de rango"
        assert all(p.amount_cents > 0 for p in sale.payments), "abono en cero"
        assert all(p.paid_at >= sale.created_at for p in sale.payments), "abono antes de la venta"
        assert all(p.paid_at <= dataset.today for p in sale.payments), "abono en el futuro"
        assert all(
            isinstance(value, int)
            for value in (sale.total_cents, sale.balance_cents, *[i.amount_cents for i in sale.installments])
        ), "dinero que no es entero"
