// La unica funcion de redondeo del sistema. Si aparece un segundo redondeo en el codigo
// del motor, hay un error de diseno: dos politicas de redondeo producen balances que no
// cuadran, y eso es exactamente lo que este modulo existe para evitar.

/**
 * Division entera con redondeo a la mitad hacia arriba (hacia +infinito).
 *
 * Con enteros y sin coma flotante: `Math.round(a / b)` se equivoca justo en el caso de
 * la mitad exacta, que es el unico que importa decidir. `denominator` es siempre
 * positivo; lo llaman constantes del dominio, nunca entrada del usuario.
 */
export function divideRoundHalfUp(numerator: number, denominator: number): number {
  const quotient = Math.floor(numerator / denominator)
  // Con denominador positivo, Math.floor deja el resto siempre en [0, denominator).
  // Por eso la misma comparacion sirve para numeradores negativos: -5/2 da -2, no -3.
  const remainder = numerator - quotient * denominator
  return remainder * 2 >= denominator ? quotient + 1 : quotient
}
