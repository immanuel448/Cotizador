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
  `;

  tabla.appendChild(row);

  row.querySelectorAll("input").forEach((input) => {
    input.addEventListener("input", updateTotals);
  });
}

function updateTotals() {
  let subtotal = 0;

  document.querySelectorAll("#tablaProductos tbody tr").forEach((row) => {
    const qty = parseFloat(row.querySelector(".qty").value) || 0;
    const price = parseFloat(row.querySelector(".price").value) || 0;

    const total = qty * price;
    row.querySelector(".rowTotal").textContent = total.toFixed(2);

    subtotal += total;
  });

  const iva = subtotal * 0.16;
  const total = subtotal + iva;

  subtotalEl.textContent = subtotal.toFixed(2);
  ivaEl.textContent = iva.toFixed(2);
  totalEl.textContent = total.toFixed(2);
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

  if (parseFloat(totalEl.textContent) <= 0) {
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

  const mensaje = `Hola ${nombre}, tu cotización de ${window.nombreTienda} es de $${total}`;
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
