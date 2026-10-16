// =============================================================
// CuentaAhorros.js — HERENCIA: es una Cuenta que acredita rendimiento mensual.
// Responsable: Juan (rama 13-retirar-dinero).
// =============================================================

class CuentaAhorros extends Cuenta {
  #ultimaFechaProcesada;
  #saldoCierreProcesado;

  constructor(numero) {
    super(numero, "ahorros");
    const ayer = new Date();
    ayer.setDate(ayer.getDate() - 1);
    this.#ultimaFechaProcesada = this.#fechaClave(ayer);
    this.#saldoCierreProcesado = 0;
  }

  // El retiro no cobra este rendimiento: se calcula sobre el saldo diario
  // y se abona al entrar por primera vez después de cerrar uno o más meses.
  calcularInteresRetiro(monto) {
    return 0;
  }

  procesarRendimientoMensual(fechaActual = new Date()) {
    if (!(fechaActual instanceof Date) || Number.isNaN(fechaActual.getTime())) {
      return crearRespuesta("error", "No se pudo determinar la fecha para calcular el rendimiento.");
    }

    const fechaCorte = new Date(fechaActual.getFullYear(), fechaActual.getMonth(), 0);
    const claveCorte = this.#fechaClave(fechaCorte);
    if (claveCorte <= this.#ultimaFechaProcesada) {
      return crearRespuesta("exito", "", { procesado: false, rendimiento: 0 });
    }

    const movimientos = this.obtenerMovimientos()
      .filter((movimiento) => {
        const clave = this.#fechaClave(movimiento.fecha);
        return clave > this.#ultimaFechaProcesada && clave <= claveCorte;
      })
      .sort((a, b) => a.fecha - b.fecha);

    let saldo = this.#saldoCierreProcesado;
    let rendimientoTotal = 0;
    let saldoDiarioDelMes = 0;
    let indiceMovimiento = 0;
    const fecha = this.#fechaDesdeClave(this.#ultimaFechaProcesada);
    fecha.setDate(fecha.getDate() + 1);

    while (this.#fechaClave(fecha) <= claveCorte) {
      const claveDia = this.#fechaClave(fecha);
      while (
        indiceMovimiento < movimientos.length &&
        this.#fechaClave(movimientos[indiceMovimiento].fecha) === claveDia
      ) {
        const variacion = this.#variacionMovimiento(movimientos[indiceMovimiento]);
        if (variacion === null) {
          return crearRespuesta(
            "error",
            "No se pudo calcular el rendimiento por un tipo de movimiento no reconocido."
          );
        }
        saldo += variacion;
        indiceMovimiento++;
      }

      saldoDiarioDelMes += Math.max(saldo, 0);
      const siguienteDia = new Date(fecha.getFullYear(), fecha.getMonth(), fecha.getDate() + 1);
      if (siguienteDia.getMonth() !== fecha.getMonth() || claveDia === claveCorte) {
        const diasDelMes = new Date(fecha.getFullYear(), fecha.getMonth() + 1, 0).getDate();
        const rendimientoMes = Math.round(saldoDiarioDelMes * TASA_INTERES_AHORROS / diasDelMes);
        rendimientoTotal += rendimientoMes;
        saldo += rendimientoMes;
        saldoDiarioDelMes = 0;
      }
      fecha.setDate(fecha.getDate() + 1);
    }

    if (rendimientoTotal > 0) {
      const respuestaAbono = this.acreditarRendimiento(rendimientoTotal);
      if (respuestaAbono.tipo !== "exito") {
        return respuestaAbono;
      }
    }
    this.#ultimaFechaProcesada = claveCorte;
    this.#saldoCierreProcesado = saldo;

    return crearRespuesta(
      "exito",
      rendimientoTotal > 0
        ? "Rendimiento mensual de ahorros abonado: " + formatearMoneda(rendimientoTotal) + "."
        : "",
      { procesado: true, rendimiento: rendimientoTotal }
    );
  }

  aDatos() {
    return {
      ...super.aDatos(),
      ultimaFechaRendimiento: this.#ultimaFechaProcesada,
      saldoCierreRendimiento: this.#saldoCierreProcesado,
    };
  }

  static restaurarRendimiento(cuenta, datos, fechaActual = new Date()) {
    const fechaGuardada = typeof datos.ultimaFechaRendimiento === "string" &&
      /^\d{4}-\d{2}-\d{2}$/.test(datos.ultimaFechaRendimiento)
      ? cuenta.#fechaDesdeClave(datos.ultimaFechaRendimiento)
      : null;
    if (
      fechaGuardada !== null &&
      cuenta.#fechaClave(fechaGuardada) === datos.ultimaFechaRendimiento &&
      Number.isInteger(datos.saldoCierreRendimiento) &&
      datos.saldoCierreRendimiento >= 0
    ) {
      cuenta.#ultimaFechaProcesada = datos.ultimaFechaRendimiento;
      cuenta.#saldoCierreProcesado = datos.saldoCierreRendimiento;
      return;
    }

    const ayer = new Date(fechaActual.getFullYear(), fechaActual.getMonth(), fechaActual.getDate() - 1);
    const claveAyer = cuenta.#fechaClave(ayer);
    const cierrePrevio = cuenta.obtenerMovimientos()
      .filter((movimiento) => cuenta.#fechaClave(movimiento.fecha) <= claveAyer)
      .sort((a, b) => b.fecha - a.fecha)[0];

    cuenta.#ultimaFechaProcesada = claveAyer;
    cuenta.#saldoCierreProcesado = cierrePrevio
      ? cierrePrevio.saldoResultante
      : cuenta.saldo;
  }

  #variacionMovimiento(movimiento) {
    if (!Number.isInteger(movimiento.valor) || movimiento.valor < 0) {
      return null;
    }
    if (movimiento.tipo === "consignacion" || movimiento.tipo === "transferencia recibida") {
      return movimiento.valor;
    }
    if (movimiento.tipo === "retiro" || movimiento.tipo === "transferencia enviada") {
      return -movimiento.valor;
    }
    if (movimiento.tipo === "rendimiento") {
      return 0;
    }
    return null;
  }

  #fechaClave(fecha) {
    return fecha.getFullYear() + "-" +
      String(fecha.getMonth() + 1).padStart(2, "0") + "-" +
      String(fecha.getDate()).padStart(2, "0");
  }

  #fechaDesdeClave(clave) {
    const [anio, mes, dia] = clave.split("-").map(Number);
    return new Date(anio, mes - 1, dia);
  }
}
