# FIA'O - Diseno y experiencia de usuario

## Paleta de colores

| Rol            | Hex       | Uso                                              |
| -------------- | --------- | ------------------------------------------------ |
| Rojo principal | `#b91c1c` | Acciones principales, botones, marca             |
| Amarillo       | `#ffbf32` | Elementos destacados, acentos, detalles de marca |
| Crema          | `#fef3c7` | Acentos suaves, resplandor del globo             |
| Blanco         | `#ffffff` | Fondo general                                    |
| Marron oscuro  | `#482d1f` | Texto y jerarquia tipografica                    |

Pendientes de definir (el poster los menciona sin valor):

- Verde: pagos completados / estado al dia.
- Rojo oscuro: alertas y mora.

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
