// =============================================================
// Banco.js — Guarda la lista de clientes y quién inició sesión.
// Responsable: Mateo (ramas 4-registrar-clientes y 6-iniciar-sesion).
// =============================================================

class Banco {
  #clientes;
  #siguienteNumeroCuenta;

  constructor() {
    this.#clientes = [];
    this.#siguienteNumeroCuenta = 1;
    this.clienteActivo = null; // Cliente que inició sesión, o null
  }

  // ---------- Registro (Mateo, rama 4-registrar-clientes) ----------

  /**
   * datos: { tipoDocumento, identificacion, nombreCompleto, celular,
   *          usuario, contrasena, confirmacion, tiposCuenta }
   * Debe validar todo, crear el Cliente y sus cuentas, y guardarlo.
   * Devuelve: crearRespuesta(...)
   */
  registrarCliente(datos) {
    // TODO (Mateo)
    return crearRespuesta("advertencia", "Registro: en construcción");
  }

  // Devuelve el cliente con ese usuario, o null. No distingue mayúsculas.
  buscarPorUsuario(usuario) {
    // TODO (Mateo)
    return null;
  }

  // true si ya existe un cliente con ese tipo y número de documento.
  existeIdentificacion(tipoDocumento, identificacion) {
    // TODO (Mateo)
    return false;
  }

  // ---------- Inicio de sesión (Mateo, rama 6-iniciar-sesion) ----------

  /**
   * Valida bloqueo, credenciales e intentos.
   * Devuelve: crearRespuesta(tipo, mensaje, { intentosRestantes })
   */
  iniciarSesion(usuario, contrasena) {
    // TODO (Mateo)
    return crearRespuesta("advertencia", "Inicio de sesión: en construcción");
  }

  cerrarSesion() {
    this.clienteActivo = null;
  }

  // ---------- Cuentas (listo en el esqueleto: lo usan todos) ----------

  // Crea una CuentaAhorros o CuentaCorriente con un número nuevo.
  crearCuenta(tipo) {
    const numero = String(this.#siguienteNumeroCuenta).padStart(6, "0");
    this.#siguienteNumeroCuenta++;
    if (tipo === "ahorros") {
      return new CuentaAhorros(numero);
    }
    if (tipo === "corriente") {
      return new CuentaCorriente(numero);
    }
    return null;
  }

  // ---------- Datos de prueba (BORRAR antes de la entrega final) ----------

  // Crea un cliente para que Juan y Sebastián puedan probar sin esperar
  // el registro. Usuario: prueba / Contraseña: prueba123
  // Además deja la sesión iniciada con ese cliente.
  cargarDatosDePrueba() {
    const cliente = new Cliente({
      tipoDocumento: "cedula",
      identificacion: "1000000000",
      nombreCompleto: "Cliente De Prueba",
      celular: "3000000000",
      usuario: "prueba",
      contrasena: "prueba123",
    });
    cliente.agregarCuenta(this.crearCuenta("ahorros"));
    cliente.agregarCuenta(this.crearCuenta("corriente"));
    this.#clientes.push(cliente);
    this.clienteActivo = cliente;
  }
}
