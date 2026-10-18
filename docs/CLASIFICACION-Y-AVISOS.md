# FIA'O - Clasificacion automatica y aviso diario

La idea: que el dueno no mueva a nadie de carpeta a mano. Si hay que arrastrar clientes
entre carpetas, volvimos al cuaderno, solo que en pantalla.

Reglas del credito en [MODELO-CREDITO.md](MODELO-CREDITO.md). Estado del dashboard en
[FASE-3-DASHBOARD.md](FASE-3-DASHBOARD.md).

## 1. Lo que ya existe

Buena parte del algoritmo esta escrito y probado. El motor
([src/lib/credit/](../src/lib/credit)) ya sabe:

| Pregunta                                  | Quien la responde    |
| ----------------------------------------- | -------------------- |
| Que cuota se pago y en que fecha          | `settleInstallments` |
| Cuanto debe hoy                           | `balanceFrom`        |
| Esta al dia o en mora                     | `accountStatus`      |
| Que tan puntual es, con su desglose       | `creditScore`        |
| En que banda cae: bueno, regular, vigilar | `scoreBand`          |

**Las carpetas son una vista, no una tabla.** Se calculan en cada carga a partir del
estado y la banda. Por eso nunca quedan viejas y nadie las mantiene: el cliente cambia de
carpeta solo, el dia que se atrasa o que se pone al dia. Eso ya funciona.

## 2. Lo que falta: el aviso

Lo que no existe es la parte que **avisa**. Hoy el dueno tiene que abrir la aplicacion
para enterarse.

Lo que pidio el equipo: un resumen diario que diga quienes pagaron el dia acordado y
quienes quedaron debiendo, que llegue solo y quede archivado.

### Forma

Un trabajo que corre una vez al dia por negocio, despues del cierre, y que para cada
cliente compara el dia acordado con lo que efectivamente entro:

| Resultado      | Condicion                                              |
| -------------- | ------------------------------------------------------ |
| Pago puntual   | Cuota con vencimiento de ayer, saldada ese dia o antes |
| Pago tarde     | Cuota saldada, pero despues de su vencimiento          |
| Quedo debiendo | Cuota vencida ayer y sin saldar                        |
| Abono parcial  | Entro dinero pero no alcanzo a cubrir la cuota         |

El resumen se guarda y se envia. **Se guarda ademas de enviarse:** un correo se pierde,
y el dueno tiene que poder abrir el de hace tres semanas.

### Lo que hay que construir

1. **Tabla `daily_digests`**: `business_id`, `digest_date`, el resumen, `sent_at`.
   `unique (business_id, digest_date)`: si el trabajo corre dos veces el mismo dia, no
   duplica nada. Es la misma regla de idempotencia que ya protege a los abonos.
2. **La funcion que lo arma**, en SQL o en una Edge Function que use el motor. Si usa el
   motor, el calculo queda en un solo lugar y el oraculo Python ya lo verifica.
3. **El disparador.** `pg_cron` en Supabase, una vez al dia por negocio, a una hora que
   dependa de su dia de corte.
4. **El canal.** Correo primero, que es lo que el PLAN.md ya contempla. WhatsApp despues:
   es el canal que de verdad usa el publico, y tiene su propio costo y su propia
   aprobacion de plantillas.
5. **La pantalla del archivo**: una lista de resumenes por fecha, abribles.

### Lo que lo bloquea hoy

- **Los dias de gracia.** "Quedo debiendo" necesita saber cuantos dias de gracia da el
  negocio. Esa columna entra con la migracion de intereses
  ([MODELO-CREDITO.md](MODELO-CREDITO.md) seccion 5). Sin eso, el aviso marcaria en mora a
  alguien que todavia esta en termino.
- **No hay ventas cargadas.** Sin el flujo de venta a credito desde la interfaz no hay
  cuotas que vencer, asi que el trabajo no tendria nada que resumir.
- **No hay remitente de correo configurado.**

## 3. Lo que NO hay que hacer

**No guardar el estado ni la banda en una columna.** Dependen de que dia es hoy: una
columna obliga a un trabajo que la refresque y a vivir con que quede vieja entre corrida
y corrida. El resumen diario se guarda porque es un hecho del pasado; el estado de hoy se
calcula.

**No dejar que el aviso decida.** El resumen informa; quien decide si le sigue fiando a
alguien es el dueno, que conoce a su gente. Por eso la banda baja se llama "watch" y no
"malo": nombra que hacer, no juzga a la persona.

**No mandar el aviso desde el navegador.** Corre del lado del servidor, con su propio
horario. Un navegador abierto no es un disparador.
