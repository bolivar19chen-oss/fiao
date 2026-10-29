# Convenciones de FIA'O

Como se escribe el codigo de este proyecto y por que. Contexto completo en
[docs/PLAN.md](docs/PLAN.md). Diseno en [docs/DISENO.md](docs/DISENO.md).

## Stack

Aplicacion en TypeScript: Next.js 15 (App Router) + Tailwind en el frontend, Server
Actions y funciones de PostgreSQL en el backend, Supabase/PostgreSQL con RLS como base de
datos, Recharts para graficas, Vitest + Playwright + Testing Library para pruebas.

El calculo de credito (intereses, saldos, estados, puntaje) va en `src/lib/credit/`, en
TypeScript, como modulo puro: sin base de datos, sin leer el reloj, sin dependencias. La
fecha entra como argumento. Reglas en [docs/MODELO-CREDITO.md](docs/MODELO-CREDITO.md).

Python vive en `tools/`, fuera del camino de ejecucion: un oraculo que verifica ese
calculo en CI y un generador de datos de demostracion. Nunca se importa desde `src/`.
Ver [docs/HERRAMIENTAS-PYTHON.md](docs/HERRAMIENTAS-PYTHON.md).

No agregar mas lenguajes ni servicios. Java, Spring Boot y C++ quedaron descartados a
proposito: PLAN.md seccion 2.2, [ADR 0003](docs/adr/0003-sin-cpp.md) y
[ADR 0005](docs/adr/0005-calculo-en-typescript-python-como-herramienta.md).

## Reglas innegociables

- **UI en ingles.** Todo texto visible al usuario va en ingles. Docs y comentarios
  internos pueden ir en espanol.
- **Dinero en centavos, siempre enteros.** Nunca float para montos. Se revisa en code
  review.
- **RLS desde el dia uno.** El multi-tenancy se garantiza en la base de datos, no en la
  interfaz. Migraciones versionadas con la CLI de Supabase.
- **Tipos compartidos** en `shared/types`, usados por el frontend y el servidor.
- **El motor de puntaje lleva tests exhaustivos:** pagos puntuales, atrasos de 1, 7 y 30
  dias, abonos parciales, normalizacion por monto.
- **Saldo y puntaje se actualizan en la misma transaccion.**
- **Validacion del lado del servidor siempre,** sobre todo en la cola de sincronizacion
  offline.
- **Nada de codigo que el equipo no sepa explicar.** Cada diff pasa por revision humana.

## Decisiones de arquitectura

Cada decision que cambie el rumbo tecnico se documenta como ADR en `docs/adr/`.

## Estilo de codigo

- La solucion mas simple que funcione. Nada de over-engineering.
- Sin abstracciones para operaciones de un solo uso.
- Sin funcionalidades especulativas.
- Sin manejo de errores para escenarios que no pueden ocurrir.
- Los colores no se escriben a mano en un componente: salen de `src/lib/colors.ts`.
- Comentar el porque que el codigo no puede mostrar, no el que.

## Revision y depuracion

- Decir el bug. Mostrar el fix. Parar.
- Nunca especular sobre un bug sin leer el codigo primero.
- Si la causa no esta clara, decirlo.
- No adivinar APIs, versiones, flags ni nombres de paquetes. Verificar en codigo o docs.
- Una cifra guardada no prueba el codigo de hoy: antes de afirmar que algo pasa, correrlo.
