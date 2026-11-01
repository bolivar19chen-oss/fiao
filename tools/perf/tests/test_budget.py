import gzip
import json

import pytest

from perf import budget


def gz_kb(data: bytes) -> float:
    return len(gzip.compress(data, 9)) / 1000


@pytest.fixture
def dist(tmp_path):
    """Build falso: dos paginas que comparten chunks, mas un css que no cuenta."""
    contents = {
        "static/chunks/main.js": b"main" * 4000,
        "static/chunks/shared.js": b"shared-code-" * 3000,
        "static/chunks/home.js": bytes(range(256)) * 40,
        "static/css/a.css": b"body{}" * 500,
    }
    for name, data in contents.items():
        path = tmp_path / name
        path.parent.mkdir(parents=True, exist_ok=True)
        path.write_bytes(data)
    pages = {
        "/(marketing)/page": ["static/chunks/main.js", "static/chunks/shared.js", "static/chunks/home.js", "static/css/a.css"],
        "/(app)/app/page": ["static/chunks/main.js", "static/chunks/shared.js"],
        "/(app)/app/layout": ["static/chunks/main.js"],
    }
    (tmp_path / "app-build-manifest.json").write_text(json.dumps({"pages": pages}))
    (tmp_path / "build-manifest.json").write_text(json.dumps({"rootMainFiles": ["static/chunks/main.js"]}))
    (tmp_path / "app-path-routes-manifest.json").write_text(
        json.dumps({"/(marketing)/page": "/", "/(app)/app/page": "/app", "/(app)/app/layout": "/ignorada"})
    )
    return tmp_path, {name: gz_kb(data) for name, data in contents.items()}


def test_suma_los_chunks_js_comprimidos(dist):
    path, kb = dist
    loads = budget.first_load_kb(path)
    main, shared, home = (kb[f"static/chunks/{n}.js"] for n in ("main", "shared", "home"))
    assert loads["/"] == pytest.approx(main + shared + home)  # el css no cuenta
    assert loads["/app"] == pytest.approx(main + shared)  # main no se suma dos veces
    assert "/ignorada" not in loads  # solo paginas, no layouts


def test_primer_patron_que_coincide_gana():
    rules = [{"ruta": "/", "max_kb": 10}, {"ruta": "/app*", "max_kb": 20}, {"ruta": "*", "max_kb": 30}]
    assert budget.limit_for("/", rules) == 10
    assert budget.limit_for("/app", rules) == 20
    assert budget.limit_for("/app/sales/[id]", rules) == 20
    assert budget.limit_for("/about", rules) == 30
    with pytest.raises(ValueError):
        budget.limit_for("/x", rules[:1])


def run(dist_path, tmp_path, rules, capsys):
    file = tmp_path / "budgets.json"
    file.write_text(json.dumps(rules))
    code = budget.main(["--dist", str(dist_path), "--budgets", str(file)])
    return code, capsys.readouterr()


def test_codigo_0_dentro_del_presupuesto(dist, tmp_path, capsys):
    code, out = run(dist[0], tmp_path, [{"ruta": "*", "max_kb": 500}], capsys)
    assert code == 0
    assert "/app" in out.out


def test_codigo_1_y_nombra_la_ruta_que_se_pasa(dist, tmp_path, capsys):
    rules = [{"ruta": "/app*", "max_kb": 0.001}, {"ruta": "*", "max_kb": 500}]
    code, out = run(dist[0], tmp_path, rules, capsys)
    assert code == 1
    assert "Sobre el presupuesto: /app" in out.err


def test_codigo_1_si_no_hay_build(tmp_path, capsys):
    code, out = run(tmp_path / "no-existe", tmp_path, [{"ruta": "*", "max_kb": 1}], capsys)
    assert code == 1
    assert "error" in out.err
