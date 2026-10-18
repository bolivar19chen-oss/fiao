-- Avatares de perfil.
--
-- Bucket privado: la foto de la cara es dato personal sensible (docs/ONBOARDING.md
-- seccion 6). No se sirve por URL publica, se lee con URL firmada de vida corta.
--
-- La ruta es {user_id}/avatar, fija y sin extension: `upsert` reemplaza el archivo, asi
-- que no hace falta borrar el anterior ni guardar la ruta en una columna de profiles.
-- El tipo real viaja en el content-type del objeto.

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('avatars', 'avatars', false, 2097152, array['image/png', 'image/jpeg', 'image/webp'])
on conflict (id) do update
  set public = excluded.public,
      file_size_limit = excluded.file_size_limit,
      allowed_mime_types = excluded.allowed_mime_types;

-- Tamano (2 MB) y tipo los exige Storage con los limites de arriba, del lado del
-- servidor. Lo que valide el navegador es solo para dar el error antes del viaje.
--
-- shortcut: allowed_mime_types mira el content-type declarado, no los bytes. Un cliente
-- que mienta solo consigue guardar un archivo que no se ve, porque el objeto se sirve
-- siempre con el tipo guardado y desde otro origen. Si este bucket pasara a publico,
-- hay que inspeccionar los bytes antes de aceptar.

-- Cada usuario, su propia carpeta y nada mas. Mismo criterio que profiles: la primera
-- carpeta de la ruta tiene que ser su uid.
create policy avatars_select_own on storage.objects
  for select to authenticated
  using (bucket_id = 'avatars' and (storage.foldername(name))[1] = (select auth.uid()::text));

create policy avatars_insert_own on storage.objects
  for insert to authenticated
  with check (bucket_id = 'avatars' and (storage.foldername(name))[1] = (select auth.uid()::text));

create policy avatars_update_own on storage.objects
  for update to authenticated
  using (bucket_id = 'avatars' and (storage.foldername(name))[1] = (select auth.uid()::text))
  with check (bucket_id = 'avatars' and (storage.foldername(name))[1] = (select auth.uid()::text));

-- Delete si va, a diferencia de profiles: es dato personal sensible y quien lo subio
-- tiene que poder retirarlo sin pedirselo a nadie.
create policy avatars_delete_own on storage.objects
  for delete to authenticated
  using (bucket_id = 'avatars' and (storage.foldername(name))[1] = (select auth.uid()::text));
