// =============================================================
// Cliente.js — HERENCIA: es un Usuario con datos personales y cuentas.
// Responsable: Mateo (ramas 4-registrar-clientes y 6-iniciar-sesion).
//
// El usuario, la contraseña, los intentos y el bloqueo los hereda de
// Usuario. ENCAPSULAMIENTO: todos los atributos son privados (#). Desde
// afuera solo se LEEN con getters; para cambiarlos hay que usar los
// métodos de la clase.
// =============================================================

class Cliente extends Usuario {
  #tipoDocumento;
  #identificacion;
  #nombreCompleto;
  #celular;
  #correo;
  #cuentas;

  /**
   * datos: los datos ya limpios y validados por Banco.
   *   Al cargar desde localStorage también trae intentosFallidos y bloqueadoHasta.
   * cuentas: las cuentas del cliente (máximo una de cada tipo).
   *   Se reciben al crearlo: no existe un método público para agregar cuentas.
   */
  constructor(datos, cuentas = []) {
    super(datos.usuario, datos.contrasena, datos.intentosFallidos, datos.bloqueadoHasta);
    this.#tipoDocumento = datos.tipoDocumento;   // "cedula" o "pasaporte"
    this.#identificacion = datos.identificacion; // texto, no número
    this.#nombreCompleto = datos.nombreCompleto;
    this.#celular = datos.celular;               // texto, para no perder el formato
    this.#correo = datos.correo;                 // ya normalizado en minúsculas
    this.#cuentas = [];
    cuentas.forEach((cuenta) => this.#agregarCuenta(cuenta));
  }

  // ---------- Getters: solo lectura ----------

  get tipoDocumento() { return this.#tipoDocumento; }
  get identificacion() { return this.#identificacion; }
  get nombreCompleto() { return this.#nombreCompleto; }
  get celular() { return this.#celular; }
  get correo() { return this.#correo; }

  // Devuelve una COPIA de la lista: quien la reciba no puede agregar ni
  // quitar cuentas del cliente.
  get cuentas() {
    return [...this.#cuentas];
  }

  // ---------- Perfil ----------

  // Reemplaza los datos personales. Banco ya los limpió y validó
  // (formato, documento y usuario sin repetir) antes de llamar aquí.
  actualizarDatos(datos) {
    this.#tipoDocumento = datos.tipoDocumento;
    this.#identificacion = datos.identificacion;
    this.#nombreCompleto = datos.nombreCompleto;
    this.#celular = datos.celular;
    this.#correo = datos.correo;
    this.cambiarUsuario(datos.usuario); // heredado de Usuario
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

  // POLIMORFISMO: amplía los datos de acceso de Usuario con los datos
  // personales y las cuentas.
  aDatos() {
    return {
      ...super.aDatos(),
      tipoDocumento: this.#tipoDocumento,
      identificacion: this.#identificacion,
      nombreCompleto: this.#nombreCompleto,
      celular: this.#celular,
      correo: this.#correo,
      cuentas: this.#cuentas.map((cuenta) => cuenta.aDatos()),
    };
  }
}
