# FIA'O - Diseno y experiencia de usuario

## Paleta de colores

| Rol            | Hex       | Uso                                              |
| -------------- | --------- | ------------------------------------------------ |
| Rojo principal | `#b91c1c` | Acciones principales, botones, marca             |
| Amarillo       | `#ffbf32` | Elementos destacados, acentos, detalles de marca |
| Crema          | `#fef3c7` | Acentos suaves, resplandor del globo             |
| Blanco         | `#ffffff` | Fondo general                                    |
| Marron oscuro  | `#482d1f` | Texto y jerarquia tipografica                    |

## Donde viven los colores

**Fuente unica: `src/lib/colors.ts`.** Ningun color se escribe a mano en un componente.
Si hace falta un tono que no esta ahi, se agrega ahi primero.

Dos consumidores leen ese archivo:

1. `tailwind.config.ts`, que lo convierte en clases: `bg-rojo`, `text-marron`,
   `bg-estado-al-dia`.
2. El codigo que necesita el valor como dato: atributos `fill` y `stroke` de SVG y props
   de Recharts, donde una clase no aplica.

Antes de esta regla habia 14 valores sueltos en 8 archivos, con dos cremas casi iguales
(`#fff8ea` y `#fff8e6`) que nadie habia notado. Se unificaron en `crema.claro`.

Excepcion conocida: `src/components/auth/auth-switch.module.css` es CSS plano y no puede
leer tokens de Tailwind. Mantiene sus valores escritos a mano.

## Colores de estado

Reservados para estado de cuenta. **Nunca se reutilizan como color de serie en un
grafico.** El poster los mencionaba sin valor; estos salen de validar la paleta con el
script de la guia de visualizacion, no de elegirlos a ojo.

| Estado     | Claro     | Oscuro    | Uso                       |
| ---------- | --------- | --------- | ------------------------- |
| Al dia     | `#047857` | `#059669` | Pagado, cuenta sin atraso |
| Por vencer | `#d97706` | `#c08309` | Cuota proxima a vencer    |
| En mora    | `#b91c1c` | `#f43f5e` | Atraso pasada la gracia   |

Dos hallazgos de esa validacion, y los dos cambian como se dibuja:

- **El amarillo de marca `#ffbf32` no sirve como relleno de grafico.** Contraste 1.6:1
  sobre blanco, muy por debajo del minimo de 3:1. Queda para acentos de marca, nunca para
  un dato.
- **En modo oscuro, ambar y rojo no se separan lo suficiente para daltonismo** dentro de
  la banda de luminosidad que exige el fondo oscuro. Es una restriccion geometrica, no una
  mala eleccion. Por eso **todo estado va siempre con icono y etiqueta, jamas solo color**.

## Tipografia

- **Poppins** e **Inter**.
- Moderna, legible, con jerarquia visual clara.

## Principios de interfaz

- **Toda la interfaz en ingles.** Landing y app. Cero texto en espanol en la UI.
- **Fondo blanco.** El color de marca entra como luz difusa (`Aurora`) detras de superficies de
  cristal: blur + relleno translucido + borde especular (`.glass`, `.btn-glass`, `.btn-glass-red`
  en `src/app/globals.css`). Sin luz detras, el cristal no se ve sobre blanco.
- Interfaz limpia y minimalista. Simple, moderno y claro.
- Responsive: movil, tablet y PC. El movil manda, el publico usa celulares de gama baja.
- Microinteracciones discretas.
- Buena jerarquia visual: lo importante (deuda, cobros de hoy) se lee primero.
- Accesibilidad: contraste suficiente, objetivos tactiles grandes.

## Caracteristicas clave visibles en producto

- Control de inventario y stock.
- Ventas y creditos (abonos parciales).
- Calculo automatico de deuda.
- Historial de pagos.
- Puntaje de credito del cliente.
- Vista de cliente con su informacion.
- Reportes y estadisticas.
- Notificaciones y alertas.
- Funciona offline (PWA).
- Instalable en el celular.
- Multi-tienda.

## Nota sobre graficas

Recharts, nativo de React. Nada de imagenes estaticas generadas en backend.
Ver [PLAN.md](PLAN.md), seccion 2.2.
