// =============================================================
// CuentaAhorros.js — HERENCIA: es una Cuenta con interés al retirar.
// Responsable: Juan (rama 13-retirar-dinero).
// =============================================================

class CuentaAhorros extends Cuenta {
  constructor(numero, datosGuardados = null) {
    super(numero, "ahorros", datosGuardados);
  }

  // POLIMORFISMO: redefine el interés que aplica la clase padre.
  // Regla: 1,5 % mensual al retirar (TASA_INTERES_AHORROS).
  // PENDIENTE (profesor): ¿se suma o se descuenta? ¿sobre el saldo o
  // sobre el monto retirado? Hasta saberlo, devuelve 0.
  calcularInteresRetiro(monto) {
    return 0;
  }
}
