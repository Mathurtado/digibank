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
    this.tipo = tipo;     // "ahorros", "corriente" o "credito"
    this.#saldo = 0;
    this.#movimientos = [];
  }

  // Solo lectura: no existe un setter, así nadie cambia el saldo desde afuera.
  get saldo() {
    return this.#saldo;
  }

  /**
   * Suma dinero a la cuenta.
   * Devuelve: crearRespuesta(tipo, mensaje, { saldo })
   */
  consignar(monto) {
    // Paso 1: validar el monto. Si no es válido, no se toca nada.
    const error = this.#validarMonto(monto);
    if (error !== null) {
      return error;
    }

    // Paso 2: sumar al saldo
    this.#saldo = this.#saldo + monto;

    // Paso 3: registrar el movimiento (solo después de que todo salió bien)
    this.#registrarMovimiento(this.tipoMovimientoConsignacion(), monto);

    return crearRespuesta(
      "exito",
      "Consignación exitosa por " + formatearMoneda(monto) + ". Nuevo saldo: " + formatearMoneda(this.#saldo) + ".",
      { saldo: this.#saldo }
    );
  }

  /**
   * Resta dinero de la cuenta.
   * Devuelve: crearRespuesta(tipo, mensaje, { saldo })
   *
   * POLIMORFISMO: este método es el mismo para todas las cuentas, pero
   * llama a limiteRetiro() y calcularInteresRetiro(), que cada clase hija
   * redefine. Así, ahorros y corriente se comportan distinto sin repetir código.
   */
  retirar(monto) {
    // Paso 1: validar el monto
    const error = this.#validarMonto(monto);
    if (error !== null) {
      return error;
    }

    // Paso 2: calcular el interés (depende del tipo de cuenta).
    // PENDIENTE (profesor): si el 1,5 % es un rendimiento y no un cobro,
    // aquí cambia el signo. Hoy calcularInteresRetiro() devuelve 0.
    const interes = this.calcularInteresRetiro(monto);
    const totalADescontar = monto + interes;

    // Paso 3: revisar el límite (depende del tipo de cuenta)
    const limite = this.limiteRetiro();
    if (totalADescontar > limite) {
      return crearRespuesta(
        "error",
        "Saldo insuficiente. Puedes retirar hasta " + formatearMoneda(Math.max(limite, 0)) + "."
      );
    }

    // Paso 4: descontar y registrar (solo si todo salió bien)
    this.#saldo = this.#saldo - totalADescontar;
    this.#registrarMovimiento(this.tipoMovimientoRetiro(), totalADescontar);

    return crearRespuesta(
      "exito",
      "Retiro exitoso por " + formatearMoneda(monto) + ". Nuevo saldo: " + formatearMoneda(this.#saldo) + ".",
      { saldo: this.#saldo }
    );
  }

  // Método polimórfico: cuánto se puede retirar como máximo.
  // En la clase padre, el saldo disponible.
  limiteRetiro() {
    return this.#saldo;
  }

  // Métodos polimórficos: con qué nombre queda cada operación en el
  // historial. TarjetaCredito los redefine: un retiro es una "compra" y
  // una consignación es un "pago".
  tipoMovimientoConsignacion() {
    return "consignacion";
  }

  tipoMovimientoRetiro() {
    return "retiro";
  }

  // Método polimórfico: interés que se aplica al retirar.
  // En la clase padre, ninguno.
  calcularInteresRetiro(monto) {
    return 0;
  }

  // Devuelve una COPIA de los movimientos, del más reciente al más antiguo.
  // Se copia cada movimiento (y su fecha), no solo el arreglo: así nadie
  // puede cambiar el historial desde afuera (encapsulamiento).
  // Se invierte antes de ordenar porque se guardan en orden de llegada:
  // si dos movimientos tienen la misma fecha, sale primero el último.
  obtenerMovimientos() {
    return this.#movimientos
      .map((movimiento) => ({ ...movimiento, fecha: new Date(movimiento.fecha) }))
      .reverse()
      .sort((a, b) => b.fecha - a.fecha);
  }

  // Privado (#): solo consignar() y retirar() pueden llamarlo, después de
  // validar. Así nadie puede agregar un movimiento falso desde afuera.
  // Movimiento: { fecha, tipo, valor, saldoResultante }
  #registrarMovimiento(tipo, valor) {
    this.#movimientos.push({
      fecha: new Date(),
      tipo: tipo,
      valor: valor,
      saldoResultante: this.#saldo, // el saldo ya actualizado
    });
  }

  // Privado: revisa que el monto sea un número entero mayor que 0.
  // Lo usan consignar() y retirar(). Devuelve una respuesta de error, o null.
  // Se valida aquí aunque la interfaz ya use convertirMonto(), porque la
  // clase no debe confiar en quien la llama (por ejemplo, desde la consola).
  #validarMonto(monto) {
    if (typeof monto !== "number" || Number.isNaN(monto)) {
      return crearRespuesta("error", "Ingresa un monto válido.");
    }
    if (!Number.isInteger(monto)) {
      return crearRespuesta("error", "El monto debe ser un número entero, sin decimales.");
    }
    if (monto <= 0) {
      return crearRespuesta("error", "El monto debe ser mayor que $0.");
    }
    return null;
  }
}
