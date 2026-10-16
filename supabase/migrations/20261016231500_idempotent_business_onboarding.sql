-- complete_business_onboarding reentrante.
--
-- Dos problemas que arregla:
--
--   1. Bucle de redireccion sin salida. El layout de (app) manda a /onboarding si no hay
--      negocio, y /onboarding mandaba a /app si habia perfil. Un usuario con perfil
--      'business' y sin negocio rebotaba para siempre. Es alcanzable: la RLS de profiles
--      permite que cualquiera inserte su propia fila desde el navegador, y un negocio
--      borrado deja el perfil huerfano.
--
--      La version anterior no servia para salir del bucle: el insert en profiles chocaba
--      contra la PK y la transaccion entera se caia. Ahora el mismo formulario de negocio
--      funciona como recuperacion.
--
--   2. Doble submit. Dos clics creaban la segunda llamada con violacion de PK y el
--      usuario veia un error sobre una operacion que ya habia salido bien.
--
-- No es un "upsert" a ciegas: un perfil de cliente NO se convierte en negocio, y un
-- usuario que ya tiene negocio no crea un segundo.

create or replace function public.complete_business_onboarding(
  p_full_name text,
  p_national_id text,
  p_phone text,
  p_date_of_birth date,
  p_trade_name text,
  p_legal_structure text,
  p_legal_name text,
  p_ruc text,
  p_ruc_dv text,
  p_operating_notice text,
  p_legal_rep_name text,
  p_legal_rep_id text,
  p_province_code text,
  p_district_code text,
  p_corregimiento_code text,
  p_address text
)
returns uuid
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_uid uuid := (select auth.uid());
  v_business_id uuid;
begin
  if v_uid is null then
    raise exception 'not authenticated';
  end if;

  -- El trigger profiles_require_adult exige los 18 anos en el insert.
  insert into public.profiles (user_id, role, full_name, national_id, phone, date_of_birth)
  values (v_uid, 'business', trim(p_full_name), trim(p_national_id), trim(p_phone), p_date_of_birth)
  on conflict (user_id) do nothing;

  -- Si ya habia perfil, tiene que ser de negocio. Un cliente no se convierte por llamar
  -- a esta funcion.
  if not exists (select 1 from public.profiles where user_id = v_uid and role = 'business') then
    raise exception 'this account is already registered as a customer';
  end if;

  -- Negocio existente: no se crea otro, se completan sus datos. Es lo que convierte el
  -- formulario en recuperacion para el perfil huerfano y lo que hace inofensivo el doble
  -- clic.
  select bm.business_id into v_business_id
  from public.business_members bm
  where bm.user_id = v_uid and bm.role = 'owner'
  order by bm.created_at
  limit 1;

  if v_business_id is null then
    insert into public.businesses (name) values (trim(p_trade_name)) returning id into v_business_id;
    insert into public.business_members (business_id, user_id, role)
    values (v_business_id, v_uid, 'owner');
  else
    update public.businesses set name = trim(p_trade_name) where id = v_business_id;
  end if;

  perform public.update_business_legal(
    v_business_id, p_legal_structure, p_legal_name, p_ruc, p_ruc_dv, p_operating_notice,
    p_legal_rep_name, p_legal_rep_id, p_province_code, p_district_code,
    p_corregimiento_code, p_address
  );

  return v_business_id;
end;
$$;

revoke execute on function public.complete_business_onboarding(
  text, text, text, date, text, text, text, text, text, text, text, text, text, text, text, text
) from public, anon;
grant execute on function public.complete_business_onboarding(
  text, text, text, date, text, text, text, text, text, text, text, text, text, text, text, text
) to authenticated;
