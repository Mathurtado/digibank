// =============================================================
// interfaz/codigoRetiro.js — Generar y usar un código de retiro
// (retiro sin tarjeta) sobre la cuenta elegida en el panel.
//
// Usa los métodos de Cuenta:
//   cuenta.generarCodigoRetiro(monto)
//   cuenta.retirarConCodigo(codigo)
//   cuenta.obtenerCodigoRetiro()  -> { codigo, monto, venceEn } o null
//   cuenta.cancelarCodigoRetiro()
// Las reglas viven en la clase. Aquí solo se lee, se llama y se muestra.
// =============================================================

function inicializarCodigoRetiro() {
  const vista = document.getElementById("vista-codigo-retiro");
  const cajaVigente = document.getElementById("codigo-vigente");
  const campoMonto = document.getElementById("codigo-monto");
  const campoCodigo = document.getElementById("codigo-ingresado");

  // Muestra u oculta el código vigente de la cuenta seleccionada
  function mostrarCodigoVigente() {
    const cuenta = obtenerCuentaSeleccionada();
    const vigente = cuenta === null ? null : cuenta.obtenerCodigoRetiro();

    if (vigente === null) {
      cajaVigente.classList.add("oculto");
      return;
    }

    const hora = new Date(vigente.venceEn).toLocaleTimeString("es-CO", { hour: "2-digit", minute: "2-digit" });
    document.getElementById("codigo-numero").textContent = vigente.codigo;
    document.getElementById("codigo-detalle").textContent =
      "Monto: " + formatearMoneda(vigente.monto) + ". Vence a las " + hora + ".";
    cajaVigente.classList.remove("oculto");
  }

  // Generar
  document.getElementById("codigo-generar-formulario").addEventListener("submit", (evento) => {
    evento.preventDefault();

    const cuenta = obtenerCuentaSeleccionada();
    if (cuenta === null) {
      mostrarMensaje(crearRespuesta("error", "Inicia sesión para generar un código."));
      return;
    }

    const respuesta = cuenta.generarCodigoRetiro(convertirMonto(campoMonto.value));
    mostrarMensaje(respuesta);
    if (respuesta.tipo === "exito") {
      campoMonto.value = "";
    }
    mostrarCodigoVigente();
  });

  // Usar en el "cajero"
  document.getElementById("codigo-usar-formulario").addEventListener("submit", (evento) => {
    evento.preventDefault();

    const cuenta = obtenerCuentaSeleccionada();
    if (cuenta === null) {
      mostrarMensaje(crearRespuesta("error", "Inicia sesión para retirar."));
      return;
    }

    const respuesta = cuenta.retirarConCodigo(campoCodigo.value);
    mostrarMensaje(respuesta);
    campoCodigo.value = "";
    if (respuesta.tipo !== "error") {
      banco.guardar(); // el retiro cambió el saldo
    }
    mostrarCodigoVigente();
  });

  // Anular
  document.getElementById("codigo-cancelar").addEventListener("click", () => {
    const cuenta = obtenerCuentaSeleccionada();
    if (cuenta !== null) {
      mostrarMensaje(cuenta.cancelarCodigoRetiro());
    }
    mostrarCodigoVigente();
  });

  // El campo de código solo acepta dígitos
  campoCodigo.addEventListener("input", () => {
    campoCodigo.value = campoCodigo.value.replace(/\D/g, "").slice(0, DIGITOS_CODIGO_RETIRO);
  });

  // Actualizar al abrir la vista o al cambiar de cuenta
  new MutationObserver(() => {
    if (!vista.classList.contains("oculto")) {
      mostrarCodigoVigente();
    }
  }).observe(vista, { attributes: true, attributeFilter: ["class"] });

  document.getElementById("panel-cuenta").addEventListener("change", mostrarCodigoVigente);
}
