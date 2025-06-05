import { validateTokenAndRedirect, fetchWithAuth } from "./auth/auth_utils.js";

document.addEventListener("DOMContentLoaded", function () {
  // Validate token on page load
  const token = validateTokenAndRedirect();
  if (token) {
    console.log("Token JWT disponible en reporte_enviar.js:", token);
  }
  function toggleSidebar() {
    const sidebar = document.getElementById("sidebar");
    const overlay = document.getElementById("sidebarOverlay");
    const main = document.getElementById("mainContent");
    sidebar.classList.toggle("mobile-visible");
    overlay.classList.toggle("active");
    main.classList.toggle("blur"); // Agrega o quita el desenfoque
    if (sidebar.classList.contains("mobile-visible")) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "auto";
    }
  }

  // Al cambiar tamaño de pantalla, restablece el menú si es escritorio
  window.addEventListener("resize", function () {
    const sidebar = document.getElementById("sidebar");
    const overlay = document.getElementById("sidebarOverlay");
    const main = document.getElementById("mainContent");
    if (window.innerWidth > 992) {
      sidebar.classList.remove("mobile-visible");
      overlay.classList.remove("active");
      main.classList.remove("blur"); // Quita el desenfoque si se cambia a escritorio
      document.body.style.overflow = "auto";
    }
  });

  // Function to send report data
  async function sendReport() {
    // Get values from form elements
    const reportData = {
      facultad: document.getElementById("facultad").value,
      turno: document.getElementById("turno").value,
      Pabellon: document.getElementById("pabellon").value, // Cambiado de 'pabellon' a 'Pabellon'
      Piso: document.getElementById("piso").value, // Cambiado de 'piso' a 'Piso'
      Salon: document.getElementById("aula").value, // Cambiado de 'aula' a 'Salon'
      Articulos: document.getElementById("articulo").value, // Cambiado de 'articulo' a 'Articulos'
      descripcion: document.getElementById("descripcion").value,
      evidencia: document.getElementById("evidencia").value,
      fecha: new Date().toISOString(), // Añadido campo fecha en formato ISO 8601
      estado: "Pendiente", // Añadido campo estado con valor por defecto
      Motivo: document.getElementById("motivo").value, // Añadido campo Motivo
    };

    try {
      const response = await fetchWithAuth(
        "https://ucv-reports-backend.onrender.com/reportes",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
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
    } catch (error) {
      console.error("Error al enviar el reporte:", error);
      alert("Error al enviar el reporte. Revisa la consola para más detalles.");
    }
  }
});

// Example of how to trigger the sendReport function (e.g., on form submission)
// You would typically attach this to a form's submit event listener.
// For demonstration, let's assume there's a button with id 'submitReportBtn'
// document.getElementById('submitReportBtn').addEventListener('click', sendReport);

// To test in Postman, you would send a POST request to:
// http://localhost:3000/api/reportes
// with a JSON body like the one defined in reportData.
// Make sure your backend is running and listening on port 3000 for this endpoint
