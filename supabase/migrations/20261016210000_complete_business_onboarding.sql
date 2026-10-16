-- Alta de negocio completa en una transaccion.
--
-- Por que no encadenar las tres llamadas desde el servidor de Next: si el perfil se
-- crea y el negocio no, el usuario queda con role 'business' sin negocio. El layout de
-- (app) lo manda a /onboarding y /onboarding lo manda a /app: rebota. Y si el negocio
-- se crea y el perfil no, al reintentar crea un segundo negocio.
--
-- Una funcion plpgsql es una sola transaccion: o queda todo o no queda nada.
create function public.complete_business_onboarding(
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

  -- El trigger profiles_require_adult exige los 18 anos.
  insert into public.profiles (user_id, role, full_name, national_id, phone, date_of_birth)
  values (v_uid, 'business', trim(p_full_name), trim(p_national_id), trim(p_phone), p_date_of_birth);

  insert into public.businesses (name) values (trim(p_trade_name)) returning id into v_business_id;
  insert into public.business_members (business_id, user_id, role)
  values (v_business_id, v_uid, 'owner');

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
