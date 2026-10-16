import { stores, type StoreCategory } from "./stores"

// Agregados del registro de MINSA (ver stores.ts). Coordenadas: capital de cada provincia.

interface ProvinceMeta {
  id: string
  key: string
  province: string
  location: [number, number]
}

const provinceMeta: ProvinceMeta[] = [
  { id: "pa", key: "PANAMÁ", province: "Panamá", location: [8.9824, -79.5199] },
  { id: "po", key: "PANAMÁ OESTE", province: "Panamá Oeste", location: [8.8803, -79.7833] },
  { id: "ch", key: "CHIRIQUÍ", province: "Chiriquí", location: [8.4273, -82.4309] },
  { id: "co", key: "COLÓN", province: "Colón", location: [9.3592, -79.9014] },
  { id: "cc", key: "COCLÉ", province: "Coclé", location: [8.5189, -80.3572] },
  { id: "ve", key: "VERAGUAS", province: "Veraguas", location: [8.1, -80.9833] },
  { id: "he", key: "HERRERA", province: "Herrera", location: [7.9614, -80.4297] },
  { id: "ls", key: "LOS SANTOS", province: "Los Santos", location: [7.7647, -80.2742] },
  { id: "bt", key: "BOCAS DEL TORO", province: "Bocas del Toro", location: [9.3403, -82.242] },
  { id: "da", key: "DARIÉN", province: "Darién", location: [8.4069, -78.1414] },
]

// "SAN FÉLIX" -> "San Félix", "BOCAS DEL TORO" -> "Bocas del Toro"
export function titleCase(value: string): string {
  return value
    .toLowerCase()
    .split(" ")
    .map((w, i) => (i > 0 && (w === "del" || w === "de") ? w : w.charAt(0).toUpperCase() + w.slice(1)))
    .join(" ")
}

function countBy<T extends string>(values: T[]): [T, number][] {
  const counts = new Map<T, number>()
  for (const v of values) counts.set(v, (counts.get(v) ?? 0) + 1)
  return [...counts].sort((a, b) => b[1] - a[1])
}

export const provinces = provinceMeta
  .map((meta) => {
    const inProvince = stores.filter((s) => s.province === meta.key)
    const [topDistrict] = countBy(inProvince.flatMap((s) => (s.district ? [s.district] : [])))
    return {
      ...meta,
      stores: inProvince.length,
      topDistrict: topDistrict ? { name: titleCase(topDistrict[0]), stores: topDistrict[1] } : null,
    }
  })
  .sort((a, b) => b.stores - a.stores)

export const totalStores = stores.length
export const maxStores = provinces[0].stores

const districts = countBy(stores.flatMap((s) => (s.district ? [`${s.province}|${s.district}`] : [])))
export const districtCount = districts.length
export const topDistrict = { name: titleCase(districts[0][0].split("|")[1]), stores: districts[0][1] }

const categoryLabels: Record<StoreCategory, string> = {
  minisuper: "Mini supers",
  mercadito: "Small markets",
  super_centro: "Super centers",
  abarroteria: "Grocery stores",
  mini_market: "Mini markets",
}

export const categories = countBy(stores.map((s) => s.category)).map(([category, count]) => ({
  label: categoryLabels[category],
  stores: count,
}))
