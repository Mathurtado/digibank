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

function actualizarSaldo() {
  const cuenta = obtenerCuentaSeleccionada();
  const saldoFecha = document.getElementById("saldo-fecha");
  const saldoValor = document.getElementById("saldo-valor");
  const fechaActual = new Date();
  saldoFecha.textContent = "Fecha: " + new Intl.DateTimeFormat("es-CO", {
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(fechaActual);
  saldoValor.textContent = cuenta
    ? formatearMoneda(cuenta.saldo)
    : "No hay una cuenta seleccionada.";
}

function inicializarConsultas() {
  // Al abrir la vista de movimientos, llenar #movimientos-lista
  // TODO (Sebastián, rama 32)
  // (Implementado abajo: mostrarMovimientos)

  const selectorCuenta = document.getElementById("panel-cuenta");

  // Los nombres viven dentro de la función: el contrato solo permite
  // globales para clases, utilidades.js y "banco".
  const NOMBRES_TIPO = {
    "consignacion": "Consignación",
    "retiro": "Retiro",
    "transferencia enviada": "Transferencia enviada",
    "transferencia recibida": "Transferencia recibida"
  };
  const lista = document.getElementById("movimientos-lista");
  const botonMovimientos = document.querySelector('[data-ver="vista-movimientos"]');

  function mostrarMovimientos() {
    lista.innerHTML = "";

    const cuenta = obtenerCuentaSeleccionada();
    if (!cuenta) {
      return;
    }

    const movimientos = cuenta.obtenerMovimientos();

    if (movimientos.length === 0) {
      const vacio = document.createElement("li");
      vacio.textContent = "No hay movimientos registrados.";
      lista.appendChild(vacio);
      return;
    }

    movimientos.forEach((m) => {
      const item = document.createElement("li");
      item.textContent =
        m.fecha.toLocaleString("es-CO") + " | " +
        NOMBRES_TIPO[m.tipo] + " | " +
        formatearMoneda(m.valor) + " | Saldo: " +
        formatearMoneda(m.saldoResultante);
      lista.appendChild(item);
    });
  }

  // Se refresca cada vez que se abre la vista y cada vez que cambia la cuenta
  botonMovimientos.addEventListener("click", mostrarMovimientos);
  selectorCuenta.addEventListener("change", mostrarMovimientos);
  selectorCuenta.addEventListener("change", actualizarSaldo);
}
