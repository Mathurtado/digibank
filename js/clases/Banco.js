// =============================================================
// Banco.js — Guarda la lista de clientes y quién inició sesión.
// Responsable: Mateo (ramas 4-registrar-clientes y 6-iniciar-sesion).
// =============================================================

class Banco {
  #clientes;
  #siguienteNumeroCuenta;
  #clienteActivo;       // Cliente que inició sesión, o null
  #administrador;       // Único administrador (usuario y clave fijos)
  #administradorActivo; // true si el que inició sesión es el administrador

  constructor() {
    this.#clientes = [];
    this.#siguienteNumeroCuenta = 1;
    this.#clienteActivo = null;
    this.#administrador = new Administrador();
    this.#administradorActivo = false;
  }

  // Solo lectura: la sesión solo se abre con iniciarSesion() y se cierra
  // con cerrarSesion(). Nadie puede "entrar" como otro cliente asignándolo.
  get clienteActivo() {
    return this.#clienteActivo;
  }

  get administradorActivo() {
    return this.#administradorActivo;
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

    // Paso 3: crear las cuentas que eligió y, si la pidió, la tarjeta
    const cuentas = limpios.tiposCuenta.map((tipo) => this.#crearCuenta(tipo));
    if (limpios.solicitaTarjeta) {
      cuentas.push(this.#crearCuenta(TIPO_TARJETA));
    }

    // Paso 4: crear el cliente con los datos ya limpios y validados, y sus cuentas
    const cliente = new Cliente(limpios, cuentas);

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

  // Revisa los datos del registro en el orden del formulario.
  // Devuelve una respuesta de error con el primer problema, o null si todo está bien.
  #validarDatosRegistro(d) {
    // ----- Datos personales: los mismos que se editan en el perfil -----
    const errorDatos = this.#validarDatosPersonales(d, null);
    if (errorDatos !== null) {
      return errorDatos;
    }

    // ----- Contraseña y confirmación -----
    const errorContrasena = this.#validarContrasena(d.contrasena, d.confirmacion);
    if (errorContrasena !== null) {
      return errorContrasena;
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

  // Revisa documento, nombre, celular, correo y usuario.
  // La usan el registro (clienteEditado = null), el perfil y el administrador
  // (clienteEditado = el cliente que se edita: su propio documento y su
  // propio usuario no cuentan como repetidos).
  #validarDatosPersonales(d, clienteEditado) {
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
    const mismoDocumento = this.#clientes.find(
      (c) => c.tipoDocumento === d.tipoDocumento && c.identificacion === d.identificacion
    );
    if (mismoDocumento !== undefined && mismoDocumento !== clienteEditado) {
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
    // El nombre del administrador está reservado
    const mismoUsuario = this.buscarPorUsuario(d.usuario);
    if ((mismoUsuario !== null && mismoUsuario !== clienteEditado) || d.usuario === USUARIO_ADMINISTRADOR) {
      return crearRespuesta("error", "Ese nombre de usuario ya está en uso. Elige otro.");
    }

    return null; // datos personales correctos
  }

  // ---------- Regla de contraseña: la usan el registro y el perfil ----------

  // Revisa una contraseña nueva y su confirmación.
  // Devuelve una respuesta de error, o null si sirve.
  #validarContrasena(contrasena, confirmacion) {
    if (contrasena === "") {
      return crearRespuesta("error", "Ingresa una contraseña.");
    }
    if (/\s/.test(contrasena)) {
      return crearRespuesta("error", "La contraseña no puede tener espacios.");
    }
    if (contrasena.length < MIN_CARACTERES_CONTRASENA) {
      return crearRespuesta(
        "error",
        "La contraseña debe tener al menos " + MIN_CARACTERES_CONTRASENA + " caracteres."
      );
    }
    if (!/[A-Za-zÁÉÍÓÚÜÑáéíóúüñ]/.test(contrasena) || !/\d/.test(contrasena)) {
      return crearRespuesta("error", "La contraseña debe tener al menos una letra y un número.");
    }
    if (confirmacion !== contrasena) {
      return crearRespuesta("error", "Las contraseñas no coinciden.");
    }
    return null;
  }

  // ---------- Perfil: editar datos ----------

  /**
   * El cliente que inició sesión modifica sus propios datos personales.
   * datos: { tipoDocumento, identificacion, nombreCompleto, celular, correo, usuario }
   * Devuelve: crearRespuesta(...)
   */
  actualizarPerfil(datos) {
    if (this.#clienteActivo === null) {
      return crearRespuesta("error", "Inicia sesión para cambiar tus datos.");
    }
    return this.#editarCliente(this.#clienteActivo, datos, "Tus datos se guardaron correctamente.");
  }

  // Privado: lo comparten el perfil (actualizarPerfil) y el administrador
  // (editarCliente). Limpia y valida igual que el registro; las cuentas y
  // la contraseña no se tocan aquí.
  #editarCliente(cliente, datos, mensajeExito) {
    const limpios = this.#normalizarDatosRegistro(datos);
    const error = this.#validarDatosPersonales(limpios, cliente);
    if (error !== null) {
      return error;
    }
    cliente.actualizarDatos(limpios);
    this.guardar();
    return crearRespuesta("exito", mensajeExito, { usuario: cliente.usuario });
  }

  // ---------- Perfil: cambiar contraseña ----------

  /**
   * Cambia la contraseña del cliente que inició sesión.
   * Flujo del enunciado: usuario -> clave actual -> clave nueva -> confirmación.
   * Los fallos de usuario o clave actual cuentan como intentos fallidos,
   * igual que en el inicio de sesión: al tercero se bloquea la cuenta y
   * se cierra la sesión.
   * Devuelve: crearRespuesta(tipo, mensaje, datos)
   *   datos = { intentosRestantes } tras un fallo, o { sesionCerrada: true }
   *   cuando el fallo bloqueó la cuenta.
   */
  cambiarContrasena(usuario, contrasenaActual, nueva, confirmacion) {
    // Paso 1: tiene que haber una sesión abierta
    const cliente = this.clienteActivo;
    if (cliente === null) {
      return crearRespuesta("error", "Inicia sesión para cambiar tus datos.");
    }

    const textoUsuario = String(usuario || "").trim().toLowerCase();
    const textoActual = String(contrasenaActual || "");

    // Paso 2: campos vacíos. No cuenta como intento fallido.
    if (textoUsuario === "" || textoActual === "") {
      return crearRespuesta("error", "Ingresa tu usuario y tu contraseña actual.");
    }

    // Paso 3: confirmar que quien escribe es el dueño de la cuenta.
    // El usuario debe ser el de la sesión abierta.
    if (textoUsuario !== cliente.usuario || !cliente.verificarContrasena(textoActual)) {
      cliente.registrarIntentoFallido();
      this.guardar();

      if (cliente.estaBloqueado()) {
        this.cerrarSesion();
        return crearRespuesta(
          "error",
          "Demasiados intentos fallidos. Tu cuenta quedó bloqueada por " + MINUTOS_BLOQUEO +
            " minutos y se cerró la sesión.",
          { sesionCerrada: true }
        );
      }

      const restantes = MAX_INTENTOS - cliente.intentosFallidos;
      return crearRespuesta(
        "error",
        "Usuario o contraseña actual incorrectos. Intentos restantes: " + restantes + ".",
        { intentosRestantes: restantes }
      );
    }

    // Paso 4: mismas reglas que en el registro.
    // La contraseña NO se limpia: un espacio es un error que hay que avisar.
    const textoNueva = String(nueva || "");
    const error = this.#validarContrasena(textoNueva, String(confirmacion || ""));
    if (error !== null) {
      return error;
    }
    if (textoNueva === textoActual) {
      return crearRespuesta("error", "La contraseña nueva debe ser distinta de la actual.");
    }

    // Paso 5: todo bien. Se guarda la contraseña nueva y se reinician los intentos.
    cliente.cambiarContrasena(textoActual, textoNueva);
    cliente.reiniciarIntentos();
    this.guardar(); // para que el cambio siga aunque se recargue la página
    return crearRespuesta("exito", "Tu contraseña se cambió correctamente.");
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

    // Paso 2: buscar al usuario: el administrador o un cliente.
    // Si no existe, el mensaje es el MISMO que con contraseña incorrecta,
    // para no revelar qué usuarios existen.
    // POLIMORFISMO: desde aquí "cliente" puede ser un Cliente o el
    // Administrador; los dos son Usuario y responden a los mismos métodos.
    const cliente = textoUsuario.toLowerCase() === USUARIO_ADMINISTRADOR
      ? this.#administrador
      : this.buscarPorUsuario(textoUsuario);
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

    // Paso 5: todo bien. Se reinicia el contador y se abre la sesión
    // del tipo que corresponda.
    cliente.reiniciarIntentos();
    this.guardar();
    this.#administradorActivo = cliente.esAdministrador();
    this.#clienteActivo = cliente.esAdministrador() ? null : cliente;
    return crearRespuesta("exito", "Bienvenido, " + cliente.nombreCompleto + ".", {
      intentosRestantes: MAX_INTENTOS,
      esAdministrador: cliente.esAdministrador(),
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
    this.#clienteActivo = null;
    this.#administradorActivo = false;
  }

  // ---------- Administración de clientes (CRUD) ----------
  // Todos estos métodos exigen que haya iniciado sesión el administrador.

  // Lista de clientes como objetos simples (copias): quien la recibe no
  // puede modificar a los clientes ni a sus cuentas.
  listarClientes() {
    if (!this.#administradorActivo) {
      return [];
    }
    return this.#clientes.map((cliente) => ({
      usuario: cliente.usuario,
      nombreCompleto: cliente.nombreCompleto,
      tipoDocumento: cliente.tipoDocumento,
      identificacion: cliente.identificacion,
      celular: cliente.celular,
      correo: cliente.correo,
      bloqueado: cliente.estaBloqueado(),
      cuentas: cliente.cuentas.map((cuenta) => ({
        tipo: cuenta.tipo,
        numero: cuenta.numero,
        saldo: cuenta.saldo,
      })),
    }));
  }

