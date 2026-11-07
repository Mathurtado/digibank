// =============================================================
// Cuenta.js — Clase padre de todos los productos bancarios.
// Responsable: Juan.
//
// ENCAPSULAMIENTO: #numero, #tipo, #saldo y #movimientos son privados.
// Solo esta clase puede modificarlos; desde afuera se leen con getters.
// Las clases hijas tampoco pueden leer #saldo (en JavaScript los campos
// privados no se heredan): usan el getter "saldo" y redefinen
// limiteRetiro() y calcularInteresRetiro() para cambiar el
// comportamiento (POLIMORFISMO).
// =============================================================

class Cuenta {
  #numero;
  #tipo;
  #saldo;
  #movimientos;

  /**
   * numero: texto de 6 dígitos, lo asigna Banco.
   * tipo: "ahorros", "corriente" o "credito".
   * datosGuardados: solo al cargar desde localStorage ({ saldo, movimientos }).
   *   Así el saldo guardado se recupera sin que exista un método público
   *   que lo cambie en una cuenta que ya está en uso.
   */
  constructor(numero, tipo, datosGuardados = null) {
    this.#numero = numero;
    this.#tipo = tipo;
    this.#saldo = 0;
    this.#movimientos = [];
    if (datosGuardados !== null) {
      this.#saldo = Number.isInteger(datosGuardados.saldo) ? datosGuardados.saldo : 0;
      const movimientos = Array.isArray(datosGuardados.movimientos) ? datosGuardados.movimientos : [];
      this.#movimientos = movimientos.map((movimiento) => ({
        ...movimiento,
        fecha: new Date(movimiento.fecha), // se guardó como texto
      }));
    }
  }

  // ---------- Getters: solo lectura (no hay setters) ----------

  get numero() {
    return this.#numero;
  }

  get tipo() {
    return this.#tipo;
  }

  // No existe un setter: nadie cambia el saldo desde afuera.
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

    // Paso 2: interés que se abona en el momento del retiro (depende del
    // tipo de cuenta). En la clase padre es 0; CuentaAhorros lo redefine:
    // 1,5 % del saldo, una vez al mes.
    const interes = this.calcularInteresRetiro(monto);

    // Paso 3: revisar el límite (depende del tipo de cuenta).
    // El interés que se va a abonar también cuenta como dinero disponible.
    const limite = this.limiteRetiro() + interes;
    if (monto > limite) {
      return crearRespuesta(
        "error",
        "Saldo insuficiente. Puedes retirar hasta " + formatearMoneda(Math.max(limite, 0)) + "."
      );
    }

    // Paso 4: solo si todo salió bien: primero se abona el interés y
    // después se descuenta el retiro. Cada uno queda como un movimiento.
    if (interes > 0) {
      this.#saldo = this.#saldo + interes;
      this.#registrarMovimiento("interes", interes);
    }
    this.#saldo = this.#saldo - monto;
    this.#registrarMovimiento(this.tipoMovimientoRetiro(), monto);

    const textoInteres = interes > 0
      ? " Se abonó el interés mensual de " + textoPorcentaje(TASA_INTERES_AHORROS) + ": " + formatearMoneda(interes) + "."
      : "";
    return crearRespuesta(
      "exito",
      "Retiro exitoso por " + formatearMoneda(monto) + "." + textoInteres +
        " Nuevo saldo: " + formatearMoneda(this.#saldo) + ".",
      { saldo: this.#saldo, interes: interes }
    );
  }

  /**
   * Transfiere dinero a otra cuenta de depósito y registra ambos movimientos.
   * Devuelve: crearRespuesta(tipo, mensaje, { saldoOrigen, saldoDestino })
   */
  transferirA(destino, monto) {
    const error = this.#validarMonto(monto);
    if (error !== null) {
      return error;
    }
    if (!(destino instanceof Cuenta) || this.tipo === TIPO_TARJETA || destino.tipo === TIPO_TARJETA) {
      return crearRespuesta("error", "Las transferencias solo están disponibles entre cuentas de ahorros y corriente.");
    }
    if (destino === this) {
      return crearRespuesta("error", "Selecciona una cuenta distinta a la cuenta de origen.");
    }

    const limite = this.limiteRetiro();
    if (monto > limite) {
      return crearRespuesta(
        "error",
        "Saldo insuficiente. Puedes transferir hasta " + formatearMoneda(Math.max(limite, 0)) + "."
      );
    }

    this.#saldo -= monto;
    destino.#saldo += monto;

    const fecha = new Date();
    this.#registrarMovimiento("transferencia enviada", monto, { cuentaDestino: destino.numero }, fecha);
    destino.#registrarMovimiento("transferencia recibida", monto, { cuentaOrigen: this.numero }, fecha);

    return crearRespuesta(
      "exito",
      "Transferencia exitosa por " + formatearMoneda(monto) + " a la cuenta Nº " + destino.numero + ".",
      { saldoOrigen: this.#saldo, saldoDestino: destino.#saldo }
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

  // Método polimórfico: interés que se ABONA en el momento del retiro.
  // En la clase padre, ninguno. CuentaAhorros lo redefine.
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

  // ---------- Almacenamiento ----------

  // Convierte la cuenta en un objeto simple para guardarlo con JSON.
  // JSON.stringify no ve los campos privados (#), por eso se copian aquí.
  // Las fechas se guardan como texto y se convierten de nuevo al cargar.
  aDatos() {
    return {
      numero: this.#numero,
      tipo: this.#tipo,
      saldo: this.#saldo,
      movimientos: this.#movimientos.map((movimiento) => ({
        ...movimiento,
        fecha: movimiento.fecha.toISOString(),
      })),
    };
  }

  // Privado (#): solo consignar(), retirar() y transferirA() pueden
  // llamarlo, después de validar. Así nadie puede agregar un movimiento falso desde afuera.
  // Movimiento: { fecha, tipo, valor, saldoResultante }
  #registrarMovimiento(tipo, valor, datos = {}, fecha = new Date()) {
    this.#movimientos.push({
      ...datos,
      fecha: fecha,
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
