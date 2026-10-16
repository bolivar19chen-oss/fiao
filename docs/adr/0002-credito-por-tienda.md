# ADR 0002 - Credito por tienda, no buro nacional

Fecha: 2026-10-16. Estado: aceptado.

## Contexto

Al describir el mercado aparecieron dos productos distintos bajo el mismo nombre:

1. **Credito por tienda.** Cada mini super lleva su propia libreta digital. El cliente
   le debe a ese negocio y a nadie mas. Es lo que el schema actual ya implementa:
   `customers` cuelga de `business_id` y nada cruza entre negocios.
2. **Red nacional de credito.** El cliente compra en un super y abona en otro; el saldo
   y el historial son compartidos entre negocios. Esto es un buro de credito.

La diferencia no es de tamano, es de naturaleza. Define el modelo de datos, el encuadre
legal y a quien hay que convencer para vender el producto.

## Decision

FIA'O es **credito por tienda**. El historial, el saldo y el puntaje viven dentro de un
negocio y no se comparten entre negocios.

Razones, en orden de peso:

- **Es lo que el mercado hace hoy.** El fiado es una relacion entre el dueno y el vecino
  al que conoce. La confianza es local y no es transferible. Digitalizar la libreta es un
  problema real y resuelto de punta a punta. Un buro es otro negocio.
- **El buro no arranca.** Una red de credito compartida no vale nada con tres tiendas
  adentro: el valor aparece recien con cobertura amplia. Es un efecto de red que no se
  puede arrancar desde cero en un proyecto de 27 semanas.
- **Identidad.** Un buro necesita identificar a la persona sin ambiguedad (cedula
  verificada). Un mini super no va a capturar eso de forma confiable. Identidad mala
  produce historial crediticio malo, que es peor que no tener ninguno.
- **Es actividad regulada.** Centralizar historial crediticio de personas en Panama cae
  bajo proteccion de datos personales y bajo el regimen de agencias de informacion de
  datos. El marco exacto hay que verificarlo con la norma vigente antes de prometer nada.
  Para una libreta por tienda el riesgo es mucho menor: el negocio ya tiene esos datos.
- **Adopcion.** Un dueno de super no entrega su lista de clientes a una red administrada
  por terceros. Si entrega sus datos a una herramienta que le organiza su propia libreta.

## Consecuencias

- El schema no cambia en su eje: `business_id` sigue siendo la frontera, y las politicas
  RLS actuales ya son correctas.
- `customers.credit_score` es **reputacion dentro de esa tienda**, no un puntaje nacional.
  Hay que nombrarlo asi en la interfaz para no prometer lo que no es. En la UI, en ingles:
  "Store credit score", no "Credit score".
- Un mismo comprador atendido por dos negocios son dos filas en `customers` sin relacion
  entre si. Es correcto y es deliberado.
- Camino futuro, no construido ahora: un puntaje agregado entre tiendas, opt-in explicito
  del cliente y revision legal previa. Si se hace, va en su propio ADR. Hoy no existe.
