"""Convierte fotos a WebP dentro de un presupuesto de peso, difuminando datos privados.

Uso, desde tools/:
    python -m perf.images --src-dir RUTA_DE_LOS_PNG [--config perf/images.json] [--only NOMBRE]

Cada entrada de images.json lleva las cajas [x, y, ancho, alto] en pixeles de la imagen
ORIGINAL que hay que difuminar (placas, telefonos). Si ni con la calidad minima cabe en
max_bytes, se achica el ancho de a 15 por ciento hasta un piso de 640 px; si aun asi no
cabe, falla con codigo 1 y no escribe nada.
"""

from __future__ import annotations

import argparse
import io
import json
import sys
from dataclasses import dataclass, field
from pathlib import Path

from PIL import Image, ImageFilter

REPO_ROOT = Path(__file__).resolve().parents[2]
DEFAULT_CONFIG = Path(__file__).with_name("images.json")
MAX_QUALITY = 95
WIDTH_FLOOR = 640
WIDTH_STEP = 0.85
MIN_BLUR_RADIUS = 8


@dataclass
class Entry:
    name: str
    src: str
    out: str
    max_width: int
    max_bytes: int
    min_quality: int = 68
    blur: list[list[int]] = field(default_factory=list)


@dataclass
class Result:
    name: str
    src_size: tuple[int, int]
    out_size: tuple[int, int]
    src_bytes: int
    out_bytes: int
    quality: int
    out_path: Path


class BudgetError(Exception):
    """Ni con la calidad minima y el ancho piso cabe en el presupuesto."""


def apply_blur(image: Image.Image, boxes: list[list[int]]) -> Image.Image:
    """Difumina cada caja [x, y, ancho, alto] y la pega de vuelta. Devuelve una copia."""
    image = image.copy()
    for x, y, w, h in boxes:
        box = (max(x, 0), max(y, 0), min(x + w, image.width), min(y + h, image.height))
        if box[2] <= box[0] or box[3] <= box[1]:
            raise ValueError(f"caja fuera de la imagen: {[x, y, w, h]}")
        radius = max(MIN_BLUR_RADIUS, min(w, h) * 0.5)
        image.paste(image.crop(box).filter(ImageFilter.GaussianBlur(radius)), box[:2])
    return image


def encode(image: Image.Image, quality: int) -> bytes:
    buffer = io.BytesIO()
    image.save(buffer, "WEBP", quality=quality, method=6)  # sin exif: Pillow no lo copia solo
    return buffer.getvalue()


def best_quality(image: Image.Image, low: int, max_bytes: int) -> tuple[int, bytes] | None:
    """Calidad entera mas alta en [low, 95] cuyo archivo cabe en max_bytes, o None."""
    best: tuple[int, bytes] | None = None
    high = MAX_QUALITY
    while low <= high:
        mid = (low + high) // 2
        data = encode(image, mid)
        if len(data) <= max_bytes:
            best, low = (mid, data), mid + 1
        else:
            high = mid - 1
    return best


def widths_to_try(width: int):
    yield width
    while width > WIDTH_FLOOR:
        width = max(WIDTH_FLOOR, int(width * WIDTH_STEP))
        yield width


def convert(entry: Entry, src_dir: Path, root: Path = REPO_ROOT) -> Result:
    src_path = src_dir / entry.src
    with Image.open(src_path) as opened:
        original = opened.convert("RGB")
    blurred = apply_blur(original, entry.blur)
    start = min(entry.max_width, original.width)  # jamas ampliar
    for width in widths_to_try(start):
        image = blurred
        if width < original.width:
            image = blurred.resize((width, round(original.height * width / original.width)), Image.LANCZOS)
        found = best_quality(image, entry.min_quality, entry.max_bytes)
        if found:
            out_path = root / entry.out
            out_path.parent.mkdir(parents=True, exist_ok=True)
            out_path.write_bytes(found[1])
            return Result(entry.name, original.size, image.size, src_path.stat().st_size,
                          len(found[1]), found[0], out_path)
    raise BudgetError(
        f"{entry.name}: no cabe en {entry.max_bytes} bytes ni con calidad {entry.min_quality} "
        f"y ancho {WIDTH_FLOOR}. Sube max_bytes o baja min_quality."
    )


def print_table(results: list[Result]) -> None:
    print(f"{'nombre':<22}{'dimensiones':<22}{'KB':<18}{'calidad':>8}{'reduccion':>11}")
    for r in results:
        dims = f"{r.src_size[0]}x{r.src_size[1]} -> {r.out_size[0]}x{r.out_size[1]}"
        kb = f"{r.src_bytes / 1000:.0f} -> {r.out_bytes / 1000:.1f}"
        print(f"{r.name:<22}{dims:<22}{kb:<18}{r.quality:>8}{100 * (1 - r.out_bytes / r.src_bytes):>10.1f}%")


def main(argv: list[str] | None = None, root: Path = REPO_ROOT) -> int:
    parser = argparse.ArgumentParser(prog="perf.images", description=__doc__.split("\n")[0])
    parser.add_argument("--config", type=Path, default=DEFAULT_CONFIG)
    parser.add_argument("--src-dir", type=Path, required=True)
    parser.add_argument("--only", metavar="NOMBRE")
    args = parser.parse_args(argv)

    entries = [Entry(**item) for item in json.loads(args.config.read_text(encoding="utf-8"))]
    if args.only:
        entries = [e for e in entries if e.name == args.only]
        if not entries:
            print(f"error: no hay entrada llamada {args.only!r}", file=sys.stderr)
            return 1

    results: list[Result] = []
    try:
        for entry in entries:
            results.append(convert(entry, args.src_dir, root))
    except (BudgetError, OSError, ValueError) as error:
        print(f"error: {error}", file=sys.stderr)
        return 1
    finally:
        if results:
            print_table(results)
    return 0


if __name__ == "__main__":
    sys.exit(main())
