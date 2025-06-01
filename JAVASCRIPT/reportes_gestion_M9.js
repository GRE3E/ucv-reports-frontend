const API_URL =
  "https://ucv-reports-backend.onrender.com/reportes/todos-con-usuario";
let reportesPendientes = [];
let reportesDetalle = [];
let reporteSeleccionado = null;

// Función para debugging - puedes eliminarla después
function debugResponse(data, context) {
  console.log(`=== DEBUG ${context} ===`);
  console.log("Datos recibidos:", data);
  if (data && data.length > 0) {
    console.log("Estructura del primer elemento:", Object.keys(data[0]));
    console.log("Primer elemento completo:", data[0]);
  }
  console.log("========================");
}

// Cargar reportes pendientes para la tabla principal
async function cargarReportesPendientes() {
  try {
    console.log("Cargando reportes pendientes...");
    const response = await fetch(API_URL);

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const reportes = await response.json();
    debugResponse(reportes, "REPORTES PENDIENTES");

    // Log each report's 'acciones' to debug the filter
    reportes.forEach((r) =>
      console.log("Reporte acciones (antes del filtro):", r.acciones)
    );

    reportesPendientes = reportes.filter((r) => {
      // Use 'estado' or 'acciones' for filtering
      const status = r.estado || r.acciones;
      if (!status) return false;

      const lowerCaseStatus = status.toString().trim().toLowerCase();
      return lowerCaseStatus.includes("pendiente");
    });
    // reportesPendientes = reportes; // Eliminar filtro, usar todos los reportes
    console.log(
      `Reportes pendientes filtrados (después del filtro): ${reportesPendientes.length}`
    );
    console.log("Contenido de reportesPendientes:", reportesPendientes); // Nuevo log

    renderReportesPendientes();
  } catch (error) {
    console.error("Error al cargar los reportes:", error);
    alert("Error al cargar los reportes: " + error.message);
  }
}

function renderReportesPendientes() {
  const tbody = document.querySelector(".reportes-table tbody");

  if (!tbody) {
    console.error("No se encuentra el tbody de la tabla principal");
    return;
  } else {
    console.log("tbody de la tabla principal encontrado."); // Nuevo log
  }

  tbody.innerHTML = "";

  if (reportesPendientes.length === 0) {
    tbody.innerHTML =
      '<tr><td colspan="4">No hay reportes pendientes</td></tr>';
    return;
  }

  reportesPendientes.forEach((reporte) => {
    const tr = document.createElement("tr");

    // Usar múltiples posibles nombres de campo para mayor compatibilidad
    const usuario =
      reporte.usuario ||
      reporte.nombre_usuario ||
      reporte.user ||
      "Sin usuario";
    const lugar =
      reporte.lugarDelProblema ||
      reporte.lugardelproblema || // Usar lugardelproblema del endpoint
      reporte.lugar_problema ||
      reporte.lugar ||
      "Sin lugar";
    const fecha =
      reporte.fecha || reporte.r_fecha || reporte.created_at || "Sin fecha";
    const historialId = reporte.historial_id;
    const idReporte = reporte.id_reporte || reporte.r_id_reporte || reporte.id;
    const acciones = reporte.acciones || "Sin acciones"; // Usar acciones del endpoint

    tr.innerHTML = `
      <td>${usuario}</td>
      <td>${lugar}</td>
      <td>${fecha}</td>
      <td>
        <button class="btn aprobar" onclick="aprobarReporte(${historialId})">
          <i class="fas fa-check-circle"></i>
          Aprobar Reporte
        </button>
        <button class="btn desaprobado" onclick="abrirModalDesaprobar(${historialId})">
          <i class="fas fa-ban"></i>
          Desaprobar Reporte
        </button>
      </td>
    `;
    tbody.appendChild(tr);
  });
}

// Cargar reportes aprobados y desaprobados para el modal
async function cargarReportesDetalle() {
  try {
    console.log("Cargando reportes detalle...");
    const response = await fetch(API_URL);

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const reportes = await response.json();
    debugResponse(reportes, "REPORTES DETALLE");

    reportesDetalle = reportes;
    console.log("Contenido de reportesDetalle:", reportesDetalle); // Nuevo log
    renderReportesDetalle();
  } catch (error) {
    console.error("Error al cargar los reportes:", error);
    alert("Error al cargar los reportes detalle: " + error.message);
  }
}

