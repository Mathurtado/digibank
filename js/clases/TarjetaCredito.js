// =============================================================
// TarjetaCredito.js — HERENCIA: es una Cuenta con cupo y compras en cuotas.
// Ramas: 38-realizar-compras-con-tarjeta-de-credito,
//        39-seleccionar-numero-de-cuotas, 40-aplicar-tasa-segun-cuotas,
//        41-calcular-pago-mensual.
//
// Cómo usa la clase padre:
//   El saldo de la tarjeta es 0 o NEGATIVO: -500.000 significa que se
//   deben $500.000. Una compra es un retiro y un pago es una consignación,
//   así el saldo y los movimientos siguen viviendo solo dentro de Cuenta.
//
// Las tasas por cuotas están en utilidades.js (TASAS_TARJETA), según la
// tabla del profesor: hasta 2 cuotas 0 %, de 3 a 6 cuotas 1,9 % y desde
// 7 cuotas 2,3 % mensual.
// =============================================================

class TarjetaCredito extends Cuenta {
  #compras; // [{ fecha, descripcion, monto, cuotas, tasaMensual, cuotaMensual, totalAPagar }]

  constructor(numero, cupo = CUPO_TARJETA_INICIAL) {
    super(numero, TIPO_TARJETA);
    this.cupo = cupo; // número entero
    this.#compras = [];
  }

  // Lo que se debe hoy (número positivo o 0)
  get deuda() {
    return Math.max(-this.saldo, 0);
  }

  // ---------- Polimorfismo: redefine el comportamiento de Cuenta ----------

  // Lo máximo que se puede gastar: el cupo menos lo que ya se debe.
  limiteRetiro() {
    return Math.max(this.cupo + this.saldo, 0);
  }

  // La tarjeta no cobra interés al momento de la compra: se cobra en las cuotas.
  calcularInteresRetiro(monto) {
    return 0;
  }

  // Con la tarjeta no se retira efectivo: se compra.
  retirar(monto) {
    return crearRespuesta("error", "Con la tarjeta de crédito no se puede retirar. Usa Comprar en cuotas.");
  }

  // Polimorfismo: en el historial de la tarjeta, un retiro es una compra
  // y una consignación es un pago.
  tipoMovimientoRetiro() {
    return "compra";
  }

  tipoMovimientoConsignacion() {
    return "pago";
  }

  // Consignar a la tarjeta es PAGAR. No se puede pagar más de lo que se debe.
  consignar(monto) {
    if (this.deuda === 0) {
      return crearRespuesta("advertencia", "Tu tarjeta no tiene deuda. No hay nada que pagar.");
    }
    if (Number.isInteger(monto) && monto > this.deuda) {
      return crearRespuesta("error", "El pago no puede superar la deuda de " + formatearMoneda(this.deuda) + ".");
    }

    const respuesta = super.consignar(monto); // valida el monto y registra el movimiento
    if (respuesta.tipo !== "exito") {
      return respuesta;
    }
    return crearRespuesta(
      "exito",
      "Pago exitoso por " + formatearMoneda(monto) + ". Deuda actual: " + formatearMoneda(this.deuda) + ".",
      { saldo: this.saldo, deuda: this.deuda }
    );
  }

  // ---------- Compras en cuotas ----------

  /**
   * Calcula una compra sin hacerla, para mostrarle al cliente la cuota.
   * Devuelve: crearRespuesta(tipo, mensaje, { monto, cuotas, tasaMensual, cuotaMensual, totalAPagar })
   */
  simularCompra(monto, cuotas) {
    const error = this.#validarCompra(monto, cuotas);
    if (error !== null) {
      return error;
    }

    const tasaMensual = this.tasaPorCuotas(cuotas);
    const cuotaMensual = this.calcularCuotaMensual(monto, cuotas, tasaMensual);
    const totalAPagar = cuotaMensual * cuotas;

    return crearRespuesta(
      "exito",
      this.#textoCuotas(cuotas) + " de " + formatearMoneda(cuotaMensual) + " con tasa de " +
        (tasaMensual * 100).toFixed(1).replace(".", ",") + " % mensual. Total: " + formatearMoneda(totalAPagar) + ".",
      { monto, cuotas, tasaMensual, cuotaMensual, totalAPagar }
    );
  }

