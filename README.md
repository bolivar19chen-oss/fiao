# FIA'O

**Tu negocio, mejor organizado.**

Plataforma web y movil (PWA) para que pequenos negocios gestionen sus ventas a credito:
control de inventario, historial de pagos de clientes y calculo de un puntaje de credito.

Mas control, menos riesgos, mas ventas.

## Estado

Hecho y verificado: auth con Supabase, onboarding de negocio y de cliente, shell de la
aplicacion, rutas de clientes, inventario, ventas, reportes y ajustes, schema con RLS en
`supabase/migrations/`, el motor de credito en `src/lib/credit/` y su oraculo Python en
`tools/`.

Falta: flujo de venta a credito desde la interfaz, migracion de intereses y PWA offline.
Playwright esta instalado y hay specs en `e2e/`; no corre en CI. El estado esta en
[docs/AUDITORIA.md](docs/AUDITORIA.md).

### Puesta en marcha

1. `pnpm install`
2. Copiar `.env.example` a `.env.local` y completar URL y anon key del proyecto Supabase
   (Project Settings > API). Sin la key, el middleware falla en todas las paginas.
3. `pnpm dev`

Proyecto Supabase vinculado: `yqhbnyhdyulxtvpzlcnp`. Tras cambiar el schema:
`pnpm supabase db push` y `pnpm gen:types` (regenera `shared/types/database.ts`).

### Entorno de desarrollo

Instalado y verificado: Node v24.18.0, pnpm 11.17.0, git 2.54.0, GitHub CLI 2.102.0,
JDK Temurin 25 (ajeno a este proyecto).

Pendiente: Docker Desktop y WSL2, necesarios solo para `supabase start` (base local).
Requieren permisos de administrador. Hasta entonces se trabaja contra un proyecto
Supabase en la nube.

El CLI de Supabase va como devDependency del proyecto (`pnpm supabase`), no global:
la instalacion global por npm no esta soportada y no figura en winget.

## Documentacion

| Documento                        | Contenido                                                    |
| -------------------------------- | ------------------------------------------------------------ |
| [docs/PLAN.md](docs/PLAN.md)     | Plan tecnico completo: modulos, stack, hoja de ruta, riesgos |
| [docs/DISENO.md](docs/DISENO.md) | Paleta, tipografia y criterios de interfaz                   |
| [CLAUDE.md](CLAUDE.md)           | Reglas de trabajo y convenciones de codigo                   |

## Stack

| Capa            | Tecnologia                                                          |
| --------------- | ------------------------------------------------------------------- |
| Frontend        | Next.js 15 (App Router) + TypeScript + Tailwind CSS                 |
| Backend         | Next.js Server Actions y RPCs PostgreSQL (Edge Functions previstas) |
| Base de datos   | Supabase (PostgreSQL + Auth + Row Level Security)                   |
| Dinero          | Enteros en centavos, sin librerias                                  |
| Graficas        | Recharts                                                            |
| Movil / offline | PWA offline prevista; Workbox / next-pwa sin instalar               |
| CI/CD           | GitHub Actions + Vercel                                             |
| Pruebas         | Vitest + Testing Library + Playwright (`e2e/`, ejecucion manual)    |

La aplicacion entera es TypeScript. Python vive solo en `tools/`, fuera del camino de
ejecucion: un oraculo que verifica el motor de credito en CI. Nunca se importa desde
`src/`. Ver [ADR 0005](docs/adr/0005-calculo-en-typescript-python-como-herramienta.md).

## Modulos

1. Autenticacion y multi-tenancy
2. Clientes (CRM ligero)
3. Inventario
4. Ventas a credito
5. Motor de puntaje de credito
6. Reportes y dashboards
7. PWA y offline
8. Notificaciones

Los diferenciales tecnicos son el **motor de puntaje** y la **sincronizacion offline**.
