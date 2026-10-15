# FIA'O

Plataforma PWA de ventas a credito para pequenos negocios.
Contexto completo en [docs/PLAN.md](docs/PLAN.md). Diseno en [docs/DISENO.md](docs/DISENO.md).

## Stack

TypeScript de extremo a extremo. Next.js 14 (App Router) + Tailwind en el frontend,
Supabase Edge Functions en el backend, Supabase/PostgreSQL con RLS como base de datos,
Recharts para graficas, Vitest + Playwright + Testing Library para pruebas.

No agregar lenguajes ni servicios nuevos al stack. Java, Spring Boot y Python quedaron
descartados a proposito; el motivo esta en PLAN.md seccion 2.2.

## Reglas innegociables

- **Dinero en centavos, siempre enteros.** Nunca float para montos. Se revisa en code
  review.
- **RLS desde el dia uno.** El multi-tenancy se garantiza en la base de datos, no en la
  interfaz. Migraciones versionadas con la CLI de Supabase.
- **Tipos compartidos** en `shared/types`, usados por frontend y Edge Functions.
- **El motor de puntaje lleva tests exhaustivos:** pagos puntuales, atrasos de 1, 7 y 30
  dias, abonos parciales, normalizacion por monto.
- **Saldo y puntaje se actualizan en la misma transaccion.**
- **Validacion del lado del servidor siempre,** sobre todo en la cola de sincronizacion
  offline.
- **Nada de codigo que el equipo no sepa explicar.** Cada diff pasa por revision humana.

## Decisiones de arquitectura

Cada decision que cambie el rumbo tecnico se documenta como ADR en `docs/adr/`.

## Output rules (token-efficient, coding profile)

- Frases cortas. Sin preambulo, sin recap, sin cierres de cortesia.
- Primero la herramienta. Primero el resultado. Explicar solo si se pide o no es obvio.
- Primero el codigo. La prosa despues, solo cuando el codigo no se explica solo.
- Sin em dashes, comillas tipograficas ni Unicode decorativo. Guiones y comillas rectas.
- Las letras acentuadas y otros caracteres de lenguaje natural estan bien.
- El codigo de salida debe ser copy-paste safe.

## Code rules

- La solucion mas simple que funcione. Nada de over-engineering.
- Sin abstracciones para operaciones de un solo uso.
- Sin funcionalidades especulativas.
- Leer el archivo antes de modificarlo. Nunca editar a ciegas.
- Sin manejo de errores para escenarios que no pueden ocurrir.

## Review y debugging

- Decir el bug. Mostrar el fix. Parar.
- Nunca especular sobre un bug sin leer el codigo primero.
- Si la causa no esta clara, decirlo. No adivinar.
- No adivinar APIs, versiones, flags ni nombres de paquetes. Verificar en codigo o docs.
