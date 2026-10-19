# FIA'O - Revision ejecutada de Codex

Fecha: 2026-10-19, America/Panama. Rama: `codex/inventario`. Base revisada:
`f1e9d74d85d594aeb1c7c15e18976f5fb68903ba`.

## Resultado y alcance

Inventario en [INVENTARIO.md](INVENTARIO.md), con siete grupos, tablas alfabeticas y
34 filas de tokens. Se trasladó el informe anterior desde src/components/app/ a docs/;
se conserva integro como anexo historico al final. Se corrigieron README, AUDITORIA,
PULIDO, FASE-2-ESTRUCTURA, FASE-3-DASHBOARD y el indice, incluido ADR 0008.

**Evidencia:** se ejecutaron tipos, lint, 145 pruebas, el oraculo Python y un build nuevo.
El build habitual fallo dos veces por permisos EPERM en directorios preexistentes de
`.next-build`; el build con salida nueva `.next-codex-inventario` termino correctamente.
No se reutilizo un resultado anterior. Los puertos 3000 a 3010 rechazaban conexiones
antes del build; no se levanto servidor de desarrollo. No se ejecuto e2e.

**Interpretacion:** las pruebas actuales pasan pero no cubren los siete contraejemplos
financieros/de presentacion reproducidos abajo. El esquema restringe filas entre negocios,
pero permite alterar el libro por otras vias y publicar columnas de notas al cliente.

**Propuesta:** corregir primero las fronteras de escritura del libro y de lectura del
portal, luego la imputacion por venta y las fechas locales. Este trabajo documenta esos
arreglos; no modifica el motor, las acciones, las migraciones ni los datos de la nube.

## Inventario verificado

Comando: `node scripts/audit-inventory.mjs`. Resuelve simbolos e importaciones usando
TypeScript, incluyendo alias; distingue entradas convencionales de Next y pruebas.

```json
{
  "unusedComponents": [
    { "name": "DueSoonBadge", "file": "src/components/app/account-status.tsx", "line": 26, "consumers": [] }
  ],
  "testOnlyComponents": [],
  "colorCounts": { "functions": 32, "hex": 7, "webgl": 6 }
}
```

La salida completa tambien enumera los 88 componentes/rutas exportados, sus consumidores,
las 12 acciones de servidor y cada literal con archivo, linea y valor. El conteo es de
apariciones, no de tonos distintos. Solo `#rrggbb` en TSX devuelve cero y pierde CSS,
`#fff`, rgb dentro de clases Tailwind y tuplas WebGL. No se contaron `rgb(var(...))`.

**Tokens sin uso visual:** `BRAND.rojo.claro` y `TEMA["marron-claro"]`. La publicacion
de un token en Tailwind no demuestra que una pantalla lo use. Los rgb que copian
`#cd2626` tampoco consumen el token. `BRAND.marron.claro` si se usa como dato en
category-chart.tsx; ese uso fijo no lee el par TEMA. La tabla del inventario muestra los
34 valores y caminos de consumo, incluidas dependencias indirectas y modo oscuro.

**Documentos corregidos:** Playwright instalado desde `9585b3f`; se ejecuto
`pnpm exec playwright --version`, que devolvio `Version 1.64.1`. Existen dos specs y
no hay etapa e2e en CI. PULIDO ya no afirma que todos los colores estan centralizados
ni que el tema oscuro esta inactivo por faltar clases dark:. FASE-3 reconoce abonos,
idempotencia y portal parcial; FASE-2 identifica su estado inicial como historico.
README distingue backend actual y capacidades PWA previstas. AUDITORIA ya no atribuye
a CLAUDE.md una prohibicion expresa de any que el archivo actual no contiene.

## Revision de codigo

P0: bloquea una tarea o expone datos. P1: impide uso o comprension a parte del publico.
P2: debilita estructura o consistencia. P3: detalle.

Cada fila separa evidencia de interpretacion y propone el cambio minimo. Las lineas
corresponden al codigo base, que no se modifico. No se ejecutaron ataques ni escrituras
para demostrar las inferencias SQL.

