const token = localStorage.getItem("access_token");
if (!token) {
  window.location.replace("/login");
  throw new Error("No token found. Halting script.");
}

import { validateTokenAndRedirect, fetchWithAuth } from "./auth/auth_utils.js";

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
  // Validar token antes de continuar
  const token = validateTokenAndRedirect();
  if (!token) {
    console.warn("Token no válido. Cancelando ejecución.");
    return; // Detiene toda la ejecución si no hay token
  }

  // Mostrar token en consola si es válido
  console.log("Token JWT disponible en reporte_enviar.js:", token);
  try {
    const payloadBase64 = token.split(".")[1];
    const decodedPayload = JSON.parse(atob(payloadBase64));
    console.log("ID de usuario (sub) del token:", decodedPayload.sub);
  } catch (error) {
    console.error("Error al decodificar el token JWT:", error);
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

  // Manejo de logout
  const logoutLink = document.getElementById("logoutLink");
  if (logoutLink) {
    logoutLink.addEventListener("click", function (e) {
      e.preventDefault();
      localStorage.removeItem("access_token");
      window.location.replace("/login");
    });
  }

  // Envío del formulario
  const form = document.getElementById("reportForm");
  form.addEventListener("submit", function (e) {
    e.preventDefault();
    sendReport(token);
  });
});

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

    let userId = null;
    if (token) {
      try {
        const payloadBase64 = token.split(".")[1];
        const decodedPayload = JSON.parse(atob(payloadBase64));
        userId = decodedPayload.sub;
      } catch (error) {
        console.error("Error al decodificar el token:", error);
      }
    }

    if (userId && result.id_reporte) {
      try {
        const historialResponse = await fetch(
          "https://ucv-reports-backend.onrender.com/historial-reportes/add",
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              ...(token && { Authorization: `Bearer ${token}` }),
            },
            body: JSON.stringify({
              usuario_id: parseInt(userId),
              reporte_id: parseInt(result.id_reporte),
            }),
          }
        );

        if (!historialResponse.ok) {
          throw new Error(`HTTP error! status: ${historialResponse.status}`);
        }

        console.log("Reporte registrado en historial con éxito.");
      } catch (error) {
        console.error("Error al registrar historial:", error);
      }
    }

    alert("Reporte enviado con éxito!");
    document.getElementById("reportForm").reset();
  } catch (error) {
    console.error("Error al enviar el reporte:", error);
    alert("Error al enviar el reporte. Revisa la consola para más detalles.");
  }
}
