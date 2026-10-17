# FIA'O - Modelo de negocio

Quien paga, cuanto, por que, y que cuesta sostenerlo.

Los numeros de costo son estimaciones a verificar contra los precios vigentes; los de
mercado son supuestos a validar hablando con negocios reales. Estan marcados como tales.
Un modelo con numeros inventados presentados como ciertos es peor que ninguno.

## 1. Quien es el cliente

El que paga es **el negocio que fia**. Nunca el cliente que debe.

Cobrarle al deudor seria cobrarle a quien ya esta apretado, y convertiria a FIA'O en algo
que se parece a un cobrador. Mala idea de producto y peor de reputacion.

### El criterio, mas amplio que "mini super"

Cualquier negocio que **le venda repetidamente a gente que conoce y cobre despues**:

- Mini super, chinos, abarroterias
- Carnicerias, panaderias, verdulerias
- Farmacias de barrio
- Ferreterias
- **Repuestos de autos** (ver seccion 2)
- Talleres mecanicos
- Distribuidores que venden a tiendas

### El que vale mas y nadie mira: el distribuidor

Un distribuidor que le vende a cuarenta tiendas a credito tiene decenas de miles de
dolares en la calle. Un mini super tiene cientos.

|                    | Mini super | Distribuidor     |
| ------------------ | ---------- | ---------------- |
| Plata en la calle  | Cientos    | Decenas de miles |
| Clientes a credito | 20 a 40    | 30 a 100         |
| Dolor del desorden | Molestia   | Caro             |
| Cuantos hay        | Miles      | Pocos            |
| Facil de encontrar | No         | Si               |

Son menos, pagan mas, duelen mas y se los encuentra mas facil. Y hay un efecto de
arrastre: **sus tiendas entran al sistema sin venderles nada.**

No es el primer cliente, porque el producto todavia no esta. Es hacia donde mirar.

## 2. El primer negocio real: repuestos de autos usados

Es el negocio del papa de quien lleva el proyecto. Primer usuario real, con datos reales
y opinion sin cortesia. Vale mas que veinte usuarios de prueba.

### Que tiene de distinto

- **Cada pieza es unica.** Una puerta de un Corolla 2008, de ese color y ese estado. No
  son diez unidades de un mismo articulo.
- **El inventario llega por lote**, al desarmar un vehiculo entero.
- **La compatibilidad es el conocimiento del negocio:** que alternador sirve para que
  modelos. Hoy eso vive en la cabeza del dueno.
- **Ticket alto, volumen bajo.** Decenas o cientos de dolares por venta, pocas ventas al
  dia. Al reves que un mini super.
- **Las devoluciones son normales.** Una pieza usada puede fallar y volver.

### Quien compra a credito aca

**El mecanico, no el dueno del carro.** El taller compra la pieza para un trabajo, cobra a
su cliente, y despues le paga al local. Ese es el ciclo del fiado en este rubro. El
particular que entra de la calle casi siempre paga en efectivo.

Eso lo acerca al caso del distribuidor: clientes pocos, repetidos y de ticket alto.

### Lo que esto obliga a cambiar

**El modelo de inventario actual no le sirve.** `products` con `stock` y
`low_stock_threshold` esta pensado para articulos repetidos.

Lo que el credito necesita **no cambia**: ventas, cuotas, abonos, saldo y puntaje son
identicos en cualquier rubro. El sistema se parte en dos:

- **Motor de credito: universal.** Sirve igual en los siete rubros de arriba.
- **Inventario: por rubro.** Cambia segun que se vende.

Esto refuerza el orden del trabajo: el motor de credito primero, que es lo que no se
tira nunca.

La devolucion de una pieza ya esta resuelta: es un movimiento de reversion, que
[MODELO-CREDITO.md](MODELO-CREDITO.md) seccion 1 define. No hubo que inventar nada.

