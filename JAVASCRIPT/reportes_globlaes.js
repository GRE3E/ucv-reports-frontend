const API_URL = "https://ucv-reports-backend.onrender.com/reportes";

async function fetchReports() {
  try {
    const response = await fetchWithAuth(API_URL);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const reports = await response.json();
    renderReports(reports);
  } catch (error) {
    console.error("Error fetching reports:", error);
    alert(
      "Error al cargar los reportes. Por favor, intente de nuevo más tarde."
    );
  }
}

function renderReports(reports) {
  const tableBody = document.getElementById("reportes-table-body");
  const mobileCardsContainer = document.getElementById("reportes-mobile-cards");

  tableBody.innerHTML = ""; // Clear existing static content
  mobileCardsContainer.innerHTML = ""; // Clear existing static content

  reports.forEach((report) => {
    // Desktop Table Row
    const row = document.createElement("tr");
    const statusClass = `status-${report.estado
      .toLowerCase()
      .replace(/ /g, "-")}`;
    row.innerHTML = `
              <td>${report.fecha}</td>
              <td>${[report.Pabellon, report.Piso, report.Salon]
                .filter(Boolean)
                .join(", ")}</td>
              <td>${report.descripcion}</td>
              <td>
                  <span class="status ${statusClass}">${report.estado}</span>
              </td>
              <td>
                  <button class="action-btn btn-visualizar" onclick="visualizarReporte('${
                    report.id_reporte
                  }')">
                      <i class="fas fa-eye"></i>
                      Visualizar
                  </button>
                  <button class="action-btn btn-editar" onclick="editarReporte('${
                    report.id_reporte
                  }')">
                      <i class="fas fa-edit"></i>
                      Editar
                  </button>
              </td>
          `;
    tableBody.appendChild(row);

    // Mobile Card
    const card = document.createElement("div");
    card.classList.add("report-card");
    card.innerHTML = `
              <div class="card-header">
                  <div class="card-date">${report.fecha}</div>
                  <div class="card-status ${statusClass}">${report.estado}</div>
              </div>
              <div class="card-info">
                  <div class="info-row">
                      <div class="info-label">
                          <i class="fas fa-map-marker-alt"></i>
                          Lugar:
                      </div>
                      <div class="info-value">${[
                        report.Pabellon,
                        report.Piso,
                        report.Salon,
                      ]
                        .filter(Boolean)
                        .join(", ")}</div>
                  </div>
                  <div class="info-row">
                      <div class="info-label">
                          <i class="fas fa-file-alt"></i>
                          Descripción:
                      </div>
                      <div class="info-value">${report.descripcion}</div>
                  </div>
              </div>
              <div class="card-actions">
                  <button class="action-btn btn-visualizar" onclick="visualizarReporte('${
                    report.id_reporte
                  }')">
                      <i class="fas fa-eye"></i>
                      Visualizar
                  </button>
                  <button class="action-btn btn-editar" onclick="editarReporte('${
                    report.id_reporte
                  }')">
                      <i class="fas fa-edit"></i>
                      Editar
                  </button>
              </div>
          `;
    mobileCardsContainer.appendChild(card);
  });
}

function toggleSidebar() {
  const sidebar = document.getElementById("sidebar");
  const overlay = document.getElementById("sidebarOverlay");

  sidebar.classList.toggle("mobile-visible");
  overlay.classList.toggle("active");

  // Prevent body scroll when sidebar is open on mobile
  if (sidebar.classList.contains("mobile-visible")) {
    document.body.style.overflow = "hidden";
  } else {
    document.body.style.overflow = "auto";
  }
}

function irHistorial() {
  const btn = event.target.closest(".help-btn");
  const originalContent = btn.innerHTML;

  // Simular navegación al historial
  btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Cargando...';
  btn.disabled = true;

  setTimeout(() => {
    btn.innerHTML = '<i class="fas fa-check"></i> Redirigiendo...';

    setTimeout(() => {
      btn.innerHTML = originalContent;
      btn.disabled = false;
      alert(
        "Redirigiendo al historial completo de reportes...\n\nEsta funcionalidad se conectará con la página de historial."
      );
    }, 1000);
  }, 1000);
}

async function visualizarReporte(id) {
  const btn = event.target.closest(".btn-visualizar");
  const originalContent = btn.innerHTML;
  btn.innerHTML = '<div class="loading"></div> Cargando...';
  btn.disabled = true;

  try {
    const response = await fetchWithAuth(
      `https://ucv-reports-backend.onrender.com/reportes/detalle/${id}`
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
    document.getElementById("modalEstado").textContent =
      detalleReporte.estado || "No especificado";
    document.getElementById("modalLugar").textContent =
      `${
        detalleReporte.Pabellon || detalleReporte.pabellon || "No especificado"
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

    document.getElementById("modalOverlay").style.display = "block";
    btn.innerHTML = originalContent;
    btn.disabled = false;
  } catch (error) {
    console.error("Error al cargar el detalle del reporte:", error);
    alert("Error al cargar el detalle del reporte: " + error.message);
    btn.innerHTML = originalContent;
    btn.disabled = false;
  }
}

async function editarReporte(id) {
  // In a real application, you would redirect to an edit page with the report ID
  // For now, we'll just show an alert with the ID
  const btn = event.target.closest(".btn-editar");
  const originalContent = btn.innerHTML;
  btn.innerHTML = '<div class="loading"></div> Cargando...';
  btn.disabled = true;

  setTimeout(() => {
    btn.innerHTML = originalContent;
    btn.disabled = false;
    alert(
      `Editando reporte con ID: ${id}\n\nEsta funcionalidad se conectará con el formulario de edición.`
    );
  }, 1000);
}

// Cerrar sidebar al hacer clic fuera en móvil
document.addEventListener("click", function (event) {
  const sidebar = document.getElementById("sidebar");
  const mobileToggle = document.querySelector(".mobile-toggle");

  if (
    window.innerWidth <= 992 &&
    !sidebar.contains(event.target) &&
    !mobileToggle.contains(event.target)
  ) {
    sidebar.classList.remove("mobile-visible");
    document.getElementById("sidebarOverlay").classList.remove("active");
    document.body.style.overflow = "auto";
  }
});

// Responsive handling
window.addEventListener("resize", function () {
  const sidebar = document.getElementById("sidebar");
  if (window.innerWidth > 992) {
    sidebar.classList.remove("mobile-visible");
    document.getElementById("sidebarOverlay").classList.remove("active");
    document.body.style.overflow = "auto";
  }
});

// Initial check for responsive layout
window.dispatchEvent(new Event("resize"));

// Fetch reports when the page loads
import { validateTokenAndRedirect, fetchWithAuth } from "./auth/auth_utils.js";

document.addEventListener("DOMContentLoaded", () => {
  validateTokenAndRedirect();
  fetchReports();
});
