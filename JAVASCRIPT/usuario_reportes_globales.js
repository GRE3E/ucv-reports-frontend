const API_URL = "https://ucv-reports-backend.onrender.com/reportes";
let reportesData = {};

function renderReportes(reportes) {
  const reportsGrid = document.getElementById("reportsGrid");
  reportsGrid.innerHTML = "";
  reportesData = {};

  reportes.forEach((reporte, idx) => {
    const reporteId = `reporte${reporte.id_reporte}`;
    reportesData[reporteId] = {
      facultad: reporte.facultad,
      turno: reporte.turno,
      fecha: reporte.fecha,
      estado: reporte.estado,
      lugar: `${reporte.Pabellon}, ${reporte.Piso}, ${reporte.Salon}`,
      evidencia: reporte.evidencia,
    };

    const card = document.createElement("div");
    card.className = "report-card";
    card.innerHTML = `
      <img src="${
        reporte.evidencia ||
        "https://images.unsplash.com/photo-1581092160562-40aa08e78837?w=400&h=200&fit=crop"
      }" alt="Evidencia" class="card-image">
      <div class="card-content">
          <div class="card-date">
              <i class="fas fa-calendar-alt"></i>
              Fecha: ${reporte.fecha}
          </div>
          <div class="card-shift">
              <i class="fas fa-sun"></i>
              Turno: ${reporte.turno}
          </div>
          <div class="card-location">
              <i class="fas fa-map-marker-alt"></i>
              Lugar del Reporte: ${reporte.Pabellon}, ${reporte.Piso}
          </div>
          <div class="card-classroom">
              <i class="fas fa-door-open"></i>
              Ubicación: ${reporte.Salon}
          </div>
          <button class="visualizar-btn" onclick="openModal('${reporteId}')">
              <i class="fas fa-eye"></i>
              Visualizar
          </button>
      </div>
  `;
    reportsGrid.appendChild(card);
  });
}

async function cargarReportes() {
  try {
    const response = await fetchWithAuth(API_URL);
    const reportes = await response.json();
    renderReportes(reportes);
  } catch (error) {
    console.error("Error al cargar los reportes:", error);
  }
}

function openModal(reporteId) {
  const reporte = reportesData[reporteId];
  if (reporte) {
    document.getElementById("modalFacultad").textContent =
      reporte.facultad || "";
    document.getElementById("modalTurno").textContent = reporte.turno || "";
    document.getElementById("modalFecha").textContent = reporte.fecha || "";
    const estadoElement = document.getElementById("modalEstado");
    estadoElement.textContent = reporte.estado || "";
    estadoElement.className = "info-value";
    if (reporte.estado === "Aprobado") {
      estadoElement.classList.add("status-approved");
    } else if (reporte.estado === "Pendiente") {
      estadoElement.classList.add("status-pending");
    } else if (reporte.estado === "En Proceso") {
      estadoElement.classList.add("status-process");
    }
    document.getElementById("modalLugar").textContent = reporte.lugar || "";
    document.getElementById("modalEvidencia").src = reporte.evidencia || "";
    document.getElementById("modalOverlay").classList.add("active");
    document.body.style.overflow = "hidden";
  }
}

function closeModal() {
  document.getElementById("modalOverlay").classList.remove("active");
  document.body.style.overflow = "auto";
}

import { validateTokenAndRedirect, fetchWithAuth } from "./auth/auth_utils.js";

document.addEventListener("DOMContentLoaded", () => {
  validateTokenAndRedirect();
  cargarReportes();
});

document.addEventListener("keydown", function (event) {
  if (event.key === "Escape") {
    closeModal();
  }
});

function toggleSidebar() {
  const sidebar = document.getElementById("sidebar");
  const overlay = document.getElementById("sidebarOverlay");
  const main = document.getElementById("mainContent");
  sidebar.classList.toggle("mobile-visible");
  overlay.classList.toggle("active");
  if (main) main.classList.toggle("blur");
  if (sidebar.classList.contains("mobile-visible")) {
    document.body.style.overflow = "hidden";
  } else {
    document.body.style.overflow = "auto";
  }
}
window.addEventListener("resize", function () {
  const sidebar = document.getElementById("sidebar");
  const overlay = document.getElementById("sidebarOverlay");
  const main = document.getElementById("mainContent");
  if (window.innerWidth > 992) {
    sidebar.classList.remove("mobile-visible");
    overlay.classList.remove("active");
    if (main) main.classList.remove("blur");
    document.body.style.overflow = "auto";
  }
});
