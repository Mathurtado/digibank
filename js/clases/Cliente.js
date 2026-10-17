// =============================================================
// Cliente.js — Datos de una persona registrada y sus cuentas.
// Responsable: Mateo (ramas 4-registrar-clientes y 6-iniciar-sesion).
// =============================================================

class Cliente {
  #contrasena;

  constructor(datos) {
    this.tipoDocumento = datos.tipoDocumento;   // "cedula" o "pasaporte"
    this.identificacion = datos.identificacion; // texto, no número
    this.nombreCompleto = datos.nombreCompleto;
    this.celular = datos.celular;               // texto, para no perder el formato
    this.correo = datos.correo;                 // ya normalizado en minúsculas
    this.usuario = datos.usuario;               // ya normalizado en minúsculas
    this.#contrasena = datos.contrasena;        // privada: nunca se muestra
    this.intentosFallidos = 0;
    this.bloqueadoHasta = null;                 // milisegundos (Date.now()) o null
    this.cuentas = [];                          // máximo una de cada tipo
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
    if (this.bloqueadoHasta === null) {
      return false;
    }
    if (Date.now() < this.bloqueadoHasta) {
      return true;
    }
    // Ya pasaron los minutos de bloqueo: la cuenta queda libre otra vez
    this.bloqueadoHasta = null;
    this.intentosFallidos = 0;
    return false;
  }

  // Suma un intento fallido. Al llegar a MAX_INTENTOS, bloquea la cuenta
  // durante MINUTOS_BLOQUEO (60.000 milisegundos = 1 minuto).
  registrarIntentoFallido() {
    this.intentosFallidos++;
    if (this.intentosFallidos >= MAX_INTENTOS) {
      this.bloqueadoHasta = Date.now() + MINUTOS_BLOQUEO * 60000;
    }
  }

  // Pone el contador en 0 tras un inicio de sesión correcto.
  reiniciarIntentos() {
    this.intentosFallidos = 0;
    this.bloqueadoHasta = null;
  }

  // ---------- Cuentas (listo en el esqueleto: lo usan todos) ----------

  // Agrega una cuenta. Rechaza una segunda cuenta del mismo tipo.
  agregarCuenta(cuenta) {
    if (this.obtenerCuenta(cuenta.tipo) !== null) {
      return crearRespuesta("error", "El cliente ya tiene una cuenta de " + cuenta.tipo + ".");
    }
    this.cuentas.push(cuenta);
    return crearRespuesta("exito", "Cuenta de " + cuenta.tipo + " agregada.");
  }

  // Devuelve la cuenta de ese tipo, o null si no la tiene.
  obtenerCuenta(tipo) {
    const cuenta = this.cuentas.find((c) => c.tipo === tipo);
    return cuenta || null;
  }

  // ---------- Almacenamiento ----------

  // Convierte el cliente en un objeto simple para guardarlo con JSON.
  // LIMITACIÓN: la contraseña queda como texto en localStorage y se puede
  // ver en las herramientas del navegador. Aceptable para el proyecto.
  aDatos() {
    return {
      tipoDocumento: this.tipoDocumento,
      identificacion: this.identificacion,
      nombreCompleto: this.nombreCompleto,
      celular: this.celular,
      correo: this.correo,
      usuario: this.usuario,
      contrasena: this.#contrasena,
      intentosFallidos: this.intentosFallidos,
      bloqueadoHasta: this.bloqueadoHasta,
      cuentas: this.cuentas.map((cuenta) => cuenta.aDatos()),
    };
  }
}
