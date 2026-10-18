-- Metodo de pago e idempotencia en los abonos. Contexto: ADR 0007 y
-- docs/MODELO-CREDITO.md seccion 3.
--
-- payments esta vacia, asi que las columnas entran como not null sin default de relleno.

alter table public.payments
  add column method text not null default 'cash'
    check (method in ('cash', 'yappy', 'card', 'paypal')),
  -- Identificador de la transaccion en la pasarela. Nulo en efectivo.
  add column provider_ref text,
  -- Lo genera el dispositivo al registrar el abono, no el servidor. Es lo que frena a la
  -- cola offline cuando reintenta.
  add column client_token uuid not null default gen_random_uuid();

-- Dos indices por la misma razon con dos origenes distintos: el reintento de la cola
-- offline trae el mismo client_token; el webhook entregado dos veces, el mismo
-- provider_ref. Las pasarelas garantizan "al menos una vez", no "exactamente una vez".
create unique index payments_client_token_idx on public.payments (business_id, client_token);
create unique index payments_provider_ref_idx
  on public.payments (business_id, provider_ref)
  where provider_ref is not null;

-- Un abono en efectivo no tiene identificador de pasarela, y uno remoto no deberia
-- quedarse sin el.
alter table public.payments
  add constraint payments_provider_ref_matches_method check (
    (method = 'cash' and provider_ref is null) or method <> 'cash'
  );

-- ---------------------------------------------------------------------------
-- Registrar un abono
-- ---------------------------------------------------------------------------

-- El abono y el saldo se mueven en la misma transaccion. Si fueran dos llamadas, un
-- fallo entre medio dejaria el pago registrado y la deuda intacta, o al reves.
--
-- Idempotente: el mismo p_client_token dos veces deja un solo abono y toca el saldo una
-- sola vez. Devuelve el id del abono, sea el nuevo o el que ya estaba.
create function public.register_payment(
  p_sale_id uuid,
  p_amount_cents bigint,
  p_method text,
  p_client_token uuid,
  p_provider_ref text default null
)
returns uuid
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_sale public.sales;
  v_payment_id uuid;
begin
  select * into v_sale from public.sales where id = p_sale_id for update;

  if v_sale.id is null or not public.is_member(v_sale.business_id) then
    raise exception 'sale not found';
  end if;

  -- El reintento se responde con el abono que ya existe, sin volver a tocar el saldo.
  select id into v_payment_id
  from public.payments
  where business_id = v_sale.business_id and client_token = p_client_token;
  if v_payment_id is not null then
    return v_payment_id;
  end if;

  if p_amount_cents <= 0 then
    raise exception 'amount must be positive';
  end if;
  if p_amount_cents > v_sale.balance_cents then
    raise exception 'amount is larger than the balance';
  end if;

  insert into public.payments (business_id, sale_id, amount_cents, method, client_token, provider_ref)
  values (v_sale.business_id, p_sale_id, p_amount_cents, p_method, p_client_token, p_provider_ref)
  returning id into v_payment_id;

  update public.sales
  set balance_cents = balance_cents - p_amount_cents
  where id = p_sale_id;

  return v_payment_id;
end;
$$;

revoke execute on function public.register_payment(uuid, bigint, text, uuid, text) from public, anon;
grant execute on function public.register_payment(uuid, bigint, text, uuid, text) to authenticated;
