// =============================================================
// interfaz/administracion.js — Panel del administrador: CRUD de clientes.
// Listar, agregar (con el formulario de registro), editar, desbloquear
// y eliminar (con confirmación).
// Esta capa NO valida reglas: lee los campos, llama a Banco y muestra
// la respuesta. Las reglas (quién puede, qué se valida, cuándo se puede
// eliminar) están en Banco.
// =============================================================

// Abre el panel de administración. Se llama al iniciar sesión como admin.
function entrarAlPanelAdministrador() {
  document.getElementById("registro-modo-admin").classList.add("oculto");
  mostrarSeccion("seccion-admin");
  actualizarAdministracion();
}

function inicializarAdministracion() {
  const tabla = document.getElementById("admin-clientes");
  const bloqueEdicion = document.getElementById("admin-edicion");
  const formularioEdicion = document.getElementById("admin-editar-formulario");
  let usuarioEnEdicion = null; // usuario del cliente que se está editando

  function cerrarEdicion() {
    usuarioEnEdicion = null;
    formularioEdicion.reset();
    bloqueEdicion.classList.add("oculto");
  }

  // ----- Botones de cada fila (un solo evento para toda la tabla) -----
  tabla.addEventListener("click", (evento) => {
    const boton = evento.target.closest("button[data-accion]");
    if (boton === null) {
      return;
    }
    const usuario = boton.dataset.usuario;
    const accion = boton.dataset.accion;

    if (accion === "editar") {
      const cliente = banco.listarClientes().find((c) => c.usuario === usuario);
      if (cliente === undefined) {
        return;
      }
      usuarioEnEdicion = usuario;
      llenarDatosPersonales("admin-editar", cliente);
      document.getElementById("admin-edicion-usuario").textContent = "@" + usuario;
      bloqueEdicion.classList.remove("oculto");
      bloqueEdicion.scrollIntoView({ behavior: "smooth", block: "start" });
      return;
    }

    if (accion === "desbloquear") {
      mostrarMensaje(banco.desbloquearCliente(usuario));
      actualizarAdministracion();
      return;
    }

    if (accion === "eliminar") {
      const confirmado = window.confirm(
        "¿Eliminar al cliente " + boton.dataset.nombre + " (" + usuario + ")? Esta acción no se puede deshacer."
      );
      if (!confirmado) {
        return;
      }
      const respuesta = banco.eliminarCliente(usuario);
      if (respuesta.tipo === "exito" && usuarioEnEdicion === usuario) {
        cerrarEdicion();
      }
      mostrarMensaje(respuesta);
      actualizarAdministracion();
    }
  });

  // ----- Editar -----
  formularioEdicion.addEventListener("submit", (evento) => {
    evento.preventDefault();
    if (usuarioEnEdicion === null) {
      return;
    }
    const respuesta = banco.editarCliente(usuarioEnEdicion, leerDatosPersonales("admin-editar"));
    mostrarMensaje(respuesta);
    if (respuesta.tipo === "exito") {
      cerrarEdicion();
      actualizarAdministracion();
    }
  });
  document.getElementById("admin-editar-cancelar").addEventListener("click", cerrarEdicion);

  // ----- Agregar: reutiliza el formulario de registro -----
  document.getElementById("admin-agregar").addEventListener("click", () => {
    cerrarEdicion();
    mostrarSeccion("seccion-registro");
    document.getElementById("registro-modo-admin").classList.remove("oculto");
  });
  document.getElementById("registro-volver-admin").addEventListener("click", entrarAlPanelAdministrador);

  // ----- Cerrar sesión -----
  document.getElementById("admin-cerrar-sesion").addEventListener("click", () => {
    cerrarEdicion();
    banco.cerrarSesion();
    mostrarSeccion("seccion-inicio");
    mostrarMensaje(crearRespuesta("exito", "Sesión cerrada."));
  });
}

// Dibuja la tabla de clientes con los datos de banco.listarClientes().
// Todo se escribe con textContent: un nombre nunca se interpreta como HTML.
function actualizarAdministracion() {
  const tabla = document.getElementById("admin-clientes");
  const clientes = banco.listarClientes();
  tabla.innerHTML = "";
  document.getElementById("admin-total").textContent =
    "(" + clientes.length + (clientes.length === 1 ? " cliente)" : " clientes)");

  if (clientes.length === 0) {
    const fila = tabla.insertRow();
    const celda = fila.insertCell();
    celda.colSpan = 6;
    celda.className = "admin-vacio";
    celda.textContent = "Todavía no hay clientes registrados.";
    return;
  }

  clientes.forEach((cliente) => {
    const fila = tabla.insertRow();

    // Crea una celda. "etiqueta" se muestra en celular, donde la tabla se
    // ve como tarjetas. Devuelve el contenedor para agregarle contenido.
    function celda(etiqueta) {
      const td = fila.insertCell();
      td.dataset.etiqueta = etiqueta;
      const contenido = document.createElement("div");
      td.appendChild(contenido);
      return contenido;
    }

    // Agrega una línea de texto a una celda
    function linea(contenedor, texto, clase) {
      const span = document.createElement("span");
      span.className = clase;
      span.textContent = texto;
      contenedor.appendChild(span);
    }

    const datosCliente = celda("Cliente");
    linea(datosCliente, cliente.nombreCompleto, "admin-nombre");
    linea(datosCliente, "@" + cliente.usuario, "admin-secundario");

    linea(celda("Documento"), (cliente.tipoDocumento === "cedula" ? "Cédula " : "Pasaporte ") + cliente.identificacion, "");

    const contacto = celda("Contacto");
    linea(contacto, cliente.celular, "admin-secundario admin-principal");
    linea(contacto, cliente.correo, "admin-secundario");

    const cuentas = celda("Cuentas");
    cliente.cuentas.forEach((cuenta) => {
      const texto = cuenta.tipo === TIPO_TARJETA
        ? "Tarjeta Nº " + cuenta.numero + " · deuda " + formatearMoneda(Math.max(-cuenta.saldo, 0))
        : (cuenta.tipo === "ahorros" ? "Ahorros" : "Corriente") + " Nº " + cuenta.numero + " · " + formatearMoneda(cuenta.saldo);
      linea(cuentas, texto, "admin-cuenta");
    });

    const estado = celda("Estado");
    const insignia = document.createElement("span");
    insignia.className = "estado " + (cliente.bloqueado ? "estado-bloqueado" : "estado-activo");
    insignia.textContent = cliente.bloqueado ? "Bloqueado" : "Activo";
    estado.appendChild(insignia);

    const acciones = fila.insertCell();
    acciones.className = "admin-botones";
    const botones = [["editar", "Editar"]];
    if (cliente.bloqueado) {
      botones.push(["desbloquear", "Desbloquear"]);
    }
    botones.push(["eliminar", "Eliminar"]);
    botones.forEach(([accion, texto]) => {
      const boton = document.createElement("button");
      boton.type = "button";
      boton.className = "boton-tabla" + (accion === "eliminar" ? " boton-tabla-peligro" : "");
      boton.dataset.accion = accion;
      boton.dataset.usuario = cliente.usuario;
      boton.dataset.nombre = cliente.nombreCompleto;
      boton.textContent = texto;
      acciones.appendChild(boton);
    });
  });
}
