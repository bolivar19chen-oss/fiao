# FIA'O - Motor financiero

> **Documento superado.** El motor no es un servicio HTTP: el calculo vive en
> `src/lib/credit/`, en TypeScript, dentro de la aplicacion. Ver
> [ADR 0005](adr/0005-calculo-en-typescript-python-como-herramienta.md).
>
> Lo que sigue vigente de este documento son **las reglas de dominio, el diseno de las
> operaciones y la lista de pruebas**: se trasladan tal cual al modulo TypeScript. Lo que
> ya no aplica son las rutas HTTP, el formato JSON y el despliegue del servicio.

Reglas del dominio en [MODELO-CREDITO.md](MODELO-CREDITO.md).

## Regla unica

**El motor es puro.** Entra informacion, sale un numero. No abre conexiones a la base, no
lee variables de sesion, no guarda nada entre llamadas.

Si una funcion del motor necesita consultar algo que no vino en la entrada, el diseno esta
mal: ese dato lo tiene que traer quien llama.

## Ubicacion y forma

```
engine/
  pyproject.toml
  README.md            <- como correrlo y como probarlo, en dos comandos
  src/fiao_engine/
    __init__.py
    money.py           <- enteros en centavos, redondeo, nada mas
    accrual.py         <- devengo de intereses y mora
    balance.py         <- verificacion de saldo contra historial
    scoring.py         <- puntaje de credito
    api.py             <- FastAPI, capa delgada sobre lo anterior
  tests/
```

FastAPI. Publica su propio esquema OpenAPI, y de ese esquema se generan los tipos del
cliente TypeScript. El contrato no se escribe dos veces a mano.

La logica vive en los modulos, no en `api.py`. `api.py` solo traduce JSON a llamadas y
vuelta. Las pruebas van contra los modulos, sin levantar servidor.

## Tipos de dinero

Enteros. Siempre. En Python eso ya es nativo: `int` no desborda.

Prohibido en todo el paquete: `float`, `decimal.Decimal`, `pandas`, `numpy`. Los dos
primeros porque introducen un segundo modelo de numero; los dos ultimos porque operan en
coma flotante y porque no hace falta una pila de analisis de datos para sumar.

Un solo lugar define el redondeo, `money.py`, con mitad hacia arriba, y todo lo demas lo
usa. Si aparece un segundo redondeo en el codigo, hay un error de diseno.

## Contrato

Tres operaciones. Nada mas por ahora: lo que no esta pedido no se construye.

### `POST /accrue`

Calcula el cargo de interes de un periodo. El que llama trae los saldos diarios.

```json
{
  "daily_balances_cents": [120000, 120000, 95000],
  "monthly_rate_bp": 500,
  "period_start": "2026-10-01",
  "period_end": "2026-10-31"
}
```

```json
{ "interest_cents": 1750 }
```

Un solo redondeo, al final, como fija MODELO-CREDITO.md seccion 2.

### `POST /balance/verify`

Comprueba que el saldo cacheado coincide con el historial. Es la prueba que evita los
descuadres silenciosos.

```json
{
  "sale_total_cents": 120000,
  "interest_charges_cents": [1750],
  "payments_cents": [50000, -50000, 30000],
  "cached_balance_cents": 91750
}
```

```json
{ "expected_cents": 91750, "cached_cents": 91750, "matches": true }
```

Los montos negativos en `payments_cents` son reversiones y entran en la suma con su signo,
tal como quedo definido en MODELO-CREDITO.md seccion 1.

### `POST /score`

Puntaje de reputacion dentro de la tienda, 0 a 100. Ponderacion de PLAN.md Fase 0:
puntualidad 40, ratio de deuda 30, antiguedad 20, frecuencia 10.

```json
{
  "installments": [
    { "due_date": "2026-09-01", "paid_date": "2026-09-01", "amount_cents": 40000 },
    { "due_date": "2026-10-01", "paid_date": "2026-10-08", "amount_cents": 40000 },
    { "due_date": "2026-11-01", "paid_date": null, "amount_cents": 40000 }
  ],
  "current_balance_cents": 40000,
  "credit_limit_cents": 200000,
  "first_sale_date": "2026-06-15",
  "as_of": "2026-11-05"
}
```

```json
{
  "score": 72,
  "breakdown": { "punctuality": 28, "debt_ratio": 24, "tenure": 14, "frequency": 6 }
}
```

`breakdown` no es decorativo: es el requisito de que el puntaje se pueda explicar y
defender, que MODELO-CREDITO.md y PLAN.md listan como riesgo.

`as_of` entra como dato, no se toma del reloj del servidor. Una funcion pura no mira la
hora: si lo hiciera, la misma entrada daria resultados distintos y las pruebas no servirian.

## Quien llama y cuando

| Operacion | Quien la invoca | Cuando |
|---|---|---|
| `/accrue` | Trabajo de corte, en el servidor | Una vez al mes, por negocio |
| `/balance/verify` | Pruebas y auditoria | En CI, y a pedido desde ajustes |
| `/score` | Edge Function, tras registrar un abono | Al cambiar el historial del cliente |

Next.js lee los datos bajo la sesion del usuario, llama al motor y **persiste el resultado
el mismo**, dentro de la transaccion. El motor nunca escribe.

## Cuando el motor no responde

Hay que disenarlo, no asumir que siempre contesta.

- Registrar ventas, abonos y clientes **no depende del motor**. Eso sigue andando.
- El puntaje queda con su ultimo valor y la interfaz dice desde cuando. No se inventa uno.
- El corte que falla se reintenta. Como `interest_charges` es unico por
  `(sale_id, kind, period_end)`, reintentar no duplica. La idempotencia de
  MODELO-CREDITO.md seccion 3 cubre este caso tambien.

## Pruebas

En `engine/tests/`, contra los modulos, sin servidor.

- Redondeo: el mismo periodo calculado dia a dia y de una vez da el mismo centavo.
- Tasa cero: un negocio sin intereses nunca genera un cargo.
- Saldo cero: un periodo entero sin deuda devenga cero.
- Reversion: abono mas reversion deja el saldo como estaba.
- Puntaje: pagos puntuales, atrasos de 1, 7 y 30 dias, abonos parciales, cliente nuevo
  sin historial.
- `breakdown` siempre suma `score`.

Cobertura alta en `accrual.py`, `balance.py` y `scoring.py`. En `api.py` no hace falta:
no tiene logica.

## Despliegue

Contenedor con el servicio, variable `ENGINE_URL` del lado de Next.js. El `README.md` de
`engine/` tiene que dejarlo corriendo en dos comandos: los jueces no deberian pelear con
el entorno para ver el proyecto andando.

CI aparte para el motor: lint, tipos y pruebas de Python. No se mezcla con el pipeline de
la aplicacion.
