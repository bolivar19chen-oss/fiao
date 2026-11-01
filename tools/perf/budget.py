"""Presupuesto de JavaScript por ruta a partir del build de Next.

Uso, desde tools/:
    python -m perf.budget [--dist ../.next] [--budgets perf/budgets.json]

First Load JS de una ruta = suma, en kB (1000 bytes), del tamano gzip de cada chunk .js
distinto de la entrada de su pagina en app-build-manifest.json, mas los rootMainFiles de
build-manifest.json (en App Router la entrada ya los incluye). Es la misma cuenta que
imprime `next build`. No suma los layouts por separado: Next tampoco lo hace.

budgets.json es una lista de {"ruta": patron fnmatch, "max_kb": n}; gana la primera que
coincide. Ojo: en un patron, [id] es una clase de caracteres; usa * para rutas dinamicas.
"""

from __future__ import annotations

import argparse
import fnmatch
import gzip
import json
import sys
from pathlib import Path

HERE = Path(__file__).resolve().parent


def first_load_kb(dist: Path) -> dict[str, float]:
    """Ruta -> kB de JS comprimido con gzip, para cada pagina del build."""
    app = json.loads((dist / "app-build-manifest.json").read_text(encoding="utf-8"))["pages"]
    build = json.loads((dist / "build-manifest.json").read_text(encoding="utf-8"))
    routes = json.loads((dist / "app-path-routes-manifest.json").read_text(encoding="utf-8"))
    sizes: dict[str, int] = {}

    def gzip_size(chunk: str) -> int:
        if chunk not in sizes:
            sizes[chunk] = len(gzip.compress((dist / chunk).read_bytes(), 9))
        return sizes[chunk]

    result = {}
    for entry, route in routes.items():
        if entry.endswith("/page") and entry in app:
            chunks = {f for f in [*build["rootMainFiles"], *app[entry]] if f.endswith(".js")}
            result[route] = sum(gzip_size(c) for c in chunks) / 1000
    return result


def limit_for(route: str, budgets: list[dict]) -> float:
    for budget in budgets:
        if fnmatch.fnmatchcase(route, budget["ruta"]):
            return budget["max_kb"]
    raise ValueError(f"ninguna regla de budgets.json cubre la ruta {route}")


def main(argv: list[str] | None = None) -> int:
    parser = argparse.ArgumentParser(prog="perf.budget", description=__doc__.split("\n")[0])
    parser.add_argument("--dist", type=Path, default=HERE.parent / "../.next")
    parser.add_argument("--budgets", type=Path, default=HERE / "budgets.json")
    args = parser.parse_args(argv)

    try:
        budgets = json.loads(args.budgets.read_text(encoding="utf-8"))
        loads = first_load_kb(args.dist)
        rows = [(route, kb, limit_for(route, budgets)) for route, kb in sorted(loads.items())]
    except (OSError, KeyError, ValueError) as error:
        print(f"error: {error}", file=sys.stderr)
        return 1

    width = max((len(r[0]) for r in rows), default=5) + 2
    print(f"{'ruta':<{width}}{'kB':>8}{'limite':>8}{'holgura':>9}")
    for route, kb, limit in rows:
        print(f"{route:<{width}}{kb:>8.1f}{limit:>8g}{limit - kb:>+9.1f}")

    over = [route for route, kb, limit in rows if kb > limit]
    if over:
        print(f"\nSobre el presupuesto: {', '.join(over)}", file=sys.stderr)
        return 1
    return 0


if __name__ == "__main__":
    sys.exit(main())
