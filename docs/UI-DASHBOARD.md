# FIA'O - Medidas de la interfaz

Valores concretos para que la implementacion coincida con el canvas de diseno. La
estructura y el porque estan en [APLICACION.md](APLICACION.md); los colores en
[DISENO.md](DISENO.md). Aca solo van numeros.

Todo esta en px porque es lo que se mide en el diseno. En Tailwind, `28px` es `p-7`,
`22px` es `gap-[22px]`. Usar el valor arbitrario cuando no caiga en la escala: es
preferible a redondear y que no coincida.

Reutilizar lo que ya existe antes de escribir CSS nuevo: `.glass`, `.btn`, `.btn-glass`,
`.btn-glass-red`, `.eyebrow`, `.section-title` en `src/app/globals.css`, y los componentes
de `src/components/app/ui.tsx` (`Card`, `Stat`, `Table`, `Badge`, `PageHeader`).

## 1. Tres correcciones al canvas

El canvas tiene tres cosas mal resueltas. **Implementar la version de aca, no la del
dibujo.**

**La barra de cartera por estado no va como un SVG estirado.** En el canvas es un `<svg>`
con `preserveAspectRatio="none"`, asi que el separador entre segmentos se deforma con el
ancho. Va con divs flex y `gap: 2px`, que da exactamente 2px a cualquier ancho, que es lo
que pide la regla de separacion entre rellenos.

**Las barras de columna llevan redondeo solo en la punta, no en la base.** En el canvas
use `rx` sobre todo el `<rect>`, que redondea tambien donde la barra apoya en el eje. El
extremo anclado a la linea base queda recto; solo la punta lleva 4px.

**La fila de indicadores no puede ser tres columnas en telefono.** En el canvas es
`repeat(3, minmax(0, 1fr))` sin punto de quiebre. Va en una columna hasta `sm` y tres
desde ahi.

## 2. Estructura y espaciado

| Elemento                         | Valor                                 |
| -------------------------------- | ------------------------------------- |
| Padding de pagina                | `28px`                                |
| Separacion barra lateral / main  | `28px`                                |
| Separacion vertical de secciones | `22px`                                |
| Barra lateral                    | `flex: 1 1 232px`, `max-width: 258px` |
| Contenido                        | `flex: 999 1 600px`, `min-width: 0`   |

El `flex: 999 1 600px` del contenido con el `232px` de la lateral hace que la barra se
apile sola debajo de los 900px aprox. No hace falta media query.

Barra lateral por dentro: radio `24px`, padding `20px 14px`, separacion entre items `6px`.
Cada item de navegacion: `min-height: 44px`, padding `10px 14px`, radio `999px`,
`font-size: 14px`, `font-weight: 500`, icono `17px`, separacion icono-texto `10px`.

## 3. Tarjetas

| Elemento                     | Radio  | Padding     |
| ---------------------------- | ------ | ----------- |
| Seccion (`.glass`)           | `26px` | `24px 28px` |
| Seccion del heroe            | `26px` | `26px 28px` |
| Ficha de indicador (anidada) | `18px` | `16px`      |
| Barra lateral y navegacion   | `24px` | `20px 14px` |
| Aviso / nota                 | `20px` | `18px 22px` |

La ficha anidada dentro del cristal no lleva `.glass` otra vez: `background:
rgba(255,255,255,.52)` y `border: 1px solid rgba(255,255,255,.6)`. Cristal sobre cristal
se ve sucio.

## 4. Tipografia

| Uso                   | Familia    | Tamano | Peso | Tracking |
| --------------------- | ---------- | ------ | ---- | -------- |
| Figura principal      | Montserrat | `58px` | 700  | `-.03em` |
| Titulo de pagina      | Montserrat | `34px` | 600  | `-.02em` |
| Titulo de seccion     | Montserrat | `17px` | 600  | normal   |
| Valor de indicador    | Montserrat | `24px` | 600  | normal   |
| Eyebrow               | Inter      | `11px` | 600  | `.18em`  |
| Encabezado de tabla   | Inter      | `11px` | 600  | `.1em`   |
| Celda de tabla        | Inter      | `14px` | 400  | normal   |
| Texto secundario      | Inter      | `13px` | 400  | normal   |
| Etiqueta de indicador | Inter      | `12px` | 400  | normal   |

