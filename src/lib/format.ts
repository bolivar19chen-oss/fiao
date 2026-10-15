const usd = new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" })

// Display only. Amounts are stored and computed as integer cents.
export function formatCents(cents: number): string {
  return usd.format(cents / 100)
}

const count = new Intl.NumberFormat("en-US")

export function formatCount(n: number): string {
  return count.format(n)
}
