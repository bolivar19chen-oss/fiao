# FIA'O - Herramientas Python

Dos programas Python que viven en `tools/`. Decision en
[ADR 0005](adr/0005-calculo-en-typescript-python-como-herramienta.md).

## Regla que los delimita

**Nada de lo que hay en `tools/` se importa desde `src/`, ni responde a un request, ni se
despliega.** Son herramientas de desarrollo: corren en la maquina del equipo y en CI.

Si alguna vez hace falta llamar a `tools/` para que la aplicacion funcione, algo se diseno
mal.

```
tools/
  pyproject.toml
  README.md
  oracle/
    __init__.py
    accrual.py        <- devengo de intereses y mora
    balance.py        <- saldo a partir del historial
    scoring.py        <- puntaje de credito
    cases.py          <- lee y escribe el archivo de casos compartido
    tests/            <- pruebas propias, con hypothesis
  seed/
    __init__.py
    generate.py       <- genera negocios, clientes y movimientos
    render_sql.py     <- vuelca a SQL para Supabase
```

## 1. Oraculo de verificacion

Una segunda implementacion de la matematica de [MODELO-CREDITO.md](MODELO-CREDITO.md),
usada en CI para contrastar contra la implementacion TypeScript de `src/lib/credit/`.

### La regla que lo hace valido

**Se escribe leyendo MODELO-CREDITO.md, nunca traduciendo el codigo TypeScript.**

Si se traduce, hereda los mismos errores de interpretacion y deja de verificar nada. Lo
ideal es que lo escriba una persona distinta de quien hizo el modulo TypeScript. Si no se
puede, que lo escriba la misma persona pero antes de mirar su propio codigo, y que quede
dicho en el `README.md` de `tools/`.

### Como se contrastan

Un archivo de casos compartido, `tools/oracle/cases.json`, versionado en git. Cada caso es
una entrada y nada mas: el resultado esperado no se escribe a mano.

```json
{
  "id": "accrual-saldo-variable-30d",
  "op": "accrue",
  "input": {
    "daily_balances_cents": [120000, 120000, 95000],
    "monthly_rate_bp": 500,
    "period_start": "2026-10-01",
    "period_end": "2026-10-31"
  }
}
```

En CI, tres pasos:

1. El runner de TypeScript lee `cases.json`, ejecuta cada caso contra `src/lib/credit/` y
   escribe `ts-results.json`.
2. El oraculo Python hace lo mismo y escribe `py-results.json`.
3. Un comparador verifica que sean identicos. Cualquier diferencia, aunque sea de un
   centavo, falla el build e imprime el caso.

Ninguno de los dos lados ve el resultado del otro antes de producir el suyo.

### Generacion de casos

Aqui Python aporta lo que no es decoracion. Con `hypothesis`, el oraculo genera casos que
nadie escribiria a mano: periodos con saldo que cambia todos los dias, tasas en los
limites, abonos que dejan el saldo exactamente en cero, reversiones encadenadas.

Los casos que encuentran una discrepancia se agregan a `cases.json` y quedan como prueba
de regresion permanente.

### Propiedades a verificar

Mas alla de la igualdad entre implementaciones, son afirmaciones que deben valer siempre:

- Tasa cero nunca genera cargo, con cualquier saldo.
- Saldo cero durante todo el periodo nunca genera cargo, con cualquier tasa.
- El interes de un periodo partido en dos mitades suma lo mismo que el periodo entero, o
  difiere en a lo sumo un centavo por el redondeo. Definir cual de las dos y sostenerlo.
- El saldo reconstruido desde el historial nunca es negativo.
- Un abono mas su reversion deja el saldo exactamente como estaba.
- En el puntaje, el desglose suma siempre el total.
- El puntaje nunca sale de 0 a 100.

## 2. Generador de datos de demostracion

El PLAN.md pide una demo con datos realistas. A mano no sale: hacen falta meses de
movimientos coherentes entre si.

`tools/seed/generate.py` produce, con semilla fija para que sea reproducible:

- 3 negocios con tasas y dias de corte distintos, incluido uno con tasa cero.
- 20 clientes por negocio, con perfiles de pago distintos: puntual, irregular, moroso,
  cliente nuevo sin historial.
