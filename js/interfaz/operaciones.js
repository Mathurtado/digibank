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
  document.getElementById("consignar-formulario").addEventListener("submit", (evento) => {
    evento.preventDefault();
    // TODO (Juan, rama 12)
    mostrarMensaje(crearRespuesta("advertencia", "Consignar: en construcción"));
  });

  document.getElementById("retirar-formulario").addEventListener("submit", (evento) => {
    evento.preventDefault();
    // TODO (Juan, rama 13)
    mostrarMensaje(crearRespuesta("advertencia", "Retirar: en construcción"));
  });
}
