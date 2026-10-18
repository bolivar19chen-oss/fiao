# FIA'O - Pulido antes de seguir

Brief de trabajo. Sale de una auditoria con rubrica del 2026-10-18. La meta que fijo el
equipo: **ningun criterio por debajo de 4.5 sobre 5**, apuntando a 4.8.

Si tomas este documento a mitad, mira primero `git log` para ver que ya esta hecho.

## 0. El contexto que importa

**Nadie ha visto nunca esta interfaz funcionando.** Hay 123 pruebas y las 123 son del
motor puro: cero pruebas de componente, cero end-to-end, y ninguna pantalla autenticada
se ha renderizado con datos reales. Compilar no es funcionar.

Por eso el punto 4 es el que mas mueve la aguja, no los de diseno.

## 1. D1 - Los colores escritos a mano (consistencia 3 -> 4.5)

`docs/DISENO.md` dice textual: *"Ningun color se escribe a mano en un componente. Si hace
falta un tono que no esta ahi, se agrega ahi primero."*

`src/components/app/customer-folder.tsx` tiene **8 valores hex escritos a mano**. Es el
unico archivo de la aplicacion que rompe la regla.

Que hacer: mover esos tonos a `src/lib/colors.ts` y consumirlos. El componente usa un
bloque `<style>` con CSS plano, asi que no puede leer clases de Tailwind: los valores
entran como variables CSS desde el `style` del elemento raiz, calculadas en el componente
a partir de `BRAND` y `ESTADO`.

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

| Componente             | Que probar                                                        |
| ---------------------- | ----------------------------------------------------------------- |
| `charts.tsx`           | `StatusBar` con total cero no dibuja barra; los porcentajes suman 100 |
| `charts.tsx`           | El equivalente en `sr-only` nombra los siete dias                  |
| `customer-folder.tsx`  | Cerrada, las fichas estan fuera del orden de tabulacion (`inert`)  |
| `customer-folder.tsx`  | El boton anuncia cuantos clientes hay y si abre o cierra           |
| `record-payment.tsx`   | Con saldo cero no muestra formulario                               |
| `record-payment.tsx`   | En efectivo no pide referencia; en los demas si                    |
| `invite-card.tsx`      | Vinculado no ofrece generar codigo                                 |

Regla: probar **lo que el usuario ve y puede hacer**, nunca detalles internos. Nada de
comprobar clases de CSS.

**Playwright sigue sin instalar** (su metadata no bajaba con la conexion de ese dia). Los
end-to-end quedan fuera de este pulido; entran con su propia tarea.

## 5. Lo que NO entra en este pulido

**El modo oscuro.** `src/lib/colors.ts` define los tonos oscuros y no hay **ni una clase
`dark:`** en toda la aplicacion. Implementarlo bien toca todos los componentes y merece su
propia sesion; hacerlo a la carrera junto con lo demas sale mal.

Hasta entonces esos tokens son lineas que nadie ejecuta. Es deuda conocida y esta
anotada, no olvidada.

## 6. Como saber que terminaste

```
pnpm typecheck && pnpm lint && pnpm test && pnpm build
```

Y ademas, a mano:

- `grep -rn "#[0-9a-fA-F]\{6\}" src/ --include=*.tsx | grep -v colors.ts` no devuelve nada
- `grep -rc "rounded-2xl border border-marron/10 bg-white/70" src/ --include=*.tsx` solo
  aparece en `ui.tsx`
- El numero de pruebas subio bien por encima de 123

**No correr `pnpm build` con el servidor de desarrollo arriba.** Ya no se pisan (el build
escribe en `.next-build`), pero bajarlo sigue siendo lo prolijo.
