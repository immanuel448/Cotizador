// ---------------------
// INIT BASE
// ---------------------
const tabla = document.querySelector("#tablaProductos tbody");
const subtotalEl = document.getElementById("subtotal");
const ivaEl = document.getElementById("iva");
const totalEl = document.getElementById("total");

let indiceEdicion = null;

document.getElementById("tienda").textContent = window.nombreTienda;

// ---------------------
// UTILIDADES (PRIMERO)
// ---------------------
function debounce(fn, delay = 500) {
  let timeout;
  return (...args) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => fn(...args), delay);
  };
}

function guardarBorrador() {
  const cotizacion = window.obtenerCotizacionActual();
  localStorage.setItem("borrador", JSON.stringify(cotizacion));
}

const guardarBorradorDebounced = debounce(guardarBorrador, 500);

function cargarBorrador() {
  const data = JSON.parse(localStorage.getItem("borrador"));
  if (!data) return;

  document.getElementById("clienteNombre").value = data.cliente.nombre || "";
  document.getElementById("clienteTelefono").value = data.cliente.telefono || "";
  document.getElementById("clienteEmpresa").value = data.cliente.empresa || "";

  tabla.innerHTML = "";

  data.productos.forEach((p) => {
    addRow();
    const lastRow = tabla.lastChild;

    lastRow.querySelector(".desc").value = p.desc;
    lastRow.querySelector(".qty").value = p.qty;
    lastRow.querySelector(".price").value = p.price;
  });

  updateTotals();
}

// ---------------------
// EVENTOS INICIALES
// ---------------------
document.getElementById("addRow").addEventListener("click", addRow);

// autoguardado cliente
["clienteNombre", "clienteTelefono", "clienteEmpresa"].forEach((id) => {
  document.getElementById(id).addEventListener("input", guardarBorradorDebounced);
});

// ---------------------
// FILAS
// ---------------------
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

  row.querySelectorAll("input").forEach((input) => {
    input.addEventListener("input", updateTotals);
  });

  row.querySelector(".btnDelete").addEventListener("click", () => {
    row.remove();
    updateTotals();
  });
}

// ---------------------
// TOTALES
// ---------------------
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

  guardarBorradorDebounced();
}

// ---------------------
// VALIDACIÓN
// ---------------------
function validarFormulario() {
  const nombre = document.getElementById("clienteNombre").value.trim();
  const telefono = document.getElementById("clienteTelefono").value.trim();

  if (!nombre) return alert("Falta nombre"), false;
  if (!/^\d{10}$/.test(telefono)) return alert("Teléfono inválido"), false;

  const totalNumero = parseFloat(totalEl.textContent.replace(/,/g, "")) || 0;
  if (totalNumero <= 0) return alert("Agrega productos"), false;

  return true;
}

// ---------------------
// LIMPIAR
// ---------------------
document.getElementById("btnLimpiar").addEventListener("click", () => {
  if (!confirm("¿Limpiar cotización?")) return;

  document.getElementById("clienteNombre").value = "";
  document.getElementById("clienteTelefono").value = "";
  document.getElementById("clienteEmpresa").value = "";

  tabla.innerHTML = "";

  subtotalEl.textContent = "0.00";
  ivaEl.textContent = "0.00";
  totalEl.textContent = "0.00";

  indiceEdicion = null;
  document.getElementById("modoEdicion").style.display = "none";
  document.getElementById("btnGuardar").textContent = "Guardar";

  localStorage.removeItem("borrador");

  addRow();
});

// ---------------------
// GUARDAR
// ---------------------
document.getElementById("btnGuardar").addEventListener("click", guardarCotizacion);

function guardarCotizacion() {
  if (!validarFormulario()) return;

  const cotizacion = window.obtenerCotizacionActual();
  let historial = JSON.parse(localStorage.getItem("cotizaciones")) || [];

  if (indiceEdicion !== null) {
    cotizacion.folio = historial[indiceEdicion].folio;
    historial[indiceEdicion] = cotizacion;
  } else {
    cotizacion.folio = window.obtenerSiguienteFolio();
    historial.push(cotizacion);
  }

  localStorage.setItem("cotizaciones", JSON.stringify(historial));

  indiceEdicion = null;
  document.getElementById("modoEdicion").style.display = "none";
  document.getElementById("btnGuardar").textContent = "Guardar";

  renderHistorial();
  alert("Guardado");
}

// ---------------------
// HISTORIAL
// ---------------------
function renderHistorial(filtro = "") {
  const contenedor = document.getElementById("historial");
  if (!contenedor) return;

  let historial = JSON.parse(localStorage.getItem("cotizaciones")) || [];
  historial.reverse();

  contenedor.innerHTML = "";

  historial.forEach((cot, index) => {
    const realIndex = historial.length - 1 - index;

    const fecha = new Date(cot.fecha).toLocaleDateString();

    const div = document.createElement("div");

    div.innerHTML = `
      <div style="display:flex; justify-content:space-between;">
        <b>#${cot.folio}</b>
        <span>${fecha}</span>
      </div>
      <div style="display:flex; justify-content:space-between;">
        <span>${cot.cliente.nombre} | $${cot.totales.total}</span>
        <div>
          <button data-index="${realIndex}" class="btnCargar">Cargar</button>
          <button data-index="${realIndex}" class="btnEliminar">X</button>
        </div>
      </div>
    `;

    contenedor.appendChild(div);
  });
}

// ---------------------
// EVENTOS HISTORIAL
// ---------------------
document.addEventListener("click", (e) => {
  const historial = JSON.parse(localStorage.getItem("cotizaciones")) || [];

  if (e.target.classList.contains("btnCargar")) {
    const index = parseInt(e.target.dataset.index);
    const cot = historial[index];

    indiceEdicion = index;

    document.getElementById("clienteNombre").value = cot.cliente.nombre;
    document.getElementById("clienteTelefono").value = cot.cliente.telefono;
    document.getElementById("clienteEmpresa").value = cot.cliente.empresa;

    tabla.innerHTML = "";

    cot.productos.forEach((p) => {
      addRow();
      const row = tabla.lastChild;
      row.querySelector(".desc").value = p.desc;
      row.querySelector(".qty").value = p.qty;
      row.querySelector(".price").value = p.price;
    });

    updateTotals();
  }

  if (e.target.classList.contains("btnEliminar")) {
    const index = parseInt(e.target.dataset.index);

    if (!confirm("¿Eliminar?")) return;

    historial.splice(index, 1);
    localStorage.setItem("cotizaciones", JSON.stringify(historial));

    renderHistorial();
  }
});

// ---------------------
// INIT
// ---------------------
addRow();
cargarBorrador();
renderHistorial();