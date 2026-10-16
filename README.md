# FIA'O

**Tu negocio, mejor organizado.**

Plataforma web y movil (PWA) para que pequenos negocios gestionen sus ventas a credito:
control de inventario, historial de pagos de clientes y calculo de un puntaje de credito.

Mas control, menos riesgos, mas ventas.

## Estado

Fase 2 (estructura y flujo), ver [docs/FASE-2-ESTRUCTURA.md](docs/FASE-2-ESTRUCTURA.md): auth con
Supabase, onboarding de negocio, shell de la aplicacion y rutas de clientes, inventario, ventas,
reportes y ajustes. Schema con RLS en `supabase/migrations/`.

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

| Capa            | Tecnologia                                          |
| --------------- | --------------------------------------------------- |
| Frontend        | Next.js 15 (App Router) + TypeScript + Tailwind CSS |
| Backend         | Supabase Edge Functions (TypeScript)                |
| Base de datos   | Supabase (PostgreSQL + Auth + Row Level Security)   |
| Dinero          | Enteros en centavos / decimal.js                    |
| Graficas        | Recharts                                            |
| Movil / offline | PWA (Workbox / next-pwa)                            |
| CI/CD           | GitHub Actions + Vercel                             |
| Pruebas         | Vitest + Playwright + Testing Library               |

Un solo lenguaje de punta a punta: TypeScript. El motivo esta en
[docs/PLAN.md](docs/PLAN.md), seccion 2.

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
