// =============================================================
// interfaz/consultas.js — Consultar saldo y ver movimientos.
// Responsable: Sebastián (ramas 11-consultar-producto-y-saldo y
// 32-consultar-movimientos).
//
// Datos disponibles:
//   obtenerCuentaSeleccionada()  -> la Cuenta elegida en el panel
//   cuenta.saldo                 -> número (usar formatearMoneda para mostrarlo)
//   cuenta.obtenerMovimientos()  -> [{ fecha, tipo, valor, saldoResultante }]
// =============================================================

function inicializarConsultas() {
  const selectorCuenta = document.getElementById("panel-cuenta");
  const saldoValor = document.getElementById("saldo-valor");
  const movimientosLista = document.getElementById("movimientos-lista");

  // Si la página no tiene estos elementos aún, no interrumpimos la carga.
  if (!selectorCuenta || !saldoValor || !movimientosLista) {
    return;
  }

  function dibujarMovimientos(cuenta) {
    movimientosLista.innerHTML = "";

    if (!cuenta) {
      const vacio = document.createElement("li");
      vacio.textContent = "Selecciona una cuenta para ver sus movimientos.";
      movimientosLista.appendChild(vacio);
      return;
    }

    const movimientos = cuenta.obtenerMovimientos();

    if (movimientos.length === 0) {
      const vacio = document.createElement("li");
      vacio.textContent = "Esta cuenta aún no tiene movimientos.";
      movimientosLista.appendChild(vacio);
      return;
    }

    movimientos.forEach((movimiento) => {
      const item = document.createElement("li");
      const fecha = new Date(movimiento.fechaHora).toLocaleString("es-CO");
      const tipoTexto = movimiento.tipo === "consignacion" ? "Consignación" : "Retiro";
      const valorTexto = formatearMoneda(movimiento.valor);
      const saldoTexto = formatearMoneda(movimiento.saldoResultante);

      item.textContent = `${fecha} - ${tipoTexto}: ${valorTexto} - saldo: ${saldoTexto}`;
      movimientosLista.appendChild(item);
    });
  }

  function actualizarSaldoEnPantalla() {
    const cuenta = obtenerCuentaSeleccionada();

    if (!cuenta) {
      saldoValor.textContent = formatearMoneda(0);
      dibujarMovimientos(null);
      return;
    }

    const respuesta = cuenta.consultarSaldo();
    if (respuesta.tipo === "exito") {
      saldoValor.textContent = formatearMoneda(respuesta.datos.saldo);
    } else {
      saldoValor.textContent = formatearMoneda(0);
    }

    dibujarMovimientos(cuenta);
  }

  // Al cambiar de cuenta, se actualiza el saldo y los movimientos.
  selectorCuenta.addEventListener("change", actualizarSaldoEnPantalla);

  // Cuando se abre la vista de saldo, se recarga el contenido.
  document.querySelectorAll("[data-ver]").forEach((boton) => {
    boton.addEventListener("click", () => {
      if (boton.dataset.ver === "vista-saldo") {
        actualizarSaldoEnPantalla();
      }
    });
  });

  // Carga inicial si el usuario ya tiene una cuenta activa.
  actualizarSaldoEnPantalla();
}

// Se expone a operaciones.js para que el resultado del retiro/consignación
// actualice la pantalla sin duplicar lógica.
window.actualizarSaldoEnPantalla = function () {
  const saldoValor = document.getElementById("saldo-valor");
  const movimientosLista = document.getElementById("movimientos-lista");

  if (!saldoValor || !movimientosLista) {
    return;
  }

  const cuenta = obtenerCuentaSeleccionada();

  if (!cuenta) {
    saldoValor.textContent = formatearMoneda(0);
    movimientosLista.innerHTML = "";
    return;
  }

  const respuesta = cuenta.consultarSaldo();
  if (respuesta.tipo === "exito") {
    saldoValor.textContent = formatearMoneda(respuesta.datos.saldo);
  } else {
    saldoValor.textContent = formatearMoneda(0);
  }

  movimientosLista.innerHTML = "";
  const movimientos = cuenta.obtenerMovimientos();

  if (movimientos.length === 0) {
    const vacio = document.createElement("li");
    vacio.textContent = "Esta cuenta aún no tiene movimientos.";
    movimientosLista.appendChild(vacio);
    return;
  }

  movimientos.forEach((movimiento) => {
    const item = document.createElement("li");
    const fecha = new Date(movimiento.fechaHora).toLocaleString("es-CO");
    const tipoTexto = movimiento.tipo === "consignacion" ? "Consignación" : "Retiro";
    item.textContent = `${fecha} - ${tipoTexto}: ${formatearMoneda(movimiento.valor)} - saldo: ${formatearMoneda(movimiento.saldoResultante)}`;
    movimientosLista.appendChild(item);
  });
};
