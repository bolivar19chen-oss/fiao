# ADR 0006 - Cuentas de cliente por invitacion

Fecha: 2026-10-16. Estado: aceptado.

## Contexto

Hasta ahora el sistema tiene una sola clase de persona con cuenta: el miembro de un
negocio, en `business_members`. Los clientes son filas en `customers`, sin acceso.

El producto necesita que el cliente entre: ver cuanto debe, su historial y su puntaje en
cada tienda donde compra fiado. Eso agrega un segundo tipo de usuario y una superficie de
seguridad nueva.

La pregunta que decide el diseno es como se vincula una cuenta recien creada con la fila
que ya existe en la libreta de un negocio.

## Decision

Los clientes tienen cuenta. **El negocio invita; el cliente canjea. Nunca al reves.**

Si un cliente pudiera escribir su telefono o su nombre y quedarse con esa cuenta,
cualquiera podria apropiarse del historial crediticio de otra persona. Es toma de cuenta
directa, y en datos de deuda es grave. El negocio es el unico que sabe quien es quien, y
por eso es el unico que puede vincular.

### Flujo

1. El negocio abre la ficha del cliente y genera una invitacion. Se muestra en el
   mostrador como codigo corto o QR.
2. El cliente se registra con su correo y canjea el codigo.
3. Recien ahi se escribe `customers.user_id`.

La invitacion es de un solo uso y vence. Una vencida no se reusa: se genera otra.

### Un usuario puede ser las dos cosas

Un dueno de super tambien compra fiado en otro lado. El rol no se guarda en el usuario: se
deriva de lo que tiene. Con negocio, ve `/app`. Con filas de cliente vinculadas, ve `/me`.
Con ambos, elige.

La pregunta del onboarding es para saber a donde mandarlo la primera vez, no para
etiquetarlo para siempre.

### No contradice el ADR 0002

El credito sigue siendo [por tienda](0002-credito-por-tienda.md). Un cliente que debe en
tres negocios ve tres cuentas separadas, cada una con su saldo y su puntaje. No hay saldo
unificado ni puntaje nacional, porque eso seria un buro y esta descartado.

## Cambios de schema

Migracion nueva. No se toca la existente.

**`customers`**

- `user_id uuid references auth.users (id) on delete set null`, nulo hasta canjear.
- `unique (user_id, business_id)`: una persona es un solo cliente por negocio.

`on delete set null`, no `cascade`: si el cliente borra su cuenta de FIA'O, su deuda con el
negocio no desaparece. Son cosas distintas.

**`customer_invites`** (nueva)

- `id`, `business_id`, `customer_id`
- `code text not null`, con `unique (business_id, code)`
- `expires_at timestamptz not null`
- `redeemed_at timestamptz`, `redeemed_by uuid references auth.users (id)`
- El codigo se guarda hasheado, no en claro. Es una credencial de acceso a datos
  financieros, no un numero de orden.

**Funciones de ayuda para RLS**

Las politicas actuales usan `public.is_member(business_id)`. El cliente no es miembro, asi
que hace falta el otro lado:

- `public.is_customer(customer_id uuid)`: la fila pertenece al usuario actual.
- `public.is_sale_customer(sale_id uuid)`: para `payments` e `installments`, que solo
  tienen `sale_id` y no `customer_id`.

Ambas `security definer` con `search_path` fijo y revocadas de `anon`, igual que las que
ya existen (ver `20261016175031_revoke_anon_helpers.sql`).

**Politicas**

Lectura del cliente sobre `customers`, `sales`, `sale_items`, `installments` y `payments`,
siempre acotada a sus propias filas. **Escritura, ninguna.** El cliente no registra abonos
ni modifica nada: eso lo hace el negocio o la pasarela. Lo unico que escribe es canjear su
invitacion, y eso pasa por una funcion, no por un `insert` directo.

## Consecuencias

- Superficie de seguridad nueva, y es la mas delicada del proyecto. **Se prueba con tres
  cuentas: dos clientes y un negocio.** Que el cliente A no vea nada de B, ni de otro
  negocio, ni escriba en ningun lado.
- Las rutas `/me` del [documento de la aplicacion](../APLICACION.md) seccion 3.
- `customers.credit_score` es reputacion en esa tienda. En la interfaz se llama "Store
  credit score", nunca "Credit score" a secas: no se promete lo que no es.
- Una invitacion vencida o ya canjeada falla igual y con el mismo mensaje. No se revela si
  el codigo existio.