| ID    | Archivo y linea                                                                                     | Evidencia / que pasa                                                                                                                                                        | Caso concreto y consecuencia                                                                                                                                                                                                                     | Arreglo minimo propuesto                                                                                                                                                                                                                          |
| ----- | --------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| P0-01 | `supabase/migrations/20261015174144_init_schema.sql:222`                                            | `sales_all` permite ALL por membresia; la nube concede UPDATE de balance_cents y no tiene triggers propios en sales.                                                        | Un staff del negocio puede actualizar una venta de 10000 a saldo 0 por Data API, sin insertar ningun pago. La ficha de venta/portal lee saldo 0 y el motor reconstruye deuda 10000. RLS separa negocios pero no protege la integridad del libro. | Revocar INSERT/UPDATE/DELETE operativos sobre ventas/items/cuotas al rol authenticated y exponer escrituras por RPC validada; register_payment mantiene el unico cambio autorizado del saldo. Hacerlo en migracion nueva con pruebas de permisos. |
| P0-02 | `supabase/migrations/20261016200000_customer_accounts.sql:192`; `20261015174144_init_schema.sql:97` | customers_select_self permite la fila completa; SELECT de notes para authenticated es true en la nube.                                                                      | Si el negocio anota informacion confidencial en Notes, el cliente vinculado puede pedir `customers?select=notes` aunque el portal solo muestre su deuda. La columna no es privada por estar oculta en UI.                                        | Separar notas privadas en tabla con RLS exclusiva de miembros; alternativamente revocar lectura directa de columnas y entregar al portal una RPC con proyeccion explicita. No basta cambiar el select de React.                                   |
| P1-01 | `src/lib/credit-account.ts:61`, `:64`, `:68`                                                        | El adaptador junta pagos y cuotas de todas las ventas antes de settleInstallments. Reproduccion local.                                                                      | A vence el 1/10 y esta impaga; B vence el 1/11 y se paga el 10/10. Al 19/10 devuelve CURRENT, porque el pago de B salda A ficticiamente.                                                                                                         | Ejecutar settleInstallments por venta con sus propios pagos; concatenar despues las cuotas resueltas.                                                                                                                                             |
| P1-02 | `src/lib/credit-account.ts:41`; `src/app/(app)/app/page.tsx:75`                                     | Se corta el timestamp UTC con slice en vez de convertirlo a Panama. Reproduccion local del adaptador.                                                                       | Abono `2026-10-19T04:30:00Z` es 18/10 a las 23:30 en Panama. Se registra como dia 19, penaliza puntualidad y desplaza el grafico diario.                                                                                                         | Usar un unico conversor a fecha ISO en America/Panama para timestamps, tanto en adaptador como en cobros diarios; conservar fechas date sin conversion.                                                                                           |
| P1-03 | `src/app/(app)/app/page.tsx:66`                                                                     | El indicador suma el monto original de toda cuota no saldada. Reproduccion con los mismos filtros del dashboard.                                                            | Cuota de 10000 vence esta semana, ya abonados 6000: saldo 4000, pero Due this week dice 10000.                                                                                                                                                   | Hacer que la imputacion devuelva el restante por cuota y sumar ese restante; no duplicar la regla financiera en la pagina.                                                                                                                        |
| P1-04 | `src/lib/format.ts:19`                                                                              | parseCents elimina todas las comas antes de validar. Reproduccion local.                                                                                                    | Al escribir `1,50` en un teclado con coma decimal se registran 15000 centavos; con saldo suficiente se acepta un abono de 150 dolares en lugar de 1.50.                                                                                          | Validar agrupaciones de miles antes de eliminar comas; rechazar la coma decimal con ejemplo claro, o soportarla explicitamente sin ambiguedad.                                                                                                    |
| P1-05 | `supabase/migrations/20261018120000_payment_methods.sql:64`                                         | La RPC devuelve cualquier pago del negocio con ese token sin comparar venta, monto, metodo ni referencia. Cuerpo confirmado en la nube; inferencia, no escritura ejecutada. | Token T ya registro 1000 en venta A; un envio para venta B con T devuelve el id de A. recordPayment muestra exito pero B no recibe el abono.                                                                                                     | Leer la fila existente y devolverla solo si todos los parametros corresponden a la misma operacion; en otro caso, error de conflicto.                                                                                                             |
| P1-06 | `src/app/me/page.tsx:23`, `:27`; `supabase/migrations/20261015174144_init_schema.sql:197`           | El portal pide businesses(name), pero la unica politica SELECT de businesses exige is_member. Confirmado en catalogo remoto.                                                | Un cliente invitado, sin membresia del negocio, ve su cuenta con nombre generico Shop. Con dos tiendas no puede distinguir cual es cual.                                                                                                         | Exponer solo id/nombre de negocios vinculados mediante RPC/proyeccion restringida. Evitar conceder la fila legal completa del negocio al cliente.                                                                                                 |
| P1-07 | `src/components/app/account-status.tsx:35`, `:104`, `:108`                                          | La UI usa maximos fijos 40/30/20/10, mientras creditScore renormaliza al faltar factores. Reproduccion del resultado que recibe la UI.                                      | Con puntualidad perfecta, dos anos y 12 compras, sin limite de credito (estado actual), puntualidad aporta 57. La pantalla muestra 57/40 y ancho 142.5%.                                                                                         | Mostrar puntos aportados sin dividir por maximos fijos; si se conserva barra, recibir el maximo efectivo del motor. El puntaje normalizado es correcto.                                                                                           |
| P1-08 | `src/components/landing/globe.tsx:144`, `:165`                                                      | El bucle requestAnimationFrame sigue oscilando sin consultar movimiento reducido. Lectura de codigo; no prueba visual ejecutada. Archivo reservado.                         | Usuario con prefers-reduced-motion: reduce recibe oscilacion continua del globo de la landing.                                                                                                                                                   | Consultar matchMedia; desactivar oscilacion/inercia automatica cuando reduce sea true. Anotado para Claude, sin editar el archivo.                                                                                                                |
| P2-01 | `src/lib/credit/accrual.ts:59`                                                                      | Una cuota pagada se excluye del periodo completo. Reproduccion local. Funcion aun no integrada al cobro real.                                                               | Cuota de 10000 vencida el 30/9, pagada el 16/10; corte 1-30/10 al 5%: cobra 0 en vez de 250 por los 15 dias previos al pago.                                                                                                                     | Recortar devengo hasta paidDate - 1, no descartar la cuota; para abonos parciales, incorporar historial de restantes diarios antes de integrar la mora. Actualizar tambien oraculo y casos de contrato.                                           |
| P2-02 | `src/lib/credit/accrual.ts:29`; `src/lib/credit/types.ts:10`                                        | Movements no distingue principal/interes y dailyBalances suma ambos. Reproduccion; no existe aun tabla interest_charges.                                                    | Al integrar el libro completo con principal 10000 e interes previo 500, el siguiente mes al 5% cobra 525 en vez de 500. Contradice interes simple sin capitalizacion.                                                                            | Definir entrada de devengo exclusivamente de principal y su imputacion, separada del saldo total; probar dos cortes antes de conectar cargos reales.                                                                                              |
| P2-03 | `supabase/migrations/20261018120000_payment_methods.sql:26`                                         | El CHECK permite cualquier referencia, incluida null, cuando el metodo no es cash. La accion pide referencia, la RPC accesible directamente no.                             | Un miembro llama register_payment con method yappy y provider_ref null; no queda referencia para la deduplicacion por proveedor. Inferencia SQL, no envio realizado.                                                                             | Exigir referencia no vacia para metodos remotos en la RPC/constraint; conservar cash con null.                                                                                                                                                    |
| P2-04 | `src/app/(app)/app/page.tsx:32`, `:39`                                                              | Se ignora error de Supabase y rows null se trata como lista vacia. Lectura de codigo.                                                                                       | Si PostgREST falla por red o schema, el dueno ve Outstanding credit $0 y No credit sales yet para una cartera real.                                                                                                                              | Comprobar error y mostrar/reintentar un estado de carga fallida antes de calcular indicadores. Aplicar el mismo patron a listados y perfil, donde un fallo se confunde con ausencia.                                                              |
| P2-05 | `src/lib/colors.ts:17`, `:68`; archivos de la tabla de colores del inventario                       | Dos tokens sin uso visual y 45 apariciones/definiciones manuales fuera de la fuente unica. Analisis estatico ejecutado.                                                     | Al ajustar rojo.claro no cambian los rgb(205 38 38) copiados en botones. El tema/cambio de paleta deja superficies incoherentes.                                                                                                                 | Reemplazar literales por referencias de tokens semanticos; conservar valores fijos de marca donde corresponda. Los archivos reservados quedan para Claude.                                                                                        |
| P3-01 | `src/components/app/account-status.tsx:26`                                                          | DueSoonBadge no tiene consumidores en el programa TypeScript.                                                                                                               | Cambiar este componente nunca altera una pantalla actual, aunque parezca ser la implementacion del aviso de vencimiento.                                                                                                                         | Retirar export/componente hasta que exista un consumidor, o conectarlo al implementar el estado; no borrar tokens de estado que si consume la carpeta warn.                                                                                       |