  /**
   * Hace una compra: aumenta la deuda y guarda la compra con sus cuotas.
   * Devuelve: crearRespuesta(tipo, mensaje, { compra, deuda, cupoDisponible })
   */
  comprar(monto, cuotas, descripcion = "") {
    const simulacion = this.simularCompra(monto, cuotas);
    if (simulacion.tipo !== "exito") {
      return simulacion;
    }

    // super.retirar: el retirar() de Cuenta, porque el de esta clase lo bloquea.
    // Revisa el cupo con limiteRetiro() y registra el movimiento.
    const retiro = super.retirar(monto);
    if (retiro.tipo === "error") {
      return crearRespuesta(
        "error",
        "Cupo insuficiente. Tu cupo disponible es " + formatearMoneda(this.limiteRetiro()) + "."
      );
    }

    const compra = {
      fecha: new Date(),
      descripcion: String(descripcion).trim() || "Compra",
      ...simulacion.datos,
    };
    this.#compras.push(compra);

    return crearRespuesta(
      "exito",
      "Compra aprobada por " + formatearMoneda(monto) + " a " + this.#textoCuotas(cuotas) + " de " +
        formatearMoneda(compra.cuotaMensual) + ". Cupo disponible: " + formatearMoneda(this.limiteRetiro()) + ".",
      { compra: { ...compra }, deuda: this.deuda, cupoDisponible: this.limiteRetiro() }
    );
  }

  // Tasa mensual según el número de cuotas (tabla TASAS_TARJETA).
  tasaPorCuotas(cuotas) {
    const fila = TASAS_TARJETA.find((f) => cuotas <= f.hastaCuotas);
    return fila ? fila.tasaMensual : TASAS_TARJETA[TASAS_TARJETA.length - 1].tasaMensual;
  }

  /**
   * Cuota fija mensual (sistema francés):
   *   cuota = monto * tasa / (1 - (1 + tasa) ^ -cuotas)
   * Sin interés, es monto / cuotas. Se redondea hacia arriba a pesos enteros.
   */
  calcularCuotaMensual(monto, cuotas, tasaMensual = this.tasaPorCuotas(cuotas)) {
    if (tasaMensual === 0) {
      return Math.ceil(monto / cuotas);
    }
    const cuota = (monto * tasaMensual) / (1 - Math.pow(1 + tasaMensual, -cuotas));
    return Math.ceil(cuota);
  }

  // Suma de las cuotas mensuales de todas las compras.
  // LIMITACIÓN: no descuenta cuotas ya pagadas, porque todavía no hay
  // manejo de meses. Sirve como pago mensual estimado.
  pagoMensualEstimado() {
    return this.#compras.reduce((total, compra) => total + compra.cuotaMensual, 0);
  }

  // Copia de las compras, de la más reciente a la más antigua.
  obtenerCompras() {
    return this.#compras
      .map((compra) => ({ ...compra, fecha: new Date(compra.fecha) }))
      .reverse()
      .sort((a, b) => b.fecha - a.fecha);
  }

  // ---------- Almacenamiento ----------

  // POLIMORFISMO: agrega a los datos de Cuenta el cupo y las compras.
  aDatos() {
    return {
      ...super.aDatos(),
      cupo: this.cupo,
      compras: this.#compras.map((compra) => ({ ...compra, fecha: compra.fecha.toISOString() })),
    };
  }

  // Devuelve a una tarjeta recién creada las compras guardadas.
  // Solo la usa Banco al cargar los datos.
  static restaurarCompras(tarjeta, compras) {
    tarjeta.#compras = compras.map((compra) => ({ ...compra, fecha: new Date(compra.fecha) }));
  }

  // Privado: "1 cuota" o "12 cuotas"
  #textoCuotas(cuotas) {
    return cuotas === 1 ? "1 cuota" : cuotas + " cuotas";
  }

  // Privado: revisa monto y cuotas. Devuelve una respuesta de error, o null.
  #validarCompra(monto, cuotas) {
    if (typeof monto !== "number" || !Number.isInteger(monto) || monto <= 0) {
      return crearRespuesta("error", "Ingresa un monto válido, entero y mayor que $0.");
    }
    if (!Number.isInteger(cuotas) || cuotas < MIN_CUOTAS_TARJETA || cuotas > MAX_CUOTAS_TARJETA) {
      return crearRespuesta(
        "error",
        "Elige entre " + MIN_CUOTAS_TARJETA + " y " + MAX_CUOTAS_TARJETA + " cuotas."
      );
    }
    return null;
  }
}
