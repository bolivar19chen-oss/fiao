# FIA'O - Onboarding: tarjeta reversible y registro

Reemplaza el `/onboarding` actual, que pide solo el nombre de la tienda. Decisiones de
alcance en [ADR 0002](adr/0002-credito-por-tienda.md) y
[ADR 0006](adr/0006-cuentas-de-cliente.md). Medidas en [UI-DASHBOARD.md](UI-DASHBOARD.md).

## 0. Antes de escribir una linea

**No se instala shadcn/ui.** Sus componentes leen variables CSS (`--background`,
`--foreground`, `--muted-foreground`, `--input`, `--ring`) que `tailwind.config.ts` no
define: se renderizarian sin color. Montarlas significa mantener un segundo sistema de
tokens al lado de `rojo` / `amarillo` / `crema` / `marron`.

Lo que hace falta ya esta instalado: `framer-motion` 12.43.0 y `lucide-react` 1.57. Los
estilos salen de `.glass`, `.btn`, `.btn-glass`, `.btn-glass-red`, `.eyebrow` en
`src/app/globals.css`.

**Nombres de iconos:** usar `LoaderCircle` y `Building`, que son los nombres actuales.
(Correccion: una version previa de este documento afirmaba que `Loader2` y `Building2` no
existen en lucide-react 1.x. Si existen; se comprobo contra el paquete instalado. Se
prefieren los nombres nuevos, pero los viejos no rompen nada.) Verificados en el paquete: `Store`, `User`,
`IdCard`, `Upload`, `LoaderCircle`, `ArrowLeft`, `ArrowRight`, `Check`, `CreditCard`,
`Smartphone`, `Banknote`, `Camera`, `RefreshCw`.

**El banner es una ilustracion pintada**, como en el diseno de referencia, con los simbolos
nacionales: el aguila harpia para el negocio y la flor del Espiritu Santo para el cliente
(`CardBanner` en `src/components/onboarding/onboarding-card.tsx`). Son ilustraciones propias,
servidas por `next/image` desde `src/assets/img`. El borde de pincelada inferior es
transparente para que se funda con la tarjeta en claro y en oscuro.

## 1. El flujo

```
/login  sign up (correo + contrasena)
   |
   v
/onboarding   <- la tarjeta reversible. Solo si el perfil esta incompleto
   |
   +-- cara frontal: negocio
   |     paso 1  tus datos          -> paso 2  tu negocio (legal)  -> /app
   |
   +-- cara trasera: cliente
         paso unico  tus datos      -> canjear invitacion           -> /me
```

**Cuando aparece.** Solo cuando el usuario no tiene perfil completo. Un usuario que ya
eligio rol **nunca** vuelve a ver la tarjeta: el layout de `(app)` y el de `/me` lo mandan
a su pagina. La comprobacion es una sola consulta: si existe fila en `profiles` con
`role` no nulo, la tarjeta no se muestra.

El `/onboarding` actual (`page.tsx`, `onboarding-form.tsx`, `actions.ts`) se reemplaza. Su
llamada a `create_business(p_name)` pasa a ser el ultimo paso del camino de negocio.

## 2. La tarjeta reversible

Dos caras. La frontal **siempre** es negocio. La trasera, cliente.

Archivo nuevo: `src/components/onboarding/role-flip-card.tsx`.