function renderReportesDetalle() {
  const tbody = document.getElementById("tbodyReportesDetalle");

  if (!tbody) {
    console.error("No se encuentra el tbody del modal de reportes");
    return;
  } else {
    console.log("tbody del modal de reportes encontrado."); // Nuevo log
  }

  tbody.innerHTML = "";

  if (reportesDetalle.length === 0) {
    tbody.innerHTML =
      '<tr><td colspan="5">No hay reportes disponibles</td></tr>';
    return;
  }

  reportesDetalle.forEach((reporte) => {
    const tr = document.createElement("tr");

    // Usar múltiples posibles nombres de campo
    const usuario =
      reporte.usuario ||
      reporte.nombre_usuario ||
      reporte.user ||
      "Sin usuario";
    const lugar =
      reporte.lugardelproblema ||
      reporte.lugarDelProblema ||
      reporte.lugar_problema ||
      reporte.lugar ||
      "Sin lugar";
    const fecha = reporte.r_fecha
      ? new Date(reporte.r_fecha).toLocaleDateString()
      : reporte.fecha
      ? new Date(reporte.fecha).toLocaleDateString()
      : "Sin fecha";
    const estado = reporte.estado || reporte.acciones || "Sin estado";
    const idReporte = reporte.r_id_reporte || reporte.id_reporte || reporte.id;

    tr.innerHTML = `
      <td>${usuario}</td>
      <td>${lugar}</td>
      <td>${fecha}</td>
      <td>${estado}</td>
      <td>
        <button class="btn observar" onclick="abrirModalDetalleDesdeReportes(${idReporte})">Observar</button>
      </td>
    `;
    tbody.appendChild(tr);
  });
}

async function aprobarReporte(historialId) {
  if (!historialId) {
    alert("ID de historial de reporte no válido");
    return;
  }

  try {
    console.log(`Aprobando historial de reporte ID: ${historialId}`);
    const response = await fetch(
      `https://ucv-reports-backend.onrender.com/historial-reportes/${historialId}/estado`,
      {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ estado: "Aprobado" }),
      }
    );

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    alert("Reporte aprobado exitosamente");
    await cargarReportesPendientes();
    await cargarReportesDetalle();
  } catch (error) {
    console.error("Error al aprobar el reporte:", error);
    alert("Error al aprobar el reporte: " + error.message);
  }
}

let idDesaprobar = null;

function abrirModalDesaprobar(historialId) {
  if (!historialId) {
    alert("ID de historial de reporte no válido");
    return;
  }

  idDesaprobar = historialId;
  const modal = document.getElementById("modalDesaprobar");
  const input = document.getElementById("motivoDesaprobacion");

  if (modal && input) {
    modal.style.display = "block";
    input.value = "";
  } else {
    console.error("No se encuentra el modal de desaprobación o el input");
  }
}

function cerrarModalDesaprobar() {
  const modal = document.getElementById("modalDesaprobar");
  if (modal) {
    modal.style.display = "none";
  }
}

async function aceptarDesaprobacion() {
  const motivo = document.getElementById("motivoDesaprobacion")?.value?.trim();

  if (!motivo) {
    alert("Por favor, ingrese el motivo.");
    return;
  }

  if (!idDesaprobar) {
    alert("ID de historial de reporte no válido");
    return;
  }

  try {
    console.log(`Desaprobando historial de reporte ID: ${idDesaprobar}`);
    const response = await fetch(
      `https://ucv-reports-backend.onrender.com/historial-reportes/${idDesaprobar}/estado`,
      {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ estado: "Desaprobado", motivo: motivo }),
      }
    );

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    alert("Reporte desaprobado exitosamente");
    cerrarModalDesaprobar();
    await cargarReportesPendientes();
    await cargarReportesDetalle();
  } catch (error) {
    console.error("Error al desaprobar el reporte:", error);
    alert("Error al desaprobar el reporte: " + error.message);
  }
}

function abrirModalReportes() {
  cargarReportesDetalle();
  const modal = document.getElementById("modalReportes");
  if (modal) {
    modal.style.display = "block";
  } else {
    console.error("No se encuentra el modal de reportes");
  }
}

function cerrarModalReportes() {
  const modal = document.getElementById("modalReportes");
  if (modal) {
    modal.style.display = "none";
  }
}

// Mejorar el manejo de clics fuera del modal
window.onclick = function (event) {
  const modalReportes = document.getElementById("modalReportes");
  const modalDesaprobar = document.getElementById("modalDesaprobar");
  const modalDetalle = document.getElementById("modalDetalleReporte");

  if (event.target == modalReportes) {
    modalReportes.style.display = "none";
  }
  if (event.target == modalDesaprobar) {
    modalDesaprobar.style.display = "none";
  }
  if (event.target == modalDetalle) {
    modalDetalle.style.display = "none";
  }
};

