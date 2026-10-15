# FIA'O - Plan de desarrollo

Documento tecnico. Octubre 2026.
Reevaluacion del stack, decisiones de arquitectura y hoja de ruta del equipo.

## Resumen ejecutivo

FIA'O es una plataforma web y movil (PWA) que ayuda a los pequenos negocios a gestionar
sus ventas a credito: control de inventario, historial de pagos de clientes y calculo de
un puntaje de credito.

Este documento reevalua el proyecto bajo dos premisas:

1. Es un trabajo en equipo con limitaciones de tiempo y experiencia.
2. El objetivo es ganar el reconocimiento al mejor codigo y desarrollo, no solo terminar
   un producto.

**Conclusion central:** el poster original propone un stack sobre-dimensionado
(Java + Spring Boot + Python en el mismo sistema) que dispersaria el esfuerzo del equipo
entre cuatro lenguajes y tres despliegues. La recomendacion es concentrar todo el
conocimiento en un solo ecosistema, TypeScript de extremo a extremo, sobre
Next.js + Supabase, e invertir el esfuerzo liberado en lo que los jueces valoran:
arquitectura limpia, pruebas automatizadas, CI/CD, documentacion y el motor de puntaje
de credito, que es el diferenciador tecnico del proyecto.

## 1. Desglose del proyecto en modulos

El sistema se divide en ocho modulos funcionales. Dos concentran la mayor complejidad
tecnica y el mayor valor diferencial: el motor de puntaje de credito y la capa PWA con
sincronizacion offline. El resto son funcionalidades de complejidad media o baja
(principalmente CRUD con reglas de negocio).

| Modulo | Descripcion | Complejidad |
|---|---|---|
| Autenticacion y multi-tenancy | Login/registro; cada negocio solo ve sus datos (RLS) | Media |
| Clientes (CRM ligero) | CRUD de clientes e historial de compras y pagos | Baja |
| Inventario | CRUD de productos, stock y alertas de bajo inventario | Media |
| Ventas a credito | Registro de ventas, cronograma de pagos y abonos parciales | Media-Alta |
| Motor de puntaje de credito | Algoritmo que pondera puntualidad, deuda y antiguedad | Alta |
| Reportes y dashboards | Graficas interactivas: cartera, morosidad, flujo | Media |
| PWA y offline | Instalable; cola de sincronizacion sin conexion | Alta |
| Notificaciones | Recordatorios de pago (email, luego WhatsApp) | Media |

## 2. Reevaluacion del stack tecnologico

El criterio de evaluacion cambia respecto al poster original. Al ser un equipo con
limitaciones, cada tecnologia adicional cuesta: curva de aprendizaje, despliegue extra y
superficie de bugs que nadie en el equipo domina. La evaluacion se hizo con cuatro
criterios: velocidad de desarrollo, costo de despliegue, curva de aprendizaje y ajuste al
tamano del equipo y al MVP.

### 2.1 Lo que se mantiene del poster original

- **Supabase:** acierto total. Postgres real, autenticacion incluida, Row Level Security
  para el multi-tenancy y realtime. Mejor adaptado que Firebase para datos relacionales
  (ventas, abonos y clientes son relaciones por naturaleza).
- **PWA:** correcto para el publico objetivo (bodegas y tienditas): instalable desde el
  navegador, sin pasar por tiendas de apps, usable en celulares de gama baja y con
  funcion parcial sin conexion.
- **GitHub Actions:** bien para CI/CD, aunque se recomienda complementarlo con un
  despliegue continuo (Vercel) para minimizar configuracion.

### 2.2 Lo que se corrige del poster original

- **Java + Spring Boot (overkill):** para un equipo pequeno es demasiado boilerplate.
  Exige un despliegue JVM aparte, enlentece el desarrollo y no aporta al objetivo de
  calidad de codigo: los jueces evaluan decisiones proporcionadas al problema.
- **Python + Pandas/NumPy para dinero (error conceptual):** pandas y NumPy operan con
  floats de punto flotante, inaceptables para dinero. La precision decimal se resuelve
  con enteros en centavos o aritmetica decimal exacta, no con una pila Python extra que
  ademas obliga a mantener otro servicio desplegado.
- **Plotly/Matplotlib en frontend (mezcla rara):** Matplotlib genera imagenes estaticas y
  no es para web interactiva; Plotly es pesado para la PWA. En React lo natural y limpio
  es Recharts o Chart.js.
- **HTML/CSS aislado vs React + TypeScript:** el poster lista ambos. Se unifica: todo el
  frontend en React + TypeScript + Tailwind, sin capas duplicadas.

## 3. Stack final recomendado

La decision estrategica es un solo lenguaje de programacion (TypeScript) en todo el
sistema: frontend, backend y funciones de datos. Esto maximiza la calidad del codigo que
el equipo puede producir: se comparten tipos entre capas, hay un solo entorno de pruebas,
un solo linter y un solo pipeline de CI/CD.

