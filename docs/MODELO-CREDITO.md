# FIA'O - Modelo de credito

Especificacion del credito con intereses. Decisiones de alcance en
[adr/0002-credito-por-tienda.md](adr/0002-credito-por-tienda.md).

El schema actual (`supabase/migrations/20261015174144_init_schema.sql`) cubre ventas,
cuotas y abonos, sin intereses. Este documento define lo que falta y por que.

## 1. Libro de movimientos inmutable

La fuente de verdad es el historial de movimientos, no el saldo. Tres origenes:

| Movimiento | Tabla | Signo sobre el saldo |
|---|---|---|
| Venta a credito | `sales.total_cents` | Suma |
| Interes devengado | `interest_charges` (nueva) | Suma |
| Abono | `payments.amount_cents` | Resta |

**Nada se borra ni se edita.** RLS deniega `update` y `delete` sobre `payments` e
`interest_charges`. Un error se corrige con un movimiento de reversion: una fila nueva
con monto negativo y `reverses` apuntando a la original.

Esto permite que el saldo sea una sola suma, sin filtros ni casos especiales:

```
balance = sales.total_cents
        + sum(interest_charges.amount_cents)
        - sum(payments.amount_cents)
```

`sales.balance_cents` se mantiene como cache para que las consultas de cartera no
recorran el historial. Es cache, no verdad: necesita una prueba que compruebe que coincide
con la suma. Cache sin verificacion es donde nacen los descuadres.

## 2. Politica de intereses

Una sola politica, aplicada siempre igual. Las inconsistencias de redondeo son la causa
principal de balances que no cuadran.

- **Interes simple sobre saldo diario.** No hay capitalizacion: el interes no genera
  interes.
- **Tasa configurable por negocio,** en puntos base (`bp`, centesimas de punto
  porcentual) para que sea un entero. 5% mensual es `500`.
- **Tasa diaria = tasa mensual / 30.** Dias calendario, no habiles.
- **Un corte por mes,** en el dia que fija el negocio.
- **Un solo redondeo, al final.** El devengo diario no se redondea; se suma el saldo de
  cada dia del periodo y el redondeo a centavo (mitad hacia arriba) ocurre una vez, al
  emitir el cargo.

```
interes_cents = round_half_up(
  sum(saldo_cents de cada dia del periodo) * tasa_mensual_bp / (30 * 10000)
)
```

El resultado es una fila en `interest_charges`, nunca una modificacion de una venta
pasada.

**Mora.** Una tasa penal aparte (`late_rate_bp`), que corre solo sobre la porcion vencida
del saldo y solo despues de los dias de gracia. Mismo metodo de devengo y mismo redondeo.

**Advertencia:** cobrar intereses sobre credito de consumo es una actividad regulada.
Antes de usar esto con negocios reales hay que verificar la norma vigente en Panama,
incluido si existe tasa maxima. Para la demo y la evaluacion no aplica.

## 3. Idempotencia

El requisito mas importante y no por volumen: por la cola offline de la Fase 3. Una cola
que reintenta **va** a mandar el mismo abono dos veces.

Cada abono lleva un `client_token` (uuid) generado **en el dispositivo** al momento de
registrarlo, no en el servidor. Indice unico por negocio. El reintento choca contra el
indice y se rechaza solo.

Lo mismo vale para los cargos de interes: unico por `(sale_id, period_end)`. Si el job de
corte corre dos veces, el segundo no duplica nada.

## 4. Estados de la cuenta

Derivados, no almacenados. Guardar un estado que depende de la fecha de hoy obliga a un
job que lo actualice y abre la puerta a que quede viejo.

| Estado | Condicion |
|---|---|
| `NO_DEBT` | saldo = 0 |
| `CURRENT` | saldo > 0 y ninguna cuota vencida pasados los dias de gracia |
| `OVERDUE` | al menos una cuota vencida pasados los dias de gracia |

Se calculan en una vista de Postgres. En la UI van en ingles, igual que todo texto visible.

## 5. Cambios de schema

Migracion nueva, sin tocar la existente.

**`businesses`**

- `monthly_rate_bp integer not null default 0 check (monthly_rate_bp >= 0)`
- `late_rate_bp integer not null default 0 check (late_rate_bp >= 0)`
- `cutoff_day smallint not null default 1 check (cutoff_day between 1 and 28)`
- `grace_days smallint not null default 0 check (grace_days >= 0)`

El tope de 28 evita el problema de los meses cortos. Default 0 en las tasas: un negocio
que no cobra intereses es un caso valido y es el default.

**`customers`**

- `credit_limit_cents bigint check (credit_limit_cents >= 0)`, nulo = sin limite.
  Se valida del lado del servidor al registrar la venta, nunca solo en la interfaz.

**`payments`**

- `client_token uuid not null`, con `unique (business_id, client_token)`.
- `reverses uuid references payments (id)`, nulo salvo reversion.
- Cambiar `check (amount_cents > 0)` por `check (amount_cents <> 0)` mas la regla de
  signo: negativo solo si `reverses is not null`.
- RLS: quitar `update` y `delete`.

**`interest_charges`** (nueva)

- `id`, `business_id`, `sale_id`, `amount_cents bigint not null check (amount_cents <> 0)`
- `kind text not null check (kind in ('interest', 'late_fee'))`
- `period_start date not null`, `period_end date not null`
- `reverses uuid references interest_charges (id)`
- `unique (sale_id, kind, period_end)`
- RLS de lectura por miembro; sin `update` ni `delete`.

**Vista `customer_account_state`**: saldo, estado y dias de atraso por cliente.

## 6. Pruebas obligatorias

- Aritmetica: el saldo cache coincide con la suma del historial, en todos los casos.
- Redondeo: un periodo completo con saldo variable da el mismo centavo calculado dia a
  dia que calculado de una vez.
- Idempotencia: el mismo `client_token` dos veces deja un solo abono.
- Reversion: abono mas su reversion deja el saldo como estaba.
- Corte: ejecutar el job dos veces no duplica el cargo.
- Limite de credito: una venta que excede el limite se rechaza en el servidor.
