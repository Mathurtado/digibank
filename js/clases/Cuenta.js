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
    // Validación del monto: solo enteros positivos.
    if (!Number.isInteger(monto) || monto <= 0) {
      return crearRespuesta("error", "Ingresa un monto entero mayor que cero.");
    }

    // Evita overflow o valores no seguros por cálculo matemático.
    const saldoNuevo = this.#saldo + monto;
    if (!Number.isSafeInteger(saldoNuevo)) {
      return crearRespuesta("error", "El monto supera el límite permitido.");
    }

    this.#saldo = saldoNuevo;
    this.#registrarMovimiento("consignacion", monto);
    return crearRespuesta("exito", "Consignación realizada correctamente.");
  }

  /**
   * Resta dinero de la cuenta.
   * Debe: validar monto > 0, validar monto <= limiteRetiro(),
   * aplicar calcularInteresRetiro(monto), restar, registrar movimiento "retiro".
   * Devuelve: crearRespuesta(...)
   */
  retirar(monto) {
    // Validación básica del monto de retiro.
    if (!Number.isInteger(monto) || monto <= 0) {
      return crearRespuesta("error", "Ingresa un monto entero mayor que cero.");
    }

    // El interés puede ser 0 en la cuenta base, pero las hijas lo redefinen.
    const interes = this.calcularInteresRetiro(monto);
    const montoTotal = monto + interes;

    // Restricción general del método polimórfico.
    // La cuenta corriente usa un límite mayor por sobregiro.
    if (montoTotal > this.limiteRetiro()) {
      const mensaje = this.tipo === "corriente"
        ? "El retiro supera el saldo y el sobregiro permitido."
        : "No tienes saldo suficiente en tu cuenta de ahorros.";
      return crearRespuesta("error", mensaje);
    }

    this.#saldo -= montoTotal;
    this.#registrarMovimiento("retiro", monto, interes);
    return crearRespuesta("exito", "Retiro realizado correctamente.");
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
    return [...this.#movimientos].sort((a, b) => {
      return new Date(b.fechaHora) - new Date(a.fechaHora);
    });
  }

  // Método auxiliar para consultar el saldo sin romper el encapsulamiento.
  consultarSaldo() {
    if (!Number.isSafeInteger(this.#saldo)) {
      return crearRespuesta("error", "El saldo de la cuenta no es válido.");
    }

    return crearRespuesta("exito", "Saldo consultado correctamente.", {
      tipoCuenta: this.tipo,
      numeroCuenta: this.numero,
      saldo: this.#saldo,
      fechaHora: new Date().toISOString()
    });
  }

  // Método auxiliar para obtener los movimientos en orden cronológico inverso.
  consultarMovimientos() {
    return this.obtenerMovimientos();
  }

  // Privado (#): solo consignar() y retirar() pueden llamarlo, después de
  // validar. Así nadie puede agregar un movimiento falso desde afuera.
  // Movimiento: { fechaHora, tipo, valor, saldoResultante, interes }
  #registrarMovimiento(tipo, valor, interes = 0) {
    this.#movimientos.push({
      fechaHora: new Date().toISOString(),
      tipo: tipo,
      valor: valor,
      interes: interes,
      saldoResultante: this.#saldo
    });
  }
}
