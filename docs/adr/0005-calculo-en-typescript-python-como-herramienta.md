# ADR 0005 - Calculo en TypeScript, Python como herramienta de verificacion

Fecha: 2026-10-16. Estado: aceptado.
Reemplaza a [ADR 0004](0004-motor-financiero-python.md), que queda **superado**.

## Contexto

El ADR 0004 definia el motor financiero como un servicio Python aparte. Se escribio
asumiendo que el calculo podia vivir fuera de la aplicacion. El equipo aclaro despues que
no: todo el manejo de cuentas y credito corre **dentro de la misma web**.

Con esa restriccion, un servicio externo deja de ser una opcion: habria que llamarlo por
HTTP desde la web, lo que agrega un despliegue, latencia, un contrato que mantener, riesgo
sobre el RLS y la imposibilidad de calcular sin conexion.

Tambien se reviso la premisa de que otro lenguaje da mas precision monetaria. Es falsa en
este caso. Los numeros de JavaScript son exactos para enteros hasta 9.007.199.254.740.991,
que en centavos son noventa billones de dolares. El problema clasico de `0.1 + 0.2` es de
fracciones decimales, y aqui no hay decimales: hay centavos enteros. `Decimal` de Python y
`BigDecimal` de Java resuelven un problema que el modelo de datos ya evito.

## Decision

**Todo el calculo de credito se implementa en TypeScript, dentro de la aplicacion web.**
Intereses, saldos, estados y puntaje. Las reglas no cambian: siguen siendo las de
[MODELO-CREDITO.md](../MODELO-CREDITO.md). Cambia donde viven.

Vive en `src/lib/credit/`, como modulo puro: sin acceso a base de datos, sin lectura del
reloj, sin dependencias. La fecha de referencia entra como argumento. Asi corre igual en
el servidor, en una Edge Function y en el cliente sin conexion, que es el requisito de la
Fase 3.

**Python se adopta, fuera del camino de ejecucion.** Dos usos, detallados en
[HERRAMIENTAS-PYTHON.md](../HERRAMIENTAS-PYTHON.md):

1. **Oraculo de verificacion.** Una segunda implementacion independiente de la misma
   matematica, usada en CI para contrastar resultados contra la de TypeScript. Si las dos
   no coinciden al centavo, el build falla.
2. **Generador de datos de demostracion.** Produce negocios, clientes y meses de
   movimientos coherentes para la demo y para las pruebas de carga.

Ninguno de los dos se importa desde la aplicacion ni responde a un request. Son
herramientas de desarrollo.

**Java no se adopta.** No hay en este proyecto un problema con forma de Java: no hay
concurrencia pesada, ni un backend corporativo exigido, ni integracion con un ecosistema
JVM. Agregarlo seria tecnologia sin problema que la justifique, que es exactamente lo que
el PLAN.md seccion 2.2 identifico como el error a evitar. El JDK instalado en la maquina
de trabajo no pertenece a este proyecto.

## Por que el oraculo si suma

Es la parte que vale la pena defender ante un jurado.

Dos implementaciones independientes de la misma especificacion, contrastadas
automaticamente, es una tecnica real de software financiero: se llama prueba diferencial.
Sirve porque un error de interpretacion de la regla se cuela en una implementacion, pero
es muy improbable que se cuele identico en dos escritas por separado.

La condicion que lo hace valido: **el oraculo se escribe desde el documento, nunca
traduciendo el codigo TypeScript.** Si se traduce, hereda los mismos errores y no verifica
nada.

Aqui Python aporta algo concreto que no es decoracion: se lee casi como la especificacion,
y `hypothesis` genera casos de prueba que ninguna persona escribiria a mano.

## Consecuencias

- `engine/` como servicio no se construye. El contrato HTTP de
  [MOTOR-FINANCIERO.md](../MOTOR-FINANCIERO.md) queda sin efecto; sus reglas de dominio y
  su diseno de pruebas se conservan y se trasladan al modulo TypeScript.
- Aparece `tools/` con los dos programas Python y su propio CI, separado del de la
  aplicacion.
- El orden importa: primero el modulo TypeScript con sus pruebas, despues el oraculo. Un
  oraculo sin nada que contrastar no sirve.
- Hoy no hay framework de pruebas instalado. Vitest entra como parte de este trabajo.
