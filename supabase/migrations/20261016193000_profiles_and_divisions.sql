-- Perfil por usuario y catalogo de division politica de Panama.
-- Contexto: docs/ONBOARDING.md secciones 1 y 7, ADR 0006.
--
-- profiles es la tabla que decide que ve el usuario al entrar: sin fila, va a
-- /onboarding; con fila, a /app o a /me segun role.

-- ---------------------------------------------------------------------------
-- Perfil
-- ---------------------------------------------------------------------------

create table public.profiles (
  user_id uuid primary key references auth.users (id) on delete cascade,
  role text not null check (role in ('business', 'customer')),
  full_name text not null check (length(trim(full_name)) between 2 and 120),
  -- Formato sin verificar todavia (docs/ONBOARDING.md seccion 5). Solo no vacio:
  -- un validador inventado rechaza cedulas validas y deja al usuario afuera.
  -- TODO: formato de cedula contra el Tribunal Electoral.
  national_id text not null check (length(trim(national_id)) > 0),
  phone text not null check (length(trim(phone)) > 0),
  date_of_birth date not null check (date_of_birth > date '1900-01-01'),
  created_at timestamptz not null default now()
);

-- Los 18 anos van en trigger y no en un check: current_date no es inmutable y un
-- check que lo use se reevalua en cada dump/restore. El trigger lo exige donde
-- corresponde, al escribir, y es la unica via porque la RLS de abajo solo deja
-- tocar la fila propia.
create function public.profiles_require_adult()
returns trigger
language plpgsql
as $$
begin
  if new.date_of_birth > current_date - interval '18 years' then
    raise exception 'must be 18 or older';
  end if;
  return new;
end;
$$;

create trigger profiles_require_adult
before insert or update of date_of_birth on public.profiles
for each row execute function public.profiles_require_adult();

alter table public.profiles enable row level security;

-- Cada usuario, su propia fila y nada mas. role no se restringe aca: elegir ser
-- negocio no da acceso a ningun negocio, eso lo decide business_members.
create policy profiles_select_own on public.profiles
  for select to authenticated using (user_id = (select auth.uid()));

create policy profiles_insert_own on public.profiles
  for insert to authenticated with check (user_id = (select auth.uid()));

create policy profiles_update_own on public.profiles
  for update to authenticated
  using (user_id = (select auth.uid()))
  with check (user_id = (select auth.uid()));

-- Sin politica de delete: el perfil se va con la cuenta, por el cascade.

-- ---------------------------------------------------------------------------
-- Division politica
-- ---------------------------------------------------------------------------

-- Catalogo, no dato de negocio. Queda vacia a proposito: la lista oficial se carga
-- en una migracion aparte (docs/ONBOARDING.md seccion 10, paso 5). La division
-- politica de Panama cambia, asi que source_version dice de que publicacion salio.
create table public.panama_divisions (
  code text primary key,
  kind text not null check (kind in ('province', 'district', 'corregimiento')),
  name text not null check (length(trim(name)) > 0),
  parent_code text references public.panama_divisions (code),
  source_version text not null
);

create index panama_divisions_parent_code_idx on public.panama_divisions (parent_code);

alter table public.panama_divisions enable row level security;

-- Lectura para cualquiera con sesion. Escritura solo por migracion: no hay
-- politica de insert, update ni delete.
create policy panama_divisions_select on public.panama_divisions
  for select to authenticated using (true);