  // CREAR: usa exactamente el mismo registro y las mismas validaciones.
  agregarCliente(datos) {
    if (!this.#administradorActivo) {
      return crearRespuesta("error", "Solo el administrador puede agregar clientes.");
    }
    const respuesta = this.registrarCliente(datos);
    if (respuesta.tipo !== "exito") {
      return respuesta;
    }
    return crearRespuesta("exito", "Cliente " + respuesta.datos.usuario + " agregado.", respuesta.datos);
  }

  // EDITAR: mismos campos y reglas que el perfil del cliente.
  editarCliente(usuario, datos) {
    if (!this.#administradorActivo) {
      return crearRespuesta("error", "Solo el administrador puede editar clientes.");
    }
    const cliente = this.buscarPorUsuario(usuario);
    if (cliente === null) {
      return crearRespuesta("error", "No existe un cliente con ese usuario.");
    }
    return this.#editarCliente(cliente, datos, "Datos de " + cliente.nombreCompleto + " actualizados.");
  }

  // Quita el bloqueo por intentos fallidos.
  desbloquearCliente(usuario) {
    if (!this.#administradorActivo) {
      return crearRespuesta("error", "Solo el administrador puede desbloquear clientes.");
    }
    const cliente = this.buscarPorUsuario(usuario);
    if (cliente === null) {
      return crearRespuesta("error", "No existe un cliente con ese usuario.");
    }
    if (!cliente.estaBloqueado()) {
      return crearRespuesta("advertencia", "La cuenta de " + cliente.nombreCompleto + " no está bloqueada.");
    }
    cliente.reiniciarIntentos();
    this.guardar();
    return crearRespuesta("exito", "Se desbloqueó la cuenta de " + cliente.nombreCompleto + ".");
  }