```tsx
"use client"

import { useState } from "react"
import { motion, useReducedMotion } from "framer-motion"
import { ArrowRight, IdCard, RefreshCw, Store, User } from "lucide-react"

const FADE_UP = {
  hidden: { opacity: 0, y: 10 },
  show: { opacity: 1, y: 0, transition: { type: "spring" as const, bounce: 0.2 } },
}

const STAGGER = {
  hidden: {},
  show: { transition: { staggerChildren: 0.12 } },
}

type Face = "business" | "customer"

export function RoleFlipCard({ onChoose }: { onChoose: (role: Face) => void }) {
  const [face, setFace] = useState<Face>("business")
  const reduced = useReducedMotion()
  const flipped = face === "customer"

  return (
    <div className="w-full max-w-md">
      {/* perspective wrapper: sin esto el giro se ve plano */}
      <div className="[perspective:1600px]">
        <motion.div
          className="relative [transform-style:preserve-3d]"
          animate={reduced ? {} : { rotateY: flipped ? 180 : 0 }}
          transition={{ type: "spring", stiffness: 160, damping: 22 }}
        >
          <Face
            side="front"
            hidden={flipped}
            reduced={reduced}
            icon={<ShopArt className="h-9 w-9" />}
            eyebrow="For shop owners"
            title="I run a business"
            description="Track inventory, sell on credit and keep every customer's payment history in one place."
            detailIcon={<IdCard className="h-4 w-4" aria-hidden="true" />}
            detailTitle="You'll need your RUC"
            detailNote="Plus your operating notice and the shop's address."
            cta="Set up my shop"
            accent="red"
            onChoose={() => onChoose("business")}
          />
          <Face
            side="back"
            hidden={!flipped}
            reduced={reduced}
            icon={<CustomerArt className="h-9 w-9" />}
            eyebrow="For customers"
            title="I'm a customer"
            description="See what you owe at each shop, your payment history and your credit score there."
            detailIcon={<IdCard className="h-4 w-4" aria-hidden="true" />}
            detailTitle="You'll need your ID number"
            detailNote="And an invite from the shop that gives you credit."
            cta="Enter my invite code"
            accent="cream"
            onChoose={() => onChoose("customer")}
          />
        </motion.div>
      </div>

      <button
        type="button"
        onClick={() => setFace(flipped ? "business" : "customer")}
        className="btn btn-glass mx-auto mt-6 flex"
      >
        <RefreshCw className="h-4 w-4" aria-hidden="true" />
        {flipped ? "I run a business instead" : "I'm a customer instead"}
      </button>
    </div>
  )
}

function Face({
  side,
  hidden,
  reduced,
  icon,
  eyebrow,
  title,
  description,
  detailIcon,
  detailTitle,
  detailNote,
  cta,
  accent,
  onChoose,
}: {
  side: "front" | "back"
  hidden: boolean
  reduced: boolean | null
  icon: React.ReactNode
  eyebrow: string
  title: string
  description: string
  detailIcon: React.ReactNode
  detailTitle: string
  detailNote: string
  cta: string
  accent: "red" | "cream"
  onChoose: () => void
}) {
  const isBack = side === "back"

  return (
    <motion.div
      // `inert` saca la cara oculta del foco y del lector de pantalla.
      // Mismo patron que src/components/auth/auth-switch.tsx.
      inert={hidden}
      aria-hidden={hidden}
      initial="hidden"
      animate="show"
      variants={STAGGER}
      style={{ backfaceVisibility: "hidden" }}
      className={[
        "glass overflow-hidden rounded-[2rem]",
        isBack ? "absolute inset-0 [transform:rotateY(180deg)]" : "",
        reduced && hidden ? "opacity-0" : "",
      ].join(" ")}
    >
      {/* Banda superior: la "foto" del diseno de referencia, hecha con la marca */}
      <motion.div
        variants={FADE_UP}
        aria-hidden="true"
        className={[
          "relative h-32 w-full",
          accent === "red"
            ? "bg-[radial-gradient(120%_140%_at_20%_0%,#cd2626_0%,#b91c1c_45%,#7f1d1d_100%)]"
            : "bg-[radial-gradient(120%_140%_at_20%_0%,#fff8e6_0%,#fef3c7_45%,#ffbf32_100%)]",
        ].join(" ")}
      >
        <span
          className={[
            "absolute bottom-4 left-8 grid h-12 w-12 place-items-center rounded-2xl",
            accent === "red" ? "bg-white/90 text-rojo" : "bg-marron text-crema",
          ].join(" ")}
        >
          {icon}
        </span>
      </motion.div>

      <div className="space-y-5 p-8">
        <motion.div variants={FADE_UP} className="space-y-2">
          <p className="eyebrow">{eyebrow}</p>
          <h2 className="font-display text-2xl font-semibold tracking-tight text-marron">{title}</h2>
          <p className="text-[15px] leading-relaxed text-marron/70">{description}</p>
        </motion.div>

        <motion.div
          variants={FADE_UP}
          className="flex items-start gap-3 rounded-2xl border border-white/60 bg-white/50 p-4"
        >
          <span className="mt-0.5 text-marron/60">{detailIcon}</span>
          <span>
            <span className="block text-sm font-semibold text-marron">{detailTitle}</span>
            <span className="block text-xs leading-relaxed text-marron/60">{detailNote}</span>
          </span>
        </motion.div>

        <motion.div variants={FADE_UP}>
          <button type="button" onClick={onChoose} className="btn btn-glass-red w-full">
            {cta}
            <ArrowRight className="h-4 w-4" aria-hidden="true" />
          </button>
        </motion.div>
      </div>
    </motion.div>
  )
}
```

Notas de implementacion que no se ven en el codigo:

- La cara trasera va en `absolute inset-0`; la frontal define la altura. Si una cara queda
  mas alta que la otra, se corta. **Las dos caras tienen que medir lo mismo**: igual
  cantidad de lineas en `description` y en `detailNote`, o se fija una altura minima.
