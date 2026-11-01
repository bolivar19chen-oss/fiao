import { SOURCE_URL } from "@/data/stores"

export function SourceNote({ className = "" }: { className?: string }) {
  return (
    <p className={`text-xs text-marron/70 ${className}`}>
      Source:{" "}
      <a
        href={SOURCE_URL}
        target="_blank"
        rel="noopener noreferrer"
        className="underline decoration-marron/20 underline-offset-2 hover:text-rojo"
      >
        Panama Ministry of Health (MINSA), food establishment sanitary registry
      </a>
      .
    </p>
  )
}
