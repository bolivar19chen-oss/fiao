# FIA'O - Auditoria del proyecto

Inspeccion del 2026-10-17. Cada afirmacion de este documento se comprobo ejecutando algo,
no leyendo por encima. La columna **Evidencia** dice con que.

## 0. Como leer esto

**Identificador:** letra de severidad, guion, numero correlativo. `C-01`, `A-01`, `M-03`.

| Letra | Severidad | Significa                                                    |
| ----- | --------- | ------------------------------------------------------------ |
| `C`   | Critico   | Hay un bug vivo o el codigo no coincide con la base de datos |
| `A`   | Alto      | Riesgo de seguridad o de datos, sin consecuencia inmediata   |
| `M`   | Medio     | El proyecto afirma algo falso sobre si mismo                 |
| `B`   | Bajo      | Deuda menor o incoherencia de estilo                         |

**Categorias:** `BASE` base de datos, `SEG` seguridad, `DOC` documentacion,
`COD` codigo, `CI` integracion continua.

**Estado:** `CERRADO` arreglado en esta pasada. `ABIERTO` queda pendiente, con responsable.

## 1. Resumen

| Severidad | Hallados | Cerrados | Abiertos |
| --------- | -------- | -------- | -------- |
| Critico   | 1        | 1        | 0        |
| Alto      | 1        | 0        | 1        |
| Medio     | 6        | 6        | 0        |
| Bajo      | 3        | 0        | 3        |
| **Total** | **11**   | **7**    | **4**    |

## 2. Critico

### C-01 · BASE · CERRADO

**Dos migraciones estaban en el repositorio sin aplicar en la base de datos.**

`20261016223000_validate_business_legal.sql` y
`20261016231500_idempotent_business_onboarding.sql` figuraban como `local` con `remote`
vacio.

No era un detalle de orden: el codigo ya las daba por aplicadas. `src/app/onboarding/page.tsx`
tiene un comentario que referencia la migracion `20261016231500` para explicar por que no
hay bucle de redireccion. Ese bucle estaba vivo en la base.

Las dos arreglan problemas reales:

- La validacion completa dentro de `update_business_legal`. La funcion esta otorgada a
  `authenticated`: cualquiera con sesion puede llamarla directo con la anon key, sin pasar
  por el Server Action. La validacion de la interfaz no es la frontera.
- `complete_business_onboarding` reentrante, que evita el bucle sin salida y el doble envio.

**Evidencia:** `pnpm supabase migration list --linked`.
**Accion:** `pnpm supabase db push --linked`. Verificado despues: cero pendientes.

**Como se evita que vuelva a pasar:** nadie commitea una migracion sin aplicarla. Lo
correcto seria un paso de CI que falle si hay migraciones locales sin aplicar, pero eso
necesita credenciales de la base en CI y hoy no estan. Queda como `B-03`.

## 3. Alto

### A-01 · SEG · ABIERTO

**La politica de contrasenas no esta verificada en el proyecto de la nube.**

`supabase/config.toml` declara:

```
minimum_password_length = 6
secure_password_change = false
```

Seis caracteres es debil para una aplicacion que guarda cedulas, telefonos e historial de
deuda de personas reales. Y `secure_password_change = false` significa que se puede cambiar
la contrasena sin volver a autenticarse: quien tome una sesion abierta se queda con la
cuenta.

**La parte importante:** ese archivo configura el Supabase **local**, que en este proyecto
nunca se usa porque no hay Docker. Lo que rige es la configuracion del proyecto en la nube,
y **nadie la miro**.

**Evidencia:** `grep -nE "minimum_password_length|secure_password_change" supabase/config.toml`.

**Accion pendiente, antes de cualquier usuario real:** entrar al panel de Supabase,
Authentication > Policies, y confirmar longitud minima de al menos 10 y cambio de
contrasena seguro activado. Despues alinear `config.toml` para que diga lo mismo.

**Responsable:** el dueno del proyecto Supabase. No se puede hacer desde el repositorio.

## 4. Medio

Todos son lo mismo: **el proyecto afirmaba algo falso sobre si mismo.** Es el tipo de error
que mas caro sale en una evaluacion, porque quien lee confia en el documento.

