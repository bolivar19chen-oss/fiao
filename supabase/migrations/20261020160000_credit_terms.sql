-- Los terminos del credito, que los pone la tienda. Ver ADR 0009 y
-- docs/MODELO-CREDITO.md seccion 5, que ya especificaba estas columnas.
--
-- Entra solo la parte que necesita la venta a credito. La tabla interest_charges, la
-- reversion de abonos y la vista customer_account_state son del devengo (cobrar el
-- interes con el paso del tiempo) y van en su propia migracion.

-- ---------------------------------------------------------------------------
-- businesses: las condiciones
-- ---------------------------------------------------------------------------
--
-- En puntos base y no en decimales: el dinero de este proyecto es entero y las tasas
-- tambien. 150 es 1.50% mensual, y asi no hay forma de que se cuele un float.
--
-- Default 0 en las dos tasas. Un negocio que no cobra intereses es un caso valido y es
-- el mas comun en una tienda de barrio: cero no es "sin configurar", es una respuesta.
--
-- Los topes son de cordura, no legales: atajan un dedo gordo. FIA'O no sabe cual es la
-- tasa maxima legal en cada pais y no va a fingir que la sabe (ADR 0009).
alter table public.businesses
  add column monthly_rate_bp integer not null default 0
    check (monthly_rate_bp between 0 and 10000),
  add column late_rate_bp integer not null default 0
    check (late_rate_bp between 0 and 10000),
  -- El tope de 28 evita el problema de los meses cortos.
  add column cutoff_day smallint not null default 1
    check (cutoff_day between 1 and 28),
  add column grace_days smallint not null default 0
    check (grace_days between 0 and 90),
  -- Lo que el formulario de venta propone por defecto. El dueno lo cambia por venta.
  add column default_installments smallint not null default 2
    check (default_installments between 1 and 24),
  -- Dias entre cuotas. 15 es quincenal, que es como cobra una tienda de barrio.
  add column installment_days smallint not null default 15
    check (installment_days between 1 and 90);

comment on column public.businesses.monthly_rate_bp is
  'Interes mensual en puntos base. 150 = 1.50%. Lo fija la tienda (ADR 0009).';
comment on column public.businesses.late_rate_bp is
  'Recargo por mora en puntos base. Lo fija la tienda (ADR 0009).';

-- ---------------------------------------------------------------------------
-- customers: el limite
-- ---------------------------------------------------------------------------
--
-- No es una condicion del negocio sino una decision sobre esa persona, por eso va aca.
-- Nulo = sin limite. Se valida del lado del servidor al registrar la venta, nunca solo
-- en la interfaz.
--
-- Tambien desbloquea el factor debtRatio del puntaje, que hoy sale en blanco porque el
-- motor no tiene con que dividir (src/lib/credit/scoring.ts).
alter table public.customers
  add column credit_limit_cents bigint check (credit_limit_cents >= 0);

comment on column public.customers.credit_limit_cents is
  'Cuanto fiado aguanta este cliente. Nulo = sin limite. Lo decide la tienda.';

-- El limite lo pone el negocio, asi que entra en las columnas que si puede escribir.
-- La migracion anterior (20261020140000) dejo el UPDATE restringido por columna.
grant update (credit_limit_cents) on public.customers to authenticated;
grant insert (credit_limit_cents) on public.customers to authenticated;

-- ---------------------------------------------------------------------------
-- sales: los terminos aplicados, congelados
-- ---------------------------------------------------------------------------
--
-- Dato duplicado a proposito. Si la tienda sube la tasa manana, las ventas de hoy tienen
-- que seguir diciendo la de hoy: un cambio de tarifa no reescribe deudas ya contraidas,
-- y sin esto el historial dejaria de cuadrar al primer cambio.
alter table public.sales
  add column monthly_rate_bp integer not null default 0
    check (monthly_rate_bp between 0 and 10000),
  add column late_rate_bp integer not null default 0
    check (late_rate_bp between 0 and 10000),
  add column grace_days smallint not null default 0
    check (grace_days between 0 and 90);

comment on column public.sales.monthly_rate_bp is
  'Los terminos que regian cuando se hizo esta venta. Congelados: no siguen a businesses.';
