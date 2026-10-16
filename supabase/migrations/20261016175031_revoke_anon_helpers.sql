-- is_member e is_owner son security definer y quedaban ejecutables por anon via
-- /rest/v1/rpc (advisor 0028 de Supabase). Solo las usan las politicas RLS, que son
-- "to authenticated": anon no las necesita. authenticated conserva execute porque las
-- politicas se evaluan con el rol de quien consulta.
revoke execute on function public.is_member(uuid) from public, anon;
revoke execute on function public.is_owner(uuid) from public, anon;
grant execute on function public.is_member(uuid) to authenticated;
grant execute on function public.is_owner(uuid) to authenticated;
