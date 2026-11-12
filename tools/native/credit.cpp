// Nucleo del motor de credito en C++: la misma aritmetica que oracle/ (Python) y
// src/lib/credit (TypeScript), escrita por tercera vez en otro lenguaje. Python la carga con
// ctypes y native/tests comprueba con casos generados que las tres dan el mismo centavo.
//
// Todo es entero de 64 bits. Limite: saldo-dia acumulado por tasa tiene que caber en int64,
// o sea saldos de hasta ~10^11 centavos en un periodo de un mes. Sobra para una tienda.
#include <cstddef>
#include <cstdint>

namespace {
constexpr std::int64_t kDaysPerMonth = 30;
constexpr std::int64_t kBasisPoints = 10'000;
}  // namespace

extern "C" {

// Division entera con redondeo a la mitad hacia +infinito. `/` en C++ trunca hacia cero,
// asi que primero se baja al piso, que es lo que hace `//` en Python.
std::int64_t fiao_divide_round_half_up(std::int64_t numerator, std::int64_t denominator) {
  std::int64_t quotient = numerator / denominator;
  if ((numerator % denominator != 0) && ((numerator < 0) != (denominator < 0))) --quotient;
  const std::int64_t remainder = numerator - quotient * denominator;
  return remainder * 2 >= denominator ? quotient + 1 : quotient;
}

// Dias desde 1970-01-01 en el calendario gregoriano (algoritmo de Howard Hinnant).
std::int64_t fiao_days_from_civil(std::int64_t year, std::int64_t month, std::int64_t day) {
  year -= month <= 2;
  const std::int64_t era = (year >= 0 ? year : year - 399) / 400;
  const std::int64_t year_of_era = year - era * 400;
  const std::int64_t day_of_year = (153 * (month + (month > 2 ? -3 : 9)) + 2) / 5 + day - 1;
  const std::int64_t day_of_era = year_of_era * 365 + year_of_era / 4 - year_of_era / 100 + day_of_year;
  return era * 146097 + day_of_era - 719468;
}

// Interes simple sobre saldo diario con un solo redondeo al final. `days[i]` es el dia del
// movimiento i (ver fiao_days_from_civil) y `cents[i]` su importe. Un dia con saldo negativo
// aporta cero, y por eso se recorre dia a dia con el saldo corrido: no hay formula cerrada
// cuando el saldo cruza por cero.
std::int64_t fiao_accrue_interest(const std::int64_t* days, const std::int64_t* cents, std::size_t count,
                                  std::int64_t start, std::int64_t end, std::int64_t monthly_rate_bp) {
  if (monthly_rate_bp == 0) return 0;

  std::int64_t total = 0;
  std::int64_t running = 0;
  for (std::size_t i = 0; i < count; ++i)
    if (days[i] < start) running += cents[i];

  for (std::int64_t day = start; day <= end; ++day) {
    for (std::size_t i = 0; i < count; ++i)
      if (days[i] == day) running += cents[i];
    if (running > 0) total += running;
  }
  return fiao_divide_round_half_up(total * monthly_rate_bp, kDaysPerMonth * kBasisPoints);
}

}  // extern "C"
