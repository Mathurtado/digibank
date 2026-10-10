// =============================================================
// interfaz/operaciones.js — Formularios de consignar y retirar.
// Responsable: Juan (ramas 12-consignar-dinero y 13-retirar-dinero).
//
// Patrón a seguir (ver interfaz/registro.js como ejemplo):
//   1. evento.preventDefault()
//   2. const cuenta = obtenerCuentaSeleccionada();
//   3. const monto = convertirMonto(campo.value);
//   4. const respuesta = cuenta.consignar(monto);   // o cuenta.retirar(monto)
//   5. mostrarMensaje(respuesta);
//   6. si fue "exito", limpiar el campo
// Las validaciones del monto van en la clase Cuenta, no aquí.
// =============================================================

function inicializarOperaciones() {
  const formularioConsignar = document.getElementById("consignar-formulario");
  const formularioRetirar = document.getElementById("retirar-formulario");

  // Si el HTML del proyecto no trae estos formularios, no fallamos.
  if (!formularioConsignar || !formularioRetirar) {
    return;
  }

  formularioConsignar.addEventListener("submit", (evento) => {
    evento.preventDefault();

    const cuenta = obtenerCuentaSeleccionada();
    if (!cuenta) {
      mostrarMensaje(crearRespuesta("error", "Selecciona una cuenta antes de consignar."));
      return;
    }

    const campoMonto = document.getElementById("consignar-monto");
    const monto = convertirMonto(campoMonto ? campoMonto.value : "");

    if (Number.isNaN(monto)) {
      mostrarMensaje(crearRespuesta("error", "Ingresa un monto válido para consignar."));
      return;
    }

    const respuesta = cuenta.consignar(monto);
    mostrarMensaje(respuesta);

    if (respuesta.tipo === "exito" && campoMonto) {
      campoMonto.value = "";
      if (typeof actualizarSaldoEnPantalla === "function") {
        actualizarSaldoEnPantalla();
      }
    }
  });

  formularioRetirar.addEventListener("submit", (evento) => {
    evento.preventDefault();

    const cuenta = obtenerCuentaSeleccionada();
    if (!cuenta) {
      mostrarMensaje(crearRespuesta("error", "Selecciona una cuenta antes de retirar."));
      return;
    }

    const campoMonto = document.getElementById("retirar-monto");
    const monto = convertirMonto(campoMonto ? campoMonto.value : "");

    if (Number.isNaN(monto)) {
      mostrarMensaje(crearRespuesta("error", "Ingresa un monto válido para retirar."));
      return;
    }

    const respuesta = cuenta.retirar(monto);
    mostrarMensaje(respuesta);

    if (respuesta.tipo === "exito" && campoMonto) {
      campoMonto.value = "";
      if (typeof actualizarSaldoEnPantalla === "function") {
        actualizarSaldoEnPantalla();
      }
    }
  });
}
