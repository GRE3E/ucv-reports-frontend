const API_URL = "https://ucv-reports-backend.onrender.com/reportes/todos-con-usuario";
let reportesPendientes = [];
let reportesDetalle = [];
let reporteSeleccionado = null;

// Cargar reportes pendientes para la tabla principal
async function cargarReportesPendientes() {
  try {
    const response = await fetch(API_URL);
    const reportes = await response.json();
    reportesPendientes = reportes.filter((r) => r.estado === "Pendiente");
    renderReportesPendientes();
  } catch (error) {
    console.error("Error al cargar los reportes:", error);
  }
}

function renderReportesPendientes() {
  const tbody = document.querySelector(".reportes-table tbody");
  tbody.innerHTML = "";
  reportesPendientes.forEach((reporte) => {
    const tr = document.createElement("tr");
    tr.innerHTML = `
      <td>${reporte.usuario || ""}</td>
      <td>${reporte.lugarDelProblema || ""}</td>
      <td>${reporte.fecha}</td>
      <td>
        <button class="btn aprobar" onclick="aprobarReporte(${reporte.id_reporte})">
          <i class="fas fa-check-circle"></i>
          Aprobar Reporte</button>

        <button class="btn desaprobado" onclick="abrirModalDesaprobar(${reporte.id_reporte})">
          <i class="fas fa-ban"></i>
          Desaprobar Reporte</button>
      </td>
    `;
    tbody.appendChild(tr);
  });
}

// Cargar reportes aprobados y desaprobados para el modal
async function cargarReportesDetalle() {
  try {
    const response = await fetch(API_URL);
    const reportes = await response.json();
    reportesDetalle = reportes.filter(
      (r) => r.estado === "Aprobado" || r.estado === "Desaprobado"
    );
    renderReportesDetalle();
  } catch (error) {
    console.error("Error al cargar los reportes:", error);
  }
}

function renderReportesDetalle() {
  const tbody = document.getElementById("tbodyReportesDetalle");
  tbody.innerHTML = "";
  reportesDetalle.forEach((reporte, idx) => {
    const tr = document.createElement("tr");
    tr.innerHTML = `
      <td>${reporte.usuario || ""}</td>
      <td>${reporte.lugarDelProblema || ""}</td>
      <td>${reporte.fecha}</td>
      <td>${reporte.acciones}</td>
      <td>
        <button class="btn observar" onclick="abrirModalDetalleDesdeReportes(${idx})">Observar</button>
      </td>
    `;
    tbody.appendChild(tr);
  });
}

async function aprobarReporte(id) {
  try {
    await fetch(
      `https://ucv-reports-backend.onrender.com/reportes/${id}/aprobar`,
      {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
      }
    );
    cargarReportesPendientes();
    cargarReportesDetalle();
  } catch (error) {
    alert("Error al aprobar el reporte");
  }
}

let idDesaprobar = null;
function abrirModalDesaprobar(id) {
  idDesaprobar = id;
  document.getElementById("modalDesaprobar").style.display = "block";
  document.getElementById("motivoDesaprobacion").value = "";
}

function cerrarModalDesaprobar() {
  document.getElementById("modalDesaprobar").style.display = "none";
}

async function aceptarDesaprobacion() {
  const motivo = document.getElementById("motivoDesaprobacion").value.trim();
  if (!motivo) {
    alert("Por favor, ingrese el motivo.");
    return;
  }
  try {
    await fetch(
      `https://ucv-reports-backend.onrender.com/reportes/${idDesaprobar}/desaprobar`,
      {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ motivo: motivo }),
      }
    );
    cerrarModalDesaprobar();
    cargarReportesPendientes();
    cargarReportesDetalle();
  } catch (error) {
    alert("Error al desaprobar el reporte");
  }
}

function abrirModalReportes() {
  cargarReportesDetalle();
  document.getElementById("modalReportes").style.display = "block";
}

function cerrarModalReportes() {
  document.getElementById("modalReportes").style.display = "none";
}

window.onclick = function (event) {
  var modal = document.getElementById("modalReportes");
  if (event.target == modal) {
    modal.style.display = "none";
  }
};

function abrirModalDetalleDesdeReportes(idx) {
  reporteSeleccionado = reportesDetalle[idx];
  if (!reporteSeleccionado) return;
  const detalle = document.querySelector("#modalDetalleReporte .detalle-info");
  detalle.innerHTML = `
    <div><b>Facultad:</b> ${reporteSeleccionado.facultad || ""}</div>
    <div><b>Turno:</b> ${reporteSeleccionado.turno || ""}</div>
    <div><b>Fecha:</b> ${reporteSeleccionado.fecha || ""}</div>
    <div><b>Estado:</b> ${reporteSeleccionado.acciones || ""}</div>
    <div><b>Artículos:</b> ${reporteSeleccionado.Articulos || ""}</div>
    <div><b>Motivo:</b> ${reporteSeleccionado.Motivo || ""}</div>
    <hr>
    <div><b>Lugar del Problema:</b> ${reporteSeleccionado.lugarDelProblema || ""}</div>
    <div><b>Descripción del Problema:</b><br>${reporteSeleccionado.descripcion || ""}</div>
    <hr>
    <div><b>Evidencia:</b></div>
    <img id="imgEvidencia" src="${reporteSeleccionado.evidencia || "../../CSS/auth/images/Problema monitor.jpg"}" alt="Evidencia" style="max-width:100%;margin-top:10px;border-radius:8px;">
  `;
  document.getElementById("modalReportes").style.display = "none";
  document.getElementById("modalDetalleReporte").style.display = "block";
}

function cerrarModalDetalleReporte() {
  document.getElementById("modalDetalleReporte").style.display = "none";
  document.getElementById("modalReportes").style.display = "block";
}

document.addEventListener("DOMContentLoaded", () => {
  cargarReportesPendientes();
  cargarReportesDetalle();
}); 