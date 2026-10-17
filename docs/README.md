# Documentacion de FIA'O

Indice. Si llegaste aca sin contexto, lee en este orden.

## Empezar por aca

| Documento                                              | Que es                                                                    |
| ------------------------------------------------------ | ------------------------------------------------------------------------- |
| [../CLAUDE.md](../CLAUDE.md)                           | Reglas de trabajo, stack y convenciones. Se lee solo al abrir el proyecto |
| [PLAN.md](PLAN.md)                                     | El plan completo: modulos, stack, 27 semanas, riesgos                     |
| [FASE-2-ESTRUCTURA.md](FASE-2-ESTRUCTURA.md)           | Auth, rutas y pantallas. Hecho                                            |
| [BLOQUE-1-MOTOR-CREDITO.md](BLOQUE-1-MOTOR-CREDITO.md) | Intereses, saldos, estados y puntaje. Hecho                               |
| **[FASE-3-DASHBOARD.md](FASE-3-DASHBOARD.md)**         | **El trabajo que viene ahora.** Dashboard, graficos y lo que sigue        |
| **[AUDITORIA.md](AUDITORIA.md)**                       | **Estado verificado del proyecto.** Hallazgos y lo que falta              |

## Reglas del producto

| Documento                                        | Que es                                                                |
| ------------------------------------------------ | --------------------------------------------------------------------- |
| [APLICACION.md](APLICACION.md)                   | El cuerpo de la app: dos tipos de usuario, pantallas, pagos y tema    |
| [NEGOCIO.md](NEGOCIO.md)                         | Quien paga, cuanto, costos y el primer usuario real                   |
| [MODELO-CREDITO.md](MODELO-CREDITO.md)           | Intereses, libro inmutable, idempotencia, estados y cambios de schema |
| [DISENO.md](DISENO.md)                           | Paleta, colores de estado, tipografia y criterios de interfaz         |
| [UI-DASHBOARD.md](UI-DASHBOARD.md)               | Medidas concretas: espaciado, tipografia, graficos, modo oscuro       |
| [ONBOARDING.md](ONBOARDING.md)                   | Tarjeta reversible, registro de negocio y de cliente, cookies         |
| [HERRAMIENTAS-PYTHON.md](HERRAMIENTAS-PYTHON.md) | El oraculo de verificacion y el generador de datos de demo            |

## Decisiones de arquitectura

Una por decision que cambia el rumbo. Se leen para entender **por que** algo es como es,
antes de proponer cambiarlo.

| ADR                                                               | Decision                                   | Estado                |
| ----------------------------------------------------------------- | ------------------------------------------ | --------------------- |
| [0001](adr/0001-next-15.md)                                       | Next.js 15 en lugar de 14                  | Aceptado              |
| [0002](adr/0002-credito-por-tienda.md)                            | Credito por tienda, no buro nacional       | Aceptado              |
| [0003](adr/0003-sin-cpp.md)                                       | Sin C++ ni modulo nativo                   | Aceptado              |
| [0004](adr/0004-motor-financiero-python.md)                       | Motor financiero como servicio Python      | **Superado por 0005** |
| [0005](adr/0005-calculo-en-typescript-python-como-herramienta.md) | Calculo en TypeScript; Python como oraculo | Aceptado              |
| [0006](adr/0006-cuentas-de-cliente.md)                            | Cuentas de cliente por invitacion          | Aceptado              |
| [0007](adr/0007-pagos-sin-custodia.md)                            | Pagos sin custodia de fondos               | Aceptado              |

## Superado

| Documento                                  | Por que sigue aca                                                                                            |
| ------------------------------------------ | ------------------------------------------------------------------------------------------------------------ |
| [MOTOR-FINANCIERO.md](MOTOR-FINANCIERO.md) | El contrato HTTP ya no aplica. Sus reglas de dominio y su lista de pruebas se trasladan al modulo TypeScript |
