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
//   6. si fue "exito", limpiar el campo y llamar a banco.guardar()
// Las validaciones del monto van en la clase Cuenta, no aquí.
// =============================================================

function inicializarOperaciones() {
  document.getElementById("consignar-formulario").addEventListener("submit", (evento) => {
    evento.preventDefault();

    const cuenta = obtenerCuentaSeleccionada();
    if (cuenta === null) {
      mostrarMensaje(crearRespuesta("error", "Inicia sesión para hacer operaciones."));
      return;
    }

    const campo = document.getElementById("consignar-monto");
    const monto = convertirMonto(campo.value);
    const respuesta = cuenta.consignar(monto);

    mostrarMensaje(respuesta);
    if (respuesta.tipo === "exito") {
      campo.value = "";
      banco.guardar();
    }
  });

  document.getElementById("retirar-formulario").addEventListener("submit", (evento) => {
    evento.preventDefault();

    const cuenta = obtenerCuentaSeleccionada();
    if (cuenta === null) {
      mostrarMensaje(crearRespuesta("error", "Inicia sesión para hacer operaciones."));
      return;
    }

    const campo = document.getElementById("retirar-monto");
    const monto = convertirMonto(campo.value);
    const respuesta = cuenta.retirar(monto);

    mostrarMensaje(respuesta);
    if (respuesta.tipo === "exito") {
      campo.value = "";
      banco.guardar();
    }
  });
}