Los P2 de devengo son fallos del contrato preparado para la futura integracion, no una
afirmacion de que hoy se esten cobrando intereses incorrectos. La falta del formulario
de nueva venta y del detalle/puntaje en `/me` es alcance conocido, no un bug nuevo.

## Reproducciones locales

Comando ejecutado: `node scripts/reproduce-credit-review.mjs`. Carga los modulos actuales
por transpilation TypeScript en memoria. No usa base ni modifica archivos. Salida real:

```json
[
  { "name": "abono de B no debe saldar A", "actual": "CURRENT", "expected": "OVERDUE", "matches": false },
  { "name": "pago a las 23:30 de Panama", "actual": "2026-10-19", "expected": "2026-10-18", "matches": false },
  { "name": "due this week despues de abono parcial", "actual": 10000, "expected": 4000, "matches": false },
  { "name": "mora pagada dentro del mismo corte", "actual": 0, "expected": 250, "matches": false },
  { "name": "interes previo no debe capitalizarse", "actual": 525, "expected": 500, "matches": false },
  {
    "name": "UI divide puntualidad por 40 con peso renormalizado",
    "actual": "57/40",
    "expected": "57 points",
    "matches": false
  },
  { "name": "coma decimal introducida por el usuario", "actual": 15000, "expected": null, "matches": false }
]
```

