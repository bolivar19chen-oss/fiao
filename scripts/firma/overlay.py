"""Dibuja la linea de centro sobre la tinta para corregirla mirando.

No es codigo de la aplicacion: es la herramienta con la que se ajusto el trazado de
public/firma.png. Se queda en el repo porque si alguien cambia la imagen, hay que volver
a trazar, y esto es lo que lo hace posible sin adivinar.

    python -I scripts/firma/overlay.py
"""

import os
import re

import io

import numpy as np
from PIL import Image, ImageDraw


def bezier(p0, p1, p2, p3, n=60):
    t = np.linspace(0, 1, n)[:, None]
    return ((1 - t) ** 3 * p0 + 3 * (1 - t) ** 2 * t * p1 + 3 * (1 - t) * t**2 * p2 + t**3 * p3)


def puntos(d):
    """Convierte un path de solo M y C en una lista de puntos."""
    t = d.replace("M", " M ").replace("C", " C ").replace(",", " ").split()
    out, i, actual = [], 0, None
    while i < len(t):
        if t[i] == "M":
            actual = np.array([float(t[i + 1]), float(t[i + 2])])
            out.append(actual)
            i += 3
        elif t[i] == "C":
            c1 = np.array([float(t[i + 1]), float(t[i + 2])])
            c2 = np.array([float(t[i + 3]), float(t[i + 4])])
            fin = np.array([float(t[i + 5]), float(t[i + 6])])
            out.extend(bezier(actual, c1, c2, fin))
            actual = fin
            i += 7
        else:
            i += 1
    return out


def main():
    # Los trazos se leen del componente: alli viven, y una copia aparte se desincroniza
    # el dia que alguien ajuste uno y no el otro.
    fuente = io.open("src/components/landing/intro.tsx", encoding="utf-8").read()
    cuerpo = fuente[fuente.index("const TRAZOS"):fuente.index("const FIN")]
    # Un d: puede venir partido en varias cadenas sumadas con +.
    trazos = ["".join(re.findall(r'"([^"]*)"', bloque)) for bloque in re.findall(r"d:\s*((?:\s*\"[^\"]*\"\s*\+?)+)", cuerpo)]

    a = np.array(Image.open("public/firma.png"))[..., 3]
    H, W = a.shape
    rgb = np.full((H, W, 3), 255, np.uint8)
    rgb[a > 40] = (210, 210, 210)
    im = Image.fromarray(rgb)
    d = ImageDraw.Draw(im, "RGBA")

    for x in range(0, W, 100):
        d.line([(x, 0), (x, H)], fill=(255, 190, 190), width=1)
        d.text((x + 3, 3), str(x), fill=(200, 0, 0))
    for y in range(0, H, 100):
        d.line([(0, y), (W, y)], fill=(190, 210, 255), width=1)
        d.text((3, y + 3), str(y), fill=(0, 0, 200))

    tintas = [(220, 0, 0), (0, 140, 0), (0, 0, 230), (230, 130, 0), (170, 0, 190), (0, 160, 170), (120, 90, 0)]
    print(f"{len(trazos)} trazos leidos de intro.tsx")
    for n, d_ in enumerate(trazos):
        pts = [tuple(p) for p in puntos(d_)]
        d.line(pts, fill=tintas[n % len(tintas)] + (190,), width=5, joint="curve")
        d.ellipse([pts[0][0] - 9, pts[0][1] - 9, pts[0][0] + 9, pts[0][1] + 9], fill=tintas[n % len(tintas)])
        d.text((pts[0][0] + 12, pts[0][1] - 10), str(n + 1), fill=tintas[n % len(tintas)])

    out = os.path.join(os.environ.get("TEMP", "."), "firma-trazado.png")
    im.save(out)
    print(out)


if __name__ == "__main__":
    main()
