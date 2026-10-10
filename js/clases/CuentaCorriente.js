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
  // Nota: si el saldo ya es negativo, por ahora se conserva el saldo actual
  // para no ampliar artificialmente la deuda. El profesor puede definir luego
  // la política exacta del sobregiro en ese caso.
  limiteRetiro() {
    if (this.saldo <= 0) {
      return this.saldo;
    }

    return this.saldo + Math.floor(this.saldo * PORCENTAJE_SOBREGIRO);
  }
}