- `useReducedMotion` apaga el giro. Con movimiento reducido la cara oculta se esconde con
  opacidad, no rotando: un giro 3D es movimiento fuerte y hay gente a la que le marea.
- `inert` ya se usa en `auth-switch.tsx`. Sin el, el tabulador entra en la cara que no se
  ve.
- El boton de cambio de cara va **fuera** de la tarjeta. Dentro, gira con ella y deja de
  poderse tocar.

## 3. Registro de negocio

Dos pasos despues de elegir la cara frontal. Barra de progreso arriba, "Step 1 of 2".

### Paso 1: tus datos

| Campo         | Tipo  | Regla                                 |
| ------------- | ----- | ------------------------------------- |
| Full name     | texto | Requerido, 2-120 caracteres           |
| Date of birth | fecha | Requerido, 18 anos cumplidos          |
| National ID   | texto | Requerido, formato de cedula panamena |
| Phone         | tel   | Requerido, 8 digitos                  |

**Fecha de nacimiento, no edad.** Pediste "edad" y lo cambio a proposito: una edad
guardada queda vieja al dia siguiente del cumpleanos. Se guarda la fecha y la edad se
calcula. Es un campo, no dos, y nunca miente.

Los 18 anos no son decoracion: otorgar credito a un menor no tiene validez.

### Paso 2: tu negocio

| Campo                | Tipo   | Regla                                                 |
| -------------------- | ------ | ----------------------------------------------------- |
| Legal structure      | enum   | `natural` o `corporation`. Cambia los campos de abajo |
| Trade name           | texto  | Requerido. El nombre del local                        |
| Legal name           | texto  | Solo `corporation`. La razon social                   |
| RUC                  | texto  | Requerido                                             |
| RUC check digit (DV) | texto  | Requerido                                             |
| Operating notice no. | texto  | Requerido                                             |
| Legal rep. full name | texto  | Solo `corporation`                                    |
| Legal rep. ID        | texto  | Solo `corporation`                                    |
| Province             | select | Requerido                                             |
| District             | select | Requerido. Depende de Province                        |
| Corregimiento        | select | Requerido. Depende de District                        |
| Address              | texto  | Requerido                                             |
| Owner photo          | imagen | Opcional en el MVP. Ver seccion 6                     |

En `natural` el RUC suele coincidir con la cedula del dueno: se prellena desde el paso 1 y
se deja editar.

## 4. Registro de cliente

Un solo paso.

| Campo         | Tipo  | Regla                        |
| ------------- | ----- | ---------------------------- |
| Full name     | texto | Requerido, 2-120 caracteres  |
| National ID   | texto | Requerido                    |
| Email         | email | Prellenado desde la sesion   |
| Phone         | tel   | Requerido, 8 digitos         |
| Date of birth | fecha | Requerido, 18 anos cumplidos |

Despues, la pantalla de invitacion: un codigo corto que da el negocio. Sin invitacion, la
cuenta existe pero no ve ninguna libreta. **El cliente nunca se auto-reclama** por
telefono ni por cedula: seria apropiarse del historial de otro (ADR 0006).

## 5. Lo que hay que verificar antes de codear

**No inventar ninguno de estos. Se verifican contra la fuente oficial.**

| Dato                                            | Donde se verifica                      |
| ----------------------------------------------- | -------------------------------------- |
| Formato exacto de la cedula                     | Tribunal Electoral                     |
| Formato del RUC y calculo del DV                | DGI, Ministerio de Economia y Finanzas |
| Nombre y formato del permiso de operacion       | Ministerio de Comercio e Industrias    |
| Lista de provincias, distritos y corregimientos | INEC / Tribunal Electoral              |

La division politica de Panama cambia: se crean corregimientos. **La lista no se escribe a
mano en un archivo TypeScript desde la memoria de nadie.** Se carga de un conjunto de
datos oficial a una tabla, con fecha de la version.

Mientras no esten verificados, el validador acepta el campo como texto no vacio y queda un
`TODO` con el enlace a la fuente. **Un validador inventado es peor que ninguno:** rechaza
cedulas validas y el usuario no puede registrarse.

## 6. Datos sensibles

**La foto de perfil esta encendida.** La decision y sus condiciones estan en
[ADR 0008](adr/0008-foto-de-perfil.md); esta seccion resume lo que hay que respetar.

- **Opcional de verdad.** No viaja en el formulario y no es un campo del perfil. Saltarla
  no cuesta nada. Si nadie sube una, no hay objeto que proteger.
- **Bucket privado** `avatars`, ruta `{user_id}/avatar`, RLS que solo deja tocar la
  carpeta propia. Se lee con URL firmada de vida corta, nunca por URL publica: una URL
  publica de avatares es adivinable si se conoce el `uid`.
