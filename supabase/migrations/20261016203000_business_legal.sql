-- Datos legales del negocio. Contexto: docs/ONBOARDING.md secciones 3 y 7.

-- Nullable y no "not null": businesses ya puede tener filas creadas con el onboarding
-- anterior, que solo pedia el nombre. Quien exige el conjunto completo es
-- update_business_legal, que es la unica via de escritura.
alter table public.businesses
  add column legal_structure text check (legal_structure in ('natural', 'corporation')),
  add column legal_name text,
  add column ruc text,
  add column ruc_dv text,
  add column operating_notice text,
  add column legal_rep_name text,
  add column legal_rep_id text,
  add column province_code text,
  add column district_code text,
  add column corregimiento_code text,
  add column address text;

-- Los codigos quedan como texto suelto a proposito. La FK contra panama_divisions
-- entra cuando esa tabla tenga el catalogo oficial cargado (ONBOARDING.md seccion 10,
-- paso 5): hoy esta vacia y una FK impediria guardar cualquier negocio.
-- TODO: FK a panama_divisions (code) una vez cargado el catalogo.

-- Una sociedad lleva razon social y representante legal; una persona natural, no.
alter table public.businesses
  add constraint businesses_corporation_fields check (
    legal_structure is distinct from 'corporation'
    or (
      length(trim(coalesce(legal_name, ''))) > 0
      and length(trim(coalesce(legal_rep_name, ''))) > 0
      and length(trim(coalesce(legal_rep_id, ''))) > 0
    )
  );

-- Completa los datos legales del negocio recien creado. Separada de create_business
-- porque asi cada una se prueba sola.
--
-- Los formatos de RUC, DV y permiso de operacion no se validan todavia: hay que
-- verificarlos contra DGI y MICI (ONBOARDING.md seccion 5). Un validador inventado
-- rechaza datos validos y deja al negocio sin poder registrarse.
-- TODO: formato de RUC y calculo del digito verificador.
create function public.update_business_legal(
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

  if length(trim(coalesce(p_ruc, ''))) = 0
     or length(trim(coalesce(p_ruc_dv, ''))) = 0
     or length(trim(coalesce(p_operating_notice, ''))) = 0
     or length(trim(coalesce(p_province_code, ''))) = 0
     or length(trim(coalesce(p_district_code, ''))) = 0
     or length(trim(coalesce(p_corregimiento_code, ''))) = 0
     or length(trim(coalesce(p_address, ''))) = 0 then
    raise exception 'missing required fields';
  end if;

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
end;
$$;

revoke execute on function public.update_business_legal(
  uuid, text, text, text, text, text, text, text, text, text, text, text
) from public, anon;
grant execute on function public.update_business_legal(
  uuid, text, text, text, text, text, text, text, text, text, text, text
) to authenticated;