El JSON se compacta aqui conservando todos los campos y valores. `matches: false` es un
contraejemplo; el script es diagnostico, no una suite de regresion que apruebe esos bugs.
El caso de la UI comprueba la entrada y el texto generado por su expresion, no un render
de navegador.

## Supabase: evidencia actual, solo lectura

Proyecto confirmado por el conector: `fiao`, `yqhbnyhdyulxtvpzlcnp`, PostgreSQL 17.
Se consultaron `supabase_migrations.schema_migrations`, `pg_class`, `pg_policies`,
`information_schema.role_table_grants`, `pg_proc` y `pg_trigger`. Diez versiones locales
y remotas coinciden: 20261015174144, 20261016175031, 20261016193000, 20261016200000,
20261016203000, 20261016210000, 20261016223000, 20261016231500, 20261018120000, 20261018200000. Once tablas publicas, todas con RLS; 23 politicas publicas.

Consulta focal ejecutada y resultado real:

```sql
select
  has_column_privilege('authenticated','public.customers','notes','SELECT') as linked_customer_can_select_notes,
  (select qual from pg_policies where schemaname='public' and policyname='customers_select_self') as customer_policy,
  (select qual from pg_policies where schemaname='public' and policyname='businesses_select') as business_policy,
  has_column_privilege('authenticated','public.sales','balance_cents','UPDATE') as member_can_update_balance,
  (select qual from pg_policies where schemaname='public' and policyname='sales_all') as sales_policy,
  (select count(*) from pg_trigger where tgrelid='public.sales'::regclass and not tgisinternal) as custom_sales_triggers,
  (select bool_and(confkey is not null) from pg_constraint
   where conrelid in ('public.sales'::regclass,'public.sale_items'::regclass,'public.installments'::regclass,'public.payments'::regclass)
   and contype='f') as foreign_keys_present;
```

```json
[
  {
    "linked_customer_can_select_notes": true,
    "customer_policy": "(user_id = ( SELECT auth.uid() AS uid))",
    "business_policy": "is_member(id)",
    "member_can_update_balance": true,
    "sales_policy": "is_member(business_id)",
    "custom_sales_triggers": 0,
    "foreign_keys_present": true
  }
]
```

