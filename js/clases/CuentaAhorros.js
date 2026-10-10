// =============================================================
// CuentaAhorros.js — HERENCIA: es una Cuenta con interés al retirar.
// Responsable: Juan (rama 13-retirar-dinero).
// =============================================================

class CuentaAhorros extends Cuenta {
  constructor(numero) {
    super(numero, "ahorros");
  }

  // POLIMORFISMO: redefine el interés que aplica la clase padre.
  // Regla: 1,5 % mensual al retirar (TASA_INTERES_AHORROS).
  // Se aplica sobre el monto retirado y se descuenta del saldo final.
  // Ejemplo: retirar $100.000 => interés de $1.500.
  calcularInteresRetiro(monto) {
    return Math.round(monto * TASA_INTERES_AHORROS);
  }
}