  // ELIMINAR: solo si todas sus cuentas están en $0 y la tarjeta no tiene
  // deuda, para no hacer desaparecer dinero. La confirmación la pide la interfaz.
  eliminarCliente(usuario) {
    if (!this.#administradorActivo) {
      return crearRespuesta("error", "Solo el administrador puede eliminar clientes.");
    }
    const cliente = this.buscarPorUsuario(usuario);
    if (cliente === null) {
      return crearRespuesta("error", "No existe un cliente con ese usuario.");
    }

    const cuentaConSaldo = cliente.cuentas.find((cuenta) => cuenta.saldo !== 0);
    if (cuentaConSaldo !== undefined) {
      const detalle = cuentaConSaldo.tipo === TIPO_TARJETA
        ? "una deuda de " + formatearMoneda(cuentaConSaldo.deuda) + " en la tarjeta de crédito"
        : formatearMoneda(cuentaConSaldo.saldo) + " en su " + nombreProducto(cuentaConSaldo.tipo).toLowerCase();
      return crearRespuesta(
        "error",
        "No se puede eliminar a " + cliente.nombreCompleto + ": tiene " + detalle +
          ". Todas sus cuentas deben quedar en $0."
      );
    }

    this.#clientes = this.#clientes.filter((c) => c !== cliente);
    this.guardar();
    return crearRespuesta("exito", "Cliente " + cliente.nombreCompleto + " eliminado.");
  }

  // ---------- Cuentas ----------

  // Privado: crea una CuentaAhorros, CuentaCorriente o TarjetaCredito con un
  // número nuevo. Solo Banco crea cuentas, así los números nunca se repiten.
  #crearCuenta(tipo) {
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

