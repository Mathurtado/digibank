// =============================================================
// Cuenta.js — Clase padre de todos los productos bancarios.
// Responsable: Juan.
//
// ENCAPSULAMIENTO: #saldo y #movimientos son privados. Solo esta
// clase puede modificarlos. Las clases hijas NO pueden leer #saldo
// (en JavaScript los campos privados no se heredan); usan el getter
// "saldo" para leerlo y redefinen limiteRetiro() y
// calcularInteresRetiro() para cambiar el comportamiento (POLIMORFISMO).
// =============================================================

class Cuenta {
  #saldo;
  #movimientos;

  constructor(numero, tipo) {
    this.numero = numero; // texto, lo asigna Banco
    this.tipo = tipo;     // "ahorros" o "corriente"
    this.#saldo = 0;
    this.#movimientos = [];
  }

  // Solo lectura: no existe un setter, así nadie cambia el saldo desde afuera.
  get saldo() {
    return this.#saldo;
  }

  /**
   * Suma dinero a la cuenta.
   * Debe: validar monto > 0, sumar, registrar movimiento "consignacion".
   * Devuelve: crearRespuesta(...)
   */
  consignar(monto) {
    // TODO (Juan, rama 12-consignar-dinero)
    return crearRespuesta("advertencia", "Consignar: en construcción");
  }

  /**
   * Resta dinero de la cuenta.
   * Debe: validar monto > 0, validar monto <= limiteRetiro(),
   * aplicar calcularInteresRetiro(monto), restar, registrar movimiento "retiro".
   * Devuelve: crearRespuesta(...)
   */
  retirar(monto) {
    // TODO (Juan, rama 13-retirar-dinero)
    return crearRespuesta("advertencia", "Retirar: en construcción");
  }

  // Método polimórfico: cuánto se puede retirar como máximo.
  // En la clase padre, el saldo disponible.
  limiteRetiro() {
    return this.#saldo;
  }

  // Método polimórfico: interés que se aplica al retirar.
  // En la clase padre, ninguno.
  calcularInteresRetiro(monto) {
    return 0;
  }

  // Devuelve una COPIA de los movimientos, del más reciente al más antiguo.
  // Es una copia para que nadie pueda modificar el historial desde afuera.
  obtenerMovimientos() {
    // TODO (Sebastián/Juan): ordenar del más reciente al más antiguo
    return [...this.#movimientos];
  }

  // Privado (#): solo consignar() y retirar() pueden llamarlo, después de
  // validar. Así nadie puede agregar un movimiento falso desde afuera.
  // Movimiento: { fecha, tipo, valor, saldoResultante }
  #registrarMovimiento(tipo, valor) {
    // TODO (Juan)
  }
}
