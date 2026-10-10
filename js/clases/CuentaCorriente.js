// =============================================================
// CuentaCorriente.js — HERENCIA: es una Cuenta con sobregiro.
// Responsable: Juan (rama 13-retirar-dinero).
// =============================================================

class CuentaCorriente extends Cuenta {
  constructor(numero) {
    super(numero, "corriente");
  }

  // POLIMORFISMO: redefine el límite de retiro de la clase padre.
  // Regla: saldo + 20 % (PORCENTAJE_SOBREGIRO).
  // Ejemplo: con $1.000.000 se pueden retirar hasta $1.200.000.
  // PENDIENTE (profesor): ¿qué pasa si el saldo ya es negativo?
  limiteRetiro() {
    // TODO (Juan): aplicar el sobregiro
    return this.saldo;
  }
}
