import { validateTokenAndRedirect, fetchWithAuth } from "./auth/auth_utils.js";

// Mover fuera de DOMContentLoaded para que funcione desde HTML onclick
window.toggleSidebar = function () {
  const sidebar = document.getElementById("sidebar");
  const overlay = document.getElementById("sidebarOverlay");
  const main = document.getElementById("mainContent");
  sidebar.classList.toggle("mobile-visible");
  overlay.classList.toggle("active");
  main.classList.toggle("blur");
  document.body.style.overflow = sidebar.classList.contains("mobile-visible")
    ? "hidden"
    : "auto";
};

document.addEventListener("DOMContentLoaded", function () {
  const token = validateTokenAndRedirect();
  if (token) {
    console.log("Token JWT disponible en reporte_enviar.js:", token);
  }

  window.addEventListener("resize", function () {
    const sidebar = document.getElementById("sidebar");
    const overlay = document.getElementById("sidebarOverlay");
    const main = document.getElementById("mainContent");
    if (window.innerWidth > 992) {
      sidebar.classList.remove("mobile-visible");
      overlay.classList.remove("active");
      main.classList.remove("blur");
      document.body.style.overflow = "auto";
    }
  });

  // Evento submit del formulario
  const form = document.getElementById("reportForm");
  form.addEventListener("submit", function (e) {
    e.preventDefault(); // Previene recarga
    sendReport(token); // Llama con el token
  });
});

// Envío del reporte
async function sendReport(token) {
  const reportData = {
    facultad: document.getElementById("facultad").value,
    turno: document.getElementById("turno").value,
    Pabellon: document.getElementById("pabellon").value,
    Piso: document.getElementById("piso").value,
    Salon: document.getElementById("aula").value,
    Articulos: document.getElementById("articulo").value,
    descripcion: document.getElementById("descripcion").value,
    evidencia: document.getElementById("evidencia").value,
    fecha: new Date().toISOString(),
    estado: "Pendiente",
    Motivo: document.getElementById("motivo").value,
  };

  try {
    const response = await fetch(
      "https://ucv-reports-backend.onrender.com/reportes",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(token && { Authorization: `Bearer ${token}` }),
        },
        body: JSON.stringify(reportData),
      }
    );

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const result = await response.json();
    console.log("Reporte enviado con éxito:", result);
    alert("Reporte enviado con éxito!");
    document.getElementById("reportForm").reset();
  } catch (error) {
    console.error("Error al enviar el reporte:", error);
    alert("Error al enviar el reporte. Revisa la consola para más detalles.");
  }
}