- 3 meses de ventas, cuotas y abonos, con los cortes de interes aplicados.

Dos condiciones, y son las que le dan valor:

1. **Cuadra al centavo.** El generador verifica que para cada venta el saldo coincida con
   el historial antes de emitir nada. Si no cuadra, falla y no escribe.
2. **No inventa estados imposibles.** Un abono nunca es anterior a su venta, un saldo
   nunca es negativo, una cuota pagada nunca queda vencida.

`render_sql.py` lo vuelca a SQL para cargarlo en Supabase. Respeta las claves foraneas
compuestas `(id, business_id)` del schema.

Sirve ademas para la demostracion de la exposicion: mostrar que con 3 negocios y 3 meses
de movimientos la cartera cuadra exactamente es mucho mas convincente que tres clientes
cargados a mano.

## Entorno

`pyproject.toml` propio en `tools/`, independiente de la aplicacion. Python 3.12, que es
el que ya esta instalado en la maquina de trabajo.

Dependencias: `hypothesis` para generacion de casos, `pytest` para correrlas. Nada mas.
**Prohibidos `pandas` y `numpy`:** operan en coma flotante y no hay aqui ningun problema
que los pida.

Dinero en `int`, siempre. En Python no desborda.

CI propio, separado del de la aplicacion: lint, tipos y pruebas de Python por un lado; el
contraste de `cases.json` es un trabajo distinto que necesita los dos lenguajes.

## Orden de construccion

1. Modulo `src/lib/credit/` en TypeScript, con Vitest y sus pruebas.
2. `tools/oracle/`, escrito desde MODELO-CREDITO.md.
3. El contraste en CI.
4. `tools/seed/`.

El oraculo no puede ir primero: sin implementacion que contrastar no verifica nada.

## Rendimiento: `tools/perf/`

Dos herramientas que cuidan el peso de lo que se le sirve al usuario. Corren desde `tools/`
y siguen la misma regla: nada de esto se importa desde `src/`.

### Imagenes: `python -m perf.images`

```
python -m perf.images --src-dir RUTA_DE_LOS_PNG [--only NOMBRE]
```

Convierte las fotos de `perf/images.json` a WebP en `src/assets/img/`. Por imagen: difumina
las cajas `blur` (placas y telefonos, en pixeles de la imagen original), achica solo si es
mas ancha que `max_width`, y busca la calidad mas alta que cabe en `max_bytes`. Si ni con
`min_quality` cabe, reduce el ancho de a 15% (piso 640 px) y, si sigue sin caber, sale con
codigo 1 sin escribir nada. Protege dos cosas: que una foto de 2 MB no llegue a la pagina
y que datos de terceros no salgan publicados. Al agregar una foto con vehiculos o
telefonos, hay que mirar el resultado antes de commitear.

### Presupuesto de JS: `python -m perf.budget`

```
pnpm build
cd tools && python -m perf.budget --dist ../.next
```

Calcula el First Load JS de cada ruta (chunks `.js` de su entrada en
`app-build-manifest.json`, comprimidos con gzip, en kB de 1000 bytes), la misma cuenta que
imprime `next build`, y la compara con `perf/budgets.json`: lista de `{ruta, max_kb}` con
patrones `fnmatch`, gana el primero que coincide. Sale con codigo 1 y nombra la ruta que se
pase. En CI corre despues del build; en local `pnpm build` escribe en `.next-build`, asi que
se pasa `--dist ../.next-build`. Para subir un limite hay que editar `budgets.json` en
el mismo cambio, a la vista de quien revisa.

## Nucleo en C++: `tools/native/`

La aritmetica del motor (division con redondeo, calendario e interes sobre saldo diario)
escrita una tercera vez, en C++17 (`credit.cpp`). Python la carga con `ctypes`, sin
dependencias, y `native/tests` genera casos con hypothesis y exige que C++ y el oraculo den
el mismo centavo.

    python -m native.build      # usa $CXX, o g++ si no esta definido
    python -m pytest -q native/tests

No corre en produccion: es una verificacion mas, igual que el oraculo. Sin compilar, sus
pruebas se saltan en local; en el CI se compila siempre.