  // Busca una cuenta de ahorros o corriente y devuelve solo los datos
  // necesarios para identificar al destinatario antes de transferir.
  consultarDestinoTransferencia(numeroDestino) {
    if (this.clienteActivo === null) {
      return crearRespuesta("error", "Inicia sesión para consultar el destinatario.");
    }

    const destino = this.#buscarCuentaDestino(numeroDestino);
    if (destino.tipo !== "exito") {
      return destino;
    }

    return crearRespuesta(
      "exito",
      "Destinatario encontrado.",
      {
        numero: destino.datos.cuenta.numero,
        tipoCuenta: destino.datos.cuenta.tipo,
        // Por privacidad solo se muestra el nombre y la inicial del apellido
        // ("Ana R."). Si la cuenta es del mismo cliente, se muestra completo.
        nombreDestinatario: destino.datos.cliente === this.clienteActivo
          ? destino.datos.cliente.nombreCompleto
          : this.#nombreParcial(destino.datos.cliente.nombreCompleto),
        esMismoUsuario: destino.datos.cliente === this.clienteActivo,
      }
    );
  }

  // "Ana María Ruiz Gómez" -> "Ana R.": primer nombre e inicial del apellido.
  // Se toma como apellido la penúltima palabra si hay cuatro o más
  // (dos nombres y dos apellidos); si no, la segunda.
  #nombreParcial(nombreCompleto) {
    const partes = nombreCompleto.split(" ");
    const apellido = partes.length >= 4 ? partes[partes.length - 2] : partes[1];
    return partes[0] + " " + apellido.charAt(0).toUpperCase() + ".";
  }

  // Transfiere desde una cuenta del cliente activo a cualquier cuenta bancaria.
  transferir(origen, numeroDestino, monto) {
    if (this.clienteActivo === null) {
      return crearRespuesta("error", "Inicia sesión para hacer transferencias.");
    }
    if (!this.clienteActivo.cuentas.includes(origen)) {
      return crearRespuesta("error", "La cuenta de origen no pertenece al cliente activo.");
    }

    const busqueda = this.#buscarCuentaDestino(numeroDestino);
    if (busqueda.tipo !== "exito") {
      return busqueda;
    }

    const destino = busqueda.datos.cuenta;
    const respuesta = origen.transferirA(destino, monto);
    if (respuesta.tipo === "exito") {
      this.guardar();
    }
    return respuesta;
  }

  #buscarCuentaDestino(numeroDestino) {
    const numeroBuscado = String(numeroDestino || "").trim();
    if (!/^\d{6}$/.test(numeroBuscado)) {
      return crearRespuesta("error", "Ingresa un número de cuenta válido de 6 dígitos.");
    }

    for (const cliente of this.#clientes) {
      const cuenta = cliente.cuentas.find((producto) => producto.numero === numeroBuscado);
      if (cuenta !== undefined) {
        if (cuenta.tipo === TIPO_TARJETA) {
          return crearRespuesta("error", "Las transferencias solo están disponibles entre cuentas de ahorros y corriente.");
        }
        return crearRespuesta("exito", "Cuenta encontrada.", { cuenta, cliente });
      }
    }
    return crearRespuesta("error", "No encontramos una cuenta con ese número.");
  }

  // ---------- Almacenamiento (localStorage) ----------

  // Guarda todos los clientes y sus cuentas en el navegador.
  // La sesión (clienteActivo) NO se guarda: al recargar hay que volver a entrar.
  // Se llama después de cada cambio: registro, intentos de login, cambio de
  // contraseña en el perfil y, desde la interfaz, después de cada
  // consignación, retiro, compra o pago exitoso.
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
  // El constructor de Cliente recupera también los intentos y el bloqueo.
  #reconstruirCliente(datos) {
    const cuentas = datos.cuentas.map((d) => this.#reconstruirCuenta(d));
    return new Cliente(datos, cuentas);
  }

  // Crea la clase correcta según el tipo guardado. Cada constructor recibe
  // los datos guardados y recupera su saldo, sus movimientos y, si es
  // tarjeta, su cupo y sus compras.
  #reconstruirCuenta(datos) {
    if (datos.tipo === "ahorros") {
      return new CuentaAhorros(datos.numero, datos);
    }
    if (datos.tipo === "corriente") {
      return new CuentaCorriente(datos.numero, datos);
    }
    return new TarjetaCredito(datos.numero, datos.cupo, datos);
  }
}
