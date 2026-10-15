// Soft brand-colored light behind glass surfaces. Without something behind it,
// backdrop blur on a white page is invisible.
// Vertical fade so the light never ends in a hard edge at the section boundary.
const FADE = "linear-gradient(to bottom, transparent, black 15%, black 85%, transparent)"

export function Aurora({ className = "" }: { className?: string }) {
  return (
    <div
      className={`pointer-events-none absolute inset-0 -z-10 overflow-hidden ${className}`}
      style={{ maskImage: FADE, WebkitMaskImage: FADE }}
      aria-hidden
    >
      <div className="absolute -right-24 -top-32 h-[34rem] w-[34rem] rounded-full bg-rojo/20 blur-[110px]" />
      <div className="absolute -left-32 top-40 h-[28rem] w-[28rem] rounded-full bg-amarillo/30 blur-[110px]" />
      <div className="absolute bottom-0 right-1/3 h-72 w-72 rounded-full bg-amarillo/25 blur-[90px]" />
      <div
        className="absolute inset-0 opacity-[0.35]"
        style={{
          backgroundImage:
            "linear-gradient(rgb(72 45 31 / 0.06) 1px, transparent 1px), linear-gradient(90deg, rgb(72 45 31 / 0.06) 1px, transparent 1px)",
          backgroundSize: "56px 56px",
          maskImage: "radial-gradient(ellipse 70% 60% at 50% 30%, black, transparent)",
          WebkitMaskImage: "radial-gradient(ellipse 70% 60% at 50% 30%, black, transparent)",
        }}
      />
    </div>
  )
}
