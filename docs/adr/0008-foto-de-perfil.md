# ADR 0008 - Foto de perfil opcional

Fecha: 2026-10-18. Estado: aceptado.

Reemplaza la recomendacion de [ONBOARDING.md](../ONBOARDING.md) seccion 6, que decia no
pedir foto en el MVP y que encenderla seria una decision aparte "con su ADR". Este es.

## Contexto

El diseno de referencia del alta trae una fila de avatar con boton de subida. Nosotros la
habiamos quitado: la foto de la cara es dato personal sensible y guardarla trae
obligaciones de proteccion de datos.

El equipo decidio ponerla. La decision de producto no se discute aca; lo que se decide es
bajo que condiciones se guarda.

## Decision

**La foto es opcional, privada y borrable por su dueno.**

### Opcional de verdad

No viaja en el formulario de alta y no es un campo del perfil. Se sube aparte, cuando el
usuario quiera. Saltarla no cuesta nada y no bloquea el registro. Si nunca sube una, no
existe el objeto y no hay nada que proteger.

### Bucket privado, carpeta por usuario

Bucket `avatars`, `public = false`. La ruta es `{user_id}/avatar`.

La RLS sobre `storage.objects` exige que la primera carpeta de la ruta sea el `uid` de
quien pide. Mismo criterio que `profiles`: tu fila y nada mas. Comprobado contra la base
real: escribir en la carpeta de otro devuelve `403 new row violates row-level security
policy`.

Se lee con URL firmada de vida corta, nunca por URL publica. Una URL publica de un bucket
de avatares es adivinable si se conoce el `uid`, y el `uid` viaja en varios sitios.

### Validacion donde no se puede saltar

Tipo y tamano los exige el bucket (`allowed_mime_types`, `file_size_limit` de 2 MB), que
es servidor de Supabase. Lo que valida el navegador es solo para avisar antes de subir
2 MB para nada. Comprobado: `text/plain` devuelve `415 invalid_mime_type`.

### Se puede retirar

Hay politica de `delete` y boton de quitar. Es la diferencia con `profiles`, que no tiene
delete porque el perfil se va con la cuenta. Un dato personal sensible que subiste
voluntariamente tiene que poder salir cuando quieras, sin pedirselo a nadie.

## Por que no pasa por el servidor

La subida va del navegador a Storage con la sesion del propio usuario. Una server action
intermedia agregaria el limite de cuerpo de Next, una copia del archivo en memoria del
servidor y codigo que mantener, y **no agregaria ninguna garantia**: la autorizacion ya la
da la RLS y los limites ya los da el bucket.

## Consecuencias

- La ruta es fija y sin extension, asi que `upsert` reemplaza y no hay que guardar la ruta
  en una columna ni borrar el archivo anterior. El tipo real viaja en el content-type del
  objeto.
- `allowed_mime_types` mira el content-type declarado, no los bytes. Un cliente que mienta
  solo consigue guardar algo que no se ve, porque el objeto se sirve con el tipo guardado
  y desde otro origen. **Si este bucket pasara a publico, hay que inspeccionar los bytes
  antes de aceptar.** Queda anotado como `shortcut:` en la migracion.
- La politica de privacidad tiene que nombrar la foto entre los datos de cuenta, y decir
  que es opcional y que se puede borrar.
- La foto es del usuario, no del negocio. El logo del comercio, si alguna vez se quiere,
  es otro bucket con otras reglas: lo ven los clientes de esa tienda, no solo su dueno.
