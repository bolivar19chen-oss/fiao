-- Cierra tres columnas que el diseno asume que solo escribe una funcion, y que hoy
-- cualquier miembro del negocio puede escribir a mano por REST.
--
-- El aislamiento ENTRE tiendas estaba bien: ninguna politica deja leer datos de otro
-- negocio. Lo que faltaba son las invariantes DENTRO del negocio. Un `for all` filtrado
-- por business_id es correcto para lo primero y demasiado grueso para lo segundo.
--
-- Postgres no deja quitar un privilegio de columna a quien tiene el de tabla: hay que
-- revocar el UPDATE entero y volver a conceder solo las columnas que si se editan.

-- ---------------------------------------------------------------------------
-- 1. customers.user_id y customers.credit_score
-- ---------------------------------------------------------------------------
--
-- `user_id` es lo que ata una fila de customers a una cuenta, y por tanto lo que decide
-- que ve el cliente en /me. La regla escrita en 20261016200000 es "el negocio invita, el
-- cliente canjea, nunca al reves", y `redeem_customer_invite` la implementa con cuidado.
-- Pero la regla no se aplicaba: bastaba un INSERT con el user_id puesto para saltarse la
-- invitacion entera y colgarle una deuda a cualquiera cuyo uid se conozca. Y los uid de
-- los clientes son legibles para su propio negocio en customer_invites.redeemed_by.
--
-- `credit_score` lo escribe el motor de puntaje. Hoy /me lo recalcula y lo ignora, asi
-- que el impacto es nulo; se cierra ahora porque el dia que el puntaje sea portable
-- entre tiendas, un negocio podria inflar o hundir el de un cliente a mano.
--
-- redeem_customer_invite es `security definer` y su dueno es `postgres`, asi que sigue
-- escribiendo las dos columnas sin enterarse de esto.
revoke update on public.customers from authenticated;
grant update (name, phone, notes) on public.customers to authenticated;
revoke insert on public.customers from authenticated;
grant insert (business_id, name, phone, notes) on public.customers to authenticated;

-- ---------------------------------------------------------------------------
-- 2. sales.balance_cents
-- ---------------------------------------------------------------------------
--
-- `payments` ya estaba blindada: solo SELECT, porque "un abono insertado a mano dejaria
-- el saldo desincronizado". Pero el candado estaba en la puerta equivocada. `sales` era
-- `for all`, asi que el saldo se podia poner en cero directamente:
--
--   PATCH /rest/v1/sales?id=eq.<uuid>  {"balance_cents": 0}
--
-- Sin fila en payments y sin rastro. No hacia falta ser owner: is_member incluye staff,
-- o sea el dependiente que tambien compra fiado en la tienda.
--
-- Una venta no se edita: se registra y se abona. Por eso no se vuelve a conceder ningun
-- UPDATE. register_payment es `security definer` y sigue moviendo el saldo.
revoke update on public.sales from authenticated;

-- ---------------------------------------------------------------------------
-- 3. Borrar una venta pasa a ser cosa del owner
-- ---------------------------------------------------------------------------
--
-- Cerrado el saldo, borrar la venta era la otra forma de hacer desaparecer una deuda.
-- La FK de payments es `on delete restrict`, asi que una venta con abonos ya no se podia
-- borrar; una sin abonos, si. Se separa `sales_all` por operacion para que el DELETE
-- exija owner. Lectura, alta y el resto siguen siendo de cualquier miembro.
drop policy sales_all on public.sales;

create policy sales_select on public.sales
  for select to authenticated using (public.is_member(business_id));
create policy sales_insert on public.sales
  for insert to authenticated with check (public.is_member(business_id));
create policy sales_delete on public.sales
  for delete to authenticated using (public.is_owner(business_id));

-- ---------------------------------------------------------------------------
-- 4. El cliente necesita el nombre de la tienda que le fio
-- ---------------------------------------------------------------------------
--
-- `businesses_select` es `using (public.is_member(id))` y un cliente NO es miembro, asi
-- que el join embebido de /me devolvia null y la pantalla mostraba "Shop" en vez del
-- nombre. Abrir la fila entera no sirve: businesses tiene ruc, representante legal y
-- direccion, que no son asunto del cliente.
--
-- Una funcion que devuelve solo (business_id, name) de las tiendas a las que el que
-- llama esta vinculado. `security definer` para poder leer businesses, con el filtro por
-- auth.uid() dentro: no acepta parametros, asi que no hay nada que manipular desde fuera.
create function public.my_shop_names()
returns table (business_id uuid, name text)
language sql
security definer
set search_path = ''
stable
as $$
  select b.id, b.name
  from public.businesses b
  join public.customers c on c.business_id = b.id
  where c.user_id = (select auth.uid());
$$;

revoke all on function public.my_shop_names() from public, anon;
grant execute on function public.my_shop_names() to authenticated;

comment on function public.my_shop_names() is
  'Nombre de las tiendas a las que el usuario actual esta vinculado como cliente. Devuelve solo id y nombre: el resto de businesses no es asunto suyo.';
