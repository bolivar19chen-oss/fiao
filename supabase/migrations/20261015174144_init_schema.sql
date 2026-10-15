-- FIA'O - schema inicial con RLS.
--
-- Reglas:
-- * Dinero en centavos, bigint, nunca numeric/float.
-- * Toda tabla de negocio lleva business_id y RLS por membresia.
-- * Las FK hacia datos de un negocio son compuestas (id, business_id): la base impide
--   que una venta de la tienda A apunte a un cliente de la tienda B, aunque alguien
--   conozca el uuid.

-- ---------------------------------------------------------------------------
-- Negocios y membresia
-- ---------------------------------------------------------------------------

create table public.businesses (
  id uuid primary key default gen_random_uuid(),
  name text not null check (length(trim(name)) > 0),
  created_at timestamptz not null default now()
);

create table public.business_members (
  business_id uuid not null references public.businesses (id) on delete cascade,
  user_id uuid not null references auth.users (id) on delete cascade,
  role text not null check (role in ('owner', 'staff')),
  created_at timestamptz not null default now(),
  primary key (business_id, user_id)
);

create index business_members_user_id_idx on public.business_members (user_id);

-- security definer: las politicas consultan business_members sin pasar por su propia
-- RLS (evita recursion infinita).
create function public.is_member(p_business_id uuid)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1
    from public.business_members
    where business_id = p_business_id
      and user_id = (select auth.uid())
  );
$$;

create function public.is_owner(p_business_id uuid)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1
    from public.business_members
    where business_id = p_business_id
      and user_id = (select auth.uid())
      and role = 'owner'
  );
$$;

-- Crear un negocio y quedar como owner en una sola operacion. No hay politica de
-- insert sobre businesses: esta funcion es la unica via.
create function public.create_business(p_name text)
returns uuid
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_id uuid;
begin
  if (select auth.uid()) is null then
    raise exception 'not authenticated';
  end if;

  insert into public.businesses (name) values (p_name) returning id into v_id;
  insert into public.business_members (business_id, user_id, role)
  values (v_id, (select auth.uid()), 'owner');
  return v_id;
end;
$$;

revoke execute on function public.create_business(text) from public, anon;
grant execute on function public.create_business(text) to authenticated;

-- ---------------------------------------------------------------------------
-- Clientes e inventario
-- ---------------------------------------------------------------------------

create table public.customers (
  id uuid primary key default gen_random_uuid(),
  business_id uuid not null references public.businesses (id) on delete cascade,
  name text not null check (length(trim(name)) > 0),
  phone text,
  notes text,
  -- 0-100, null hasta el primer calculo. Lo escribe el motor de puntaje (Fase 1).
  credit_score smallint check (credit_score between 0 and 100),
  created_at timestamptz not null default now(),
  unique (id, business_id)
);

create index customers_business_id_idx on public.customers (business_id);

create table public.products (
  id uuid primary key default gen_random_uuid(),
  business_id uuid not null references public.businesses (id) on delete cascade,
  name text not null check (length(trim(name)) > 0),
  price_cents bigint not null check (price_cents >= 0),
  stock integer not null default 0 check (stock >= 0),
  low_stock_threshold integer not null default 0 check (low_stock_threshold >= 0),
  created_at timestamptz not null default now(),
  unique (id, business_id)
);

create index products_business_id_idx on public.products (business_id);

-- ---------------------------------------------------------------------------
-- Ventas a credito, cronograma y abonos
-- ---------------------------------------------------------------------------

create table public.sales (
  id uuid primary key default gen_random_uuid(),
  business_id uuid not null references public.businesses (id) on delete cascade,
  customer_id uuid not null,
  total_cents bigint not null check (total_cents > 0),
  balance_cents bigint not null check (balance_cents >= 0),
  created_at timestamptz not null default now(),
  unique (id, business_id),
  check (balance_cents <= total_cents),
  foreign key (customer_id, business_id)
    references public.customers (id, business_id) on delete restrict
);

