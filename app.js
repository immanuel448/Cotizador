const tabla = document.querySelector("#tablaProductos tbody");
const subtotalEl = document.getElementById("subtotal");
const ivaEl = document.getElementById("iva");
const totalEl = document.getElementById("total");
let indiceEdicion = null;

document.getElementById("addRow").addEventListener("click", addRow);
document.getElementById("tienda").textContent = window.nombreTienda;

// ---------------------
// AGREGAR FILA
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
// CALCULAR TOTALES
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
}

// inicial
addRow();

// ---------------------
// VALIDACIÓN
// ---------------------
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

// ---------------------
// WHATSAPP
// ---------------------
document.getElementById("btnWA").addEventListener("click", () => {
  if (!validarFormulario()) return;

  const nombre = document.getElementById("clienteNombre").value;
  const telefonoRaw = document.getElementById("clienteTelefono").value;
  const empresa = document.getElementById("clienteEmpresa").value;
  const total = totalEl.textContent;

  const telefono = "521" + telefonoRaw;

  let detalle = "";

  document.querySelectorAll("#tablaProductos tbody tr").forEach((row) => {
    const desc = row.querySelector(".desc").value;
    const qty = row.querySelector(".qty").value;
    const totalRow = row.querySelector(".rowTotal").textContent;

    if (desc) {
      detalle += `• ${desc} (x${qty}) = $${totalRow}\n`;
    }
  });

  const mensaje = `Hola ${nombre},

Gracias por cotizar en ${window.nombreTienda}.
${empresa ? `Empresa: ${empresa}\n` : ""}

Detalle:
${detalle}
Total: $${total}

Quedo atento a cualquier duda.`;

  const url = `https://wa.me/${telefono}?text=${encodeURIComponent(mensaje)}`;

  window.open(url, "_blank");
});

// ---------------------
// LIMPIAR
// ---------------------
document.getElementById("btnLimpiar").addEventListener("click", () => {
  if (!confirm("¿Seguro que quieres limpiar la cotización?")) return;

  document.getElementById("clienteNombre").value = "";
  document.getElementById("clienteTelefono").value = "";
  document.getElementById("clienteEmpresa").value = "";

  tabla.innerHTML = "";

  subtotalEl.textContent = "0.00";
  ivaEl.textContent = "0.00";
  totalEl.textContent = "0.00";

  indiceEdicion = null;

  indiceEdicion = null;
  document.getElementById("modoEdicion").style.display = "none";
  document.getElementById("btnGuardar").textContent = "Guardar";

  addRow();
});

// ---------------------
// GUARDAR
// ---------------------
document
  .getElementById("btnGuardar")
  .addEventListener("click", guardarCotizacion);

function guardarCotizacion() {
  if (!validarFormulario()) return;

  const cotizacion = window.obtenerCotizacionActual();
  let historial = JSON.parse(localStorage.getItem("cotizaciones")) || [];

  if (indiceEdicion !== null) {
    // EDITAR
    cotizacion.folio = historial[indiceEdicion].folio;
    historial[indiceEdicion] = cotizacion;
  } else {
    // NUEVO
    cotizacion.folio = window.obtenerSiguienteFolio();
    historial.push(cotizacion);
  }

  localStorage.setItem("cotizaciones", JSON.stringify(historial));

  // RESET estado edición (AQUÍ VA)
  indiceEdicion = null;
  document.getElementById("modoEdicion").style.display = "none";
  document.getElementById("btnGuardar").textContent = "Guardar";

  renderHistorial();
  alert("Cotización guardada");
}