La figura principal lleva `line-height: 1`. Eyebrow y encabezado de tabla van en
mayusculas.

Opacidades del texto sobre claro, siempre sobre `#482d1f`: secundario `.62`, etiquetas
`.6`, encabezados de tabla `.55`, notas al pie `.58`.

## 5. Controles

| Control                | Alto       | Padding    | Radio   | Texto        |
| ---------------------- | ---------- | ---------- | ------- | ------------ |
| Boton principal        | `44px` min | `0 20px`   | `999px` | `14px` / 600 |
| Boton en fila de tabla | `36px` min | `0 14px`   | `999px` | `13px` / 600 |
| Campo de formulario    | `44px` min | `0 14px`   | `13px`  | `14px`       |
| Chip de estado         | auto       | `4px 11px` | `999px` | `12px` / 600 |

El boton de `36px` es el unico que baja de 44, y solo porque vive dentro de una fila de
tabla en escritorio. En la vista de telefono esa accion pasa a ser una fila completa,
no un boton chico.

Chip de estado: icono `12px`, separacion `6px`, fondo del color de estado al `12%`, texto
del color de estado pleno.

Foco visible en todo control: `outline: 2px solid rgba(185,28,28,.4)`, `outline-offset: 1px`.

## 6. Graficos

### Barra de cartera por estado

Altura `54px`. Divs flex con `gap: 2px`. Radio `8px` solo en los extremos exteriores: el
primer segmento redondeado a la izquierda, el ultimo a la derecha, los del medio rectos.

Leyenda debajo a `16px`, separacion entre items `26px`, cada uno con icono `15px` + nombre
en `600` + valor y porcentaje en texto secundario. **El icono no es decorativo: es lo que
sostiene la identidad cuando el color no alcanza.**

### Columnas, cobros de la semana

Altura total `180px`, area de trazado `150px`, etiquetas del eje debajo.

Barra `38px` de ancho, paso `58px` entre centros. Radio `4px` **solo arriba**. Linea base
`1px` en `rgba(72,45,31,.14)`.

Una sola serie, asi que no lleva leyenda: el titulo la nombra. Etiqueta directa solo sobre
la barra mas alta, `12px` peso 600, `10px` por encima de la punta. Las demas se leen en el
tooltip.

### Barras horizontales, top deudores

Cinco filas, separacion `12px`. Altura de barra `22px`, radio `4px`. Columna de nombre
`116px` fija con elipsis; columna de valor `68px` alineada a la derecha, peso 600.

Carril de fondo en `rgba(72,45,31,.06)`. Una sola serie: el mismo rojo bajando opacidad
por posicion (`.88`, `.72`, `.6`, `.5`, `.42`), que es magnitud, no identidad.

### Sparkline en ficha de indicador

Altura `22px`, separacion `8px` del valor. Trazo `2px` con
`vector-effect="non-scaling-stroke"`, `stroke-linecap` y `stroke-linejoin` redondos.
`viewBox="0 0 100 22"` con `preserveAspectRatio="none"`. Sin ejes, sin puntos, sin
etiquetas.

### Anillo de puntaje

`92px` de lado, radio `38`, trazo `9px`, `stroke-linecap: round`, arranca en
`rotate(-90)`. Carril en `rgba(72,45,31,.1)`. El numero al centro en Montserrat `26px` peso 700.

El desglose debajo: cuatro filas, separacion `11px`, etiqueta `92px` fija, carril `8px` de
alto con radio `4px`, valor `44px` a la derecha.

### Reglas que valen para todos

