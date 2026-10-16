-- Validacion completa dentro de update_business_legal.
--
-- Por que: la funcion esta otorgada a authenticated, asi que cualquier usuario con sesion
-- puede llamarla directo con la anon key, sin pasar por el Server Action. La validacion
-- de src/app/onboarding/actions.ts no es la frontera; esta funcion si lo es.
--
-- Faltaban dos cosas:
--
--   1. p_legal_structure no se validaba. Pasando null se guardaba un negocio sin
--      estructura legal: el check de la columna acepta null, y el check
--      businesses_corporation_fields tambien, porque null is distinct from 'corporation'.
--
--   2. Para 'corporation', los campos de razon social y representante legal los atrapaba
--      el check de tabla con un error crudo de Postgres en vez del mensaje propio. El
--      formulario los marca required, pero required es HTML y se evade.
--
-- Regla del proyecto que esto cumple (CLAUDE.md): validacion del lado del servidor
-- siempre.

create or replace function public.update_business_legal(
  p_business_id uuid,
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
returns void
language plpgsql
security definer
set search_path = ''
as $$
begin
  if not public.is_owner(p_business_id) then
    raise exception 'not allowed';
  end if;

  if p_legal_structure is null or p_legal_structure not in ('natural', 'corporation') then
    raise exception 'missing required fields';
  end if;

  if length(trim(coalesce(p_ruc, ''))) = 0
     or length(trim(coalesce(p_ruc_dv, ''))) = 0
     or length(trim(coalesce(p_operating_notice, ''))) = 0
     or length(trim(coalesce(p_province_code, ''))) = 0
     or length(trim(coalesce(p_district_code, ''))) = 0
     or length(trim(coalesce(p_corregimiento_code, ''))) = 0
     or length(trim(coalesce(p_address, ''))) = 0 then
    raise exception 'missing required fields';
  end if;

  -- Una sociedad lleva razon social y representante legal. El check de tabla ya lo exige;
  -- esto da el mismo mensaje que el resto en vez de un error de constraint.
  if p_legal_structure = 'corporation'
     and (length(trim(coalesce(p_legal_name, ''))) = 0
          or length(trim(coalesce(p_legal_rep_name, ''))) = 0
          or length(trim(coalesce(p_legal_rep_id, ''))) = 0) then
    raise exception 'missing required fields';
  end if;

  -- Los formatos de RUC, DV y permiso de operacion siguen sin validar: hay que
  -- verificarlos contra DGI y MICI (docs/ONBOARDING.md seccion 5). Un validador
  -- inventado rechaza datos validos y deja al negocio sin poder registrarse.
  -- TODO: formato de RUC y calculo del digito verificador.

  update public.businesses
  set legal_structure = p_legal_structure,
      legal_name = nullif(trim(coalesce(p_legal_name, '')), ''),
      ruc = trim(p_ruc),
      ruc_dv = trim(p_ruc_dv),
      operating_notice = trim(p_operating_notice),
      legal_rep_name = nullif(trim(coalesce(p_legal_rep_name, '')), ''),
      legal_rep_id = nullif(trim(coalesce(p_legal_rep_id, '')), ''),
      province_code = trim(p_province_code),
      district_code = trim(p_district_code),
      corregimiento_code = trim(p_corregimiento_code),
      address = trim(p_address)
  where id = p_business_id;

  if not found then
    raise exception 'not allowed';
  end if;
end;
$$;

-- create or replace no conserva los grants anteriores de forma garantizada: se repiten.
revoke execute on function public.update_business_legal(
  uuid, text, text, text, text, text, text, text, text, text, text, text
) from public, anon;
grant execute on function public.update_business_legal(
  uuid, text, text, text, text, text, text, text, text, text, text, text
) to authenticated;