| Componente | Poster original | Recomendacion final | Motivo |
|---|---|---|---|
| Frontend | React + TS + Tailwind | Next.js 15 (App Router) + TS + Tailwind | Un solo proyecto con routing y server actions |
| Backend | Java + Spring Boot | Supabase Edge Functions (TS) | Cero servidores; logica junto a los datos |
| Base de datos | Supabase | Supabase (igual) | Postgres + Auth + RLS ya resuelto |
| Calculo de dinero | Python + Pandas/NumPy | Enteros en centavos / decimal.js | Precision exacta, sin servicio extra |
| Graficas | Plotly / Matplotlib | Recharts | Nativo de React, interactivo y ligero |
| Movil / offline | PWA | PWA (Workbox / next-pwa) | Requisito del proyecto, se mantiene |
| CI/CD y deploy | GitHub + Actions | GitHub Actions + Vercel | Deploy automatico casi sin configurar |
| Pruebas | JUnit + Vitest + Postman | Vitest + Playwright + Testing Library | Un solo ecosistema de testing |

### 3.1 Decisiones tecnicas de calidad

Al competir por el mejor codigo y desarrollo, estas practicas pesan tanto como el stack:

- **Dinero siempre en centavos (enteros):** regla innegociable en todo el sistema,
  revisada en code review. Es el detalle tecnico que mas demuestra madurez.
- **Esquema de base de datos con RLS desde el dia uno:** el multi-tenancy se garantiza en
  la base, no solo en la interfaz; migraciones versionadas con la CLI de Supabase.
- **Tipos compartidos:** una carpeta `shared/types` usada por frontend y Edge Functions;
  cambios de contrato detectados por el compilador.
- **Pruebas del motor de puntaje:** suite exhaustiva de casos (pagos puntuales, atrasos
  de 1, 7 y 30 dias, abonos parciales, normalizacion por monto) con cobertura alta.
- **CI/CD con calidad automatica:** en cada push, lint + typecheck + tests + build; deploy
  a preview por pull request.
- **Archivo CLAUDE.md y ADRs:** documentacion de decisiones de arquitectura (Architecture
  Decision Records). Senal inequivoca de equipo profesional.
- **PWA evaluable:** Lighthouse PWA >= 90 y flujo offline demostrable en la exposicion.

## 4. Plan de trabajo con Claude Code (27 semanas)

Claude Code actua como copiloto del equipo: genera modulos completos con pruebas, revisa
diffs y mantiene la coherencia arquitectonica. La regla de uso es pedir un modulo
completo por sesion y revisar cada cambio antes de aceptarlo.

| Fase | Semanas | Entregable |
|---|---|---|
| 0 - Setup y diseno | 1-2 | Repo, CLAUDE.md, schema de BD + politicas RLS, especificacion escrita del algoritmo de puntaje (ej.: 40% puntualidad, 30% ratio deuda, 20% antiguedad, 10% frecuencia; decaimiento por dias de atraso) |
| 1 - Backend de datos | 2-4 | Migraciones + seed; Edge Functions `calculateCreditScore` y `registerPayment` (saldo y puntaje en la misma transaccion); tests del calculo de saldos y puntaje |
| 2 - Core funcional | 4-11 | Auth y onboarding; CRUD de clientes y productos; flujo de venta a credito con cronograma; registro de abonos y estado de cuenta; dashboard principal (cartera, morosos, cobros de la semana) |
| 3 - PWA y offline | 11-17 | Manifest, iconos y service worker (network-first con cache de respaldo); cola de operaciones offline con IndexedDB y tabla `pending_sync`; resolucion de conflictos validada del lado del servidor |
| 4 - Reportes y pulido | 17-23 | Graficas Recharts (cartera, morosidad, top deudores); notificaciones por email; auditoria de calidad (Lighthouse >= 90, cobertura de tests, ADRs completados) |
| 5 - Beta | 24-27 | 2-3 negocios reales usando el sistema; correccion de hallazgos; preparacion de la demo para la exposicion |

El 65% del esfuerzo se concentra en el core funcional, la PWA y los reportes.

## 5. Riesgos y mitigacion

| Riesgo | Impacto | Mitigacion |
|---|---|---|
| Sincronizacion offline con datos inconsistentes | Alto | Validar siempre del lado del servidor; conflictos por "ultimo escritor gana" + reglas de negocio en la Edge Function |
| Errores de redondeo en dinero | Alto | Enteros en centavos en toda la cadena; tests de aritmetica monetaria obligatorios |
| Algoritmo de puntaje dificil de explicar o defender | Medio | Especificacion escrita en la Fase 0, ponderaciones documentadas y suite de casos de prueba |
| Scope creep (funciones extra a mitad de proyecto) | Medio | Congelar funcionalidades al cerrar la Fase 2; todo lo nuevo va a la Fase 5 o se descarta |
| Dependencia excesiva de la IA generando deuda | Medio | Code review humano de cada diff; prohibido aceptar codigo que el equipo no sabe explicar |
| Reparto desigual del trabajo en el equipo | Medio | Un modulo = un responsable; integracion semanal; tablero Kanban en GitHub Projects |

## Conclusion

La ventaja competitiva de FIA'O no esta en acumular tecnologias, sino en la coherencia
del sistema: un solo lenguaje, un solo pipeline de calidad y dos piezas tecnicas dificiles
hechas muy bien (el motor de puntaje de credito y la sincronizacion offline) sobre una
base de datos con seguridad a nivel de fila. Con Next.js + Supabase + PWA, un equipo con
limitaciones puede producir codigo limpio, probado y documentado: exactamente lo que se
evalua al premiar el mejor desarrollo.
