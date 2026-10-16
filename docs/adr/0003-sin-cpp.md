# ADR 0003 - Sin C++ ni modulo nativo

Fecha: 2026-10-16. Estado: aceptado.

## Contexto

Se propuso una arquitectura hibrida: Python para interfaz y reglas de negocio, C++ para
un "motor financiero de alto rendimiento", unidos con pybind11. El argumento es que el
volumen nacional de transacciones de fiado exige velocidad de calculo.

Esta ADR existe porque la propuesta es razonable en apariencia y hay que dejar escrito
por que no se toma.

## Decision

No se incorpora C++, ni pybind11, ni un modulo nativo compilado a WebAssembly. El sistema
sigue en TypeScript de punta a punta, como fija el PLAN.md seccion 3.

## Razones

**El volumen no justifica nada.** Con los numeros de la propuesta misma: cientos de mini
super, decenas de clientes con fiado cada uno, varias compras diarias. Tomando 500
tiendas, 50 clientes y 3 compras por dia son 75.000 filas diarias, unos 27 millones al
ano. Postgres resuelve eso con indices correctos sin despeinarse. No hay cuello de
botella de CPU que un motor nativo pueda destrabar.

**Lo pesado es trabajo de conjuntos, no aritmetica.** Devengo diario de intereses,
cartera vencida, reportes de morosos: todo eso es agregacion sobre muchas filas. Se
resuelve en SQL, dentro del motor, donde estan los datos. Un modulo C++ tendria que traer
las filas por un socket para calcularlas afuera y devolverlas. Eso es mas lento, no mas
rapido. Postgres ya esta escrito en C.

**La exactitud monetaria no la da el lenguaje, la dan los enteros.** El requisito es no
perder centavos, y se cumple con enteros de 64 bits: `bigint` en Postgres y `BigInt` en
TypeScript. Ya esta resuelto en el schema actual. Nota al margen: el ejemplo de pybind11
de la propuesta usa `double` para dinero, el error que el mismo texto prohibe tres
parrafos mas abajo.

**Rompe el requisito de offline.** La PWA tiene que calcular saldos en el cliente y el
servidor tiene que revalidarlos (PLAN.md, Fase 3). Con un solo lenguaje eso es un modulo
compartido, una sola implementacion corriendo en los dos lados. Con C++ serian dos
implementaciones que hay que mantener en paridad exacta, o un WASM extra que no aporta
nada que TypeScript no haga ya.

**Encarece la evaluacion.** Un modulo nativo obliga al jurado a compilar antes de
ejecutar. Toda friccion para ver el proyecto andando juega en contra.

Es el mismo criterio que ya descarto Java y Python en el PLAN.md seccion 2.2: cada
lenguaje extra cuesta curva de aprendizaje, despliegue y superficie de bugs. Agregar C++
seria repetir el error corregido.

## Consecuencias

- El diferencial tecnico evaluable sigue siendo el motor de puntaje de credito y la
  sincronizacion offline, hechos muy bien y con pruebas exhaustivas. Coherencia sobre
  cantidad de tecnologias.
- Si se quiere mostrar C++ como habilidad, va en un proyecto aparte donde el problema lo
  pida de verdad. Meterlo aca lo debilita a el y a FIA'O.
- Si en algun momento aparece un calculo que de verdad no rinde, primero se mide, se
  revisa el plan de consulta y se mueve a SQL. Un modulo nativo seria el ultimo recurso y
  necesitaria su propio ADR con numeros medidos, no estimados.
