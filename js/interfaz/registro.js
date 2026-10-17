// =============================================================
// interfaz/registro.js — Conecta el formulario de registro con Banco.
// Responsable: Mateo (rama 4-registrar-clientes).
// Esta capa NO valida reglas de negocio: solo lee el formulario,
// llama a banco.registrarCliente() y muestra la respuesta.
// =============================================================

function inicializarRegistro() {
  const formulario = document.getElementById("registro-formulario");

  formulario.addEventListener("submit", (evento) => {
    evento.preventDefault(); // evita que la página se recargue

    const tiposCuenta = [];
    if (document.getElementById("registro-cuenta-ahorros").checked) {
      tiposCuenta.push("ahorros");
    }
    if (document.getElementById("registro-cuenta-corriente").checked) {
      tiposCuenta.push("corriente");
    }

    const datos = {
      tipoDocumento: document.getElementById("registro-tipo-documento").value,
      identificacion: document.getElementById("registro-identificacion").value,
      nombreCompleto: document.getElementById("registro-nombre").value,
      celular: document.getElementById("registro-celular").value,
      correo: document.getElementById("registro-correo").value,
      usuario: document.getElementById("registro-usuario").value,
      contrasena: document.getElementById("registro-contrasena").value,
      confirmacion: document.getElementById("registro-confirmacion").value,
      tiposCuenta: tiposCuenta,
      solicitaTarjeta: document.getElementById("registro-tarjeta").checked,
      saldoInicial: document.getElementById("registro-saldo-inicial").value, // lo valida Banco
    };

    // Si el administrador está agregando un cliente, se usa agregarCliente()
    // y al terminar vuelve a su panel. Las validaciones son las mismas.
    if (banco.administradorActivo) {
      const respuesta = banco.agregarCliente(datos);
      if (respuesta.tipo === "exito") {
        formulario.reset();
        entrarAlPanelAdministrador();
      }
      mostrarMensaje(respuesta);
      return;
    }

    const respuesta = banco.registrarCliente(datos);

    if (respuesta.tipo === "exito") {
      formulario.reset();
      mostrarSeccion("seccion-login");
    }
    mostrarMensaje(respuesta); // después de cambiar de sección, para que no se borre
  });
}
