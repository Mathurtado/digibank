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
   * datos: { tipoDocumento, identificacion, nombreCompleto, celular, correo,
   *          usuario, contrasena, confirmacion, tiposCuenta, solicitaTarjeta,
   *          saldoInicial }
   *   saldoInicial: texto del campo ("150.000") o número. Vacío = $0
   * Los datos llegan tal como se escribieron en el formulario.
   * Devuelve: crearRespuesta(...)
   */
  registrarCliente(datos) {
    // Paso 1: limpiar los datos (quitar espacios sobrantes, mayúsculas...)
    const limpios = this.#normalizarDatosRegistro(datos);

    // Paso 2: validar. Si algo falla, se devuelve el PRIMER error
    // y no se crea nada.
    const error = this.#validarDatosRegistro(limpios);
    if (error !== null) {
      return error;
    }

    // Paso 3: crear el cliente con los datos ya limpios y validados
    const cliente = new Cliente(limpios);

    // Paso 4: crear las cuentas que eligió y, si la pidió, la tarjeta
    limpios.tiposCuenta.forEach((tipo) => {
      cliente.agregarCuenta(this.crearCuenta(tipo));
    });
    if (limpios.solicitaTarjeta) {
      cliente.agregarCuenta(this.crearCuenta(TIPO_TARJETA));
    }

    // Paso 5: saldo inicial. Se consigna en ahorros si la eligió; si no, en
    // corriente. Se usa consignar() para que quede como primer movimiento.
    if (limpios.saldoInicial > 0) {
      const cuentaInicial = cliente.obtenerCuenta("ahorros") || cliente.obtenerCuenta("corriente");
      cuentaInicial.consignar(limpios.saldoInicial);
    }

    // Paso 6: guardarlo. Solo se llega aquí si todo fue válido.
    this.#clientes.push(cliente);
    this.guardar();

    return crearRespuesta(
      "exito",
      "Registro exitoso. Ya puedes iniciar sesión con el usuario " + cliente.usuario + ".",
      { usuario: cliente.usuario }
    );
  }

  // Devuelve el cliente con ese usuario, o null. No distingue mayúsculas.
  buscarPorUsuario(usuario) {
    const buscado = String(usuario).trim().toLowerCase();
    const cliente = this.#clientes.find((c) => c.usuario === buscado);
    return cliente || null;
  }

  // true si ya existe un cliente con ese tipo y número de documento.
  // La cédula 123456 y el pasaporte 123456 son documentos distintos.
  existeIdentificacion(tipoDocumento, identificacion) {
    return this.#clientes.some(
      (c) => c.tipoDocumento === tipoDocumento && c.identificacion === identificacion
    );
  }

  // ---------- Métodos privados del registro ----------

  // Deja los datos en el formato en que se guardan.
  // No valida nada: solo los limpia para poder compararlos.
  #normalizarDatosRegistro(datos) {
    const tipoDocumento = String(datos.tipoDocumento || "").trim().toLowerCase();

    let identificacion = String(datos.identificacion || "").trim();
    if (tipoDocumento === "pasaporte") {
      identificacion = identificacion.toUpperCase();
    }

    return {
      tipoDocumento: tipoDocumento,
      identificacion: identificacion,
      // Quita espacios al inicio y al final, y deja uno solo entre palabras
      nombreCompleto: String(datos.nombreCompleto || "").trim().replace(/\s+/g, " "),
      celular: String(datos.celular || "").trim(),
      correo: String(datos.correo || "").trim().toLowerCase(),
      usuario: String(datos.usuario || "").trim().toLowerCase(),
      // La contraseña NO se limpia: un espacio es un error que hay que avisar
      contrasena: String(datos.contrasena || ""),
      confirmacion: String(datos.confirmacion || ""),
      tiposCuenta: Array.isArray(datos.tiposCuenta) ? datos.tiposCuenta : [],
      solicitaTarjeta: datos.solicitaTarjeta === true,
      // Vacío = $0. El campo ya solo deja escribir dígitos y puntos de miles.
      // Si llega un número (por ejemplo desde la consola), se respeta.
      saldoInicial: this.#convertirSaldoInicial(datos.saldoInicial),
    };
  }

  // "" -> 0, "150.000" -> 150000. Un número se deja igual para que la
  // validación decida si sirve (decimales o negativos se rechazan).
  #convertirSaldoInicial(valor) {
    if (typeof valor === "number") {
      return valor;
    }
    const texto = String(valor || "").trim();
    return texto === "" ? 0 : convertirMonto(texto);
  }

  // Revisa los datos en el orden del formulario.
  // Devuelve una respuesta de error con el primer problema, o null si todo está bien.
  #validarDatosRegistro(d) {
    // ----- Tipo de documento -----
    if (!TIPOS_DOCUMENTO.includes(d.tipoDocumento)) {
      return crearRespuesta("error", "Selecciona un tipo de documento válido.");
    }

    // ----- Número de documento -----
    if (d.identificacion === "") {
      return crearRespuesta("error", "Ingresa tu número de documento.");
    }
    if (d.tipoDocumento === "cedula") {
      if (!/^\d+$/.test(d.identificacion)) {
        return crearRespuesta("error", "La cédula solo puede tener números, sin puntos ni espacios.");
      }
      if (d.identificacion.length < MIN_DIGITOS_CEDULA || d.identificacion.length > MAX_DIGITOS_CEDULA) {
        return crearRespuesta(
          "error",
          "La cédula debe tener entre " + MIN_DIGITOS_CEDULA + " y " + MAX_DIGITOS_CEDULA + " dígitos."
        );
      }
    } else {
      if (!/^[A-Z0-9]+$/.test(d.identificacion)) {
        return crearRespuesta("error", "El pasaporte solo puede tener letras sin tildes y números.");
      }
      if (d.identificacion.length < MIN_CARACTERES_PASAPORTE || d.identificacion.length > MAX_CARACTERES_PASAPORTE) {
        return crearRespuesta(
          "error",
          "El pasaporte debe tener entre " + MIN_CARACTERES_PASAPORTE + " y " + MAX_CARACTERES_PASAPORTE + " caracteres."
        );
      }
    }
    if (this.existeIdentificacion(d.tipoDocumento, d.identificacion)) {
      return crearRespuesta("error", "Ya existe un cliente registrado con ese documento.");
    }

    // ----- Nombre completo -----
    if (d.nombreCompleto === "") {
      return crearRespuesta("error", "Ingresa tu nombre completo.");
    }
    if (!/^[A-Za-zÁÉÍÓÚÜÑáéíóúüñ ]+$/.test(d.nombreCompleto)) {
      return crearRespuesta("error", "El nombre solo puede tener letras y espacios.");
    }
    if (d.nombreCompleto.split(" ").length < 2) {
      return crearRespuesta("error", "Ingresa tu nombre completo: al menos nombre y apellido.");
    }

    // ----- Celular -----
    if (d.celular === "") {
      return crearRespuesta("error", "Ingresa tu número de celular.");
    }
    if (!/^\d+$/.test(d.celular) || d.celular.length !== DIGITOS_CELULAR || !d.celular.startsWith("3")) {
      return crearRespuesta(
        "error",
        "El celular debe tener " + DIGITOS_CELULAR + " dígitos y empezar por 3. Ejemplo: 3001234567."
      );
    }

    // ----- Correo electrónico -----
    if (d.correo === "") {
      return crearRespuesta("error", "Ingresa tu correo electrónico.");
    }
    // Formato básico: algo@algo.algo, sin espacios
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(d.correo)) {
      return crearRespuesta("error", "Ingresa un correo válido. Ejemplo: nombre@correo.com.");
    }

    // ----- Nombre de usuario -----
    if (d.usuario === "") {
      return crearRespuesta("error", "Ingresa un nombre de usuario.");
    }
    if (!/^[a-z0-9_]+$/.test(d.usuario)) {
      return crearRespuesta(
        "error",
        "El usuario solo puede tener letras sin tildes, números y guion bajo, sin espacios."
      );
    }
    if (d.usuario.length < MIN_CARACTERES_USUARIO || d.usuario.length > MAX_CARACTERES_USUARIO) {
      return crearRespuesta(
        "error",
        "El usuario debe tener entre " + MIN_CARACTERES_USUARIO + " y " + MAX_CARACTERES_USUARIO + " caracteres."
      );
    }
    if (this.buscarPorUsuario(d.usuario) !== null) {
      return crearRespuesta("error", "Ese nombre de usuario ya está en uso. Elige otro.");
    }

    // ----- Contraseña -----
    if (d.contrasena === "") {
      return crearRespuesta("error", "Ingresa una contraseña.");
    }
    if (/\s/.test(d.contrasena)) {
      return crearRespuesta("error", "La contraseña no puede tener espacios.");
    }
    if (d.contrasena.length < MIN_CARACTERES_CONTRASENA) {
      return crearRespuesta(
        "error",
        "La contraseña debe tener al menos " + MIN_CARACTERES_CONTRASENA + " caracteres."
      );
    }
    if (!/[A-Za-zÁÉÍÓÚÜÑáéíóúüñ]/.test(d.contrasena) || !/\d/.test(d.contrasena)) {
      return crearRespuesta("error", "La contraseña debe tener al menos una letra y un número.");
    }

    // ----- Confirmación -----
    if (d.confirmacion !== d.contrasena) {
      return crearRespuesta("error", "Las contraseñas no coinciden.");
    }

    // ----- Tipo de cuenta -----
    if (d.tiposCuenta.length === 0) {
      return crearRespuesta("error", "Elige al menos un tipo de cuenta: ahorros o corriente.");
    }
    const tiposValidos = d.tiposCuenta.every((tipo) => TIPOS_CUENTA.includes(tipo));
    const sinRepetir = new Set(d.tiposCuenta).size === d.tiposCuenta.length;
    if (!tiposValidos || !sinRepetir) {
      return crearRespuesta("error", "Los tipos de cuenta elegidos no son válidos.");
    }

    // ----- Saldo inicial (opcional) -----
    if (!Number.isInteger(d.saldoInicial) || d.saldoInicial < 0) {
      return crearRespuesta("error", "El saldo inicial debe ser un número entero de $0 o más.");
    }

    return null; // todo está bien
  }

  // ---------- Inicio de sesión (Mateo, rama 6-iniciar-sesion) ----------

  /**
   * Valida campos, bloqueo, credenciales e intentos.
   * Devuelve: crearRespuesta(tipo, mensaje, datos)
   *   datos = { intentosRestantes } solo cuando el usuario existe,
   *   para que la interfaz muestre el contador. Si no existe, datos = null.
   */
  iniciarSesion(usuario, contrasena) {
    const textoUsuario = String(usuario || "").trim();
    const textoContrasena = String(contrasena || "");

    // Paso 1: campos vacíos. No cuenta como intento fallido.
    if (textoUsuario === "" || textoContrasena === "") {
      return crearRespuesta("error", "Ingresa tu usuario y contraseña.");
    }

    // Paso 2: buscar al cliente. Si no existe, el mensaje es el MISMO
    // que con contraseña incorrecta, para no revelar qué usuarios existen.
    const cliente = this.buscarPorUsuario(textoUsuario);
    if (cliente === null) {
      return crearRespuesta("error", "Usuario o contraseña incorrectos.");
    }

    // Paso 3: si está bloqueado, no se revisa la contraseña ni se suman intentos.
    if (cliente.estaBloqueado()) {
      return this.#respuestaBloqueo(cliente);
    }

    // Paso 4: contraseña incorrecta. Se suma el intento.
    if (!cliente.verificarContrasena(textoContrasena)) {
      cliente.registrarIntentoFallido();
      this.guardar(); // así el bloqueo sigue aunque se recargue la página

      // Si con este intento llegó al máximo, se avisa del bloqueo de inmediato
      if (cliente.estaBloqueado()) {
        return this.#respuestaBloqueo(cliente);
      }

      return crearRespuesta("error", "Usuario o contraseña incorrectos.", {
        intentosRestantes: MAX_INTENTOS - cliente.intentosFallidos,
      });
    }

    // Paso 5: todo bien. Se reinicia el contador y se abre la sesión.
    cliente.reiniciarIntentos();
    this.guardar();
    this.clienteActivo = cliente;
    return crearRespuesta("exito", "Bienvenido, " + cliente.nombreCompleto + ".", {
      intentosRestantes: MAX_INTENTOS,
    });
  }

  // Arma el mensaje de cuenta bloqueada con los minutos que faltan,
  // redondeados hacia arriba (4 min 10 s -> "5 minutos").
  #respuestaBloqueo(cliente) {
    const milisegundosRestantes = cliente.bloqueadoHasta - Date.now();
    const minutos = Math.ceil(milisegundosRestantes / 60000);
    const palabra = minutos === 1 ? "minuto" : "minutos";
    return crearRespuesta(
      "error",
      "Cuenta bloqueada por demasiados intentos. Intenta de nuevo en " + minutos + " " + palabra + ".",
      { intentosRestantes: 0 }
    );
  }

  cerrarSesion() {
    this.clienteActivo = null;
  }

  // ---------- Cuentas (listo en el esqueleto: lo usan todos) ----------

  // Crea una CuentaAhorros, CuentaCorriente o TarjetaCredito con un número nuevo.
  crearCuenta(tipo) {
    if (!TIPOS_CUENTA.includes(tipo) && tipo !== TIPO_TARJETA) {
      return null;
    }
    const numero = String(this.#siguienteNumeroCuenta).padStart(6, "0");
    this.#siguienteNumeroCuenta++;
    if (tipo === "ahorros") {
      return new CuentaAhorros(numero);
    }
    if (tipo === "corriente") {
      return new CuentaCorriente(numero);
    }
    return new TarjetaCredito(numero);
  }

  // ---------- Almacenamiento (localStorage) ----------

  // Guarda todos los clientes y sus cuentas en el navegador.
  // La sesión (clienteActivo) NO se guarda: al recargar hay que volver a entrar.
  // Se llama después de cada cambio: registro, intentos de login y, desde la
  // interfaz, después de cada consignación, retiro, compra o pago exitoso.
  guardar() {
    const datos = {
      siguienteNumeroCuenta: this.#siguienteNumeroCuenta,
      clientes: this.#clientes.map((cliente) => cliente.aDatos()),
    };
    try {
      localStorage.setItem(CLAVE_ALMACENAMIENTO, JSON.stringify(datos));
    } catch (error) {
      // Navegador sin almacenamiento (modo privado o lleno): la app sigue
      // funcionando, solo que los datos se pierden al recargar.
      console.warn("No se pudieron guardar los datos:", error);
    }
  }

  // Carga los clientes guardados. Si no hay nada guardado o los datos están
  // dañados, el banco queda vacío. Se llama una sola vez, al arrancar (app.js).
  cargar() {
    try {
      const texto = localStorage.getItem(CLAVE_ALMACENAMIENTO);
      if (texto === null) {
        return;
      }
      const datos = JSON.parse(texto);
      this.#clientes = datos.clientes.map((d) => this.#reconstruirCliente(d));
      this.#siguienteNumeroCuenta = datos.siguienteNumeroCuenta;
    } catch (error) {
      console.warn("No se pudieron cargar los datos guardados:", error);
      this.#clientes = [];
      this.#siguienteNumeroCuenta = 1;
    }
  }

  // Crea de nuevo un Cliente (con sus métodos) a partir de los datos guardados.
  #reconstruirCliente(datos) {
    const cliente = new Cliente(datos);
    cliente.intentosFallidos = datos.intentosFallidos;
    cliente.bloqueadoHasta = datos.bloqueadoHasta;
    datos.cuentas.forEach((d) => {
      cliente.agregarCuenta(this.#reconstruirCuenta(d));
    });
    return cliente;
  }

  // Crea la clase correcta según el tipo guardado y le devuelve su saldo,
  // sus movimientos y, si es tarjeta, sus compras.
  #reconstruirCuenta(datos) {
    let cuenta;
    if (datos.tipo === "ahorros") {
      cuenta = new CuentaAhorros(datos.numero);
    } else if (datos.tipo === "corriente") {
      cuenta = new CuentaCorriente(datos.numero);
    } else {
      cuenta = new TarjetaCredito(datos.numero, datos.cupo);
      TarjetaCredito.restaurarCompras(cuenta, datos.compras);
    }
    Cuenta.restaurar(cuenta, datos);
    return cuenta;
  }

  // ---------- Datos de prueba (BORRAR antes de la entrega final) ----------

  // Crea un cliente para que Juan y Sebastián puedan probar sin esperar
  // el registro. Usuario: prueba / Contraseña: prueba123
  // Además deja la sesión iniciada con ese cliente.
  // Si ya estaba guardado (de una visita anterior), lo reutiliza.
  cargarDatosDePrueba() {
    const guardado = this.buscarPorUsuario("prueba");
    if (guardado !== null) {
      this.clienteActivo = guardado;
      return;
    }

    const cliente = new Cliente({
      tipoDocumento: "cedula",
      identificacion: "1000000000",
      nombreCompleto: "Cliente De Prueba",
      celular: "3000000000",
      correo: "prueba@miplata.com",
      usuario: "prueba",
      contrasena: "prueba123",
    });
    cliente.agregarCuenta(this.crearCuenta("ahorros"));
    cliente.agregarCuenta(this.crearCuenta("corriente"));
    cliente.agregarCuenta(this.crearCuenta(TIPO_TARJETA));
    this.#clientes.push(cliente);
    this.guardar();
    this.clienteActivo = cliente;
  }
}
