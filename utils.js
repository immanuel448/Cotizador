// utils.js
window.nombreTienda = "miTiendita";

function formatearDinero(valor) {
  return parseFloat(valor).toFixed(2);
}

window.utils = { formatearDinero };