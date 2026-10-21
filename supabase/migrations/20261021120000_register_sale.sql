-- La venta a credito, en una sola transaccion.
--
-- Una venta toca cuatro tablas: sales, sale_items, installments y el stock de products.
-- Cuatro llamadas de PostgREST no son atomicas: un fallo a la mitad deja inventario
-- descontado sin venta, o una venta sin calendario de cuotas. Por eso es una funcion,
-- igual que register_payment y por la misma razon.
--
-- **El reparto de las cuotas NO se calcula aqui.** Lo hace el motor en TypeScript
-- (src/lib/credit/schedule.ts) y llega ya resuelto. La funcion comprueba que cuadre con
-- el total antes de escribir nada: la aritmetica del dinero vive en un solo sitio
-- (ADR 0005) y esta funcion es la que garantiza que lo que se guarda es consistente.
--
-- Los precios NO se aceptan del cliente: se leen de products dentro de la transaccion,
-- con la fila bloqueada. Un navegador que mande su propio precio no cambia nada.

alter table public.sales
  -- Lo genera el dispositivo al registrar la venta. Es lo que hace que un doble toque,
  -- o el reintento de una conexion mala en el mostrador, deje una venta y no dos.
  add column client_token uuid not null default gen_random_uuid();

create unique index sales_client_token_idx on public.sales (business_id, client_token);

comment on column public.sales.client_token is
  'Identificador del intento, puesto por el dispositivo. Frena la venta duplicada.';

create function public.register_sale(
  p_customer_id uuid,
  p_items jsonb,
  p_installments jsonb,
  p_client_token uuid
)
returns uuid
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_customer public.customers;
  v_business public.businesses;
  v_sale_id uuid;
  v_total bigint := 0;
  v_scheduled bigint := 0;
  v_item jsonb;
  v_installment jsonb;
  v_product public.products;
  v_quantity integer;
  v_balance bigint;
begin
  -- El cliente decide el negocio, y el negocio decide si quien llama puede vender.
  select * into v_customer from public.customers where id = p_customer_id;
  if v_customer.id is null or not public.is_member(v_customer.business_id) then
    raise exception 'customer not found';
  end if;

  -- El reintento se responde con la venta que ya existe, sin descontar stock otra vez.
  select id into v_sale_id
  from public.sales
  where business_id = v_customer.business_id and client_token = p_client_token;
  if v_sale_id is not null then
    return v_sale_id;
  end if;

  if jsonb_array_length(coalesce(p_items, '[]'::jsonb)) = 0 then
    raise exception 'a sale needs at least one product';
  end if;
  if jsonb_array_length(coalesce(p_installments, '[]'::jsonb)) = 0 then
    raise exception 'a sale needs at least one installment';
  end if;

  select * into v_business from public.businesses where id = v_customer.business_id;

  -- Precio y stock salen de la base, nunca del navegador. `for update` sostiene la fila
  -- hasta el commit: dos ventas simultaneas del ultimo paquete no pueden pasar las dos.
  for v_item in select * from jsonb_array_elements(p_items) loop
    v_quantity := (v_item->>'quantity')::integer;

    select * into v_product
    from public.products
    where id = (v_item->>'product_id')::uuid
    for update;

    if v_product.id is null or v_product.business_id <> v_customer.business_id then
      raise exception 'product not found';
    end if;
    if v_quantity is null or v_quantity <= 0 then
      raise exception 'quantity must be positive';
    end if;
    if v_product.stock < v_quantity then
      raise exception 'not enough stock for %', v_product.name;
    end if;

    v_total := v_total + v_quantity * v_product.price_cents;
  end loop;

  if v_total <= 0 then
    raise exception 'the total must be positive';
  end if;

  -- Lo que el motor repartio tiene que sumar lo que la base calculo. Si no cuadra, algo
  -- se desincronizo entre el formulario y los precios, y es mejor no guardar nada.
  for v_installment in select * from jsonb_array_elements(p_installments) loop
    if (v_installment->>'amount_cents')::bigint <= 0 then
      raise exception 'every installment must be positive';
    end if;
    v_scheduled := v_scheduled + (v_installment->>'amount_cents')::bigint;
  end loop;

  if v_scheduled <> v_total then
    raise exception 'the installments add up to % but the sale is %', v_scheduled, v_total;
  end if;

  -- El limite es por cliente y lo decide la tienda (ADR 0009). Nulo = sin limite.
  if v_customer.credit_limit_cents is not null then
    select coalesce(sum(balance_cents), 0) into v_balance
    from public.sales
    where customer_id = p_customer_id;

    if v_balance + v_total > v_customer.credit_limit_cents then
      raise exception 'this sale goes over the credit limit';
    end if;
  end if;

  -- Los terminos se congelan en la venta: si la tienda sube la tasa manana, esta venta
  -- sigue diciendo la de hoy (ADR 0009).
  insert into public.sales (
    business_id, customer_id, total_cents, balance_cents, client_token,
    monthly_rate_bp, late_rate_bp, grace_days
  )
  values (
    v_customer.business_id, p_customer_id, v_total, v_total, p_client_token,
    v_business.monthly_rate_bp, v_business.late_rate_bp, v_business.grace_days
  )
  returning id into v_sale_id;

  -- El precio unitario se copia a la linea: la venta no cambia cuando cambie la lista.
  for v_item in select * from jsonb_array_elements(p_items) loop
    v_quantity := (v_item->>'quantity')::integer;

    select * into v_product from public.products where id = (v_item->>'product_id')::uuid;

    insert into public.sale_items (business_id, sale_id, product_id, quantity, unit_price_cents)
    values (v_customer.business_id, v_sale_id, v_product.id, v_quantity, v_product.price_cents);

    update public.products set stock = stock - v_quantity where id = v_product.id;
  end loop;

  insert into public.installments (business_id, sale_id, number, due_date, amount_cents)
  select
    v_customer.business_id,
    v_sale_id,
    (value->>'number')::smallint,
    (value->>'due_date')::date,
    (value->>'amount_cents')::bigint
  from jsonb_array_elements(p_installments);

  return v_sale_id;
end;
$$;

revoke all on function public.register_sale(uuid, jsonb, jsonb, uuid) from public, anon;
grant execute on function public.register_sale(uuid, jsonb, jsonb, uuid) to authenticated;

comment on function public.register_sale(uuid, jsonb, jsonb, uuid) is
  'Registra una venta a credito con sus lineas, su calendario y el descuento de stock, en una sola transaccion. Idempotente por client_token.';