Tambien se verificaron lecturas con rol authenticated y claims de membresias existentes,
dentro de transacciones READ ONLY terminadas con ROLLBACK. No se devolvieron nombres,
UUID ni notas personales. Consulta de denegacion ejecutada:

```sql
begin transaction read only;
select set_config('request.jwt.claim.sub',
  (select user_id::text from public.business_members order by created_at limit 1),true) is not null as member_fixture;
select set_config('audit.foreign_customers',
  (select count(*)::text from public.customers c where not public.is_member(c.business_id)
   and c.user_id is distinct from auth.uid()),true) is not null as baseline_saved;
set local role authenticated;
select current_setting('audit.foreign_customers')::int as foreign_customer_rows_in_fixture,
  (select count(*) from public.customers c where not public.is_member(c.business_id)
   and c.user_id is distinct from auth.uid()) as visible_foreign_customers,
  (select count(*) from public.customers c where public.is_member(c.business_id)) as visible_member_customers;
rollback;
```

```json
[{ "foreign_customer_rows_in_fixture": 2, "visible_foreign_customers": 0, "visible_member_customers": 0 }]
```

Para comprobar tambien el caso permitido, se repitio con el uid obtenido de
`business_members join customers using (business_id)`, ordenado por bm.created_at,
limit 1. Resultado real:

```json
[{ "visible_member_customers": 1, "visible_foreign_customers": 0 }]
```

**Limite:** esto prueba esas lecturas de customers con fixtures existentes. No certifica
INSERT/UPDATE/DELETE, el resto de tablas ni las acciones de dinero. Esas rutas requieren
pruebas con fixtures aislados; no se ejecutaron escrituras contra datos del usuario.
Las FK compuestas y los helpers con auth.uid()/search_path fijo son buenas defensas
observadas; no sustituyen esas pruebas.

