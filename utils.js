// utils.js
window.nombreTienda = "miTiendita";

window.formatearMoneda = (valor) => {
  return new Intl.NumberFormat("es-MX", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }).format(valor);
};

window.utils = { formatearDinero };

window.obtenerCotizacionActual = () => {
  const productos = [];

  document.querySelectorAll("#tablaProductos tbody tr").forEach(row => {
    productos.push({
      desc: row.querySelector(".desc").value,
      qty: row.querySelector(".qty").value,
      price: row.querySelector(".price").value,
      total: row.querySelector(".rowTotal").textContent
    });
  });

  return {
    cliente: {
      nombre: document.getElementById("clienteNombre").value,
      telefono: document.getElementById("clienteTelefono").value,
      empresa: document.getElementById("clienteEmpresa").value
    },
    productos,
    totales: {
      subtotal: document.getElementById("subtotal").textContent,
      iva: document.getElementById("iva").textContent,
      total: document.getElementById("total").textContent
    },
    fecha: new Date().toISOString()
  };
};

