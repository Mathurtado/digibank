// =============================================================
// CuentaAhorros.js — HERENCIA: es una Cuenta que genera interés al retirar.
// Responsable: Juan (rama 13-retirar-dinero).
//
// Regla (enunciado): "tasa mensual del 1.5%, calculada y aplicada en el
// momento del retiro". Decisión del equipo: en el PRIMER retiro de cada
// mes, antes de descontar, se abona el 1,5 % del saldo que hay en ese
// momento. Los demás retiros del mismo mes no generan interés.
// =============================================================

class CuentaAhorros extends Cuenta {
  constructor(numero, datosGuardados = null) {
    super(numero, "ahorros", datosGuardados);
  }

  // POLIMORFISMO: redefine el interés de la clase padre (que es 0).
  // Cuenta.retirar() lo llama, lo abona antes de descontar y lo registra
  // como un movimiento "interes".
  calcularInteresRetiro(monto) {
    if (this.saldo <= 0 || this.#recibioInteresEsteMes()) {
      return 0;
    }
    return Math.round(this.saldo * TASA_INTERES_AHORROS);
  }

  // Privado: true si ya hay un movimiento de interés en el mes actual.
  // Se revisa el historial, así no hace falta guardar ningún dato extra:
  // los movimientos ya se guardan en localStorage.
  #recibioInteresEsteMes() {
    const hoy = new Date();
    return this.obtenerMovimientos().some((movimiento) =>
      movimiento.tipo === "interes" &&
      movimiento.fecha.getFullYear() === hoy.getFullYear() &&
      movimiento.fecha.getMonth() === hoy.getMonth()
    );
  }
}
