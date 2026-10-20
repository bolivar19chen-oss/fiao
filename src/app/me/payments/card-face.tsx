/**
 * La cara de una tarjeta. Presentacion y nada mas.
 *
 * Es la mitad del componente de referencia que si puede existir: el plastico dibujado,
 * con los dos aros desenfocados detras (alli rosa y azul, aca el rojo y el ambar de la
 * marca). La otra mitad, los campos de numero y CVV, no se escribe nunca: el PAN va a
 * los campos alojados de la pasarela, y de ella vuelve un token con la marca y los
 * ultimos cuatro. Eso es lo que se dibuja aca. ADR 0007.
 *
 * Proporcion 1.586: la de una tarjeta real, 85.60 x 53.98 mm.
 */
export function CardFace({
  brand,
  last4,
  holder,
  expiry,
}: {
  brand?: string
  last4?: string
  holder?: string
  expiry?: string
}) {
  const empty = !last4
  const ink = empty ? "text-white/35" : "text-white"

  return (
    <div className="relative isolate aspect-[1.586] w-full max-w-[360px] overflow-hidden rounded-[1.25rem] bg-[linear-gradient(to_right_bottom,#323941,#061018)] p-6 text-white">
      <span
        aria-hidden
        className="pointer-events-none absolute -left-[17%] -top-10 -z-10 h-72 w-72 rounded-full border-[16px] border-rojo-marca blur-[13px]"
      />
      <span
        aria-hidden
        className="pointer-events-none absolute -left-48 top-[55%] -z-10 h-72 w-72 rounded-full border-[16px] border-amarillo blur-[13px]"
      />

      <div className="flex items-center justify-between text-[13px] font-semibold uppercase tracking-[0.1em]">
        <span>{brand ?? "Card"}</span>
        <span className="font-display text-base tracking-normal">FIA&apos;O</span>
      </div>

      <p className={`mt-7 font-display text-[22px] tabular-nums tracking-[0.08em] ${ink}`}>
        {"•••• •••• •••• "}
        {last4 ?? "••••"}
      </p>

      <div className="absolute inset-x-6 bottom-6 flex items-end justify-between gap-4">
        <span className="min-w-0">
          <span className="block text-[11px] font-semibold uppercase tracking-[0.1em] text-white/60">Card holder</span>
          <span className={`block truncate text-[15px] uppercase ${ink}`}>{holder ?? "No card yet"}</span>
        </span>
        <span className="shrink-0 text-right">
          <span className="block text-[11px] font-semibold uppercase tracking-[0.1em] text-white/60">Expires</span>
          <span className={`block text-[15px] tabular-nums ${ink}`}>{expiry ?? "MM/YY"}</span>
        </span>
      </div>
    </div>
  )
}
