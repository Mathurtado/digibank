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
      formulario.reset();
      textoIntentos.classList.add("oculto");
      entrarAlPanel();
      mostrarMensaje(respuesta);
      return;
    }

    mostrarMensaje(respuesta);

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
