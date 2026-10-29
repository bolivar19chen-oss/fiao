/**
 * Las diez provincias y como se escriben en pantalla.
 *
 * Separado de stores.ts a proposito: la lista se derivaba del arreglo de tiendas, asi que
 * cualquier componente cliente que pidiera las provincias arrastraba las 82 filas del
 * MINSA al navegador. El formulario de alta pagaba 30 kB para pintar un desplegable.
 *
 * Escrita a mano, entonces, pero no a ciegas: provinces.test.ts falla si deja de coincidir
 * con stores.ts. El `check` de la migracion 20261020120000_customer_province.sql tiene
 * estos mismos diez valores, y ahi si hay que repetirlos porque Postgres no lee TypeScript.
 */
export const PROVINCES: string[] = [
  "BOCAS DEL TORO",
  "CHIRIQUÍ",
  "COCLÉ",
  "COLÓN",
  "DARIÉN",
  "HERRERA",
  "LOS SANTOS",
  "PANAMÁ",
  "PANAMÁ OESTE",
  "VERAGUAS",
]

/**
 * La provincia como se escribe, no como viene del listado.
 *
 * El PDF del MINSA esta todo en mayusculas, y "CHIRIQUÍ" en pantalla grita. La guia de
 * Apple pide caja de frase siempre, y en espanol el nombre propio va capitalizado:
 * "PANAMÁ OESTE" -> "Panamá Oeste". Solo cambia como se ve; el valor guardado y el
 * `check` de la base siguen en mayusculas.
 */
export function provinceLabel(province: string): string {
  return province
    .toLocaleLowerCase("es")
    .split(" ")
    .map((word) => word.charAt(0).toLocaleUpperCase("es") + word.slice(1))
    .join(" ")
}
