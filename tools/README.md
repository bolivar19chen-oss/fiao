# FIA'O - Herramientas

Python fuera del camino de ejecucion. **Nada de aca se importa desde `src/`, ni responde
a un request, ni se despliega.** Decision en
[ADR 0005](../docs/adr/0005-calculo-en-typescript-python-como-herramienta.md), detalle en
[HERRAMIENTAS-PYTHON.md](../docs/HERRAMIENTAS-PYTHON.md).

## El oraculo

Una segunda implementacion del motor de credito, en `oracle/engine.py`, escrita desde
[MODELO-CREDITO.md](../docs/MODELO-CREDITO.md). Las dos implementaciones corren sobre el
mismo archivo de casos y se comparan: una diferencia de un centavo rompe el build.

Sirve porque un error de interpretacion de la regla se cuela en una implementacion, pero
es muy improbable que se cuele identico en dos escritas por separado.

### La advertencia honesta

**Las dos implementaciones las escribio el mismo autor.** La condicion ideal es que el
oraculo lo escriba otra persona, y no se cumplio.

Lo que si se respeto: el oraculo se escribio leyendo el documento de reglas, no
traduciendo `src/lib/credit/`. Aun asi, un malentendido compartido del documento pasaria
los dos lados sin que nadie lo note.

Por eso el contraste **no reemplaza** leer la especificacion con cuidado, y por eso estan
las pruebas de propiedades: esas no comparan una implementacion contra otra, sino cada una
contra reglas que tienen que valer siempre.

Si alguien del equipo puede reescribir `oracle/engine.py` desde cero sin mirar el codigo
existente, el contraste pasa a valer mucho mas. Queda como tarea abierta.

## Correrlo

```bash
cd tools
python -m pip install -e ".[dev]"
```

**Generar el lado Python** (escribe `oracle/py-results.json`):

```bash
python -m oracle.emit
```

**Contrastar** contra el lado TypeScript, desde la raiz del repo:

```bash
pnpm vitest run src/lib/credit/oracle.test.ts
```

Sin `py-results.json` la prueba se saltea con un mensaje. En CI el paso de Python corre
antes, asi que alli nunca se saltea.

**Propiedades**, que no dependen del otro lado:

```bash
python -m pytest
```

## Reglas del paquete

- Dinero en `int`, siempre. En Python no desborda.
- **Prohibidos `float`, `decimal.Decimal`, `pandas` y `numpy`.** Los dos primeros meten un
  segundo modelo de numero; los dos ultimos operan en coma flotante y no hay aca ningun
  problema que los pida.
- Un solo redondeo, en `money.py`. `round()` de Python redondea al par mas cercano, que no
  es la politica del documento.
- `py-results.json` es generado: no se commitea.

## Que falta

`seed/`, el generador de datos de demostracion de
[HERRAMIENTAS-PYTHON.md](../docs/HERRAMIENTAS-PYTHON.md) seccion 2. Todavia no existe.
