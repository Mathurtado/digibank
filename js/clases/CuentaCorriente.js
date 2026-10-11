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
  // Decisión provisional: no se permite retirar más (límite 0).
  // Se redondea hacia abajo para que los montos sigan siendo enteros.
  limiteRetiro() {
    if (this.saldo <= 0) {
      return 0;
    }
    return Math.floor(this.saldo * (1 + PORCENTAJE_SOBREGIRO));
  }
}