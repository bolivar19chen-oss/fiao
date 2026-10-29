# ADR 0004 - Motor financiero en Python, puro y sin estado

Fecha: 2026-10-16. Estado: **superado** por
[ADR 0005](0005-calculo-en-typescript-python-como-herramienta.md) el mismo dia.

Se escribio asumiendo que el calculo podia vivir en un servicio fuera de la aplicacion.
El equipo aclaro despues que todo corre dentro de la misma web, lo que invalida la
premisa. Se conserva por el registro de la decision y porque su analisis del problema
offline y del riesgo sobre el RLS sigue siendo valido.

## Contexto

Decision del equipo: la matematica del credito (intereses, saldos, manejo de cuentas,
puntaje) se escribe en un lenguaje aparte, no en TypeScript. La interfaz, el diseno y la
estructura de la aplicacion siguen en TypeScript.

El ADR 0003 descarto C++ y esa parte se mantiene. Lo que cambia es que ahora si existe un
servicio en otro lenguaje para el calculo financiero.

Se evaluo Python contra Java. Se elige **Python, uno solo**. Dos lenguajes extra son dos
despliegues, dos pipelines y el doble de superficie de error, que es justo el problema que
el PLAN.md seccion 2.2 diagnostico. Python ademas se lee mas rapido, y las reglas
financieras tienen que poder leerse y defenderse.

## Decision

Un servicio en Python que calcula y **no hace nada mas**.

La regla que lo define: **el motor es puro**. Recibe los movimientos y la configuracion
como entrada, devuelve el resultado como salida. No se conecta a la base de datos, no
sabe quien es el usuario, no guarda estado.

Todo lo demas sigue en TypeScript: Next.js lee los datos bajo la sesion del usuario, se
los pasa al motor, recibe el resultado y lo persiste.

## Por que puro

**Preserva el RLS.** El multi-tenancy vive en las politicas de Postgres, que dependen del
JWT del usuario. Un servicio que se conectara a la base con credencial propia se saltearia
esas politicas, y perder eso seria perder la pieza mas solida del proyecto. Si el motor no
toca la base, el problema no existe.

**Lo hace trivial de probar.** Entrada conocida, salida esperada, sin montar base ni
sesiones. La suite exhaustiva que exige el PLAN.md se vuelve barata de escribir.

**Lo hace trivial de desplegar.** Sin estado, sin migraciones, sin conexiones que
mantener. Un contenedor que responde y listo.

## Que resuelve el problema del offline

Objecion que se planteo al decidir esto: la PWA calcula saldos en el telefono y un
servicio Python no corre ahi. Si hubiera que reimplementar el motor en el cliente serian
dos versiones de la misma matematica, y eso termina en descuadres.

Se resuelve separando las dos operaciones, que no tienen la misma dificultad:

- **Restar un abono del saldo es una resta.** Eso corre en el cliente, offline, en
  TypeScript, y no duplica nada porque no hay nada que duplicar.
- **Devengar intereses es el calculo dificil,** y ocurre una vez al mes en el corte. El
  corte es un proceso del servidor por definicion: nunca se ejecuta en el telefono.

Asi que la matematica dificil vive en un solo lugar y nunca se duplica. El cliente offline
muestra un saldo provisional por resta, y el servidor es siempre la autoridad al
sincronizar, como ya exige PLAN.md Fase 3.

## Consecuencias

- Se agrega un despliegue: el servicio Python. Es el unico servicio extra permitido.
- El contrato entre Next.js y el motor se define en `docs/MOTOR-FINANCIERO.md` y se
  versiona. Un cambio de contrato es un cambio de los dos lados.
- CONVENCIONES.md deja de decir que Python esta descartado. Java y C++ siguen descartados.
- El motor no sustituye las Edge Functions: las operaciones que escriben en la base
  (registrar abono, cerrar venta) siguen en TypeScript, junto a los datos y bajo RLS.
- Si el servicio esta caido, la aplicacion sigue funcionando para todo lo que no sea
  devengo ni puntaje. Hay que disenar las pantallas para eso, no asumir que responde.
