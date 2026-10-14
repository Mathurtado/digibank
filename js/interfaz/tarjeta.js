// =============================================================
// interfaz/tarjeta.js — Tarjeta de crédito: resumen, compras en cuotas
// y pagos. Ramas 38 a 41. Responsable: Sebastián.
//
// Siempre trabaja con la tarjeta del cliente activo, sin importar qué
// cuenta esté elegida en el selector del panel.
// =============================================================

function inicializarTarjeta() {
  const vista = document.getElementById("vista-tarjeta");
  const selectorCuotas = document.getElementById("tarjeta-cuotas");
  const campoMonto = document.getElementById("tarjeta-monto");
  const campoDescripcion = document.getElementById("tarjeta-descripcion");
  const campoPago = document.getElementById("tarjeta-pago-monto");
  const textoSimulacion = document.getElementById("tarjeta-simulacion");

  // Opciones de cuotas: de MIN_CUOTAS_TARJETA a MAX_CUOTAS_TARJETA
  for (let cuotas = MIN_CUOTAS_TARJETA; cuotas <= MAX_CUOTAS_TARJETA; cuotas++) {
    const opcion = document.createElement("option");
    opcion.value = String(cuotas);
    opcion.textContent = cuotas === 1 ? "1 cuota" : cuotas + " cuotas";
    selectorCuotas.appendChild(opcion);
  }

  function obtenerTarjeta() {
    if (banco.clienteActivo === null) {
      return null;
    }
    return banco.clienteActivo.obtenerCuenta(TIPO_TARJETA);
  }

  // Llena el resumen y la lista de compras
  function mostrarTarjeta() {
    const tarjeta = obtenerTarjeta();
    const tieneTarjeta = tarjeta !== null;
    document.getElementById("tarjeta-sin-tarjeta").classList.toggle("oculto", tieneTarjeta);
    document.getElementById("tarjeta-contenido").classList.toggle("oculto", !tieneTarjeta);
    if (!tieneTarjeta) {
      return;
    }

    document.getElementById("tarjeta-cupo").textContent = formatearMoneda(tarjeta.cupo);
    document.getElementById("tarjeta-deuda").textContent = formatearMoneda(tarjeta.deuda);
    document.getElementById("tarjeta-disponible").textContent = formatearMoneda(tarjeta.limiteRetiro());
    document.getElementById("tarjeta-pago-mensual").textContent = formatearMoneda(tarjeta.pagoMensualEstimado());

    const lista = document.getElementById("tarjeta-compras");
    lista.innerHTML = "";
    const compras = tarjeta.obtenerCompras();
    if (compras.length === 0) {
      const vacio = document.createElement("li");
      vacio.className = "movimiento-vacio";
      vacio.textContent = "Todavía no hay compras.";
      lista.appendChild(vacio);
      return;
    }

    compras.forEach((compra) => {
      const item = document.createElement("li");
      item.className = "movimiento movimiento-salida";

      const fecha = document.createElement("span");
      fecha.className = "movimiento-fecha";
      fecha.textContent = compra.fecha.toLocaleString("es-CO");

      const descripcion = document.createElement("span");
      descripcion.className = "movimiento-tipo";
      descripcion.textContent = compra.descripcion;

      const valor = document.createElement("span");
      valor.className = "movimiento-valor";
      valor.textContent = formatearMoneda(compra.monto);

      const detalle = document.createElement("span");
      detalle.className = "movimiento-saldo";
      detalle.textContent = compra.cuotas + " x " + formatearMoneda(compra.cuotaMensual);

      item.append(fecha, descripcion, valor, detalle);
      lista.appendChild(item);
    });
  }

  // Muestra la cuota mientras el cliente escribe el monto o cambia las cuotas
  function mostrarSimulacion() {
    const tarjeta = obtenerTarjeta();
    const monto = convertirMonto(campoMonto.value);
    if (tarjeta === null || Number.isNaN(monto)) {
      textoSimulacion.textContent = "";
      return;
    }
    const simulacion = tarjeta.simularCompra(monto, Number(selectorCuotas.value));
    textoSimulacion.textContent = simulacion.mensaje;
  }

  campoMonto.addEventListener("input", mostrarSimulacion);
  selectorCuotas.addEventListener("change", mostrarSimulacion);

  // Comprar
  document.getElementById("tarjeta-compra-formulario").addEventListener("submit", (evento) => {
    evento.preventDefault();
    const tarjeta = obtenerTarjeta();
    if (tarjeta === null) {
      mostrarMensaje(crearRespuesta("error", "No tienes tarjeta de crédito."));
      return;
    }

    const respuesta = tarjeta.comprar(
      convertirMonto(campoMonto.value),
      Number(selectorCuotas.value),
      campoDescripcion.value
    );
    mostrarMensaje(respuesta);
    if (respuesta.tipo === "exito") {
      campoMonto.value = "";
      campoDescripcion.value = "";
      textoSimulacion.textContent = "";
    }
    mostrarTarjeta();
  });

  // Pagar
  document.getElementById("tarjeta-pago-formulario").addEventListener("submit", (evento) => {
    evento.preventDefault();
    const tarjeta = obtenerTarjeta();
    if (tarjeta === null) {
      mostrarMensaje(crearRespuesta("error", "No tienes tarjeta de crédito."));
      return;
    }

    const respuesta = tarjeta.consignar(convertirMonto(campoPago.value));
    mostrarMensaje(respuesta);
    if (respuesta.tipo === "exito") {
      campoPago.value = "";
    }
    mostrarTarjeta();
  });

  // Actualizar cada vez que se abre la vista
  new MutationObserver(() => {
    if (!vista.classList.contains("oculto")) {
      mostrarTarjeta();
    }
  }).observe(vista, { attributes: true, attributeFilter: ["class"] });
}
