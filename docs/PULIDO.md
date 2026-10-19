# FIA'O - Pulido antes de seguir

Brief de trabajo. Sale de una auditoria con rubrica del 2026-10-18. La meta que fijo el
equipo: **ningun criterio por debajo de 4.5 sobre 5**, apuntando a 4.8.

Si tomas este documento a mitad, mira primero `git log` para ver que ya esta hecho.

## Estado

| Punto                              | Estado                                                                |
| ---------------------------------- | --------------------------------------------------------------------- |
| 1. D1 - colores escritos a mano    | **Parcial**: 32 rgb, 7 hex y 6 RGB WebGL pendientes                   |
| 2. C1 - estilo de input repetido   | **Hecho**                                                             |
| 3. D2 - dashboard sin `PageHeader` | **Hecho**                                                             |
| 4. C2 - pruebas de componente      | **Hecho** (123 -> 145)                                                |
| 5. Modo oscuro                     | **Hecho** (DISENO.md)                                                 |
| Playwright / end-to-end            | Instalado y con dos specs; ejecucion manual, no corrida el 2026-10-19 |

Hallazgo extra que aparecio al escribir las pruebas: `Field` envolvia al input dentro del
`<label>`, asi que el nombre accesible se comia tambien la pista y un lector de pantalla
leia "Reference Reference from your Yappy app.". Arreglado con `htmlFor` y
`aria-describedby`. Lo encontro una prueba, no una lectura del codigo.

## 0. El contexto que importa

**Contexto inicial del brief, ya superado:** entonces no habia pruebas de componente ni
end-to-end. Hoy hay pruebas de componente y dos specs de Playwright. La ejecucion actual
de Vitest esta en [INFORME-CODEX.md](INFORME-CODEX.md); una cifra guardada no prueba el codigo de hoy.

Por eso el punto 4 es el que mas mueve la aguja, no los de diseno.

## 1. D1 - Los colores escritos a mano (consistencia 3 -> 4.5)

`docs/DISENO.md` dice textual: _"Ningun color se escribe a mano en un componente. Si hace
falta un tono que no esta ahi, se agrega ahi primero."_

Los ocho hex de `customer-folder.tsx` se sustituyeron por variables, pero la limpieza
quedo incompleta: ese archivo conserva tres rgb numericos. En todo `src/`, fuera de
colors.ts, quedan 32 rgb, 7 hex y 6 tuplas WebGL. No es el unico archivo que rompe la
regla. Detalle y conteo reproducible en [INVENTARIO.md](INVENTARIO.md).

Que hacer: mover esos tonos a `src/lib/colors.ts` y consumirlos. El componente usa un
bloque `<style>` con CSS plano, asi que no puede leer clases de Tailwind: los valores
entran como variables CSS desde el `style` del elemento raiz, calculadas en el componente
a partir de tokens. La implementacion actual lee variables CSS de TEMA; los apartados
2, 3 y 4 conservan el brief original, cuyas tareas figuran hechas en la tabla de estado.

## 2. C1 - El estilo de input repetido (esbeltez 3 -> 4.5)

`Field` existe en `src/components/app/ui.tsx` y lo usan cuatro pantallas. Otras cuatro
repiten la cadena de clases completa a mano:

- `src/app/(app)/app/customers/[id]/invite-card.tsx`
- `src/app/(app)/app/sales/[id]/record-payment.tsx` (dos veces)
- `src/app/me/link/invite-form.tsx`

Que hacer: usar `Field`. Si a `Field` le falta algo (un input centrado y espaciado para
el codigo de invitacion, por ejemplo), **agregarselo a `Field`** con una prop, no volver a
escribir las clases. Cuando cambie el radio o el foco, tiene que cambiar en un solo lugar.

## 3. D2 - El dashboard no usa `PageHeader` (consistencia)

Todas las paginas de `(app)` usan `PageHeader`; `src/app/(app)/app/page.tsx` escribe su
`<h1>` a mano. Pierde el slot de descripcion y rompe la simetria del encabezado.

## 4. C2 - Pruebas de componente (pruebas 2.5 -> 4.5)

**Lo mas importante de esta lista.** Vitest, Testing Library y jsdom ya estan instalados y
configurados (`vitest.config.mts`). No hace falta instalar nada.

Lo minimo que hay que cubrir, una prueba por comportamiento, no por linea:

| Componente            | Que probar                                                            |
| --------------------- | --------------------------------------------------------------------- |
| `charts.tsx`          | `StatusBar` con total cero no dibuja barra; los porcentajes suman 100 |
| `charts.tsx`          | El equivalente en `sr-only` nombra los siete dias                     |
| `customer-folder.tsx` | Cerrada, las fichas estan fuera del orden de tabulacion (`inert`)     |
| `customer-folder.tsx` | El boton anuncia cuantos clientes hay y si abre o cierra              |
| `record-payment.tsx`  | Con saldo cero no muestra formulario                                  |
| `record-payment.tsx`  | En efectivo no pide referencia; en los demas si                       |
| `invite-card.tsx`     | Vinculado no ofrece generar codigo                                    |

Regla: probar **lo que el usuario ve y puede hacer**, nunca detalles internos. Nada de
comprobar clases de CSS.

**Actualizacion 2026-10-19:** Playwright esta instalado y configurado con dos specs. Su
ejecucion crea datos reales en Supabase; no se corrio en esta revision ni forma parte del CI.

## 5. Lo que NO entra en este pulido

**El modo oscuro ya esta implementado.** TEMA alimenta variables CSS en tailwind.config.ts,
la preferencia se aplica en layout.tsx antes del pintado y ThemeToggle permite cambiarla.
No usa clases `dark:`. Solo el par `TEMA["marron-claro"]` carece de consumidor visual;
no corresponde describir todos los tokens oscuros como inactivos.

## 6. Como saber que terminaste

```
pnpm typecheck && pnpm lint && pnpm test && pnpm build
```

Y ademas, a mano:

- `grep -rn "#[0-9a-fA-F]\{6\}" src/ --include=*.tsx | grep -v colors.ts` no devuelve nada
- `grep -rc "rounded-2xl border border-marron/10 bg-white/70" src/ --include=*.tsx` solo
  aparece en `ui.tsx`
- El numero de pruebas subio bien por encima de 123

El primer grep es una comprobacion historica insuficiente: no detecta CSS, rgb ni hex
abreviados. Para esos casos usar `node scripts/audit-inventory.mjs`.

**No correr `pnpm build` con el servidor de desarrollo arriba.** Ya no se pisan (el build
escribe en `.next-build`), pero bajarlo sigue siendo lo prolijo.