// ---------------------
// RENDER HISTORIAL (ÚNICA)
// ---------------------
function renderHistorial(filtro = "") {
  const contenedor = document.getElementById("historial");
  if (!contenedor) return;

  let historial = JSON.parse(localStorage.getItem("cotizaciones")) || [];

  // invertir orden (como ya lo tenías)
  historial.reverse();

  contenedor.innerHTML = "";

  const texto = filtro.toLowerCase();

  historial.forEach((cot, index) => {
    // 🔹 filtro
    const match =
      cot.cliente.nombre.toLowerCase().includes(texto) ||
      (cot.cliente.empresa || "").toLowerCase().includes(texto) ||
      String(cot.folio || "").includes(texto);

    if (!match) return;

    // 🔹 índice real (IMPORTANTE con reverse)
    const realIndex = historial.length - 1 - index;

    const div = document.createElement("div");

    div.style.borderBottom = "1px solid #ccc";
    div.style.padding = "8px 0";

    // 🔹 resaltar el más reciente
    if (index === 0) {
      div.style.backgroundColor = "#eef6ff";
      div.style.borderRadius = "6px";
      div.style.padding = "8px";
    }

    const fecha = new Date(cot.fecha).toLocaleDateString();

    div.innerHTML = `
      <div style="display:flex; justify-content:space-between; font-weight:bold;">
        <span>Folio #${cot.folio || "-"}</span>
        <span>${fecha}</span>
      </div>

      <div style="display:flex; justify-content:space-between; align-items:center; margin-top:4px;">
        <span>${cot.cliente.nombre} | $${cot.totales.total}</span>
        
        <div style="display:flex; gap:6px;">
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

  // CARGAR
  if (e.target.classList.contains("btnCargar")) {
    const index = parseInt(e.target.dataset.index); // éste ya es realIndex
    const cot = historial[index];
    indiceEdicion = index;

    if (!cot) return; // protección

    document.getElementById("clienteNombre").value = cot.cliente.nombre;
    document.getElementById("clienteTelefono").value = cot.cliente.telefono;
    document.getElementById("clienteEmpresa").value = cot.cliente.empresa;
    document.getElementById("modoEdicion").style.display = "block";
    document.getElementById("folioEdicion").textContent = `#${cot.folio}`;
    document.getElementById("btnGuardar").textContent = "Actualizar";

    tabla.innerHTML = "";

    cot.productos.forEach((p) => {
      addRow();
      const lastRow = tabla.lastChild;

      lastRow.querySelector(".desc").value = p.desc;
      lastRow.querySelector(".qty").value = p.qty;
      lastRow.querySelector(".price").value = p.price;
    });

    updateTotals();
  }

  // ELIMINAR
  if (e.target.classList.contains("btnEliminar")) {
    const index = parseInt(e.target.dataset.index);

    if (!confirm("¿Eliminar esta cotización?")) return;

    historial.splice(index, 1);

    localStorage.setItem("cotizaciones", JSON.stringify(historial));
    renderHistorial();
  }
});

// ---------------------
// INICIALIZAR HISTORIAL
// ---------------------
renderHistorial();

//exportar e importar

document.getElementById("btnExportar").addEventListener("click", () => {
  const historial = localStorage.getItem("cotizaciones");

  if (!historial) {
    alert("No hay datos");
    return;
  }

  const blob = new Blob([historial], { type: "application/json" });
  const url = URL.createObjectURL(blob);

  const a = document.createElement("a");
  a.href = url;
  a.download = "cotizaciones.json";
  a.click();

  URL.revokeObjectURL(url);
});

document.getElementById("btnImportar").addEventListener("click", () => {
  document.getElementById("fileImportar").click();
});

document.getElementById("fileImportar").addEventListener("change", (e) => {
  const file = e.target.files[0];
  if (!file) return;

  const reader = new FileReader();

  reader.onload = (event) => {
    try {
      const data = JSON.parse(event.target.result);

      if (!Array.isArray(data)) {
        alert("Archivo inválido");
        return;
      }

      const actual = JSON.parse(localStorage.getItem("cotizaciones")) || [];

      const combinado = [...actual];

      data.forEach((nueva) => {
        const existe = actual.some(
          (c) =>
            c.fecha === nueva.fecha &&
            c.cliente.nombre === nueva.cliente.nombre,
        );

        if (!existe) {
          combinado.push(nueva);
        }
      });

      localStorage.setItem("cotizaciones", JSON.stringify(combinado));
      renderHistorial();

      alert("Importado correctamente");
    } catch {
      alert("Error al importar");
    }
  };

  reader.readAsText(file);
});

document.getElementById("buscador").addEventListener("input", (e) => {
  renderHistorial(e.target.value);
});