create index sales_business_id_idx on public.sales (business_id);
create index sales_customer_id_idx on public.sales (customer_id);

create table public.sale_items (
  id uuid primary key default gen_random_uuid(),
  business_id uuid not null references public.businesses (id) on delete cascade,
  sale_id uuid not null,
  product_id uuid not null,
  quantity integer not null check (quantity > 0),
  -- Precio congelado al momento de la venta.
  unit_price_cents bigint not null check (unit_price_cents >= 0),
  foreign key (sale_id, business_id)
    references public.sales (id, business_id) on delete cascade,
  foreign key (product_id, business_id)
    references public.products (id, business_id) on delete restrict
);

create index sale_items_sale_id_idx on public.sale_items (sale_id);
create index sale_items_product_id_idx on public.sale_items (product_id);

create table public.installments (
  id uuid primary key default gen_random_uuid(),
  business_id uuid not null references public.businesses (id) on delete cascade,
  sale_id uuid not null,
  number smallint not null check (number > 0),
  due_date date not null,
  amount_cents bigint not null check (amount_cents > 0),
  unique (sale_id, number),
  foreign key (sale_id, business_id)
    references public.sales (id, business_id) on delete cascade
);

create index installments_due_date_idx on public.installments (business_id, due_date);

create table public.payments (
  id uuid primary key default gen_random_uuid(),
  business_id uuid not null references public.businesses (id) on delete cascade,
  sale_id uuid not null,
  amount_cents bigint not null check (amount_cents > 0),
  paid_at timestamptz not null default now(),
  created_by uuid references auth.users (id) on delete set null default auth.uid(),
  foreign key (sale_id, business_id)
    references public.sales (id, business_id) on delete restrict
);

create index payments_sale_id_idx on public.payments (sale_id);

-- ---------------------------------------------------------------------------
-- RLS
-- ---------------------------------------------------------------------------

alter table public.businesses enable row level security;
alter table public.business_members enable row level security;
alter table public.customers enable row level security;
alter table public.products enable row level security;
alter table public.sales enable row level security;
alter table public.sale_items enable row level security;
alter table public.installments enable row level security;
alter table public.payments enable row level security;

-- businesses: los miembros leen, el owner edita y borra. Insert solo via create_business.
create policy businesses_select on public.businesses
  for select to authenticated using (public.is_member(id));
create policy businesses_update on public.businesses
  for update to authenticated using (public.is_owner(id)) with check (public.is_owner(id));
create policy businesses_delete on public.businesses
  for delete to authenticated using (public.is_owner(id));

-- business_members: los miembros ven a su equipo, solo el owner lo administra.
create policy business_members_select on public.business_members
  for select to authenticated using (public.is_member(business_id));
create policy business_members_insert on public.business_members
  for insert to authenticated with check (public.is_owner(business_id));
create policy business_members_update on public.business_members
  for update to authenticated
  using (public.is_owner(business_id)) with check (public.is_owner(business_id));
create policy business_members_delete on public.business_members
  for delete to authenticated using (public.is_owner(business_id));

-- Datos operativos: cualquier miembro del negocio.
create policy customers_all on public.customers
  for all to authenticated
  using (public.is_member(business_id)) with check (public.is_member(business_id));
create policy products_all on public.products
  for all to authenticated
  using (public.is_member(business_id)) with check (public.is_member(business_id));
create policy sales_all on public.sales
  for all to authenticated
  using (public.is_member(business_id)) with check (public.is_member(business_id));
create policy sale_items_all on public.sale_items
  for all to authenticated
  using (public.is_member(business_id)) with check (public.is_member(business_id));
create policy installments_all on public.installments
  for all to authenticated
  using (public.is_member(business_id)) with check (public.is_member(business_id));

-- payments: solo lectura desde el cliente. Un abono insertado a mano dejaria el saldo
-- desincronizado; se registra via registerPayment (Fase 1), que actualiza abono, saldo
-- y puntaje en la misma transaccion.
create policy payments_select on public.payments
  for select to authenticated using (public.is_member(business_id));