- Un solo eje. Nunca dos escalas en el mismo grafico.
- Nada de torta ni dona.
- Dos series o mas llevan leyenda; una sola no.
- El texto va en tinta, nunca del color de la serie.
- Cada grafico tiene su vista de tabla, enlazada desde el encabezado de la seccion.
- Ejes y grilla recesivos: `rgba(72,45,31,.14)` sobre claro, `rgba(255,255,255,.14)` sobre
  oscuro.

## 7. Tablas

Encabezado: `11px`, peso 600, mayusculas, tracking `.1em`, color al `.55`, padding
`0 0 10px`.

Celda: `14px`, padding `13px 0`, `border-top: 1px solid rgba(72,45,31,.08)`. La primera
fila tambien lleva borde superior; separa del encabezado.

Contenedor con `overflow-x: auto` y la tabla con `min-width` real: `520px` donde hay cinco
columnas, `640px` donde hay mas. Sin eso la tabla rompe el layout en telefono.

Columnas de dinero alineadas a la derecha. Nombres a la izquierda con elipsis.

## 8. Aurora

Tres gradientes radiales en un div absoluto con `inset: 0`, `pointer-events: none` y
`aria-hidden="true"`, detras del contenido.

Claro:

```css
background:
  radial-gradient(60% 50% at 12% 0%, rgba(185, 28, 28, 0.17), transparent 70%),
  radial-gradient(50% 45% at 88% 8%, rgba(255, 191, 50, 0.22), transparent 72%),
  radial-gradient(45% 40% at 60% 100%, rgba(254, 243, 199, 0.75), transparent 70%);
```

Oscuro:

```css
background:
  radial-gradient(58% 48% at 12% 0%, rgba(185, 28, 28, 0.26), transparent 70%),
  radial-gradient(48% 42% at 88% 8%, rgba(192, 131, 9, 0.2), transparent 72%),
  radial-gradient(45% 40% at 62% 100%, rgba(120, 70, 40, 0.3), transparent 70%);
```

Sobre oscuro los gradientes suben de intensidad. Con los valores del modo claro, el
cristal no se despega del fondo.

## 9. Modo oscuro

Superficie `#1c120d`. Es marron muy oscuro, no negro: sale del marron de marca `#482d1f`.
Negro puro con cristal encima pierde la identidad.

| Rol              | Valor                      |
| ---------------- | -------------------------- |
| Fondo            | `#1c120d`                  |
| Texto primario   | `#f5ece4`                  |
| Texto secundario | `rgba(245, 236, 228, .6)`  |
| Texto terciario  | `rgba(245, 236, 228, .5)`  |
| Borde            | `rgba(255, 255, 255, .08)` |
| Enlace           | `#fca5a5`, hover `#fecaca` |

Cristal oscuro:

```css
background: linear-gradient(135deg, rgba(255, 255, 255, 0.09), rgba(255, 255, 255, 0.03));
border: 1px solid rgba(255, 255, 255, 0.1);
box-shadow:
  inset 0 1px 0 rgba(255, 255, 255, 0.12),
  0 18px 44px -20px rgba(0, 0, 0, 0.8);
backdrop-filter: blur(18px) saturate(150%);
```

Ficha anidada sobre oscuro: `rgba(255,255,255,.05)` con borde `rgba(255,255,255,.08)`.

El rojo de marca `#b91c1c` **no se usa como texto sobre oscuro**: no alcanza contraste.
Para texto y bordes va `#f87171`. Como relleno de boton sigue sirviendo, porque encima
lleva texto blanco.

El tema se aplica antes del primer pintado. Un parpadeo claro al cargar en modo oscuro es
un bug, no un detalle.

## 10. Telefono

Ancho de referencia `390px`.

- Padding de pagina baja a `20px`.
- Navegacion lateral pasa a barra inferior.
- Indicadores en una columna.
- Figura principal baja a `38px`.
- Secciones a radio `22px`, padding `18px 20px`.
- Boton principal de ancho completo, `52px` de alto.
- Objetivos tactiles de `44px` como minimo, sin excepciones.
