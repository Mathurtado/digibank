// =============================================================
// Administrador.js — HERENCIA: es un Usuario que administra clientes.
// No tiene cuentas ni datos personales. Usuario y contraseña fijos
// (utilidades.js). No se guarda en localStorage.
// =============================================================

class Administrador extends Usuario {
  constructor() {
    super(USUARIO_ADMINISTRADOR, CONTRASENA_ADMINISTRADOR);
  }

  // Para el saludo del inicio de sesión
  get nombreCompleto() {
    return "Administrador";
  }

  // POLIMORFISMO: redefine el método de Usuario
  esAdministrador() {
    return true;
  }
}
