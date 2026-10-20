"""Vuelca el conjunto de demostracion a SQL para Supabase.

Se ejecuta a mano y se pega en el editor SQL del proyecto. No se conecta a nada: imprime
texto. Asi nadie puede escribir sin querer en una base que no era.

    python -m seed.render_sql --shop "MS/ los mellos" --today 2026-10-20 > demo.sql
    python -m seed.render_sql --business <uuid>  --today 2026-10-20 > demo.sql

Con `--shop` el SQL busca el negocio por su nombre, asi no hace falta ir a buscar el
uuid a ninguna parte. Si hubiera dos negocios con el mismo nombre, Postgres se queja de
que la subconsulta devuelve mas de una fila, que es justo lo que debe pasar.

Todo va en una transaccion. Si una restriccion se queja, no queda nada a medias.
"""

from __future__ import annotations

import argparse
import sys
from random import Random

from seed.generate import Dataset, generate


def _uuid(rng: Random) -> str:
    """UUID v4 sacado de la semilla, para que el volcado sea reproducible."""
    bits = rng.getrandbits(128)
    hexed = f"{bits:032x}"
    # Version 4 y variante RFC 4122, en su sitio.
    hexed = f"{hexed[:12]}4{hexed[13:16]}{'89ab'[rng.randrange(4)]}{hexed[17:]}"
    return f"{hexed[:8]}-{hexed[8:12]}-{hexed[12:16]}-{hexed[16:20]}-{hexed[20:32]}"


def _quote(value: str) -> str:
    return "'" + value.replace("'", "''") + "'"


def _noon(iso_date: str) -> str:
    """Mediodia UTC. La fecha ya viene resuelta en Panama y asi ningun huso la corre un dia."""
    return f"{iso_date}T12:00:00Z"


def render(dataset: Dataset, business: str, by_name: bool = False, seed: int = 19) -> str:
    """`business` es un uuid, o el nombre del negocio cuando `by_name`."""
    rng = Random(seed)
    # Literal uuid, o la subconsulta que lo resuelve. Va entre parentesis porque se
    # incrusta en cada fila de VALUES.
    biz = f"(select id from public.businesses where name = {_quote(business)})" if by_name else _quote(business)
    donde = (
        f"business_id = (select id from public.businesses where name = {_quote(business)})"
        if by_name
        else f"business_id = '{business}'"
    )
    out: list[str] = [
        "-- Datos de demostracion de FIA'O. Generado por tools/seed/render_sql.py.",
        f"-- Negocio: {business}. Fecha de referencia: {dataset.today}.",
        "--",
        "-- Para borrarlos despues, en orden inverso a las dependencias:",
        f"--   delete from public.payments where {donde};",
        f"--   delete from public.installments where {donde};",
        f"--   delete from public.sale_items where {donde};",
        f"--   delete from public.sales where {donde};",
        f"--   delete from public.products where {donde};",
        f"--   delete from public.customers where {donde};",
        "",
        "begin;",
        "",
    ]

    customer_ids = [_uuid(rng) for _ in dataset.customers]
    out.append("insert into public.customers (id, business_id, name, phone) values")
    rows = [
        f"  ({_quote(cid)}, {biz}, {_quote(name)}, {_quote(phone)})"
        for cid, (name, phone) in zip(customer_ids, dataset.customers)
    ]
    out.append(",\n".join(rows) + ";")
    out.append("")

    product_ids = [_uuid(rng) for _ in dataset.products]
    out.append(
        "insert into public.products (id, business_id, name, price_cents, stock, low_stock_threshold) values"
    )
    rows = [
        f"  ({_quote(pid)}, {biz}, {_quote(name)}, {price}, {stock}, 5)"
        for pid, (name, price, stock) in zip(product_ids, dataset.products)
    ]
    out.append(",\n".join(rows) + ";")
    out.append("")

    sale_rows, item_rows, inst_rows, pay_rows = [], [], [], []
    for sale in dataset.sales:
        sale_id = _uuid(rng)
        sale_rows.append(
            f"  ({_quote(sale_id)}, {biz}, {_quote(customer_ids[sale.customer_index])}, "
            f"{sale.total_cents}, {sale.balance_cents}, {_quote(_noon(sale.created_at))})"
        )
        for item in sale.items:
            item_rows.append(
                f"  ({_quote(_uuid(rng))}, {biz}, {_quote(sale_id)}, "
                f"{_quote(product_ids[item.product_index])}, {item.quantity}, {item.unit_price_cents})"
            )
        for inst in sale.installments:
            inst_rows.append(
                f"  ({_quote(_uuid(rng))}, {biz}, {_quote(sale_id)}, {inst.number}, "
                f"{_quote(inst.due_date)}, {inst.amount_cents})"
            )
        for payment in sale.payments:
            # Efectivo sin referencia de pasarela, lo remoto con una: lo exige
            # payments_provider_ref_matches_method.
            ref = "null" if payment.method == "cash" else _quote(f"demo-{_uuid(rng)[:8]}")
            pay_rows.append(
                f"  ({_quote(_uuid(rng))}, {biz}, {_quote(sale_id)}, {payment.amount_cents}, "
                f"{_quote(_noon(payment.paid_at))}, {_quote(payment.method)}, {ref}, "
                f"{_quote(_uuid(rng))})"
            )

    out.append(
        "insert into public.sales (id, business_id, customer_id, total_cents, balance_cents, created_at) values"
    )
    out.append(",\n".join(sale_rows) + ";")
    out.append("")
    out.append(
        "insert into public.sale_items (id, business_id, sale_id, product_id, quantity, unit_price_cents) values"
    )
    out.append(",\n".join(item_rows) + ";")
    out.append("")
    out.append(
        "insert into public.installments (id, business_id, sale_id, number, due_date, amount_cents) values"
    )
    out.append(",\n".join(inst_rows) + ";")
    out.append("")
    out.append(
        "insert into public.payments "
        "(id, business_id, sale_id, amount_cents, paid_at, method, provider_ref, client_token) values"
    )
    out.append(",\n".join(pay_rows) + ";")
    out.append("")
    out.append("commit;")
    return "\n".join(out) + "\n"


def main() -> int:
    parser = argparse.ArgumentParser(description="SQL de demostracion para FIA'O")
    destino = parser.add_mutually_exclusive_group(required=True)
    destino.add_argument("--business", help="uuid del negocio destino")
    destino.add_argument("--shop", help="nombre del negocio destino, se resuelve en el SQL")
    parser.add_argument("--today", required=True, help="fecha de referencia, ISO (YYYY-MM-DD)")
    parser.add_argument("--seed", type=int, default=19)
    args = parser.parse_args()
    sys.stdout.write(
        render(
            generate(args.today, args.seed),
            args.shop or args.business,
            by_name=args.shop is not None,
            seed=args.seed,
        )
    )
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
