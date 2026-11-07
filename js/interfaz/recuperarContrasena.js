// =============================================================
// interfaz/recuperarContrasena.js — Restablecimiento por correo y código.
// Simulación académica: el código se muestra en pantalla, sin backend.
// =============================================================

function inicializarRecuperacionContrasena() {
  const solicitud = document.getElementById("recuperacion-solicitud-formulario");
  const codigo = document.getElementById("recuperacion-codigo-formulario");
  const clave = document.getElementById("recuperacion-clave-formulario");
  const vistaCodigo = document.getElementById("recuperacion-codigo-demo");

  function mostrarPaso(paso) {
    solicitud.classList.toggle("oculto", paso !== "solicitud");
    codigo.classList.toggle("oculto", paso !== "codigo");
    clave.classList.toggle("oculto", paso !== "clave");
  }

  document.getElementById("login-recuperar").addEventListener("click", () => {
    banco.cancelarRecuperacion();
    solicitud.reset();
    codigo.reset();
    clave.reset();
    vistaCodigo.textContent = "";
    mostrarPaso("solicitud");
    mostrarSeccion("seccion-recuperacion");
  });

  document.getElementById("recuperacion-volver").addEventListener("click", () => {
    banco.cancelarRecuperacion();
    mostrarSeccion("seccion-login");
  });

  solicitud.addEventListener("submit", (evento) => {
    evento.preventDefault();
    const usuario = document.getElementById("recuperacion-usuario").value;
    const correo = document.getElementById("recuperacion-correo").value;
    const respuesta = banco.solicitarRecuperacion(usuario, correo);
    mostrarMensaje(respuesta);
    if (respuesta.tipo !== "exito") {
      return;
    }

    vistaCodigo.textContent =
      "Modo demostración: tu código es " + respuesta.datos.codigo +
      ". Vence en 10 minutos.";
    codigo.reset();
    mostrarPaso("codigo");
  });

  codigo.addEventListener("submit", (evento) => {
    evento.preventDefault();
    const respuesta = banco.verificarCodigoRecuperacion(
      document.getElementById("recuperacion-codigo").value
    );
    mostrarMensaje(respuesta);
    if (respuesta.tipo === "exito") {
      mostrarPaso("clave");
    }
  });

  clave.addEventListener("submit", (evento) => {
    evento.preventDefault();
    const respuesta = banco.restablecerContrasenaRecuperada(
      document.getElementById("recuperacion-contrasena").value,
      document.getElementById("recuperacion-confirmacion").value
    );
    mostrarMensaje(respuesta);
    if (respuesta.tipo === "exito") {
      clave.reset();
      mostrarPaso("solicitud");
      mostrarSeccion("seccion-login");
      mostrarMensaje(respuesta);
    }
  });
}
