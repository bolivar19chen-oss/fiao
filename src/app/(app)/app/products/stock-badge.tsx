import { Badge } from "@/components/app/ui"

// Sin stock primero; "bajo" cuando llega al umbral que fijo el negocio.
export function StockBadge({ stock, threshold }: { stock: number; threshold: number }) {
  if (stock === 0) return <Badge tone="red">Out of stock</Badge>
  if (stock <= threshold) return <Badge tone="yellow">Low stock</Badge>
  return null
}
