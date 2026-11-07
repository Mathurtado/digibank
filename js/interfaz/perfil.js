// =============================================================
// interfaz/perfil.js — Muestra los datos del cliente, permite editarlos
// y conecta el formulario para cambiar la contraseña
// (usuario -> clave actual -> clave nueva -> confirmación).
// Esta capa NO valida reglas: solo lee los campos, llama a Banco
// y muestra la respuesta.
// =============================================================

// ----- Funciones compartidas con interfaz/administracion.js -----
// Los formularios de datos personales del perfil y del administrador
// tienen los mismos campos; solo cambia el prefijo de los id.

// Lee los datos personales de un formulario. prefijo: "perfil-editar" o "admin-editar"
function leerDatosPersonales(prefijo) {
  return {
    tipoDocumento: document.getElementById(prefijo + "-tipo-documento").value,
    identificacion: document.getElementById(prefijo + "-identificacion").value,
    nombreCompleto: document.getElementById(prefijo + "-nombre").value,
    celular: document.getElementById(prefijo + "-celular").value,
    correo: document.getElementById(prefijo + "-correo").value,
    usuario: document.getElementById(prefijo + "-usuario").value,
  };
}

// Llena un formulario de datos personales con los datos actuales.
function llenarDatosPersonales(prefijo, datos) {
  document.getElementById(prefijo + "-tipo-documento").value = datos.tipoDocumento;
  document.getElementById(prefijo + "-identificacion").value = datos.identificacion;
  document.getElementById(prefijo + "-nombre").value = datos.nombreCompleto;
  document.getElementById(prefijo + "-celular").value = datos.celular;
  document.getElementById(prefijo + "-correo").value = datos.correo;
  document.getElementById(prefijo + "-usuario").value = datos.usuario;
}

function inicializarPerfil() {
  // ----- Editar mis datos -----
  document.getElementById("perfil-datos-formulario").addEventListener("submit", (evento) => {
    evento.preventDefault();
    const respuesta = banco.actualizarPerfil(leerDatosPersonales("perfil-editar"));
    mostrarMensaje(respuesta);
    if (respuesta.tipo === "exito") {
      actualizarPanel();   // el saludo usa el nombre
      actualizarPerfil();
    }
  });

  // ----- Cambiar contraseña -----
  const formularioContrasena = document.getElementById("perfil-contrasena-formulario");

  formularioContrasena.addEventListener("submit", (evento) => {
    evento.preventDefault(); // evita que la página se recargue

    const respuesta = banco.cambiarContrasena(
      document.getElementById("perfil-contrasena-usuario").value,
      document.getElementById("perfil-contrasena-actual").value,
      document.getElementById("perfil-contrasena-nueva").value,
      document.getElementById("perfil-contrasena-confirmacion").value
    );

    // Las contraseñas nunca se dejan escritas en pantalla, haya o no error
    formularioContrasena.reset();

    // Si el tercer fallo bloqueó la cuenta, Banco ya cerró la sesión:
    // se vuelve al inicio de sesión.
    if (respuesta.datos !== null && respuesta.datos.sesionCerrada) {
      mostrarSeccion("seccion-login");
    }
    mostrarMensaje(respuesta); // después de cambiar de sección, para que no se borre
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

  llenarDatosPersonales("perfil-editar", cliente);
}
