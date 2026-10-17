// =============================================================
// app.js — Arranque de la aplicación y navegación entre secciones.
// Se carga AL FINAL: usa todas las clases y archivos de interfaz.
// Responsable: Mateo (esqueleto). Cambios aquí se acuerdan en equipo.
// =============================================================

// Única instancia del banco. Es la única variable global del proyecto.
// Al arrancar recupera los clientes guardados en el navegador (localStorage).
const banco = new Banco();
banco.cargar();

// true mientras desarrollamos: crea un cliente de prueba con sesión
// iniciada y abre el panel directamente. PONER EN false antes de la entrega.
const MODO_PRUEBA = true;

// ---------- Navegación ----------

// Muestra una sección (inicio, registro, login, panel) y oculta las demás.
function mostrarSeccion(idSeccion) {
  document.querySelectorAll(".seccion").forEach((seccion) => {
    seccion.classList.toggle("oculto", seccion.id !== idSeccion);
  });
  ocultarMensaje();
}

// Dentro del panel: muestra una vista (saldo, consignar...) y oculta las demás.
function mostrarVista(idVista) {
  document.querySelectorAll(".vista").forEach((vista) => {
    vista.classList.toggle("oculto", vista.id !== idVista);
  });
  if (idVista === "vista-saldo") {
    actualizarSaldo();
  }
  if (idVista === "vista-perfil") {
    actualizarPerfil(); // interfaz/perfil.js
  }
  ocultarMensaje();
}

// ---------- Mensajes de retroalimentación ----------

// Recibe una respuesta { tipo, mensaje } de cualquier clase y la muestra
// en verde (exito), rojo (error) o amarillo (advertencia).
function mostrarMensaje(respuesta) {
  const caja = document.getElementById("mensaje");
  caja.textContent = respuesta.mensaje;
  caja.className = "mensaje mensaje-" + respuesta.tipo;
}

function ocultarMensaje() {
  const caja = document.getElementById("mensaje");
  caja.textContent = "";
  caja.className = "mensaje oculto";
}

// ---------- Panel ----------

// Llena el panel con los datos del cliente activo. Se llama al iniciar sesión.
function actualizarPanel() {
  const cliente = banco.clienteActivo;
  if (cliente === null) {
    return;
  }
  document.getElementById("panel-nombre").textContent = cliente.nombreCompleto;

  const selector = document.getElementById("panel-cuenta");
  selector.innerHTML = "";
  cliente.cuentas.forEach((cuenta) => {
    const opcion = document.createElement("option");
    opcion.value = cuenta.tipo;
    opcion.textContent = nombreProducto(cuenta.tipo) + " Nº " + cuenta.numero;
    selector.appendChild(opcion);
  });
}

// Devuelve la Cuenta elegida en el selector del panel, o null.
function obtenerCuentaSeleccionada() {
  if (banco.clienteActivo === null) {
    return null;
  }
  const tipo = document.getElementById("panel-cuenta").value;
  return banco.clienteActivo.obtenerCuenta(tipo);
}

function entrarAlPanel() {
  actualizarPanel();
  mostrarSeccion("seccion-panel");
  mostrarVista("vista-saldo");
}

// ---------- Conexiones generales ----------

function inicializarNavegacion() {
  // Botones del menú público
  document.querySelectorAll("[data-ir-a]").forEach((boton) => {
    boton.addEventListener("click", () => mostrarSeccion(boton.dataset.irA));
  });

  // Botones del panel
  document.querySelectorAll("[data-ver]").forEach((boton) => {
    boton.addEventListener("click", () => mostrarVista(boton.dataset.ver));
  });

  // Cerrar sesión
  document.getElementById("panel-cerrar-sesion").addEventListener("click", () => {
    banco.cerrarSesion();
    mostrarSeccion("seccion-inicio");
    mostrarMensaje(crearRespuesta("exito", "Sesión cerrada."));
  });

  // Todos los campos de monto agregan los puntos de miles mientras se escribe
  document.querySelectorAll(".campo-monto").forEach((campo) => {
    campo.addEventListener("input", () => {
      campo.value = formatearMiles(campo.value);
    });
  });
}

// ---------- Arranque ----------

inicializarNavegacion();
inicializarRegistro();     // interfaz/registro.js
inicializarLogin();        // interfaz/iniciarSesion.js
inicializarOperaciones();  // interfaz/operaciones.js
inicializarConsultas();    // interfaz/consultas.js
inicializarTarjeta();      // interfaz/tarjeta.js
inicializarPerfil();       // interfaz/perfil.js
inicializarAdministracion(); // interfaz/administracion.js

if (MODO_PRUEBA) {
  banco.cargarDatosDePrueba();
  entrarAlPanel();
} else {
  mostrarSeccion("seccion-inicio");
}
