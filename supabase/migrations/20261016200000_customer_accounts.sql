-- Cuentas de cliente por invitacion. Contexto: ADR 0006.
--
-- El negocio invita, el cliente canjea. Nunca al reves: si el cliente pudiera
-- reclamarse solo por telefono o cedula, cualquiera se queda con el historial de otro.

-- ---------------------------------------------------------------------------
-- Vinculo cliente - cuenta
-- ---------------------------------------------------------------------------

-- set null y no cascade: si el cliente borra su cuenta de FIA'O, su deuda con el
-- negocio no desaparece. Son cosas distintas.
alter table public.customers
  add column user_id uuid references auth.users (id) on delete set null;

-- Una persona es un solo cliente por negocio.
create unique index customers_user_business_idx
  on public.customers (user_id, business_id)
  where user_id is not null;

-- ---------------------------------------------------------------------------
-- Invitaciones
-- ---------------------------------------------------------------------------

-- El codigo se guarda hasheado: es una credencial de acceso a datos de deuda, no un
-- numero de orden. sha256 es de pg_catalog, no hace falta extension.
create table public.customer_invites (
  id uuid primary key default gen_random_uuid(),
  business_id uuid not null references public.businesses (id) on delete cascade,
  customer_id uuid not null,
  code_hash text not null,
  expires_at timestamptz not null,
  created_at timestamptz not null default now(),
  created_by uuid references auth.users (id) on delete set null default auth.uid(),
  redeemed_at timestamptz,
  redeemed_by uuid references auth.users (id) on delete set null,
  unique (business_id, code_hash),
  foreign key (customer_id, business_id)
    references public.customers (id, business_id) on delete cascade
);

create index customer_invites_customer_id_idx on public.customer_invites (customer_id);

alter table public.customer_invites enable row level security;

-- El negocio ve sus invitaciones. El cliente nunca las lista: canjea a ciegas, con el
-- codigo que le dieron en el mostrador.
create policy customer_invites_select on public.customer_invites
  for select to authenticated using (public.is_member(business_id));

-- Sin insert ni update directos: las dos funciones de abajo son la unica via.

create function public.hash_invite_code(p_code text)
returns text
language sql
immutable
as $$
  select encode(sha256(convert_to(upper(trim(p_code)), 'UTF8')), 'hex');
$$;

-- El negocio genera el codigo. Se devuelve en claro una sola vez: despues solo queda
-- el hash y no hay forma de recuperarlo.
create function public.create_customer_invite(p_customer_id uuid, p_ttl_minutes integer default 1440)
returns text
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_business_id uuid;
  v_code text;
begin
  select business_id into v_business_id
  from public.customers
  where id = p_customer_id;

  if v_business_id is null or not public.is_member(v_business_id) then
    raise exception 'customer not found';
  end if;

  -- 12 hex del uuid: 48 bits para un codigo de un solo uso que vence en horas.
  v_code := upper(substring(replace(gen_random_uuid()::text, '-', '') from 1 for 12));

  insert into public.customer_invites (business_id, customer_id, code_hash, expires_at)
  values (
    v_business_id,
    p_customer_id,
    public.hash_invite_code(v_code),
    now() + make_interval(mins => p_ttl_minutes)
  );

  return v_code;
end;
$$;

-- El cliente canja. Vencida, ya usada o inexistente fallan igual y con el mismo
-- mensaje: no se revela si el codigo existio.
create function public.redeem_customer_invite(p_code text)
returns uuid
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_invite public.customer_invites;
  v_uid uuid := (select auth.uid());
begin
  if v_uid is null then
    raise exception 'not authenticated';
  end if;

  if not exists (select 1 from public.profiles where user_id = v_uid and role = 'customer') then
    raise exception 'invalid or expired code';
  end if;

  select * into v_invite
  from public.customer_invites
  where code_hash = public.hash_invite_code(p_code)
    and redeemed_at is null
    and expires_at > now()
  for update;

  if v_invite.id is null then
    raise exception 'invalid or expired code';
  end if;

  -- La fila ya reclamada por otra persona no se roba.
  update public.customers
  set user_id = v_uid
  where id = v_invite.customer_id and user_id is null;

  if not found then
    raise exception 'invalid or expired code';
  end if;

  update public.customer_invites
  set redeemed_at = now(), redeemed_by = v_uid
  where id = v_invite.id;

  return v_invite.business_id;
end;
$$;

revoke execute on function public.hash_invite_code(text) from public, anon;
revoke execute on function public.create_customer_invite(uuid, integer) from public, anon;
revoke execute on function public.redeem_customer_invite(text) from public, anon;
grant execute on function public.create_customer_invite(uuid, integer) to authenticated;
grant execute on function public.redeem_customer_invite(text) to authenticated;

-- ---------------------------------------------------------------------------
-- Lectura del cliente
-- ---------------------------------------------------------------------------

-- Las politicas existentes preguntan is_member. El cliente no es miembro: hace falta
-- el otro lado. security definer por lo mismo que is_member: consultar sin pasar por
-- la RLS de la propia tabla.
create function public.is_customer(p_customer_id uuid)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1 from public.customers
    where id = p_customer_id and user_id = (select auth.uid())
  );
$$;

-- payments e installments solo tienen sale_id.
create function public.is_sale_customer(p_sale_id uuid)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1
    from public.sales s
    join public.customers c on c.id = s.customer_id
    where s.id = p_sale_id and c.user_id = (select auth.uid())
  );
$$;

revoke execute on function public.is_customer(uuid) from public, anon;
revoke execute on function public.is_sale_customer(uuid) from public, anon;
grant execute on function public.is_customer(uuid) to authenticated;
grant execute on function public.is_sale_customer(uuid) to authenticated;

-- Solo lectura, y solo de lo propio. El cliente no registra abonos ni modifica nada:
-- eso lo hace el negocio o la pasarela.
create policy customers_select_self on public.customers
  for select to authenticated using (user_id = (select auth.uid()));

create policy sales_select_customer on public.sales
  for select to authenticated using (public.is_customer(customer_id));

create policy sale_items_select_customer on public.sale_items
  for select to authenticated using (public.is_sale_customer(sale_id));

create policy installments_select_customer on public.installments
  for select to authenticated using (public.is_sale_customer(sale_id));

create policy payments_select_customer on public.payments
  for select to authenticated using (public.is_sale_customer(sale_id));
