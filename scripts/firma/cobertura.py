"""Comprueba que los trazos de intro.tsx tapan toda la tinta de public/firma.png.

Un hueco se ve como un corte recto en la firma terminada: tinta que ninguna mascara
llego a revelar. Esto lo encuentra sin abrir el navegador y dice donde esta.

    python -I scripts/firma/cobertura.py
"""

import io
import os
import re

import sys

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

import numpy as np
from PIL import Image, ImageDraw

import overlay  # reutiliza puntos() y bezier()


def trazos_de_intro():
    fuente = io.open("src/components/landing/intro.tsx", encoding="utf-8").read()
    cuerpo = fuente[fuente.index("const TRAZOS") : fuente.index("const FIN")]
    ds = [
        "".join(re.findall(r'"([^"]*)"', b))
        for b in re.findall(r"d:\s*((?:\s*\"[^\"]*\"\s*\+?)+)", cuerpo)
    ]
    anchos = [int(g) for g in re.findall(r"grosor:\s*(\d+)", cuerpo)]
    return list(zip(ds, anchos))


def main():
    tinta = np.array(Image.open("public/firma.png"))[..., 3] > 40
    H, W = tinta.shape

    capa = Image.new("L", (W, H), 0)
    d = ImageDraw.Draw(capa)
    for ruta, ancho in trazos_de_intro():
        pts = [tuple(p) for p in overlay.puntos(ruta)]
        d.line(pts, fill=255, width=ancho, joint="curve")
        # Los extremos redondeados, como strokeLinecap="round".
        for p in (pts[0], pts[-1]):
            r = ancho / 2
            d.ellipse([p[0] - r, p[1] - r, p[0] + r, p[1] + r], fill=255)
    cubierto = np.array(capa) > 0

    huecos = tinta & ~cubierto
    total, perdidos = int(tinta.sum()), int(huecos.sum())
    print(f"tinta {total} px, sin cubrir {perdidos} px ({perdidos / total:.2%})")

    if perdidos:
        ys, xs = np.where(huecos)
        # Agrupa los huecos por celdas de 100px para decir donde estan.
        celdas = {}
        for x, y in zip(xs, ys):
            celdas[(x // 100 * 100, y // 100 * 100)] = celdas.get((x // 100 * 100, y // 100 * 100), 0) + 1
        for (cx, cy), n in sorted(celdas.items(), key=lambda kv: -kv[1])[:12]:
            print(f"  hueco en x={cx}-{cx+100} y={cy}-{cy+100}: {n} px")

        vista = np.full((H, W, 3), 255, np.uint8)
        vista[tinta] = (205, 205, 205)
        vista[huecos] = (255, 0, 0)
        out = os.path.join(os.environ.get("TEMP", "."), "firma-huecos.png")
        Image.fromarray(vista).save(out)
        print(out)


main()
