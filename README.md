# FIA'O

**Tu negocio, mejor organizado.**

Plataforma web y movil (PWA) para que pequenos negocios gestionen sus ventas a credito:
control de inventario, historial de pagos de clientes y un puntaje de credito por cliente.

La libreta de la tienda, convertida en un libro contable que no se pierde ni se discute.

---

## Puesta en marcha

Requisitos: **Node 24+** y **pnpm 11.17** (la version va fijada en `packageManager`, asi
que Corepack la instala sola). Para la base hace falta un proyecto de Supabase.

```bash
pnpm install
cp .env.example .env.local   # y completar las dos variables
pnpm dev
```

Las dos variables salen de **Supabase > Project Settings > API**:

| Variable                        | De donde sale       |
| ------------------------------- | ------------------- |
| `NEXT_PUBLIC_SUPABASE_URL`      | Project URL         |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Clave `anon public` |

Sin la clave el middleware falla en todas las paginas: no es opcional.

La aplicacion queda en <http://localhost:3000>.

### Base de datos

El schema vive versionado en `supabase/migrations/`. Para aplicarlo a un proyecto nuevo,
o despues de agregar una migracion:

```bash
pnpm supabase db push
pnpm gen:types
```

`gen:types` regenera `shared/types/database.ts`, que es lo que usan el frontend y las
acciones de servidor. **Si cambias el schema y no regeneras, los tipos mienten.**

### Datos de demostracion

Un dashboard sin ventas sale todo en `$0.00` y las graficas no se dibujan. Para llenarlo:

```bash
cd tools
python -m seed.render_sql --shop "Mi tienda" --today 2026-10-29 > seed/demo.sql
```

Y pegar el SQL resultante en el editor de Supabase.

---

## Comandos

| Comando          | Que hace                                                      |
| ---------------- | ------------------------------------------------------------- |
| `pnpm dev`       | Servidor de desarrollo                                        |
| `pnpm build`     | Compilacion de produccion (escribe en `.next-build`)          |
| `pnpm start`     | Sirve la compilacion de produccion                            |
| `pnpm test`      | Vitest: motor de credito, formato y componentes               |
| `pnpm e2e`       | Playwright. **Crea datos reales en Supabase**; no corre en CI |
| `pnpm lint`      | ESLint                                                        |
| `pnpm typecheck` | TypeScript sin emitir                                         |
| `pnpm format`    | Prettier sobre todo el repo                                   |
| `pnpm gen:types` | Regenera los tipos desde el schema vinculado                  |

Antes de abrir un pull request, lo mismo que corre el CI:

```bash
pnpm format:check && pnpm lint && pnpm typecheck && pnpm test && pnpm build
```

No corras `pnpm build` con el servidor de desarrollo arriba. Ya no se pisan (el build
escribe en otra carpeta), pero bajarlo sigue siendo lo prolijo.

### El oraculo de Python

El motor de credito tiene una segunda implementacion en Python que lo verifica en CI. Es
una herramienta, nunca se importa desde `src/`:

```bash
cd tools
python -m pip install -e ".[dev]"
python -m oracle.emit     # genera py-results.json, que lee una prueba de Vitest
python -m pytest -q       # propiedades que deben valer siempre
```

---

## Como esta hecho

| Capa          | Tecnologia                                          |
| ------------- | --------------------------------------------------- |
| Frontend      | Next.js 15 (App Router) + TypeScript + Tailwind CSS |
| Backend       | Server Actions y funciones de PostgreSQL            |
| Base de datos | Supabase (PostgreSQL + Auth + Row Level Security)   |
| Dinero        | Enteros en centavos, sin librerias                  |
| Graficas      | Recharts                                            |
| CI            | GitHub Actions                                      |
| Pruebas       | Vitest + Testing Library + Playwright               |

Todo el camino de ejecucion es TypeScript. Python vive solo en `tools/`.

```
src/
├── app/
│   ├── (marketing)/    # landing publica
│   ├── (app)/app/      # el lado del negocio: clientes, inventario, ventas
│   ├── me/             # el lado del cliente: su credito en cada tienda
│   └── onboarding/     # alta de negocio y de cliente
├── components/
├── lib/
│   └── credit/         # el motor: intereses, saldos, estados, puntaje
└── middleware.ts       # sesion y rutas protegidas
shared/types/           # tipos generados del schema, usados por las dos capas
supabase/migrations/    # el schema, versionado
tools/                  # oraculo Python y generador de datos de demo
```

### Las tres reglas que no se negocian

1. **El dinero va en centavos enteros.** Nunca un `float` para un monto.
2. **El multi-tenancy lo garantiza la base**, con Row Level Security desde la primera
   migracion. La interfaz no es la frontera de seguridad.
3. **El motor de credito es puro:** no lee el reloj, no toca la base, no tiene
   dependencias. La fecha entra como argumento. Por eso se puede probar de verdad.

El resto de convenciones esta en [CONVENCIONES.md](CONVENCIONES.md), y las decisiones de
arquitectura, una por archivo, en [docs/adr/](docs/adr/).

---

## Estado

**Funciona:** autenticacion, alta de negocio y de cliente, clientes, inventario, la venta
a credito con su calendario de cuotas, registro de abonos, dashboard, ajustes de terminos
y el panel del cliente. Tres idiomas (en/es/zh) y modo oscuro.

**Falta:** la cola de sincronizacion sin conexion (la landing ya la anuncia), las
notificaciones de cobro y los reportes historicos.

La hoja de ruta completa esta en [docs/PLAN.md](docs/PLAN.md).
