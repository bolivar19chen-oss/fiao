// SAMPLE DATA: placeholder figures until the verified dataset arrives.
// Coordinates are the provincial capitals. Money in integer cents.
export const SAMPLE_DATA = true

export interface ProvinceStat {
  id: string
  province: string
  capital: string
  location: [number, number]
  stores: number
  creditSharePct: number
  avgTicketCents: number
}

export const provinces: ProvinceStat[] = [
  { id: "pa", province: "Panamá", capital: "Panama City", location: [8.9824, -79.5199], stores: 4210, creditSharePct: 38, avgTicketCents: 1240 },
  { id: "po", province: "Panamá Oeste", capital: "La Chorrera", location: [8.8803, -79.7833], stores: 1580, creditSharePct: 44, avgTicketCents: 980 },
  { id: "ch", province: "Chiriquí", capital: "David", location: [8.4273, -82.4309], stores: 1240, creditSharePct: 41, avgTicketCents: 1060 },
  { id: "co", province: "Colón", capital: "Colón", location: [9.3592, -79.9014], stores: 860, creditSharePct: 47, avgTicketCents: 910 },
  { id: "cc", province: "Coclé", capital: "Penonomé", location: [8.5189, -80.3572], stores: 640, creditSharePct: 45, avgTicketCents: 870 },
  { id: "ve", province: "Veraguas", capital: "Santiago", location: [8.1, -80.9833], stores: 610, creditSharePct: 49, avgTicketCents: 840 },
  { id: "he", province: "Herrera", capital: "Chitré", location: [7.9614, -80.4297], stores: 380, creditSharePct: 42, avgTicketCents: 890 },
  { id: "ls", province: "Los Santos", capital: "Las Tablas", location: [7.7647, -80.2742], stores: 330, creditSharePct: 43, avgTicketCents: 860 },
  { id: "bt", province: "Bocas del Toro", capital: "Bocas Town", location: [9.3403, -82.242], stores: 290, creditSharePct: 51, avgTicketCents: 1120 },
  { id: "da", province: "Darién", capital: "La Palma", location: [8.4069, -78.1414], stores: 140, creditSharePct: 56, avgTicketCents: 760 },
]

export const totalStores = provinces.reduce((sum, p) => sum + p.stores, 0)
export const maxStores = Math.max(...provinces.map((p) => p.stores))

// One example store over six months.
export const collectionTrend = [
  { month: "May", outstandingCents: 412_000, collectedCents: 268_000 },
  { month: "Jun", outstandingCents: 398_000, collectedCents: 291_000 },
  { month: "Jul", outstandingCents: 371_000, collectedCents: 317_000 },
  { month: "Aug", outstandingCents: 342_000, collectedCents: 336_000 },
  { month: "Sep", outstandingCents: 305_000, collectedCents: 352_000 },
  { month: "Oct", outstandingCents: 268_000, collectedCents: 371_000 },
]
