// =============================================================
// Cliente.js — Datos de una persona registrada y sus cuentas.
// Responsable: Mateo (ramas 4-registrar-clientes y 6-iniciar-sesion).
//
// ENCAPSULAMIENTO: todos los atributos son privados (#). Desde afuera
// solo se pueden LEER con getters; para cambiarlos hay que usar los
// métodos de la clase, que deciden si el cambio está permitido.
// =============================================================

class Cliente {
  #tipoDocumento;
  #identificacion;
  #nombreCompleto;
  #celular;
  #correo;
  #usuario;
  #contrasena;
  #intentosFallidos;
  #bloqueadoHasta;
  #cuentas;

  /**
   * datos: los datos ya limpios y validados por Banco.
   *   Al cargar desde localStorage también trae intentosFallidos y bloqueadoHasta.
   * cuentas: las cuentas del cliente (máximo una de cada tipo).
   *   Se reciben al crearlo: no existe un método público para agregar cuentas.
   */
  constructor(datos, cuentas = []) {
    this.#tipoDocumento = datos.tipoDocumento;   // "cedula" o "pasaporte"
    this.#identificacion = datos.identificacion; // texto, no número
    this.#nombreCompleto = datos.nombreCompleto;
    this.#celular = datos.celular;               // texto, para no perder el formato
    this.#correo = datos.correo;                 // ya normalizado en minúsculas
    this.#usuario = datos.usuario;               // ya normalizado en minúsculas
    this.#contrasena = datos.contrasena;         // nunca se muestra
    this.#intentosFallidos = Number.isInteger(datos.intentosFallidos) ? datos.intentosFallidos : 0;
    this.#bloqueadoHasta = Number.isFinite(datos.bloqueadoHasta) ? datos.bloqueadoHasta : null;
    this.#cuentas = [];
    cuentas.forEach((cuenta) => this.#agregarCuenta(cuenta));
  }

  // ---------- Getters: solo lectura ----------

  get tipoDocumento() { return this.#tipoDocumento; }
  get identificacion() { return this.#identificacion; }
  get nombreCompleto() { return this.#nombreCompleto; }
  get celular() { return this.#celular; }
  get correo() { return this.#correo; }
  get usuario() { return this.#usuario; }
  get intentosFallidos() { return this.#intentosFallidos; }
  get bloqueadoHasta() { return this.#bloqueadoHasta; } // milisegundos (Date.now()) o null

  // Devuelve una COPIA de la lista: quien la reciba no puede agregar ni
  // quitar cuentas del cliente.
  get cuentas() {
    return [...this.#cuentas];
  }

  // ---------- Inicio de sesión (Mateo, rama 6-iniciar-sesion) ----------

  // Devuelve true o false. La contraseña nunca sale de la clase:
  // desde afuera solo se puede preguntar si un texto coincide.
  verificarContrasena(texto) {
    return this.#contrasena === texto;
  }

  // Reemplaza la contraseña. Banco ya revisó que la nueva cumpla las reglas.
  // Pide la actual: así nadie puede cambiarla desde afuera (por ejemplo,
  // desde la consola) sin conocerla. Devuelve true si se cambió.
  cambiarContrasena(actual, nueva) {
    if (!this.verificarContrasena(actual)) {
      return false;
    }
    this.#contrasena = nueva;
    return true;
  }

  // true si el bloqueo sigue vigente.
  // Si el bloqueo ya venció, lo quita y reinicia el contador.
  estaBloqueado() {
    if (this.#bloqueadoHasta === null) {
      return false;
    }
    if (Date.now() < this.#bloqueadoHasta) {
      return true;
    }
    // Ya pasaron los minutos de bloqueo: la cuenta queda libre otra vez
    this.reiniciarIntentos();
    return false;
  }

  // Suma un intento fallido. Al llegar a MAX_INTENTOS, bloquea la cuenta
  // durante MINUTOS_BLOQUEO (60.000 milisegundos = 1 minuto).
  registrarIntentoFallido() {
    this.#intentosFallidos++;
    if (this.#intentosFallidos >= MAX_INTENTOS) {
      this.#bloqueadoHasta = Date.now() + MINUTOS_BLOQUEO * 60000;
    }
  }

  // Pone el contador en 0 y quita el bloqueo.
  reiniciarIntentos() {
    this.#intentosFallidos = 0;
    this.#bloqueadoHasta = null;
  }

  // ---------- Cuentas ----------

  // Devuelve la cuenta de ese tipo, o null si no la tiene.
  obtenerCuenta(tipo) {
    const cuenta = this.#cuentas.find((c) => c.tipo === tipo);
    return cuenta || null;
  }

  // Privado: solo el constructor agrega cuentas. Rechaza una segunda
  // cuenta del mismo tipo y cualquier cosa que no sea una Cuenta.
  #agregarCuenta(cuenta) {
    if (!(cuenta instanceof Cuenta) || this.obtenerCuenta(cuenta.tipo) !== null) {
      return;
    }
    this.#cuentas.push(cuenta);
  }

  // ---------- Almacenamiento ----------

  // Convierte el cliente en un objeto simple para guardarlo con JSON.
  // LIMITACIÓN: la contraseña queda como texto en localStorage y se puede
  // ver en las herramientas del navegador. Aceptable para el proyecto.
  aDatos() {
    return {
      tipoDocumento: this.#tipoDocumento,
      identificacion: this.#identificacion,
      nombreCompleto: this.#nombreCompleto,
      celular: this.#celular,
      correo: this.#correo,
      usuario: this.#usuario,
      contrasena: this.#contrasena,
      intentosFallidos: this.#intentosFallidos,
      bloqueadoHasta: this.#bloqueadoHasta,
      cuentas: this.#cuentas.map((cuenta) => cuenta.aDatos()),
    };
  }
}
