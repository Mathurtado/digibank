// =============================================================
// Usuario.js — Clase padre de todo el que puede iniciar sesión:
// Cliente y Administrador.
//
// HERENCIA: Cliente y Administrador comparten el usuario, la contraseña,
// los intentos fallidos y el bloqueo. Esa lógica se escribe UNA vez aquí.
// POLIMORFISMO: esAdministrador() y aDatos() se redefinen en las hijas.
// ENCAPSULAMIENTO: todo es privado (#); la contraseña nunca sale de la clase.
// =============================================================

class Usuario {
  #usuario;
  #contrasena;
  #intentosFallidos;
  #bloqueadoHasta;

  constructor(usuario, contrasena, intentosFallidos = 0, bloqueadoHasta = null) {
    this.#usuario = usuario;       // ya normalizado en minúsculas
    this.#contrasena = contrasena; // nunca se muestra
    this.#intentosFallidos = Number.isInteger(intentosFallidos) ? intentosFallidos : 0;
    this.#bloqueadoHasta = Number.isFinite(bloqueadoHasta) ? bloqueadoHasta : null;
  }

  // ---------- Getters: solo lectura ----------

  get usuario() { return this.#usuario; }
  get intentosFallidos() { return this.#intentosFallidos; }
  get bloqueadoHasta() { return this.#bloqueadoHasta; } // milisegundos (Date.now()) o null

  // ---------- Polimorfismo ----------

  // Cada hija responde distinto: Banco lo usa para saber a qué panel entrar.
  esAdministrador() {
    return false;
  }

  // ---------- Contraseña ----------

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

  // Cambia el nombre de usuario. Banco ya revisó que sea válido y único.
  cambiarUsuario(nuevo) {
    this.#usuario = nuevo;
  }

  // ---------- Intentos y bloqueo ----------

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

  // ---------- Almacenamiento ----------

  // Datos de acceso para guardar en localStorage. Cliente los amplía.
  // LIMITACIÓN: la contraseña queda como texto en localStorage y se puede
  // ver en las herramientas del navegador. Aceptable para el proyecto.
  aDatos() {
    return {
      usuario: this.#usuario,
      contrasena: this.#contrasena,
      intentosFallidos: this.#intentosFallidos,
      bloqueadoHasta: this.#bloqueadoHasta,
    };
  }
}