**Fuera de alcance por ahora:** buscar piezas por marca, modelo y ano. Es la funcion
estrella de este rubro y es un proyecto en si misma. Se nombra para no olvidarla, no para
construirla ahora.

## 3. Precio

**Una sola tarifa plana mensual por negocio.** Sin escalones.

Los escalones confunden al que compra y hoy no hay datos para disenarlos. Se agregan
cuando se sepa como usan el producto, no antes.

**Banda estimada, a validar:** entre 10 y 30 dolares al mes para un negocio de barrio;
entre 25 y 50 para uno de ticket alto como repuestos. Un distribuidor soporta mas.

### El periodo gratis

No treinta dias contados por calendario. **Gratis mientras tenga menos de N clientes a
credito** (20 como punto de partida).

El motivo: el dueno paga recien cuando se da cuenta de que ya no puede volver al cuaderno,
y eso toma mas de un mes de uso real. Un limite por tamano deja que llegue hasta ahi con
sus propios datos, sin reloj encima.

### Lo que nunca se cobra

- Al cliente que debe
- Por cantidad de transacciones: castiga justo al negocio al que mejor le va
- Comision sobre los pagos: eso exigiria tocar el dinero, y el
  [ADR 0007](adr/0007-pagos-sin-custodia.md) lo prohibe

## 4. Costos

Estimados, a verificar contra los precios vigentes de cada servicio.

| Concepto       | Estimado                                             |
| -------------- | ---------------------------------------------------- |
| Dominio `.com` | 12 a 15 al ano                                       |
| Vercel         | Gratis al arrancar; plan pago alrededor de 20 al mes |
| Supabase       | Gratis al arrancar; plan pago alrededor de 25 al mes |
| Respaldos      | Depende del plan; ver seccion 5                      |

**Punto de equilibrio: cuatro negocios pagando.** A 15 dolares cada uno cubren el piso de
infraestructura. Es un umbral bajisimo y conviene tenerlo presente: el proyecto no
necesita escala para sostenerse solo.

**El costo real no es la infraestructura, es el tiempo.** Vender, acompanar al que se
traba, y arreglar lo que falla. Eso no aparece en ninguna factura y es lo que limita
cuantos negocios se pueden atender.

### Orden de magnitud

| Negocios pagando | A 15 al mes              |
| ---------------- | ------------------------ |
| 4                | Cubre la infraestructura |
| 50               | 750 al mes               |
| 200              | 3.000 al mes             |

El margen sobre el costo de servidores es muy alto. El limite es cuantos negocios se
pueden conseguir y sostener, no cuanto cuesta correrlos.

## 5. Lo que hay que resolver antes del primer usuario real

Acordado: **esto va antes de la beta, no despues.**

1. **Respaldos con restauracion probada.** Si el negocio reemplaza el cuaderno por FIA'O y
   un dia se pierden los datos, se perdio la libreta de un negocio de verdad. No alcanza
   con que exista un respaldo: hay que haber restaurado uno al menos una vez.
2. **Datos personales.** Se guardan cedulas, telefonos e historial de deuda de vecinos.
   Hay marco legal en Panama y **hay que verificar el vigente** antes de abrir a gente
   que no sea del equipo.
3. **Borrar la cuenta y los datos.** Si alguien lo pide, tiene que haber una forma.
4. **Que se pueda exportar.** El dueno tiene que poder sacar su libreta del sistema. Es lo
   que hace que confiar no sea un riesgo, y es lo contrario de secuestrarle los datos.

El punto 1 es el que todo el mundo subestima y el unico que destruye la confianza de un
solo golpe.

## 6. Lo que todavia no esta decidido

- El precio exacto. Sale de hablar con negocios reales, no de esta tabla.
- Si el distribuidor se vuelve el foco, y cuando.
- La rama de reputacion compartida entre tiendas: el
  [ADR 0002](adr/0002-credito-por-tienda.md) la deja abierta con consentimiento explicito
  y revision legal previa. No antes de tener varias tiendas usandolo.
