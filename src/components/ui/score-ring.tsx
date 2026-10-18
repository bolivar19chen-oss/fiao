export function ScoreRing({ score, className = "h-11 w-11" }: { score: number; className?: string }) {
  const r = 16
  const c = 2 * Math.PI * r
  return (
    <svg viewBox="0 0 40 40" className={`-rotate-90 ${className}`} aria-label={`Score ${score} of 100`}>
      <circle cx="20" cy="20" r={r} fill="none" className="stroke-marron/10" strokeWidth="4" />
      <circle
        cx="20"
        cy="20"
        r={r}
        fill="none"
        className="stroke-rojo"
        strokeWidth="4"
        strokeLinecap="round"
        strokeDasharray={c}
        strokeDashoffset={c * (1 - score / 100)}
      />
      <text
        x="20"
        y="20"
        className="rotate-90 fill-marron text-[11px] font-bold"
        style={{ transformOrigin: "20px 20px" }}
        textAnchor="middle"
        dominantBaseline="central"
      >
        {score}
      </text>
    </svg>
  )
}
