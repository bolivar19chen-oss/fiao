# Bloque 1 - Motor de credito

Brief de trabajo. Implementa `src/lib/credit/`, el modulo que calcula intereses, saldos,
estados y puntaje.

Reglas del dominio en [MODELO-CREDITO.md](MODELO-CREDITO.md). Decision de donde vive en
[ADR 0005](adr/0005-calculo-en-typescript-python-como-herramienta.md).

**Es la pieza por la que se evalua el proyecto.** No necesita base de datos, ni red, ni
diseno, ni que nadie mas este disponible. Se puede escribir entera sin internet.

## 0. La regla que lo define

**El modulo es puro.** Entra informacion, sale un numero.

- No importa nada de `@/lib/supabase`, ni de `next`, ni de React.
- No lee el reloj: `new Date()` y `Date.now()` estan prohibidos dentro de `src/lib/credit/`.
  La fecha de referencia entra como argumento.
- No tiene dependencias de npm. Ninguna.

El motivo no es purismo. Es que la misma entrada tiene que dar siempre la misma salida: si
no, las pruebas no valen y el
[oraculo de verificacion](HERRAMIENTAS-PYTHON.md) no puede contrastar nada.

## 1. Estructura

```
src/lib/credit/
  types.ts        <- tipos compartidos del dominio
  money.ts        <- redondeo y aritmetica en centavos
  balance.ts      <- saldo a partir del historial, y su verificacion
  accrual.ts      <- devengo de intereses y mora
  status.ts       <- estado de la cuenta
  scoring.ts      <- puntaje y su desglose
  index.ts        <- lo que el resto de la app puede importar
  money.test.ts  balance.test.ts  accrual.test.ts  status.test.ts  scoring.test.ts
```

Fuera de `index.ts` nada se importa desde el resto de la app.

## 2. Dinero

Enteros. Siempre. `number`, no `BigInt`.

Los enteros de JavaScript son exactos hasta 9.007.199.254.740.991. El valor mas grande que
el motor llega a manejar es la suma de saldos diarios multiplicada por la tasa: con un
saldo de un millon de dolares durante 31 dias y una tasa de 5% mensual son unos 1,5
billones, cuatro ordenes de magnitud por debajo del limite. No hay riesgo de precision.

`BigInt` complicaria la serializacion (`JSON.stringify` falla con BigInt) sin resolver
ningun problema real.

### El redondeo, en un solo lugar

`money.ts` expone **la unica** funcion de redondeo del sistema. Si aparece un segundo
redondeo en el codigo, hay un error de diseno.

```ts
// Division entera con redondeo a la mitad hacia arriba, sin coma flotante.
// (a + b/2) / b en flotante pierde exactitud justo en el caso que importa.
export function divideRoundHalfUp(numerator: number, denominator: number): number
```

Implementacion esperada, con enteros y nada mas:

```ts
const quotient = Math.floor(numerator / denominator)
const remainder = numerator - quotient * denominator
return remainder * 2 >= denominator ? quotient + 1 : quotient
```

Tiene que funcionar con numerador negativo: las reversiones existen.

## 3. Tipos

`types.ts`:

```ts
/** Una fecha sin hora, en formato ISO: "2026-10-16". */
export type IsoDate = string

/** Movimiento del libro. Positivo sube la deuda, negativo la baja. */
export type Movement = {
  date: IsoDate
  cents: number
}

export type AccountStatus = "NO_DEBT" | "CURRENT" | "OVERDUE"

export type Installment = {
  dueDate: IsoDate
  amountCents: number
  /** null si todavia no se pago. */
  paidDate: IsoDate | null
}
```

Las fechas van como texto ISO y no como `Date`. Un `Date` arrastra zona horaria y hora, y
las dos cosas meten errores de un dia en los calculos de mora. El dominio trabaja en dias
calendario.

## 4. Saldo

`balance.ts`:

```ts
/** Saldo acumulado de todos los movimientos. */
export function balanceFrom(movements: Movement[]): number

/**
 * Saldo al cierre de cada dia del periodo, incluidos los dos extremos.
 * Devuelve un numero por dia.
 */
export function dailyBalances(movements: Movement[], from: IsoDate, to: IsoDate): number[]

/** Compara el saldo cacheado contra el historial. */
export function verifyBalance(
  movements: Movement[],
  cachedCents: number,
): { expectedCents: number; cachedCents: number; matches: boolean }
```

`dailyBalances` arranca del saldo que exista **antes** de `from`: los movimientos
anteriores al periodo cuentan para el saldo inicial aunque no esten en el periodo.

`verifyBalance` es la prueba que evita descuadres silenciosos. `sales.balance_cents` es un
cache y hay que poder demostrarlo en cualquier momento.

## 5. Intereses

`accrual.ts`:

```ts
export type AccrualInput = {
  movements: Movement[]
  periodStart: IsoDate
  periodEnd: IsoDate
  /** Tasa mensual en puntos base. 5% mensual = 500. */
  monthlyRateBp: number
}

export function accrueInterest(input: AccrualInput): number
```

Politica, de [MODELO-CREDITO.md](MODELO-CREDITO.md) seccion 2:

- Interes **simple** sobre saldo diario. El interes no genera interes.
- Tasa diaria = tasa mensual / 30. Dias calendario.
- **Un solo redondeo, al final.** El devengo diario no se redondea.

```
interes = divideRoundHalfUp(suma(saldos diarios) * monthlyRateBp, 30 * 10000)
```

Un saldo negativo en un dia (el cliente pago de mas) **no genera interes a favor**: ese
dia aporta cero a la suma, no un numero negativo.

### Mora

```ts
export type LateFeeInput = {
  installments: Installment[]
  periodStart: IsoDate
  periodEnd: IsoDate
  lateRateBp: number
  graceDays: number
}

export function accrueLateFee(input: LateFeeInput): number
```

Solo sobre la porcion vencida pasados los dias de gracia, con el mismo metodo de devengo y
el mismo redondeo.

## 6. Estado

`status.ts`:

```ts
export function accountStatus(args: {
  balanceCents: number
  installments: Installment[]
  graceDays: number
  asOf: IsoDate
}): AccountStatus
```

| Estado    | Condicion                                                     |
| --------- | ------------------------------------------------------------- |
| `NO_DEBT` | saldo igual a cero                                            |
| `CURRENT` | saldo mayor que cero y ninguna cuota vencida pasada la gracia |
| `OVERDUE` | al menos una cuota vencida pasada la gracia                   |

Derivado, nunca almacenado: depende de la fecha de hoy y un valor guardado quedaria viejo.
Por eso `asOf` entra como argumento.

## 7. Puntaje

`scoring.ts`:

```ts
export type ScoreInput = {
  installments: Installment[]
  currentBalanceCents: number
  /** null si el negocio no fijo limite. */
  creditLimitCents: number | null
  firstSaleDate: IsoDate | null
  salesLast12Months: number
  asOf: IsoDate
}

export type ScoreBreakdown = {
  punctuality: number
  debtRatio: number
  tenure: number
  frequency: number
}

export function creditScore(input: ScoreInput): { score: number; breakdown: ScoreBreakdown }
```

Pesos, de [PLAN.md](PLAN.md) Fase 0: puntualidad 40, ratio de deuda 30, antiguedad 20,
frecuencia 10.

### Puntualidad (40)

Por cada cuota, un factor de 0 a 1 segun los dias de atraso. Una cuota sin pagar usa su
atraso **al dia de `asOf`**.

| Dias de atraso      | Factor |
| ------------------- | ------ |
| 0 o pago adelantado | 1      |
| 1 a 7               | 0,7    |
| 8 a 30              | 0,3    |
| mas de 30           | 0      |

Promedio de los factores, por el peso. Sin cuotas todavia, este factor no se puede
calcular: ver la regla de renormalizacion.

### Ratio de deuda (30)

`1 - saldo / limite`, acotado entre 0 y 1.

Sin limite fijado no se puede calcular: renormaliza.

### Antiguedad (20)

