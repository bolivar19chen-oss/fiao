# ADR 0009 - Los terminos del credito los pone la tienda

Fecha: 2026-10-20. Estado: aceptado.

## Contexto

Al construir la venta a credito hay que decidir quien fija la tasa de interes, el recargo
por mora, cuantas cuotas hay y cada cuanto vencen.

Habia dos caminos: que FIA'O traiga unos valores por defecto y el negocio los acepte, o
que cada negocio ponga los suyos.

La diferencia no es de interfaz. Es la misma pregunta que resolvio
[ADR 0007](0007-pagos-sin-custodia.md) con el dinero, aplicada ahora a las condiciones.

## Decision

**La tienda fija sus propios terminos. FIA'O no trae ninguno.**

Los valores por defecto son cero: un negocio que no cobra intereses es un caso valido, y
es el mas comun en una tienda de barrio. Cero no es "sin configurar", es una respuesta.

### Por que

Si FIA'O sugiriera una tasa, estaria opinando sobre el precio del credito de otro. Eso
convierte al software en parte del contrato:

- **Deja de ser un puente.** FIA'O registra lo que la tienda y su cliente acordaron. No
  es prestamista, no es intermediario financiero y no quiere serlo (ADR 0007).
- **Las condiciones del credito son materia regulada.** Tasas maximas, informacion
  obligatoria al deudor, recargos permitidos: eso cambia por pais y cambia con el tiempo.
  Un software que las propone asume una responsabilidad que no le toca y que no puede
  mantener al dia.
- **El que responde es el que cobra.** Si manana un cliente reclama una tasa, la discusion
  es con la tienda, que fue quien la puso, no con la herramienta donde quedo anotada.

### Donde viven

En `businesses`, como ya especifica [MODELO-CREDITO.md](../MODELO-CREDITO.md) seccion 5:
`monthly_rate_bp`, `late_rate_bp`, `cutoff_day`, `grace_days`. En puntos base y no en
decimales, porque el dinero de este proyecto es entero y las tasas tambien: 150 es 1.50%
mensual y no hay forma de que se cuele un float.

El limite de credito es por cliente (`customers.credit_limit_cents`), porque no es una
condicion del negocio sino una decision sobre esa persona.

### Lo que FIA'O si hace

- **Ensena los terminos antes de guardar la venta,** en palabras, con el total y el
  calendario resueltos. El cliente firma sabiendo que firma.
- **Los congela en la venta.** Si la tienda sube la tasa manana, las ventas de hoy
  mantienen la de hoy. Un cambio de tarifa no reescribe deudas ya contraidas.
- **Pone topes de cordura en el schema,** no topes legales: `cutoff_day` entre 1 y 28
  (los meses cortos), tasas no negativas. Son para atajar un dedo gordo, no para hacer
  cumplir una ley que FIA'O no conoce.

### Lo que FIA'O no hace

**No valida que la tasa sea legal.** No hay una tabla de topes por pais y no la va a
haber: estaria desactualizada el dia que se escriba, y acertar a medias en esto es peor
que no intentarlo. La interfaz lo dice donde se configura.

## Consecuencias

- Hay una pantalla de terminos en los ajustes del negocio, y entrar a ella es parte de la
  puesta en marcha. Un negocio sin terminos configurados vende sin intereses, que es un
  resultado correcto y no un error.
- La venta guarda los terminos aplicados. Eso duplica dato a proposito: es la unica forma
  de que el historial siga cuadrando despues de un cambio de tarifa.
- Los textos legales (contrato, aviso al deudor) son del negocio, no de FIA'O. Si alguna
  vez se ofrecen plantillas, van como plantillas suyas y revisadas por un abogado, nunca
  como el texto por defecto del producto.
