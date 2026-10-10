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
    this.usuario = datos.usuario;               // ya normalizado en minúsculas
    this.#contrasena = datos.contrasena;        // privada: nunca se muestra
    this.intentosFallidos = 0;
    this.bloqueadoHasta = null;                 // milisegundos (Date.now()) o null
    this.cuentas = [];                          // máximo una de cada tipo
  }

  // ---------- Inicio de sesión (Mateo, rama 6-iniciar-sesion) ----------

  // Devuelve true o false. La contraseña nunca sale de la clase.
  verificarContrasena(texto) {
    // TODO (Mateo)
    return false;
  }

  // true si el bloqueo sigue vigente. Si ya venció, reinicia el contador.
  estaBloqueado() {
    // TODO (Mateo)
    return false;
  }

  // Suma un intento y bloquea al llegar a MAX_INTENTOS.
  registrarIntentoFallido() {
    // TODO (Mateo)
  }

  // Pone el contador en 0 tras un inicio de sesión correcto.
  reiniciarIntentos() {
    // TODO (Mateo)
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
}