Meses desde la primera venta, con tope en 24. `min(meses, 24) / 24`.

Sin primera venta, no se puede calcular.

### Frecuencia (10)

Ventas en los ultimos 12 meses, con tope en 12. `min(ventas, 12) / 12`.

### Renormalizacion

Un factor que **no se puede calcular** se saca del promedio y los pesos restantes se
reparten proporcionalmente. No se cuenta como cero.

Un cliente nuevo sin limite fijado sacaria 0 de 100 con la regla ingenua, y ese numero
seria mentira: no es que pague mal, es que no hay informacion. Con renormalizacion, un
cliente sin historial solo se puntua por lo que si se sabe.

Si no se puede calcular ninguno, el puntaje es `null`... **no**: la firma devuelve
`number`. En ese caso devolver `score: 0` con todo el desglose en cero **y documentarlo**,
o cambiar la firma a `number | null`. **Decidilo vos al implementar y dejalo escrito en un
comentario**, pero que la interfaz no muestre "0" como si fuera un mal puntaje.

### La invariante del desglose

**`breakdown` tiene que sumar exactamente `score`.** Siempre.

Para lograrlo: redondear cada factor primero, y que `score` sea la suma de las partes ya
redondeadas. Nunca al reves.

Es el requisito de que el puntaje se pueda explicar y defender. Si la suma no da, la
explicacion es falsa.

## 8. Pruebas

Son la mitad del trabajo, no un extra. Vitest ya esta instalado.

**Aritmetica**

- `divideRoundHalfUp` con casos exactos, medio exacto hacia arriba, y negativos.
- `verifyBalance` da `matches: true` cuando el cache coincide y `false` cuando no.
- Un abono mas su reversion deja el saldo como estaba.

**Intereses**

- Tasa cero no genera cargo nunca, con cualquier saldo.
- Saldo cero todo el periodo no genera cargo, con cualquier tasa.
- Un periodo partido en dos mitades suma lo mismo que el periodo entero, o difiere a lo
  sumo en un centavo por el redondeo. **Elegi cual de las dos y sostenela en todas las
  pruebas.**
- Un dia con saldo negativo aporta cero, no negativo.

**Estado**

- Los tres estados, con cuotas justo en el borde de los dias de gracia.
- Una cuota que vence hoy con gracia cero todavia no esta en mora.

**Puntaje**

- Pagos puntuales, atrasos de 1, 7 y 30 dias, abonos parciales.
- Cliente nuevo sin historial.
- Cliente sin limite de credito fijado.
- `breakdown` suma `score`, en todos los casos anteriores.
- El puntaje nunca sale de 0 a 100.

**La prueba del dia de atraso.** Una cuota que vence el 1 y se paga el 2 es **un** dia de
atraso. Los errores de mas o menos un dia son el bug clasico de este dominio y tienen que
tener su prueba explicita.

## 9. Lo que NO entra

- No se conecta a Supabase. El que llama trae los datos.
- No se escribe en la base. El que llama persiste.
- No se tocan las pantallas. Conectar el motor a la interfaz es otro bloque.
- No se escribe el oraculo Python todavia. Va despues y lo escribe otra persona, desde
  `MODELO-CREDITO.md` y **sin mirar este codigo**.

## 10. Orden

1. `types.ts` y `money.ts`, con sus pruebas.
2. `balance.ts`, con sus pruebas.
3. `accrual.ts`, con sus pruebas.
4. `status.ts`, con sus pruebas.
5. `scoring.ts`, con sus pruebas.
6. `index.ts` con la superficie publica.

Un commit por archivo con su prueba. Nunca un commit con codigo sin probar.

## 11. Terminado cuando

1. `pnpm test` pasa, con todos los casos de la seccion 8.
2. `pnpm typecheck` y `pnpm lint` limpios.
3. `grep -rE "new Date\(\)|Date\.now\(\)|from \"@/lib/supabase" src/lib/credit/` no devuelve
   nada.
4. `src/lib/credit/` no importa ningun paquete de npm.
5. Cada decision de redondeo y cada tope tiene un comentario que dice por que.
