# ADR 0007 - Pagos sin custodia de fondos

Fecha: 2026-10-16. Estado: aceptado.

## Contexto

El producto necesita tres formas de pagar el fiado: presencial en efectivo, Yappy, y
tarjeta a distancia.

La decision no es tecnica. Es donde para el dinero.

Si el pago del cliente entra a una cuenta de FIA'O y despues sale hacia el negocio, FIA'O
esta custodiando fondos de terceros. Eso es transmision de dinero, una actividad regulada
que exige licencia. No es algo que un proyecto estudiantil pueda hacer, y un producto
tampoco sin habilitarse primero.

## Decision

**El dinero nunca toca FIA'O.** Va directo del cliente a la cuenta de comercio del
negocio. FIA'O orquesta el cobro y registra el movimiento.

Asi FIA'O es software, no institucion financiera. Es ademas como funciona cualquier SaaS
que cobra por cuenta de sus clientes.

### Los tres medios

| Medio      | Quien mueve el dinero                | Que hace FIA'O             |
| ---------- | ------------------------------------ | -------------------------- |
| Presencial | Nadie, es efectivo en el local       | Registra el abono          |
| Yappy      | Yappy, cliente a negocio             | Inicia, concilia, registra |
| Tarjeta    | La pasarela, a la cuenta del negocio | Inicia, concilia, registra |

### Orden

**El MVP registra, no cobra.** Solo abonos presenciales, que no dependen de nadie externo.
Es legal, se termina, y se demuestra en la exposicion.

Los pagos a distancia entran despues, cuando haya un negocio real con cuenta de comercio
propia. Antes de eso no hay nada que integrar: una pasarela sin comercio del otro lado no
sirve.

### Tarjeta: la regla

**El numero de tarjeta no toca el servidor ni la base de datos.** Se usan los campos
alojados o el redireccionamiento de la pasarela, y se guarda solo el identificador que
ella devuelve.

Guardar un PAN mete al proyecto en cumplimiento PCI, que es un universo entero de
requisitos. No es donde queremos estar y no aporta nada al producto.

La tarjeta que se dibuja en la pantalla, con la marca y los ultimos cuatro digitos, es
presentacion. Lo guardado es un token.

### Yappy: verificar antes de disenar

Banco General tiene un producto para comercios. **Hay que leer su documentacion real antes
de escribir una linea contra ella:** que expone, como confirma el pago, si hay webhook y
con que garantias de entrega.

No se asume la forma de una API que no leimos. Es la regla de CONVENCIONES.md y aca importa mas
que en ningun otro lado, porque del otro lado hay plata.

## Cambios de schema

Sobre `payments`, en la misma migracion que los cambios de
[MODELO-CREDITO.md](../MODELO-CREDITO.md) seccion 5:

- `method text not null default 'cash' check (method in ('cash', 'yappy', 'card'))`
- `provider_ref text`, el identificador de la transaccion en la pasarela. Nulo en efectivo.
- `unique (business_id, provider_ref)` donde no sea nulo.

Ese ultimo indice es la idempotencia del lado remoto. Un webhook que se entrega dos veces
es un abono duplicado, y los webhooks **se entregan dos veces**: casi todas las pasarelas
garantizan "al menos una vez", no "exactamente una vez". El identificador de la
transaccion es la clave que lo frena, igual que `client_token` frena a la cola offline.

## Consecuencias

- Cada negocio necesita su propia cuenta de comercio. Eso es trabajo del dueno, no del
  software, y hay que decirlo claro en la interfaz al activar los pagos a distancia.
- **La aplicacion funciona con la pasarela caida.** Registrar ventas y abonos presenciales
  no depende de ella. Las pantallas se disenan para eso, no se asume que responde.
- Un pago remoto confirmado por webhook se registra del lado del servidor, nunca desde el
  navegador del cliente. El navegador puede mentir.
- El estado intermedio existe y hay que mostrarlo: el cliente ya pago en Yappy pero la
  confirmacion todavia no llego. Ni decirle que no pago, ni dar por saldada la deuda.
