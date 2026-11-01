import json
import random

from PIL import Image, ImageChops

from perf import images


def make_photo(path, width=600, height=350, seed=1):
    """Degradado con ruido: pesa lo bastante como para que la calidad importe."""
    rng = random.Random(seed)
    image = Image.new("RGB", (width, height))
    pixels = image.load()
    for y in range(height):
        for x in range(width):
            noise = rng.randint(-25, 25)
            pixels[x, y] = (
                min(255, max(0, x * 255 // width + noise)),
                min(255, max(0, y * 255 // height + noise)),
                min(255, max(0, 128 + noise)),
            )
    image.save(path)
    return image


def entry(**over):
    base = dict(name="foto", src="foto.png", out="out/foto.webp", max_width=600, max_bytes=75_000)
    return images.Entry(**{**base, **over})


def mean_diff(a, b, box):
    return ImageChops.difference(a.crop(box), b.crop(box)).convert("L").resize((1, 1), Image.BOX).getpixel((0, 0))


def test_respeta_el_presupuesto_de_bytes(tmp_path):
    make_photo(tmp_path / "foto.png")
    result = images.convert(entry(max_bytes=75_000), tmp_path, tmp_path)
    assert result.out_path.stat().st_size <= 75_000
    assert result.out_bytes == result.out_path.stat().st_size


def test_elige_la_calidad_mas_alta_que_cabe(tmp_path):
    make_photo(tmp_path / "foto.png")
    result = images.convert(entry(), tmp_path, tmp_path)
    assert result.quality < images.MAX_QUALITY
    with Image.open(tmp_path / "foto.png") as original:
        assert len(images.encode(original.convert("RGB"), result.quality + 1)) > 75_000


def test_jamas_amplia(tmp_path):
    make_photo(tmp_path / "foto.png", width=500, height=250)
    result = images.convert(entry(max_width=2000, max_bytes=500_000), tmp_path, tmp_path)
    assert result.out_size == (500, 250)


def test_achica_si_es_mas_ancha_que_max_width(tmp_path):
    make_photo(tmp_path / "foto.png", width=700, height=350)
    result = images.convert(entry(max_width=600, max_bytes=500_000), tmp_path, tmp_path)
    assert result.out_size == (600, 300)


def test_apply_blur_cambia_la_caja_y_deja_intacto_el_exterior():
    image = Image.effect_noise((100, 100), 60).convert("RGB")
    out = images.apply_blur(image, [[20, 20, 30, 30]])
    box = (20, 20, 50, 50)
    assert out.crop(box).tobytes() != image.crop(box).tobytes()
    for x in range(100):
        for y in range(100):
            if not (20 <= x < 50 and 20 <= y < 50):
                assert out.getpixel((x, y)) == image.getpixel((x, y))


def test_la_caja_difuminada_sobrevive_al_webp(tmp_path):
    make_photo(tmp_path / "foto.png", width=400, height=300)
    plain = images.convert(entry(max_width=400, max_bytes=500_000, out="a.webp"), tmp_path, tmp_path)
    blurred = images.convert(
        entry(max_width=400, max_bytes=500_000, out="b.webp", blur=[[100, 80, 60, 40]]), tmp_path, tmp_path
    )
    a, b = Image.open(plain.out_path).convert("RGB"), Image.open(blurred.out_path).convert("RGB")
    assert a.crop((100, 80, 160, 120)).tobytes() != b.crop((100, 80, 160, 120)).tobytes()
    # fuera de la caja solo queda el ruido de la compresion, mucho menor que el cambio dentro
    assert mean_diff(a, b, (0, 200, 400, 300)) < mean_diff(a, b, (100, 80, 160, 120)) / 4


def test_falla_con_codigo_1_si_el_presupuesto_es_imposible(tmp_path, capsys):
    make_photo(tmp_path / "foto.png")
    config = tmp_path / "images.json"
    config.write_text(json.dumps([entry(max_bytes=500).__dict__]), encoding="utf-8")
    code = images.main(["--config", str(config), "--src-dir", str(tmp_path)], root=tmp_path)
    assert code == 1
    assert "no cabe" in capsys.readouterr().err
    assert not (tmp_path / "out" / "foto.webp").exists()


def test_main_escribe_y_devuelve_0(tmp_path, capsys):
    make_photo(tmp_path / "foto.png")
    config = tmp_path / "images.json"
    config.write_text(json.dumps([entry().__dict__]), encoding="utf-8")
    assert images.main(["--config", str(config), "--src-dir", str(tmp_path)], root=tmp_path) == 0
    assert (tmp_path / "out" / "foto.webp").exists()
    assert "foto" in capsys.readouterr().out
