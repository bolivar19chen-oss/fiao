# Fase 2 - Estructura y flujo de la aplicacion

Brief de trabajo para la sesion de Claude Code. Objetivo: dejar el esqueleto navegable de
la aplicacion autenticada, con el flujo completo desde el login hasta cada pantalla.

Decisiones que ya estan tomadas y no se rediscuten:
[ADR 0002](adr/0002-credito-por-tienda.md), [ADR 0003](adr/0003-sin-cpp.md),
[MODELO-CREDITO.md](MODELO-CREDITO.md), [PLAN.md](PLAN.md).

## 0. Estado inicial del brief (historico)

Este apartado describe el punto de partida de la fase, no el estado actual. Hoy existen
autenticacion real, clientes Supabase y `src/middleware.ts`. Estado de esta revision en
[INFORME-CODEX.md](INFORME-CODEX.md).

- Next 15.5.28, React 19, Tailwind, App Router. 53 archivos.
- Landing lista: `/`, `/about`, `/services`, `/privacy`.
- `/login` es **solo interfaz**. `AuthSwitch` tiene un `onSubmit` que no llama a nada.
- `@supabase/ssr` 0.12.7 y `@supabase/supabase-js` instalados, **sin usar**: no hay una
  sola referencia a supabase en `src/`.
- No hay `middleware.ts` ni `.env`.
- Schema aplicado: `supabase/migrations/20261015174144_init_schema.sql`, con
  `businesses`, `business_members`, `customers`, `products`, `sales`, `sale_items`,
  `installments`, `payments`, RLS y la funcion `create_business(text)`.

## 1. Alcance

**Entra:** autenticacion real, proteccion de rutas, onboarding de negocio, layout de la
aplicacion, y todas las rutas de la tabla de la seccion 4 navegables con datos reales de
lectura donde sea directo.

**No entra, y no se adelanta:** intereses, motor de puntaje, cola offline, service worker,
notificaciones, graficas de reportes. La pantalla de reportes queda como contenedor vacio.
Los cambios de schema de MODELO-CREDITO.md son de otra fase; no tocar la migracion.

Regla: esta fase es estructura y flujo. Si una pantalla necesita logica de negocio para
existir, se deja el contenedor y un estado vacio honesto, no datos inventados.

## 2. Autenticacion con Supabase

Leer la firma real en `node_modules/@supabase/ssr/dist/main/`, no asumir la API.
Verificado al escribir esto: `createServerClient` exige `cookies` con **`getAll` y
`setAll`**; la variante `get`/`set`/`remove` esta deprecada y la libreria advierte que
usarla causa cierres de sesion aleatorios. El middleware es obligatorio: sin el, los
refrescos de token no se escriben en la respuesta.

Archivos a crear:

| Archivo                          | Rol                                                         |
| -------------------------------- | ----------------------------------------------------------- |
| `src/lib/supabase/client.ts`     | `createBrowserClient` para componentes cliente              |
| `src/lib/supabase/server.ts`     | `createServerClient` por request, con `getAll`/`setAll`     |
| `src/lib/supabase/middleware.ts` | Refresco de sesion, usado por el middleware raiz            |
| `src/middleware.ts`              | Refresca sesion y protege `/app` y `/onboarding`            |
| `.env.example`                   | `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY` |

Next 15: `cookies()` es asincrono, hay que `await`. Ver ADR 0001.

Correccion: el middleware va en `src/middleware.ts`, no en la raiz. Con `src/app`, Next solo
carga el de `src/` e ignora el de la raiz sin avisar.

Nunca crear un cliente de servidor compartido entre requests: uno nuevo por render.

`AuthSwitch` pasa a conectar de verdad contra `signInWithPassword` y `signUp`, con estado
de carga y errores visibles en ingles. **No cambiar su aspecto ni su animacion.** Es UI
aprobada; solo se le conecta el comportamiento.

## 3. Proteccion y redirecciones

El middleware decide con una sola regla por caso:

| Situacion                                                    | Destino       |
| ------------------------------------------------------------ | ------------- |
| Sin sesion y pide `/app/*` o `/onboarding`                   | `/login`      |
| Con sesion y pide `/login`                                   | `/app`        |
| Con sesion, sin negocio en `business_members`, pide `/app/*` | `/onboarding` |
| Con sesion, con negocio, pide `/onboarding`                  | `/app`        |

La consulta de pertenencia a negocio no va en el middleware si eso obliga a un viaje a la
base en cada request de assets. Hacer la comprobacion en el layout de `(app)` y dejar el
middleware solo con sesion. Elegir una de las dos y dejarlo escrito en el codigo.

## 4. Mapa de rutas

Reorganizar con grupos de rutas. El layout raiz actual pinta `SiteHeader` y `SiteFooter`
para todo, y eso no puede aparecer dentro de la aplicacion.

