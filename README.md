# FIA'O

**Tu negocio, mejor organizado.**

Plataforma web y movil (PWA) para que pequenos negocios gestionen sus ventas a credito:
control de inventario, historial de pagos de clientes y calculo de un puntaje de credito.

Mas control, menos riesgos, mas ventas.

## Estado

Fase 0 (setup). Repo recien creado, sin codigo de aplicacion todavia.

## Documentacion

| Documento | Contenido |
|---|---|
| [docs/PLAN.md](docs/PLAN.md) | Plan tecnico completo: modulos, stack, hoja de ruta, riesgos |
| [docs/DISENO.md](docs/DISENO.md) | Paleta, tipografia y criterios de interfaz |
| [CLAUDE.md](CLAUDE.md) | Reglas de trabajo y convenciones de codigo |

## Stack

| Capa | Tecnologia |
|---|---|
| Frontend | Next.js 14 (App Router) + TypeScript + Tailwind CSS |
| Backend | Supabase Edge Functions (TypeScript) |
| Base de datos | Supabase (PostgreSQL + Auth + Row Level Security) |
| Dinero | Enteros en centavos / decimal.js |
| Graficas | Recharts |
| Movil / offline | PWA (Workbox / next-pwa) |
| CI/CD | GitHub Actions + Vercel |
| Pruebas | Vitest + Playwright + Testing Library |

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