| ID     | Categoria | Afirmacion falsa                                                  | Realidad                                          |
| ------ | --------- | ----------------------------------------------------------------- | ------------------------------------------------- |
| `M-01` | DOC       | `README.md`: el dinero usa `decimal.js`                           | No se usa. El ADR 0005 lo prohibe                 |
| `M-02` | DOC       | `README.md`: Playwright en el stack de pruebas                    | No esta instalado                                 |
| `M-03` | DOC       | `README.md`: "Estado: Fase 2"                                     | Motor de credito y oraculo ya hechos              |
| `M-04` | DOC       | `README.md`: "un solo lenguaje de punta a punta: TypeScript"      | Python vive en `tools/` desde el ADR 0005         |
| `M-05` | DOC       | `docs/README.md`: el bloque 1 es "el trabajo que viene ahora"     | Terminado, 95 pruebas                             |
| `M-06` | DOC       | `ONBOARDING.md`: `Loader2` y `Building2` no existen en lucide 1.x | **Existen los dos.** Comprobado contra el paquete |

`M-06` es el peor de los seis: el documento decia "verificados en el paquete instalado" y
no lo estaban. Una afirmacion falsa presentada como verificada es peor que no decir nada.
Se corrigio dejando la correccion visible, no borrando la linea.

**Evidencia:** `node -e "const n=require('lucide-react'); console.log(!!n.Loader2, !!n.Building2)"`
devuelve `true true`. El resto, comparando cada afirmacion contra el arbol de archivos.

**Estado:** los seis **CERRADOS** en esta pasada.

## 5. Bajo

| ID     | Categoria | Hallazgo                                                                                                           | Estado  |
| ------ | --------- | ------------------------------------------------------------------------------------------------------------------ | ------- |
| `B-01` | COD       | `src/lib/credit/oracle.test.ts` usa `any` dos veces con `eslint-disable`. CLAUDE.md dice no usar `any`             | ABIERTO |
| `B-02` | COD       | `dailyBalances`, `verifyBalance`, `accrueInterest` y `accrueLateFee` se exportan y nadie los llama fuera del motor | ABIERTO |
| `B-03` | CI        | CI no detecta migraciones locales sin aplicar, que es exactamente lo que fue `C-01`                                | ABIERTO |

Sobre `B-01`: el `any` esta en un despachador dinamico sobre casos de forma heterogenea.
Se arregla con una union discriminada por `op`. No es urgente pero es una regla del
proyecto incumplida, y las reglas que se incumplen sin anotarlo dejan de ser reglas.

Sobre `B-02`: no es codigo muerto. Es superficie que entra en uso cuando exista la
migracion de intereses. Se anota para que nadie la borre pensando que sobra.

## 6. Lo que se verifico y esta bien

Esto tambien es resultado de la inspeccion. Un informe que solo lista problemas no dice
donde esta parado el proyecto.

| Verificacion                                   | Resultado | Evidencia                                                         |
| ---------------------------------------------- | --------- | ----------------------------------------------------------------- |
| Secretos en el repositorio                     | Ninguno   | `git ls-files \| grep ^\.env` devuelve solo `.env.example`        |
| RLS en las 11 tablas                           | Completa  | Cada `create table` tiene su `enable row level security`          |
| Pureza del motor de credito                    | Intacta   | Sin `new Date()`, `Date.now()`, `@/lib/supabase` ni `process.env` |
| Dependencias de npm dentro del motor           | Ninguna   | Solo importaciones relativas                                      |
| Tipos generados en uso                         | Si        | `@shared/types/database` en los tres clientes de Supabase         |
| Documentos fuera del indice                    | Ninguno   | Los 11 de `docs/` y los 7 ADR estan indexados                     |
| Archivos sueltos sin rastrear en `src/`        | Ninguno   | `git status --untracked-files=all src/` vacio                     |
| Contraste diferencial TypeScript contra Python | Coinciden | 25 de 25 casos                                                    |
| Suite completa                                 | Verde     | 121 pruebas, 9 archivos                                           |
| Formato, lint, tipos y build                   | Limpios   | `pnpm format:check`, `lint`, `typecheck`, `build`                 |

## 7. Lo que falta construir

No son hallazgos: es alcance pendiente, ordenado por lo que desbloquea.

| #   | Pieza                              | Por que importa                                                         |
| --- | ---------------------------------- | ----------------------------------------------------------------------- |
| 1   | Flujo de venta a credito           | Sin el, el motor calcula sobre datos que nadie puede cargar             |
| 2   | Migracion de intereses             | Hoy el limite de credito va `null` y no hay tasas ni `interest_charges` |
| 3   | `tools/seed/`                      | El generador de datos de demostracion                                   |
| 4   | PWA y sincronizacion offline       | La segunda pieza tecnica dificil del proyecto                           |
| 5   | Playwright                         | No hay pruebas de extremo a extremo                                     |
| 6   | Respaldos con restauracion probada | Condicion acordada antes de cualquier usuario real                      |

El 6 no es tecnicamente el ultimo: es el que bloquea la beta. Ver
[NEGOCIO.md](NEGOCIO.md) seccion 5.