Referencia contrastada: [documentacion oficial de RLS](https://supabase.com/docs/guides/database/postgres/row-level-security).
Se leyo el changelog actual; no se implementaron APIs ni cambios de Supabase.

## Validacion ejecutada: salida real

Primero se regenero el resultado Python, no se uso el guardado:

```text
> python -m oracle.emit
25 casos -> py-results.json
> python -m pytest -q
.......                                                                  [100%]
7 passed in 17.83s
Exception ignored in: <function Console.__del__ at 0x00000234EC5A40E0>
Traceback (most recent call last):
  File "C:\Users\Usuario\AppData\Local\Programs\Python\Python312\Lib\site-packages\pyreadline3\console\console.py", line 255, in __del__
OSError: [WinError -1073741816] Windows Error 0xc0000008
```

El proceso Python termino con exit 0; el destructor de pyreadline3 produjo ese aviso al
cerrarse. No se oculta el aviso ni se considera una prueba fallida.

Cadena pedida, ejecutada literalmente:
`pnpm typecheck && pnpm lint && pnpm test && pnpm build`.

```text
$ tsc --noEmit
$ next lint
`next lint` is deprecated and will be removed in Next.js 16.
For new projects, use create-next-app to choose your preferred linter.
For existing projects, migrate to the ESLint CLI:
npx @next/codemod@canary next-lint-to-eslint-cli .

✔ No ESLint warnings or errors
$ vitest run

 RUN  v5.0.5 C:/Users/Usuario/Desktop/fiao

 Test Files  14 passed (14)
      Tests  145 passed (145)
   Start at  09:49:38
   Duration  60.55s (environment 60%, setup 25%, import 11%, tests 2%, worker 1%, transform 1%)

Environment  jsdom was created 14 times · 209.07s total, 60% of tracked time
             create it once per worker with pool: 'vmThreads' (keeps per-file isolation) or isolate: false (shares it across files)
             learn more: https://vitest.dev/guide/improving-performance#test-environments

$ node scripts/next-dist.mjs build
   ▲ Next.js 15.5.28
   - Environments: .env.local

   Creating an optimized production build ...
Failed to compile.

Error: EPERM: operation not permitted, mkdir 'C:\Users\Usuario\Desktop\fiao\.next-build\types\app\(marketing)'

> Build failed because of webpack errors
[ELIFECYCLE] Command failed with exit code 1.
```

Tras conceder acceso a .next-build se reintento `pnpm build` y fallo por otro EPERM:

```text
$ node scripts/next-dist.mjs build
   ▲ Next.js 15.5.28
   - Environments: .env.local

   Creating an optimized production build ...
Failed to compile.

Error: EPERM: operation not permitted, mkdir 'C:\Users\Usuario\Desktop\fiao\.next-build\static\chunks\app\(app)\app\products\[id]'

> Build failed because of webpack errors
[ELIFECYCLE] Command failed with exit code 1.
```

Se uso la variable ya soportada por scripts/next-dist.mjs, sin cambiar configuracion
del proyecto: `$env:NEXT_DIST_DIR = '.next-codex-inventario'; pnpm build`.
Salida real; exit 0:

```text
$ node scripts/next-dist.mjs build
   ▲ Next.js 15.5.28
   - Environments: .env.local

   Creating an optimized production build ...
<w> [webpack.cache.PackFileCacheStrategy] Serializing big strings (113kiB) impacts deserialization performance (consider using Buffer instead and decode when needed)
<w> [webpack.cache.PackFileCacheStrategy] Serializing big strings (268kiB) impacts deserialization performance (consider using Buffer instead and decode when needed)
 ✓ Compiled successfully in 106s
   Linting and checking validity of types ...

   We detected TypeScript in your project and reconfigured your tsconfig.json file for you.
   The following suggested values were added to your tsconfig.json. These values can be changed to fit your project's needs:

   	- include was updated to add '.next-codex-inventario/types/**/*.ts'

   Collecting page data ...
   Generating static pages (0/22) ...
   Generating static pages (5/22)
   Generating static pages (10/22)
   Generating static pages (16/22)
 ✓ Generating static pages (22/22)
   Finalizing page optimization ...
   Collecting build traces ...

Route (app)                                 Size  First Load JS
┌ ○ /                                    14.9 kB         271 kB
├ ○ /_not-found                            131 B         102 kB
├ ○ /about                                1.5 kB         107 kB
├ ƒ /app                                 2.06 kB         258 kB
├ ƒ /app/customers                       4.96 kB         110 kB
├ ƒ /app/customers/[id]                  3.46 kB         109 kB
├ ƒ /app/customers/new                     605 B         106 kB
├ ƒ /app/products                         1.5 kB         107 kB
├ ƒ /app/products/[id]                     605 B         106 kB
├ ƒ /app/products/new                      605 B         106 kB
├ ƒ /app/reports                          1.5 kB         107 kB
├ ƒ /app/sales                            1.5 kB         107 kB
├ ƒ /app/sales/[id]                      2.96 kB         151 kB
├ ƒ /app/sales/new                        1.5 kB         107 kB
├ ƒ /app/settings                         4.4 kB         179 kB
├ ƒ /auth/callback                         131 B         102 kB
├ ○ /login                               3.57 kB         109 kB
├ ƒ /me                                  3.35 kB         178 kB
├ ƒ /me/link                              3.7 kB         109 kB
├ ƒ /onboarding                          7.71 kB         222 kB
├ ○ /privacy                               131 B         102 kB
└ ○ /services                             1.5 kB         107 kB
+ First Load JS shared by all             102 kB
  ├ chunks/450-628acb04c721863c.js       45.9 kB
  ├ chunks/a7381167-2b4502a98418a98f.js  54.2 kB
  └ other shared chunks (total)          2.01 kB

ƒ Middleware                             94.9 kB

○  (Static)   prerendered as static content
ƒ  (Dynamic)  server-rendered on demand
```

Next agrego temporalmente el directorio de tipos de esa salida en tsconfig.json; se
retiro exclusivamente ese cambio automatico al terminar. No se cambia la configuracion
del proyecto para resolver un permiso de esta sesion.

## Archivos reservados y limites

No se editaron ui.tsx, app-shell.tsx, landing/_, onboarding/_ ni DISENO.md. Se compararon
sus hashes SHA256 antes/despues y el diff. Los colores manuales en landing y onboarding,
y el movimiento del globo, quedan anotados para Claude. No se hizo push ni merge.

No se ejecutaron e2e, nuevas migraciones, pruebas de escritura RLS, cobros contra la nube,
despliegues, auditoria visual de todas las pantallas, restauracion de backups ni cambios
de Auth remoto. No se certifica la politica real de passwords. El build no prueba esos
recorridos. El informe historico siguiente no es evidencia de esta revision.

---

# Anexo historico: informe de Codex del 2026-10-18

Fecha: 2026-10-18 (America/Panama).
Autor: Codex.
Proyecto revisado: C:/Users/Usuario/Desktop/fiao.
Rama indicada por .git/HEAD y VS Code: fase-0-setup.

## 1. Dictamen

FIA'O tiene una base de aplicacion considerable: identidad visual, autenticacion, onboarding, clientes, productos, dashboard, motor de credito y registro de abonos. El bloqueo funcional principal es crear una venta a credito desde la interfaz. Esa pantalla sigue siendo un contenedor informativo.

La siguiente entrega recomendada es completar el recorrido cliente -> productos -> cuotas -> guardar venta -> registrar abono -> consultar saldo actualizado. Es lo que permite demostrar el negocio completo con los modulos existentes.

## 2. Alcance y evidencia

Este informe se basa en inspeccion de VS Code, lectura de archivos locales, configuracion de pruebas y documentacion. No se ejecutaron pruebas nuevas, build ni operaciones contra Supabase. No se verifico la aplicacion desplegada ni la configuracion de la nube.

El archivo test-results/.last-run.json contiene status passed y failedTests vacio. Es un resultado guardado; no demuestra por si solo que el codigo actual haya pasado ni identifica aqui la revision probada.

Los intentos de consultar git status desde este entorno fallaron. No se certifica que el arbol de trabajo este limpio ni se atribuyen cambios pendientes a Claude o al usuario.

## 3. Estado observado en el repositorio

| Area                 | Estado observado                                                           | Evidencia local                                                       |
| -------------------- | -------------------------------------------------------------------------- | --------------------------------------------------------------------- |
| Stack                | Next.js 15, React 19, TypeScript, Tailwind, Supabase y Recharts declarados | package.json                                                          |
| Landing              | Entrada con firma revelada mediante mascaras y animacion                   | src/components/landing/intro.tsx                                      |
| Acceso y onboarding  | Rutas, acciones y formularios para negocio y cliente; campo de avatar      | src/components/auth/, src/app/onboarding/, src/components/onboarding/ |
| Clientes             | Alta con validacion del servidor, ficha e invitaciones                     | src/app/(app)/app/customers/actions.ts y customers/[id]/              |
| Inventario           | Alta y actualizacion de precio, stock y umbral de alerta                   | src/app/(app)/app/products/actions.ts                                 |
| Dashboard            | Cartera, mora, vencimientos, cobros y graficos conectados a consultas      | src/app/(app)/app/page.tsx                                            |
| Motor de credito     | Modulo separado con archivos de pruebas y contraste con Python             | src/lib/credit/ y tools/oracle/                                       |
| Nueva venta          | Pendiente: muestra cuatro pasos y anuncia una actualizacion futura         | src/app/(app)/app/sales/new/page.tsx                                  |
| Detalle de venta     | Consulta articulos, cuotas, pagos y saldo; incluye formulario de abono     | src/app/(app)/app/sales/[id]/page.tsx                                 |
| Abonos               | Accion con validacion, token del cliente y llamada a register_payment      | src/app/(app)/app/sales/[id]/actions.ts                               |
| Portal del cliente   | Consulta negocios vinculados y saldos; permite vincular otra tienda        | src/app/me/page.tsx y src/app/me/link/                                |
| Reportes             | Pendiente: pantalla con mensaje de proxima disponibilidad                  | src/app/(app)/app/reports/page.tsx                                    |
| Pruebas de navegador | Playwright instalado; recorrido de dueno y prueba de tema                  | package.json, e2e/ y playwright.config.ts                             |
| Integracion continua | Configura formato, lint, tipos, pruebas, oraculo Python y build            | .github/workflows/ci.yml                                              |

Presencia de codigo no equivale a funcionamiento comprobado de extremo a extremo. La tabla describe implementacion visible, no una certificacion de produccion.

## 4. Pendientes prioritarios

### P1. Registrar ventas a credito

La ruta /app/sales/new no contiene el formulario ni la accion de guardado. Este pendiente impide alimentar normalmente el circuito de cartera y cobros desde la aplicacion.

Criterios de aceptacion propuestos:

- Elegir un cliente del negocio y productos con cantidades validas.
- Calcular importes en centavos enteros y repartir cuotas sin perder centavos.
- Validar precio, pertenencia al negocio, stock y fechas en el servidor.
- Guardar venta, articulos, cuotas y movimiento de stock en una sola transaccion.
- Evitar ventas duplicadas por doble envio o reintento.
- Mostrar el detalle guardado y reflejar la deuda en el dashboard.
- Registrar un abono y comprobar saldo, historial y acceso del cliente.

Estos puntos son una propuesta para la siguiente entrega, no comportamientos ya verificados.

### P2. Integrar las reglas de intereses

src/lib/credit-account.ts pasa creditLimitCents: null y graceDays: 0 al motor. Sus comentarios relacionan esos valores con columnas pendientes de la migracion de intereses. La existencia de calculos de interes dentro del motor no implica que esten conectados a la operacion real.

Antes de ampliar reglas en las pantallas, revisar docs/MODELO-CREDITO.md, el esquema vigente y los tipos compartidos. Las reglas financieras deben permanecer en el dominio y validarse en el servidor.

### P3. Construir reportes y funcionamiento offline

La pantalla de reportes esta vacia. PWA y sincronizacion offline figuran pendientes en la documentacion; esta revision no ejecuto una auditoria de instalabilidad ni del service worker.

La cola offline debera apoyarse en operaciones idempotentes y validacion del servidor. Conviene cerrar primero la venta online para disponer de un recorrido de referencia verificable.

### P4. Actualizar la documentacion de estado

- README.md y docs/AUDITORIA.md aun presentan Playwright como pendiente, aunque esta instalado y existen especificaciones.
- docs/FASE-3-DASHBOARD.md conserva pendientes de abonos y del portal del cliente para los que ya hay codigo.
- docs/PULIDO.md marca modo oscuro y Playwright como hechos en su tabla, pero mantiene parrafos anteriores que dicen que faltan.

Recomendacion: distinguir explicitamente estado actual, notas historicas y evidencia de cada verificacion. No reutilizar cifras antiguas de pruebas como si fueran una ejecucion de hoy.

## 5. Verificaciones aun necesarias

No se confirma en esta pasada:

- Que las migraciones locales, incluidas pagos y avatares, coincidan con la base remota.
- La politica de contrasenas configurada en Supabase. docs/AUDITORIA.md la deja abierta.
- La restauracion de respaldos antes de una beta con usuarios reales.
- El resultado actual de lint, typecheck, pruebas y build.
- El aislamiento entre negocios mediante una prueba con dos cuentas.
- La operacion completa con ventas, cuotas, abonos y datos reales de prueba.

La configuracion de Playwright indica que el recorrido del dueno crea usuarios y negocios en el Supabase de .env.local. Una nueva ejecucion debe considerar esos efectos; este informe no la lanzo. El CI leido no incluye una etapa de Playwright.

## 6. Coordinacion propuesta con Claude Code

Este archivo es el informe propio de Codex y un punto de referencia para la colaboracion. No implica que se haya enviado un mensaje a Claude ni que haya aceptado una asignacion.

- Acordar un responsable de implementacion por tarea y evitar ediciones simultaneas del mismo archivo.
- Usar CLAUDE.md y los ADR como convenciones del proyecto: UI en ingles, dinero en centavos, tipos compartidos y motor puro.
- Revisar el diff y el resultado observable del recorrido antes de dar una tarea por cerrada.
- Anotar aqui las futuras verificaciones con fecha, revision y comando o recorrido utilizado.

## 7. Registro de esta intervencion

Trabajo realizado: inspeccion del repositorio y creacion de este informe a peticion del usuario.

No se cambiaron modulos de la aplicacion ni se ejecutaron migraciones, despliegues o pruebas nuevas. Las recomendaciones quedan pendientes de implementacion.
