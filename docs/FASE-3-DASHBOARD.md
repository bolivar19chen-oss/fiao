# Fase 3 - El cuerpo de la aplicacion

Estado del dashboard y lo que sigue. Las medidas estan en
[UI-DASHBOARD.md](UI-DASHBOARD.md), los colores en [DISENO.md](DISENO.md), la estructura
y el porque en [APLICACION.md](APLICACION.md).

## 1. Que quedo hecho

`src/app/(app)/app/page.tsx` y `src/components/app/charts.tsx`.

**Figura principal:** la cartera total, en Poppins 44px en telefono y 58px desde `sm`. Es
la pregunta que el dueno se hace al abrir, asi que va primera y sola, no como una ficha
mas entre otras.

**Fila de indicadores:** en mora, vence esta semana, cobrado esta semana.

**Tres graficos:**

| Grafico             | Forma                    | Por que esa                           |
| ------------------- | ------------------------ | ------------------------------------- |
| Cartera por estado  | Barra apilada horizontal | Parte-de-un-todo. **Nunca una torta** |
| Cobros de la semana | Columnas, una serie      | Comparar magnitud entre siete dias    |
| Top deudores        | Barras horizontales      | Nombres largos: en vertical no entran |

## 2. Decisiones que no hay que deshacer

**La barra de estado no usa Recharts.** Va con divs para que el separador entre segmentos
mida exactamente 2px a cualquier ancho. Un SVG estirado lo deforma. Los otros dos si usan
Recharts, porque ganan algo real: tooltip por dia y por deudor.

**Solo hay dos cubos de estado, no tres.** El motor devuelve `NO_DEBT`, `CURRENT` y
`OVERDUE`. "Por vencer" necesita los dias de gracia del negocio, que entran con la
migracion de intereses ([MODELO-CREDITO.md](MODELO-CREDITO.md) seccion 5). **No se inventa
esa regla en la pagina:** el estado lo decide el motor y nada mas. El tercer color
(`estado-por-vencer`) ya existe y esta validado, esperando.

**El estado sale de `customerAccount`, no de sumas sueltas.** La pagina trae filas y el
motor decide. Si aparece una regla de negocio nueva en una pagina, esta en el lugar
equivocado.

**Los colores de estado siempre llevan icono y etiqueta.** En modo oscuro el ambar y el
rojo no se separan lo suficiente para daltonismo dentro de la banda de luminosidad que
exige el fondo: la identidad no puede descansar en el color.

**El movimiento respeta `useReducedMotion`.** Con movimiento reducido las barras no se
animan. No es decoracion opcional: hay gente a la que el movimiento le marea.

## 3. Costo que se acepto a proposito

`/app` paso de 107 kB a 259 kB de JavaScript inicial. La diferencia es Recharts.

Se acepto porque el dueno del proyecto lo pidio: los graficos con hover valen mas que los
kilobytes. **Si alguna vez se revierte esa decision,** las dos formas que usan Recharts se
pueden rehacer con divs como la barra de estado, y el peso vuelve a donde estaba.

## 4. Lo que sigue, en orden

1. **Flujo de venta a credito desde la interfaz.** Hoy `/app/sales/new` es un contenedor.
   Sin esto el dashboard muestra ceros para siempre, porque no hay forma de cargar una
   venta sin SQL.
2. **Migracion de intereses** ([MODELO-CREDITO.md](MODELO-CREDITO.md) seccion 5): tasas,
   dias de gracia, limite de credito y cargos de interes. La idempotencia de `payments`
   ya existe en `20261018120000_payment_methods.sql`.
   Desbloquea el tercer cubo de estado y el calculo real de intereses.
3. **Registrar abonos: implementado** en la ficha de la venta, con accion y RPC. La
   verificacion del cobro real requiere una prueba especifica; ver INFORME-CODEX.md.
4. **La pantalla de reportes**, hoy vacia.
5. **Modo oscuro: implementado** mediante TEMA, variables CSS y ThemeToggle. No necesita
   clases `dark:`. Quedan colores manuales por centralizar; ver INVENTARIO.md.
6. **Completar el lado del cliente:** `/me` ya lista cuentas y saldos; faltan el detalle
   de movimientos y el puntaje por tienda. No hay ruta `/me/[businessId]`.

## 5. Como verificar que algo de esto funciona

No alcanza con que compile. Si un negocio no tiene ventas, el dashboard muestra ceros
y no dibuja graficos. Este documento no certifica cuantos registros hay hoy en la nube.

Para probarlo de verdad: registrarse como negocio, crear dos o tres clientes, y cargar
ventas con cuotas. Hasta que exista el flujo de venta (punto 1), eso se hace por SQL.

**Dos servidores de desarrollo a la vez rompen la pagina** (se queda sin CSS). `pnpm dev`
ya se niega a arrancar el segundo, y `pnpm build` escribe en `.next-build` para no pisar
al primero. Si aparece un 404 en `/_next/static/css`, es eso: cerrar todo, borrar `.next`
y levantar uno solo.
