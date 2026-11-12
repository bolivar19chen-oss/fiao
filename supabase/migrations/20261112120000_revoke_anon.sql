-- Defensa en profundidad: quien no inicio sesion no toca ninguna tabla.
--
-- RLS ya lo impedia (todas las politicas son `to authenticated`, asi que `anon` no ve ni
-- cambia filas), pero el rol conservaba los permisos de tabla que Supabase da por defecto:
-- un DELETE anonimo respondia 204 con cero filas en vez de un rechazo. Sin el permiso, la
-- peticion se corta antes de llegar a las politicas, y una politica mal escrita en el
-- futuro ya no alcanza para abrir una tabla al publico.
revoke all on all tables in schema public from anon;
revoke all on all sequences in schema public from anon;
revoke execute on all functions in schema public from anon;

-- Lo mismo para lo que se cree despues.
alter default privileges in schema public revoke all on tables from anon;
alter default privileges in schema public revoke all on sequences from anon;
alter default privileges in schema public revoke execute on functions from anon;

-- Unica excepcion: /api/keepalive consulta esta tabla sin sesion para que el proyecto no se
-- pause. Son las provincias de Panama, datos publicos, y RLS igual no le devuelve filas.
grant select on public.panama_divisions to anon;
