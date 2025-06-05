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
        reporte.googleDriveFileId && reporte.googleDriveFileId.length > 0
          ? `https://lh3.googleusercontent.com/d/${reporte.googleDriveFileId}`
          : "https://images.unsplash.com/photo-1581092160562-40aa08e78837?w=400&h=200&fit=crop"
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

async function openModal(reporteId) {
  const reporte = reportesData[reporteId];
  if (reporte) {
    try {
      const id_reporte = reporteId.replace("reporte", "");
      const response = await fetchWithAuth(
        `https://ucv-reports-backend.onrender.com/reportes/detalle/${id_reporte}`
      );

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const detalleReporte = await response.json();
      console.log("Detalle del reporte:", detalleReporte);

      const imageUrl =
        detalleReporte.googleDriveFileId &&
        detalleReporte.googleDriveFileId.length > 0
          ? `https://lh3.googleusercontent.com/d/${detalleReporte.googleDriveFileId}`
          : "";

      document.getElementById("modalFacultad").textContent =
        detalleReporte.facultad || "No especificada";
      document.getElementById("modalTurno").textContent =
        detalleReporte.turno || "No especificado";
      document.getElementById("modalFecha").textContent =
        detalleReporte.fecha || "No especificada";
      const estadoElement = document.getElementById("modalEstado");
      estadoElement.textContent = detalleReporte.estado || "No especificado";
      estadoElement.className = "info-value";
      if (detalleReporte.estado === "Aprobado") {
        estadoElement.classList.add("status-approved");
      } else if (detalleReporte.estado === "Pendiente") {
        estadoElement.classList.add("status-pending");
      } else if (detalleReporte.estado === "En Proceso") {
        estadoElement.classList.add("status-process");
      }
      document.getElementById("modalLugar").textContent =
        `${
          detalleReporte.Pabellon ||
          detalleReporte.pabellon ||
          "No especificado"
        }, ` +
        `${detalleReporte.Piso || detalleReporte.piso || "No especificado"}, ` +
        `${detalleReporte.Salon || detalleReporte.salon || "No especificado"}`;
      document.getElementById("modalDescripcion").textContent =
        detalleReporte.descripcion || "No especificada";

      const modalEvidencia = document.getElementById("modalEvidencia");
      if (imageUrl) {
        modalEvidencia.src = imageUrl;
        modalEvidencia.style.display = "block";
      } else {
        modalEvidencia.src = "";
        modalEvidencia.style.display = "none";
      }

      document.getElementById("modalOverlay").classList.add("active");
      document.body.style.overflow = "hidden";
    } catch (error) {
      console.error("Error al cargar el detalle del reporte:", error);
      alert("Error al cargar el detalle del reporte: " + error.message);
    }
  }
}

function closeModal() {
  document.getElementById("modalOverlay").classList.remove("active");
  document.body.style.overflow = "auto";
}

window.openModal = openModal;
window.closeModal = closeModal;

import { validateTokenAndRedirect, fetchWithAuth } from "./auth/auth_utils.js";

const token = localStorage.getItem("access_token");
if (!token) {
  window.location.replace("/login");
  throw new Error("No token found. Halting script.");
}

document.addEventListener("DOMContentLoaded", () => {
  const token = validateTokenAndRedirect();
  if (!token) {
    console.warn("Token no válido. Cancelando ejecución.");
    return; // Detiene toda la ejecución si no hay token
  }

  // Mostrar token en consola si es válido
  console.log("Token JWT disponible en usuario_reportes_globales.js:", token);
  try {
    const payloadBase64 = token.split(".")[1];
    const decodedPayload = JSON.parse(atob(payloadBase64));
    console.log("ID de usuario (sub) del token:", decodedPayload.sub);
  } catch (error) {
    console.error("Error al decodificar el token JWT:", error);
  }
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