- **Tipo y tamano los exige el bucket** (`allowed_mime_types`, 2 MB), que es servidor. Lo
  del navegador es solo para avisar antes de subir en vano.
- **Se puede retirar.** Hay politica de delete y boton de quitar.
- El formulario dice que es opcional y que formatos y tamano acepta.

**La imagen del documento de identidad sigue sin pedirse.** Guardar el numero de cedula
alcanza para identificar y una foto del documento es muchisimo mas riesgo por muy poco.
Eso no cambio.

## 7. Cambios de schema

Migracion nueva. No se toca la existente.

**`profiles`** (tabla nueva, una fila por usuario)

- `user_id uuid primary key references auth.users (id) on delete cascade`
- `role text not null check (role in ('business', 'customer'))`
- `full_name text not null check (length(trim(full_name)) > 0)`
- `national_id text not null`
- `phone text not null`
- `date_of_birth date not null`
- `created_at timestamptz not null default now()`
- RLS: cada usuario lee y escribe **solo su propia fila**. Sin excepciones.

La edad se calcula, no se guarda. Un `check` sobre `date_of_birth` fija los 18 anos al
momento de insertar.

**`businesses`** gana:

- `legal_structure text not null check (legal_structure in ('natural', 'corporation'))`
- `legal_name text`, nulo en `natural`
- `ruc text not null`, `ruc_dv text not null`
- `operating_notice text not null`
- `legal_rep_name text`, `legal_rep_id text`, nulos en `natural`
- `province_code text not null`, `district_code text not null`,
  `corregimiento_code text not null`
- `address text not null`

**`panama_divisions`** (tabla nueva, solo lectura)

- `code text primary key`, `kind text check (kind in ('province','district','corregimiento'))`
- `name text not null`, `parent_code text references panama_divisions (code)`
- `source_version text not null` - de que publicacion oficial salio
- Sin RLS de negocio: es un catalogo. Lectura para `authenticated`, escritura solo por
  migracion.

El `create_business(text)` actual recibe solo el nombre. Pasa a recibir el conjunto
completo, o se parte en `create_business` + `update_business_legal`. Lo segundo es mas
simple de probar.

## 8. Metodos de pago

Detalle y encuadre legal en [APLICACION.md](APLICACION.md) seccion 4 y
[ADR 0007](adr/0007-pagos-sin-custodia.md). Aca solo la forma.

| Metodo            | Icono        | Que mueve el dinero                  |
| ----------------- | ------------ | ------------------------------------ |
| Cash in person    | `Banknote`   | Nada. El negocio lo registra         |
| Yappy             | `Smartphone` | Yappy, cliente a negocio             |
| Visa / Mastercard | `CreditCard` | La pasarela, a la cuenta del negocio |

En el perfil del negocio, cada metodo se enciende por separado. Un negocio que solo cobra
en efectivo no ve nada de pasarelas.

**La regla de la tarjeta, otra vez porque es la que se rompe:** el numero no toca tu
servidor ni tu base de datos. Campos alojados o redireccion de la pasarela; vos guardas el
token que te devuelven y los ultimos cuatro digitos para mostrar.

Yappy: hay que **verificar la integracion real** de Banco General para comercios antes de
disenar contra ella. Que expone, como confirma, si hay webhook. Ni una linea asumiendo
como funciona.

## 9. Cookies

Lo primero es contar que cookies hay de verdad. Hoy el proyecto usa **solo las de sesion
de Supabase**, que son estrictamente necesarias para que el login funcione.

Con eso y nada mas, lo que corresponde es un **aviso**, no un muro de consentimiento con
casillas. Un gestor de consentimiento para cookies que no necesitan consentimiento es
trabajo de mas y molesta al usuario.

- Banda discreta abajo, una vez, con "Got it" y enlace a `/privacy`.
- La preferencia se guarda en `localStorage`, no en una cookie nueva.
- No bloquea la pagina ni atrapa el foco.
- **El dia que entre analitica o un pixel de terceros, esto cambia** y pasa a ser
  consentimiento real, con opcion de rechazar igual de visible que la de aceptar, y nada
  se carga antes del si.

## 10. Orden

1. Tabla `profiles` con su RLS, y `panama_divisions` vacia.
2. La tarjeta reversible, reemplazando el `/onboarding` actual.
3. Paso de cliente, que es el corto, y el canje de invitacion.
4. Pasos de negocio, con los validadores en modo permisivo y sus `TODO`.
5. Cargar `panama_divisions` del conjunto oficial y encender los selects en cascada.
6. Validadores reales de cedula y RUC, una vez verificados.
7. Aviso de cookies.
8. Metodos de pago, al final: dependen del ADR 0007.
