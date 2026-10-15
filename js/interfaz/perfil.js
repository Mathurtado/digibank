// =============================================================
// interfaz/perfil.js — Muestra los datos del cliente y conecta el
// formulario para cambiar la contraseña.
// Esta capa NO valida reglas: solo lee los campos, llama a Banco
// y muestra la respuesta.
// =============================================================

function inicializarPerfil() {
  // ----- Cambiar contraseña -----
  const formularioContrasena = document.getElementById("perfil-contrasena-formulario");

  formularioContrasena.addEventListener("submit", (evento) => {
    evento.preventDefault(); // evita que la página se recargue

    const respuesta = banco.cambiarContrasena(
      document.getElementById("perfil-contrasena-actual").value,
      document.getElementById("perfil-contrasena-nueva").value,
      document.getElementById("perfil-contrasena-confirmacion").value
    );

    // Las contraseñas nunca se dejan escritas en pantalla, haya o no error
    formularioContrasena.reset();
    mostrarMensaje(respuesta);
  });
}

// Llena la parte de "Mi perfil" con los datos del cliente que inició sesión.
// Se llama cada vez que se abre la pestaña Perfil.
function actualizarPerfil() {
  const cliente = banco.clienteActivo;
  if (cliente === null) {
    return;
  }

  const tipoDocumento = cliente.tipoDocumento === "cedula" ? "Cédula" : "Pasaporte";

  document.getElementById("perfil-usuario").textContent = cliente.usuario;
  document.getElementById("perfil-documento").textContent = tipoDocumento + " " + cliente.identificacion;
  document.getElementById("perfil-correo").textContent = cliente.correo;
  document.getElementById("perfil-celular").textContent = cliente.celular;
}
