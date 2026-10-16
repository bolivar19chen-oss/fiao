# FIA'O - El cuerpo de la aplicacion

Lo que ve el usuario despues del login. Amplia el mapa de rutas de
[FASE-2-ESTRUCTURA.md](FASE-2-ESTRUCTURA.md) con dos tipos de usuario, pagos, ajustes y
tema.

Tres decisiones nuevas estan marcadas **DECIDIR**. Ninguna se construye hasta resolverla.

## 1. Dos tipos de usuario

Hoy el schema tiene una sola clase de persona con cuenta: el miembro de un negocio.
`customers` son filas sin acceso. Que el cliente entre a ver su deuda cambia eso.

### El fork del onboarding

Despues del primer registro, una sola pregunta, a pantalla completa y sin barra lateral:

> **How will you use FIA'O?**
> **I run a business** - Track inventory, credit sales and customer payments.
> **I'm a customer** - See what I owe and pay it.

- Negocio -> `create_business(name)` -> `/app`
- Cliente -> canjear invitacion -> `/me`

La eleccion no es para siempre: un dueno de super tambien compra fiado en otro lado. Un
mismo usuario puede tener ambos roles. Lo que decide que ve al entrar es si tiene negocio,
clientes vinculados, o los dos, y en ese caso se le ofrece elegir.

### Como se vincula un cliente a su libreta

**El negocio invita. El cliente nunca se auto-reclama.**

Si un cliente pudiera escribir su telefono y quedarse con esa cuenta, cualquiera podria
apropiarse del historial de otro. Es toma de cuenta pura.

El flujo: el negocio abre la ficha del cliente, genera una invitacion (codigo corto o QR
que se muestra en el mostrador), el cliente se registra y la canjea. Recien ahi
`customers.user_id` queda escrito.

**DECIDIR (ADR 0006):** cuentas de cliente. Arrastra:

- `customers.user_id uuid references auth.users (id)`, nulo hasta que se canjea.
- Tabla `customer_invites` con codigo, vencimiento y un solo uso.
- Politicas RLS nuevas: un cliente lee **sus** ventas, cuotas y abonos en cualquier
  negocio, y nada mas. Es una superficie de seguridad nueva y hay que probarla con tres
  cuentas: dos clientes y un negocio.
- No contradice el [ADR 0002](adr/0002-credito-por-tienda.md): el credito sigue siendo por
  tienda. El cliente ve sus cuentas, una por negocio, sin saldo unificado ni puntaje
  nacional.

## 2. El lado del negocio

### Dashboard (`/app`)

Lo primero que se lee, en este orden.

**Figura principal:** la cartera total. Un solo numero grande, porque es la pregunta que
el dueno se hace al abrir. No es un grafico.

**Fila de indicadores**, cuatro fichas con valor y variacion:

| Ficha | Que dice |
|---|---|
| Outstanding | Cartera total por cobrar |
| Overdue | Cuanto esta en mora |
| Due this week | Lo que vence en siete dias |
| Customers with debt | Cuantos deben |

**Hoy:** lista corta de cobros del dia y clientes que acaban de entrar en mora. Accionable,
no decorativa: cada fila lleva a registrar el abono.

### Graficos

Cuatro, no mas. Cada uno tiene un trabajo distinto; si dos cuentan lo mismo, sobra uno.

| Grafico | Forma | Por que esa |
|---|---|---|
| Cartera por estado | Barra apilada horizontal | Es parte-de-un-todo con tres clases. **Nunca una torta** |
| Cobros de la semana | Columnas por dia | Comparar magnitud entre siete dias |
| Evolucion de la cartera | Linea, una sola serie | Tendencia en el tiempo |
| Top deudores | Barras horizontales | Comparar magnitud con nombres largos |

Reglas que no se negocian:

- **Al dia / por vencer / en mora son estados, no series.** Van con los colores de estado
  (bien / advertencia / grave), que quedan reservados para eso y no se reutilizan nunca
  para "la serie 4". Siempre con etiqueta e icono, jamas solo color.
- **Un solo eje.** Nada de dos escalas en el mismo grafico. Dos medidas distintas son dos
  graficos.
- **Nada de torta ni dona.** Barra apilada horizontal para parte-de-un-todo.
- Dos series o mas llevan leyenda siempre; hasta cuatro, ademas etiqueta directa.
- Texto en tinta, nunca del color de la serie.
- Cada grafico tiene su vista de tabla. Es accesibilidad y ademas sirve para exportar.
- La paleta se valida antes de usarse, con el script de la guia de visualizacion. No se
  decide a ojo si dos colores se distinguen con daltonismo.

### El resto del negocio

Las rutas ya estan en [FASE-2-ESTRUCTURA.md](FASE-2-ESTRUCTURA.md) seccion 4: clientes,
inventario, ventas, reportes y ajustes.

## 3. El lado del cliente

Una aplicacion mucho mas chica. El cliente entra a saber cuanto debe y a pagar.

| Ruta | Pantalla |
|---|---|
| `/me` | Mis cuentas: una tarjeta por negocio donde tengo credito, con saldo y proximo vencimiento |
| `/me/[businessId]` | Estado de cuenta en ese negocio: compras, abonos, cuotas, mi puntaje en **esa** tienda |
| `/me/[businessId]/pay` | Pagar |
| `/me/settings` | Mis datos, contrasena, tema |

