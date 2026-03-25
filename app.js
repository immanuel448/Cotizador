const tabla = document.querySelector("#tablaProductos tbody");
const subtotalEl = document.getElementById("subtotal");
const ivaEl = document.getElementById("iva");
const totalEl = document.getElementById("total");

document.getElementById("addRow").addEventListener("click", addRow);

document.getElementById("tienda").textContent = window.nombreTienda;

function addRow() {
  const row = document.createElement("tr");

  row.innerHTML = `
    <td><input type="text" class="desc"></td>
    <td><input type="number" class="qty" value="1"></td>
    <td><input type="number" class="price" value="0"></td>
    <td class="rowTotal">0</td>
    <td><button class="btnDelete">X</button></td>
  `;

  tabla.appendChild(row);

  // 🔹 recalcular totales al cambiar inputs
  row.querySelectorAll("input").forEach((input) => {
    input.addEventListener("input", updateTotals);
  });

  // 🔹 eliminar fila
  row.querySelector(".btnDelete").addEventListener("click", () => {
    row.remove();
    updateTotals();
  });
}

function updateTotals() {
  let subtotal = 0;

  document.querySelectorAll("#tablaProductos tbody tr").forEach((row) => {
    const qty = parseFloat(row.querySelector(".qty").value) || 0;
    const price = parseFloat(row.querySelector(".price").value) || 0;

    const total = qty * price;
    row.querySelector(".rowTotal").textContent = window.formatearMoneda(total);

    subtotal += total;
  });

  const iva = subtotal * 0.16;
  const total = subtotal + iva;

  subtotalEl.textContent = window.formatearMoneda(subtotal);
  ivaEl.textContent = window.formatearMoneda(iva);
  totalEl.textContent = window.formatearMoneda(total);
}

// inicial
addRow();

function validarFormulario() {
  const nombre = document.getElementById("clienteNombre").value.trim();
  const telefono = document.getElementById("clienteTelefono").value.trim();

  if (!nombre) {
    alert("Falta nombre");
    return false;
  }

  if (!/^\d{10}$/.test(telefono)) {
    alert("Teléfono inválido (10 dígitos)");
    return false;
  }

  const totalNumero = parseFloat(totalEl.textContent.replace(/,/g, "")) || 0;

  if (totalNumero <= 0) {
    alert("Agrega al menos un producto válido");
    return false;
  }

  return true;
}

document.getElementById("btnWA").addEventListener("click", () => {
  if (!validarFormulario()) return;

  const nombre = document.getElementById("clienteNombre").value;
  const telefonoRaw = document.getElementById("clienteTelefono").value;
  const total = totalEl.textContent;

  // convertir a formato internacional (México)
  const telefono = "521" + telefonoRaw;

  // 🔹 construir detalle de productos
  let detalle = "";

  document.querySelectorAll("#tablaProductos tbody tr").forEach((row) => {
    const desc = row.querySelector(".desc").value;
    const qty = row.querySelector(".qty").value;
    const totalRow = row.querySelector(".rowTotal").textContent;

    if (desc) {
      detalle += `• ${desc} x${qty} = $${totalRow}\n`;
    }
  });

  // 🔹 mensaje completo
  const mensaje = `Hola ${nombre},

Gracias por cotizar en ${window.nombreTienda}.

Detalle:
${detalle}
Total: $${total}`;

  const url = `https://wa.me/${telefono}?text=${encodeURIComponent(mensaje)}`;

  window.open(url, "_blank");
});

document.getElementById("btnLimpiar").addEventListener("click", () => {
  // Limpiar inputs del cliente
  document.getElementById("clienteNombre").value = "";
  document.getElementById("clienteTelefono").value = "";
  document.getElementById("clienteEmpresa").value = "";

  // Limpiar tabla de productos
  tabla.innerHTML = "";

  // Reiniciar totales
  subtotalEl.textContent = "0.00";
  ivaEl.textContent = "0.00";
  totalEl.textContent = "0.00";

  // Agregar fila inicial vacía
  addRow();
});

document
  .getElementById("btnGuardar")
  .addEventListener("click", guardarCotizacion);

function guardarCotizacion() {
  if (!validarFormulario()) return;

  const cotizacion = window.obtenerCotizacionActual();

  let historial = JSON.parse(localStorage.getItem("cotizaciones")) || [];

  historial.push(cotizacion);

  localStorage.setItem("cotizaciones", JSON.stringify(historial));

  alert("Cotización guardada");
}

function renderHistorial() {
  const contenedor = document.getElementById("historial");
  const historial = JSON.parse(localStorage.getItem("cotizaciones")) || [];

  contenedor.innerHTML = "";

  historial.forEach((cot, index) => {
    const div = document.createElement("div");
    div.style.borderBottom = "1px solid #ccc";
    div.style.padding = "8px 0";

    div.innerHTML = `
      <strong>${cot.cliente.nombre}</strong> - $${cot.totales.total}
      <button data-index="${index}" class="btnCargar">Cargar</button>
      <button data-index="${index}" class="btnEliminar">X</button>
    `;

    contenedor.appendChild(div);
  });
}

document.addEventListener("click", (e) => {
  if (e.target.classList.contains("btnCargar")) {
    const index = e.target.dataset.index;
    const historial = JSON.parse(localStorage.getItem("cotizaciones")) || [];
    const cot = historial[index];

    // Cliente
    document.getElementById("clienteNombre").value = cot.cliente.nombre;
    document.getElementById("clienteTelefono").value = cot.cliente.telefono;
    document.getElementById("clienteEmpresa").value = cot.cliente.empresa;

    // Productos
    tabla.innerHTML = "";

    cot.productos.forEach(p => {
      addRow();
      const lastRow = tabla.lastChild;

      lastRow.querySelector(".desc").value = p.desc;
      lastRow.querySelector(".qty").value = p.qty;
      lastRow.querySelector(".price").value = p.price;
    });

    updateTotals();
  }
});

document.addEventListener("click", (e) => {
  if (e.target.classList.contains("btnEliminar")) {
    const index = e.target.dataset.index;
    let historial = JSON.parse(localStorage.getItem("cotizaciones")) || [];

    historial.splice(index, 1);

    localStorage.setItem("cotizaciones", JSON.stringify(historial));
    renderHistorial();
  }
});

function guardarCotizacion() {
  if (!validarFormulario()) return;

  const cotizacion = window.obtenerCotizacionActual();

  let historial = JSON.parse(localStorage.getItem("cotizaciones")) || [];
  historial.push(cotizacion);

  localStorage.setItem("cotizaciones", JSON.stringify(historial));

  renderHistorial(); // 🔥 actualizar vista
  alert("Cotización guardada");
}

renderHistorial();

