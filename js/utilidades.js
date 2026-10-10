// =============================================================
// utilidades.js
// Constantes de reglas de negocio y funciones comunes de montos.
// Se carga PRIMERO: todos los demás archivos lo usan.
// Responsable: Mateo (esqueleto). Cambios aquí se acuerdan en equipo.
// =============================================================

// ---------- Reglas de inicio de sesión ----------
const MAX_INTENTOS = 3;
const MINUTOS_BLOQUEO = 5;

// ---------- Reglas de registro ----------
const MIN_CARACTERES_CONTRASENA = 6;
const MIN_DIGITOS_CEDULA = 6;
const MAX_DIGITOS_CEDULA = 10;
const MIN_CARACTERES_PASAPORTE = 6;
const MAX_CARACTERES_PASAPORTE = 9;
const MIN_CARACTERES_USUARIO = 4;
const MAX_CARACTERES_USUARIO = 15;
const DIGITOS_CELULAR = 10;

// ---------- Reglas de cuentas ----------
const TASA_INTERES_AHORROS = 0.015; // 1,5 %. Cómo se aplica: PENDIENTE (profesor)
const PORCENTAJE_SOBREGIRO = 0.2;   // 20 % sobre el saldo en cuenta corriente

// ---------- Textos fijos (no cambiar: otros archivos los comparan) ----------
const TIPOS_CUENTA = ["ahorros", "corriente"];
const TIPOS_DOCUMENTO = ["cedula", "pasaporte"];

// =============================================================
// Funciones de montos
// =============================================================

/**
 * Deja solo dígitos y agrega puntos de miles.
 * formatearMiles("1000000") -> "1.000.000"
 * formatearMiles("12a3")    -> "123"
 */
function formatearMiles(texto) {
  const soloDigitos = String(texto).replace(/\D/g, "");
  if (soloDigitos === "") {
    return "";
  }
  return Number(soloDigitos).toLocaleString("es-CO");
}

/**
 * Convierte el texto de un campo de monto en número entero.
 * convertirMonto("1.000.000") -> 1000000
 * convertirMonto("")          -> NaN  (así las validaciones lo rechazan)
 */
function convertirMonto(texto) {
  const soloDigitos = String(texto).replace(/\D/g, "");
  if (soloDigitos === "") {
    return NaN;
  }
  return Number(soloDigitos);
}

/**
 * Muestra un número como dinero.
 * formatearMoneda(1000000) -> "$1.000.000"
 */
function formatearMoneda(numero) {
  const signo = numero < 0 ? "-" : "";
  return signo + "$" + Math.abs(numero).toLocaleString("es-CO");
}

/**
 * Crea el objeto de respuesta que devuelven todos los métodos.
 * tipo: "exito" | "error" | "advertencia"
 */
function crearRespuesta(tipo, mensaje, datos = null) {
  return { tipo: tipo, mensaje: mensaje, datos: datos };
}