El puntaje se muestra con su desglose: puntualidad, deuda, antiguedad, frecuencia. Si el
cliente no entiende por que tiene 72, el numero no sirve para nada.

## 4. Pagos

**Aca esta el riesgo real del proyecto, y no es tecnico.**

### La linea que no se cruza

Si el dinero del cliente pasa por una cuenta de FIA'O y despues llega al negocio, FIA'O
esta custodiando fondos de terceros. Eso es transmision de dinero y es una actividad
regulada que exige licencia. Un proyecto estudiantil no puede hacerlo, y un producto
tampoco sin habilitarse.

**El diseno correcto: el dinero nunca toca FIA'O.** Va directo del cliente a la cuenta de
comercio del negocio. FIA'O orquesta y registra. Asi es software, no institucion
financiera. Es ademas como funciona cualquier SaaS que cobra por cuenta de sus clientes.

### Los tres medios

| Medio | Como funciona | Que mueve el dinero |
|---|---|---|
| **Presencial** | El negocio registra el abono en efectivo | Nada. Solo se anota |
| **Yappy** | El cliente paga al comercio; la app refleja y concilia | Yappy, entre cliente y negocio |
| **Tarjeta** | Campos alojados por la pasarela, dentro de la app | La pasarela, a la cuenta del negocio |

**La tarjeta, en una regla:** el numero no toca nunca tu servidor ni tu base de datos.
Se usan los campos alojados o el redireccionamiento de la pasarela, y vos guardas
unicamente el identificador que te devuelven. Guardar un numero de tarjeta te mete en
cumplimiento PCI, que es un mundo entero y no es donde queres estar.

La pantalla de tarjeta se ve como una tarjeta de verdad, con la marca y los ultimos cuatro
digitos, pero ese dibujo es presentacion: lo que hay guardado es un token de la pasarela.

**Yappy:** Banco General tiene un producto para comercios. Hay que **verificar la
integracion real** antes de disenar contra ella: que expone, como confirma el pago, si hay
webhook. No se escribe una linea asumiendo como funciona.

**DECIDIR (ADR 0007):** pagos a distancia. Hasta resolverlo, la Fase 2 y 3 construyen solo
el registro de abonos presenciales, que no depende de nadie.

Mi recomendacion: el MVP registra, no cobra. Es legal, se termina, y se demuestra. La
pasarela entra despues, con un negocio real que ya tenga su cuenta de comercio.

### Idempotencia, otra vez

Un pago en linea que se confirma dos veces por un reintento de webhook es un abono
duplicado. El `client_token` de [MODELO-CREDITO.md](MODELO-CREDITO.md) seccion 3 cubre
tambien este caso: el identificador de la transaccion de la pasarela es la clave.

## 5. Ajustes y cuenta

`/app/settings` y `/me/settings`, con las mismas secciones donde aplica.

**Profile:** nombre, telefono, correo. Cambiar el correo exige confirmar en la casilla
nueva.

**Password:** contrasena actual, nueva, repetir. Supabase pide sesion reciente para
cambiarla; si la sesion esta vieja, se re-autentica antes. Cerrar las demas sesiones es
una opcion aparte.

**Appearance:** tema claro, oscuro o el del sistema.

**Business** (solo negocio, solo rol owner): nombre, tasa mensual, tasa de mora, dia de
corte, dias de gracia, miembros del equipo. Las tasas dependen del schema de intereses, que
es de otra fase.

**Danger zone:** cerrar la cuenta. Un negocio con cartera abierta no se puede cerrar: hay
deuda de terceros registrada. Se avisa y se bloquea.

## 6. Tema claro y oscuro

Hoy [DISENO.md](DISENO.md) define fondo blanco, color de marca como luz difusa y
superficies de cristal. El modo oscuro no es invertir eso.

- **Se elige, no se calcula.** Cada color del modo oscuro se define y se valida contra el
  fondo oscuro. Un filtro de inversion automatica produce colores sucios y contraste malo.
- **El fondo oscuro sale del marron de marca (`#482d1f`), no del negro puro.** Negro puro
  con cristal encima se ve barato y pierde la identidad.
- **El rojo `#b91c1c` no sirve para texto sobre oscuro:** no llega al contraste minimo.
  Hace falta un paso mas claro del mismo rojo para texto y bordes en modo oscuro. Como
  relleno de un boton sigue funcionando.
- La aurora se mantiene, mas tenue. Sin luz detras, el cristal no existe.
- Los colores de estado se re-eligen para oscuro, no se reciclan.
- Se respeta `prefers-color-scheme` por defecto y la eleccion explicita del usuario manda.
- Nada de parpadeo al cargar: el tema se aplica antes del primer pintado.

## 7. Orden

1. Fase 2 tal como esta escrita: auth, rutas, pantallas del negocio. No se toca.
2. Tema claro y oscuro. Es de diseno, no arrastra schema, y conviene antes de construir
   muchas pantallas.
3. ADR 0006 y las cuentas de cliente, con sus politicas RLS y el flujo de invitacion.
4. El lado del cliente, `/me`.
5. ADR 0007 y pagos a distancia, al final, cuando haya un negocio real con cuenta de
   comercio.

El registro de abonos presenciales no espera a nada de esto: es parte del nucleo.
