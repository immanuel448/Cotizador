// utils.js
window.nombreTienda = "miTiendita";

window.formatearMoneda = (valor) => {
  return new Intl.NumberFormat("es-MX", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }).format(valor);
};

window.utils = { formatearDinero };