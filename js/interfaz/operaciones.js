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

  document.getElementById("transferir-formulario").addEventListener("submit", (evento) => {
    evento.preventDefault();

    const cuenta = obtenerCuentaSeleccionada();
    if (cuenta === null) {
      mostrarMensaje(crearRespuesta("error", "Inicia sesión para hacer transferencias."));
      return;
    }

    const campoNumero = document.getElementById("transferir-numero");
    const campoMonto = document.getElementById("transferir-monto");
    const vistaDestinatario = document.getElementById("transferir-destinatario");
    const destino = banco.consultarDestinoTransferencia(campoNumero.value);
    if (destino.tipo !== "exito") {
      vistaDestinatario.textContent = destino.mensaje;
      mostrarMensaje(destino);
      return;
    }

    // Si es la misma cuenta, no tiene sentido pedir confirmación: se
    // intenta de una vez y la clase Cuenta responde con el error.
    if (destino.datos.numero === cuenta.numero) {
      mostrarMensaje(banco.transferir(cuenta, campoNumero.value, convertirMonto(campoMonto.value)));
      return;
    }

    const tipoCuenta = nombreProducto(destino.datos.tipoCuenta);
    const confirmacion = window.confirm(
      "Vas a transferir dinero a " + destino.datos.nombreDestinatario +
      " (" + tipoCuenta + " Nº " + destino.datos.numero + "). ¿Deseas continuar?"
    );
    if (!confirmacion) {
      return;
    }

    const respuesta = banco.transferir(cuenta, campoNumero.value, convertirMonto(campoMonto.value));

    mostrarMensaje(respuesta);
    if (respuesta.tipo === "exito") {
      campoNumero.value = "";
      campoMonto.value = "";
      vistaDestinatario.textContent = "";
    }
  });

  document.getElementById("transferir-numero").addEventListener("input", (evento) => {
    const campo = evento.currentTarget;
    const vistaDestinatario = document.getElementById("transferir-destinatario");
    vistaDestinatario.textContent = "";
    if (campo.value.trim() === "") {
      return;
    }

    const respuesta = banco.consultarDestinoTransferencia(campo.value);
    if (respuesta.tipo === "exito") {
      vistaDestinatario.textContent =
        "Destinatario: " + respuesta.datos.nombreDestinatario + " — " +
        nombreProducto(respuesta.datos.tipoCuenta) + " Nº " + respuesta.datos.numero;
    } else if (/^\d{6}$/.test(campo.value.trim())) {
      vistaDestinatario.textContent = respuesta.mensaje;
    }
  });
}
