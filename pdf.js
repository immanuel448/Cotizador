document.getElementById("btnPDF").addEventListener("click", generarPDF);

function generarPDF() {
  if (!validarFormulario()) return;

  const { jsPDF } = window.jspdf;
  const doc = new jsPDF();

  const nombre = document.getElementById("clienteNombre").value;
  const empresa = document.getElementById("clienteEmpresa").value;

  const fecha = new Date().toLocaleDateString();
  const folio = folioActual || "SIN GUARDAR";

  // LOGO (opcional)
  const logo =
    "data:image/png;base64,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LPQoRWTFFfIgsNCzNiMrrpAPgYUMtBFZcYW8CCxkYj6RFVfIj8BCRuYSWXGFPAksZKZJZMUV8iWwkKEqsv/j6z+przb626/+WFwhYwILmZqZmYk//sgV8W8/9K34/s0PxobpmXh2/XRc9aP74i3vvTje84l/rH8JkBGBhcx98cJb49XvOC+2f+3/jJ1++6w48t+fH1/71u31w4DMCCwMxMzMTExPz9THQKYEFgASEFgASEBgASABgQWABAQWABIQWABIQGABIAGBBYAEBLZlG3wQwGZmvBxkyntzc+s3eEHaJrAtu/O+X9RHo3b3A14P8uS9ubk773uyPmKeBLZl5166rj4arWfXT8cFV95RH0MWLrjyjnh2/XR9PFrnXebzrdsmsC07/Zyb4rrbHq6PR+nUz18bd/mpmEzddd+Tcernr62PR+m62x6O08+5qT5mnhbGXid8qD5k7tZvmI5zL7s91rxij1i118719Sg8u346/uqsH8aHP/eD+gqycvkP7o2pqYjffOWesXDBVH09Cpd9/+fxL//zRfHYk8/WV8zTVKw5w5PtRH7r114aRxy2ZyzfeXF9VaQNG2bi7gd+ERdceYcrVwZl7z2Xxpt+Z99YuceSWLhwHKF99Iln4qpr74v/96N76ytaIrAAkIBnsACQgMACQAICCwAJCCwAJCCwAJCAwAJAAgILAAkILAAkILAAkIDAAkACAgsACQgsACQgsACQgMACQAICCwAJCCwAJCCwAJCAwAJAAgILAAkILAAkILAAkIDAAkACAgsACQgsACQgsACQgMACQAICCwAJCCwAJCCwAJCAwAJAAgILAAkILAAkILAAkIDAAkACAgsACQgsACQgsACQgMACQAICCwAJCCwAJCCwAJCAwAJAAgILAAkILAAkILAAkIDAAkACAgsACQgsACQgsACQgMACQAICCwAJCCwAJCCwAJCAwAJAAgILAAkILAAkILAAkIDAAkACAgsACQgsACQgsACQgMACQAICCwAJCCwAJCCwAJCAwAJAAgILAAkILAAkILAAkIDAAkACAgsACQgsACQgsACQgMACQAICCwAJCCwAJCCwAJDA/weD3iT1l9+rNQAAAABJRU5ErkJggg=="; // tu base64
  doc.addImage(logo, "PNG", 175, 14, 20, 20);

  // Título
  doc.setFont("helvetica", "bold");
  doc.setTextColor(0, 51, 153);
  doc.setFontSize(18);
  doc.text(`COTIZACIÓN`, 14, 20);

  doc.setFontSize(11);
  doc.setTextColor(100);
  doc.text(window.nombreTienda, 14, 26);

  // Línea separadora
  doc.setDrawColor(0, 51, 153);
  doc.setLineWidth(0.5);
  doc.line(14, 36, 196, 36);

  doc.setFont("helvetica", "normal");

  // Info derecha
  doc.setFontSize(10);
  doc.setTextColor(0, 0, 0);
  doc.text(`Fecha: ${fecha}`, 195, 41, { align: "right" });
  doc.text(`Folio: ${folio}`, 195, 47, { align: "right" });

  // Cliente
  doc.text(`Cliente: ${nombre}`, 14, 41);
  if (empresa) doc.text(`Empresa: ${empresa}`, 14, 47);

  // Tabla productos
  const rows = [];

  document.querySelectorAll("#tablaProductos tbody tr").forEach((row) => {
    const desc = row.querySelector(".desc").value;
    const qty = row.querySelector(".qty").value;
    const price = row.querySelector(".price").value;
    const totalRow = row.querySelector(".rowTotal").textContent;

    if (!desc) return;

    rows.push([
      desc,
      qty,
      `$${window.formatearMoneda(price)}`,
      `$${window.formatearMoneda(totalRow)}`,
    ]);
  });

  doc.autoTable({
    startY: 60,
    head: [["Descripción", "Cant.", "Precio", "Total"]],
    body: rows,
    styles: {
      fontSize: 9,
      lineColor: [220, 220, 220],
      lineWidth: 0.2,
    },
    headStyles: {
      fillColor: [0, 51, 153],
      textColor: [255, 255, 255],
      fontStyle: "bold",
    },
    alternateRowStyles: {
      fillColor: [245, 245, 245],
    },
    columnStyles: {
      1: { halign: "center" },
      2: { halign: "right" },
      3: { halign: "right" },
    },
  });

  // Totales
  const finalY = doc.lastAutoTable.finalY + 10;

  const subtotal = document.getElementById("subtotal").textContent;
  const iva = document.getElementById("iva").textContent;
  const totalFinal = document.getElementById("total").textContent;

  doc.autoTable({
    startY: finalY,
    body: [
      ["Subtotal", `$${window.formatearMoneda(subtotal)}`],
      ["IVA", `$${window.formatearMoneda(iva)}`],
      ["TOTAL", `$${window.formatearMoneda(totalFinal)}`],
    ],
    theme: "plain",
    styles: { fontSize: 10 },
    columnStyles: {
      0: { cellWidth: 30 },
      1: { cellWidth: 40, halign: "right" },
    },
    margin: { left: 126 },
    didParseCell: function (data) {
      if (data.row.index === 2) {
        data.cell.styles.fontStyle = "bold";
        data.cell.styles.textColor = [0, 51, 153];
      }
    },
  });

  // Footer
  doc.setFontSize(9);
  doc.setTextColor(120);
  doc.text("Gracias por su preferencia", 105, 280, { align: "center" });

  doc.save(`cotizacion_${nombre.replace(/\s+/g, "_")}.pdf`);
}