```
src/app/
  layout.tsx            <- solo html, body, fuentes y globals.css
  (marketing)/
    layout.tsx          <- SiteHeader + SiteFooter (lo que hoy hace el raiz)
    page.tsx            <- landing actual
    about/ services/ privacy/ login/
  (app)/
    layout.tsx          <- shell autenticado, comprueba sesion y negocio
    app/
      page.tsx          <- dashboard
      customers/ products/ sales/ reports/ settings/
  onboarding/
    page.tsx            <- crear negocio, sin shell
```

`/login` se queda dentro de `(marketing)` para que conserve exactamente el encuadre que
tiene hoy. No tocar su `pt-28` ni su `Aurora`.

Rutas de la aplicacion:

| Ruta                  | Pantalla            | Contenido en esta fase                                                                                                |
| --------------------- | ------------------- | --------------------------------------------------------------------------------------------------------------------- |
| `/app`                | Dashboard           | Tarjetas de cartera total, clientes con deuda, cobros de la semana. Valores reales por consulta, cero si no hay datos |
| `/app/customers`      | Lista de clientes   | Tabla con nombre, telefono, saldo. Estado vacio con llamada a crear                                                   |
| `/app/customers/new`  | Alta de cliente     | Formulario real que inserta                                                                                           |
| `/app/customers/[id]` | Estado de cuenta    | Datos del cliente, lista de ventas y abonos. Sin puntaje todavia                                                      |
| `/app/products`       | Inventario          | Tabla con nombre, precio, stock, aviso de stock bajo                                                                  |
| `/app/products/new`   | Alta de producto    | Formulario real que inserta                                                                                           |
| `/app/products/[id]`  | Detalle de producto | Edicion de precio y stock                                                                                             |
| `/app/sales`          | Ventas a credito    | Lista con cliente, total, saldo, fecha                                                                                |
| `/app/sales/new`      | Nueva venta         | Contenedor con los pasos marcados. El flujo completo es de la fase siguiente                                          |
| `/app/sales/[id]`     | Detalle de venta    | Items, cuotas, abonos. Sin registrar abonos todavia                                                                   |
| `/app/reports`        | Reportes            | Contenedor vacio con nota de proxima fase                                                                             |
| `/app/settings`       | Ajustes             | Nombre del negocio y miembros. Tasas cuando exista el schema de intereses                                             |
| `/onboarding`         | Crear negocio       | Llama a `create_business(text)` y redirige a `/app`                                                                   |

## 5. Shell autenticado

`(app)/layout.tsx`: navegacion lateral en escritorio, barra inferior en movil. El publico
objetivo usa celulares de gama baja, asi que el movil manda.

Secciones de la navegacion, en ingles: Dashboard, Customers, Inventory, Sales, Reports,
Settings. Mas el nombre del negocio y el cierre de sesion.

Reutilizar lo que ya existe en `src/components/ui/` antes de crear nada nuevo. El dock de
la landing es de marketing: si no encaja, hacer un componente propio del shell, no
forzarlo.

## 6. Convenciones

- Todo texto visible en ingles. Comentarios y documentos en espanol.
- Dinero en centavos, `bigint` en la base, enteros en el cliente. Formatear solo al
  mostrar, con el helper de `src/lib/format.ts`.
- Lectura de datos en Server Components. Mutaciones con Server Actions.
- Tipos de la base en `shared/types`, generados con la CLI de Supabase, no escritos a mano.
- No usar `any`.
- Estados vacios honestos: si no hay clientes, decirlo y ofrecer crear uno. Nunca datos de
  relleno.

## 7. Definicion de terminado

1. Un usuario nuevo se registra, cae en `/onboarding`, crea su negocio y llega a `/app`.
2. Cerrar sesion y volver a entrar lleva directo a `/app`, sin pasar por onboarding.
3. Entrar a `/app` sin sesion redirige a `/login`.
4. Un usuario no ve datos de otro negocio. Comprobado contra las politicas RLS, con dos
   cuentas.
5. Todas las rutas de la tabla responden, ninguna da 404 ni pantalla en blanco.
6. La landing y el login se ven exactamente igual que antes del cambio.
7. `pnpm build` y `pnpm lint` pasan sin advertencias nuevas.

## 8. Orden de trabajo

Un commit por punto, en este orden. Parar y mostrar el diff antes de seguir al siguiente.

1. Clientes de Supabase, `middleware.ts` y `.env.example`.
2. Grupos de rutas `(marketing)` y `(app)`, sin cambiar nada visual.
3. `AuthSwitch` conectado a auth real.
4. `/onboarding` con `create_business`.
5. Shell de `(app)` con navegacion.
6. Rutas de la tabla, en el orden en que aparecen.
7. Tipos generados y limpieza.

Sin Docker todavia: se trabaja contra un proyecto Supabase en la nube. `supabase start`
no corre en esta maquina.
