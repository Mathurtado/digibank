// =============================================================
// interfaz/iniciarSesion.js — Conecta el formulario de login con Banco.
// Responsable: Mateo (ramas 6-iniciar-sesion y 7-controlar-intentos).
// =============================================================

function inicializarLogin() {
  const formulario = document.getElementById("login-formulario");
  const textoIntentos = document.getElementById("login-intentos");

  formulario.addEventListener("submit", (evento) => {
    evento.preventDefault();

    const usuario = document.getElementById("login-usuario").value;
    const contrasena = document.getElementById("login-contrasena").value;

    const respuesta = banco.iniciarSesion(usuario, contrasena);

    if (respuesta.tipo === "exito") {
      const rendimiento = banco.acreditarRendimientosPendientes();
      formulario.reset();
      textoIntentos.classList.add("oculto");
      entrarAlPanel();
      if (rendimiento.tipo !== "exito") {
        mostrarMensaje(rendimiento);
      } else if (rendimiento.datos.rendimiento > 0) {
        mostrarMensaje(crearRespuesta(
          "exito",
          respuesta.mensaje + " Se abonó rendimiento mensual de ahorros por " +
            formatearMoneda(rendimiento.datos.rendimiento) + "."
        ));
      } else {
        mostrarMensaje(respuesta);
      }
      return;
    }

    mostrarMensaje(respuesta);

    // Tras un error se borra la contraseña, para que se escriba de nuevo
    document.getElementById("login-contrasena").value = "";

    // Contador visible: solo aparece si Banco informa los intentos restantes
    // (es decir, si el usuario existe). Limitación documentada en el contrato.
    if (respuesta.datos !== null && respuesta.datos.intentosRestantes !== undefined) {
      textoIntentos.textContent = "Intentos restantes: " + respuesta.datos.intentosRestantes;
      textoIntentos.classList.remove("oculto");
    } else {
      textoIntentos.classList.add("oculto");
    }
  });
}