async function abrirModalDetalleDesdeReportes(id_reporte) {
  if (!id_reporte) {
    alert("ID de reporte no válido");
    return;
  }

  try {
    console.log(`Cargando detalle del reporte ID: ${id_reporte}`);
    const response = await fetch(
      `https://ucv-reports-backend.onrender.com/reportes/detalle/${id_reporte}`
    );

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const detalleReporte = await response.json();
    console.log("Detalle del reporte:", detalleReporte);

    const detalle = document.querySelector(
      "#modalDetalleReporte .detalle-info"
    );
    if (!detalle) {
      console.error("No se encuentra el contenedor de detalle");
      return;
    }

    detalle.innerHTML = `
      <div><b>Facultad:</b> ${
        detalleReporte.facultad || "No especificada"
      }</div>
      <div><b>Turno:</b> ${detalleReporte.turno || "No especificado"}</div>
      <div><b>Fecha:</b> ${detalleReporte.fecha || "No especificada"}</div>
      <div><b>Estado:</b> ${detalleReporte.estado || "No especificado"}</div>
      <div><b>Artículos:</b> ${
        detalleReporte.Articulos ||
        detalleReporte.articulos ||
        "No especificados"
      }</div>
      <div><b>Motivo:</b> ${
        detalleReporte.Motivo || detalleReporte.motivo || "No especificado"
      }</div>
      <hr>
      <div><b>Lugar del Problema:</b> ${
        detalleReporte.Pabellon || detalleReporte.pabellon || "No especificado"
      }, ${detalleReporte.Piso || detalleReporte.piso || "No especificado"}, ${
      detalleReporte.Salon || detalleReporte.salon || "No especificado"
    }</div>
      <div><b>Descripción del Problema:</b><br>${
        detalleReporte.descripcion || "No especificada"
      }</div>
      <hr>
      <div><b>Evidencia:</b></div>
      <img id="imgEvidencia" src="${
        detalleReporte.evidencia || "../../CSS/auth/images/Problema monitor.jpg"
      }" alt="Evidencia" style="max-width:100%;margin-top:10px;border-radius:8px;" onerror="this.src='../../CSS/auth/images/Problema monitor.jpg'">
    `;

    // Cerrar modal de reportes y abrir modal de detalle
    const modalReportes = document.getElementById("modalReportes");
    const modalDetalle = document.getElementById("modalDetalleReporte");

    if (modalReportes) modalReportes.style.display = "none";
    if (modalDetalle) modalDetalle.style.display = "block";
  } catch (error) {
    console.error("Error al cargar el detalle del reporte:", error);
    alert("Error al cargar el detalle del reporte: " + error.message);
  }
}

function cerrarModalDetalleReporte() {
  const modalDetalle = document.getElementById("modalDetalleReporte");
  const modalReportes = document.getElementById("modalReportes");

  if (modalDetalle) modalDetalle.style.display = "none";
  if (modalReportes) modalReportes.style.display = "block";
}

// Inicialización mejorada
document.addEventListener("DOMContentLoaded", async () => {
  console.log("DOM cargado, inicializando aplicación...");

  // Verificar que los elementos necesarios existen
  const elementos = [
    ".reportes-table tbody",
    "#tbodyReportesDetalle",
    "#modalDesaprobar",
    "#modalReportes",
    "#modalDetalleReporte",
  ];

  let elementosFaltantes = [];
  elementos.forEach((selector) => {
    if (!document.querySelector(selector)) {
      elementosFaltantes.push(selector);
    }
  });

  if (elementosFaltantes.length > 0) {
    console.error("Elementos HTML faltantes:", elementosFaltantes);
  }

  // Cargar datos iniciales
  try {
    await cargarReportesPendientes();
    await cargarReportesDetalle();

    const searchInput = document.getElementById("searchInput");
    if (searchInput) {
      searchInput.addEventListener("keyup", (event) => {
        const searchTerm = event.target.value.trim().toLowerCase();
        if (searchTerm.length === 0) {
          renderReportesPendientes();
          return;
        }
        // Filtrar en el frontend por coincidencia parcial en usuario
        const filtrados = reportesPendientes.filter((reporte) => {
          const usuario =
            (reporte.usuario ||
              reporte.nombre_usuario ||
              reporte.user ||
              "").toLowerCase();
          return usuario.includes(searchTerm);
        });
        // Renderizar solo los reportes filtrados
        renderReportesPendientesCustom(filtrados);
      });
    }

    console.log("Aplicación inicializada correctamente");
  } catch (error) {
    console.error("Error en la inicialización:", error);
  }
});

// Nueva función para renderizar una lista personalizada de reportes pendientes
function renderReportesPendientesCustom(lista) {
  const tbody = document.querySelector(".reportes-table tbody");
  if (!tbody) return;
  tbody.innerHTML = "";

  if (lista.length === 0) {
    tbody.innerHTML =
      '<tr><td colspan="4">No hay reportes pendientes</td></tr>';
    return;
  }

  lista.forEach((reporte) => {
    const tr = document.createElement("tr");
    const usuario =
      reporte.usuario ||
      reporte.nombre_usuario ||
      reporte.user ||
      "Sin usuario";
    const lugar =
      reporte.lugarDelProblema ||
      reporte.lugardelproblema ||
      reporte.lugar_problema ||
      reporte.lugar ||
      "Sin lugar";
    const fecha =
      reporte.fecha || reporte.r_fecha || reporte.created_at || "Sin fecha";
    const historialId = reporte.historial_id;
    tr.innerHTML = `
      <td>${usuario}</td>
      <td>${lugar}</td>
      <td>${fecha}</td>
      <td>
        <button class="btn aprobar" onclick="aprobarReporte(${historialId})">
          <i class="fas fa-check-circle"></i>
          Aprobar Reporte
        </button>
        <button class="btn desaprobado" onclick="abrirModalDesaprobar(${historialId})">
          <i class="fas fa-ban"></i>
          Desaprobar Reporte
        </button>
      </td>
    `;
    tbody.appendChild(tr);
  });
}
