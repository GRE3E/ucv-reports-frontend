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

// Cargar pabellones al iniciar la página
loadPabellones();

// Event listener para el cambio de pabellón
const selectPabellon = document.getElementById("pabellon");
selectPabellon.addEventListener("change", loadPisos);

// Event listener para el cambio de piso
const selectPiso = document.getElementById("piso");
selectPiso.addEventListener("change", loadAulas);

async function loadPabellones() {
  try {
    const response = await fetch(
      "https://ucv-reports-backend.onrender.com/pabellon"
    );
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const pabellones = await response.json();
    const selectPabellon = document.getElementById("pabellon");
    selectPabellon.innerHTML =
      '<option value="">Seleccione un pabellón</option>'; // Opción por defecto
    pabellones.forEach((pabellon) => {
      const option = document.createElement("option");
      option.value = pabellon.id;
      option.textContent = pabellon.Pabellon;
      selectPabellon.appendChild(option);
    });
  } catch (error) {
    console.error("Error al cargar los pabellones:", error);
    alert(
      "Error al cargar los pabellones. Revisa la consola para más detalles."
    );
  }
}

async function loadPisos() {
  const selectPabellon = document.getElementById("pabellon");
  const selectedPabellonId = selectPabellon.value;
  const selectPiso = document.getElementById("piso");
  selectPiso.innerHTML = '<option value="">Seleccione un piso</option>'; // Opción por defecto
  selectPiso.disabled = true; // Deshabilitar hasta que se seleccione un pabellón

  if (!selectedPabellonId) {
    return;
  }

  try {
    const response = await fetch(
      "https://ucv-reports-backend.onrender.com/piso"
    );
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const pisos = await response.json();
    const filteredPisos = pisos.filter(
      (piso) => piso.idpabellon == selectedPabellonId
    );

    selectPiso.disabled = false; // Habilitar el select de pisos
    filteredPisos.forEach((piso) => {
      const option = document.createElement("option");
      option.value = piso.numero_piso;
      option.textContent = piso.numero_piso;
      selectPiso.appendChild(option);
    });
  } catch (error) {
    console.error("Error al cargar los pisos:", error);
    alert("Error al cargar los pisos. Revisa la consola para más detalles.");
  }
}

async function loadAulas() {
  const selectPabellon = document.getElementById("pabellon");
  const selectedPabellonId = selectPabellon.value;
  const selectPiso = document.getElementById("piso");
  const selectedPisoNumber = selectPiso.value;
  const selectAula = document.getElementById("aula");
  selectAula.innerHTML = '<option value="">Seleccione un aula</option>'; // Opción por defecto
  selectAula.disabled = true; // Deshabilitar hasta que se seleccione un piso

  if (!selectedPabellonId || !selectedPisoNumber) {
    return;
  }

  try {
    const response = await fetch(
      "https://ucv-reports-backend.onrender.com/salon"
    );
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const aulas = await response.json();
    const filteredAulas = aulas.filter(
      (aula) =>
        aula.idpabellon == selectedPabellonId &&
        aula.idpiso == selectedPisoNumber
    );

    selectAula.disabled = false; // Habilitar el select de aulas
    filteredAulas.forEach((aula) => {
      const option = document.createElement("option");
      option.value = aula.nombre;
      option.textContent = aula.nombre;
      selectAula.appendChild(option);
    });
  } catch (error) {
    console.error("Error al cargar las aulas:", error);
    alert("Error al cargar las aulas. Revisa la consola para más detalles.");
  }
}

async function sendReport(token) {
  const evidenciaInput = document.getElementById("evidencia");
  const file = evidenciaInput.files[0];

  const reportData = {
    facultad: document.getElementById("facultad").value,
    turno: document.getElementById("turno").value,
    Pabellon: document.getElementById("pabellon").value,
    Piso: document.getElementById("piso").value,
    Salon: document.getElementById("aula").value,
    Articulos: document.getElementById("articulo").value,
    descripcion: document.getElementById("descripcion").value,
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

    if (file) {
      const formData = new FormData();
      formData.append("file", file);

      try {
        const uploadResponse = await fetch(
          `https://ucv-reports-backend.onrender.com/google-drive/reportes/${result.id_reporte}/upload-evidencia`,
          {
            method: "POST",
            headers: {
              ...(token && { Authorization: `Bearer ${token}` }),
            },
            body: formData,
          }
        );

        if (!uploadResponse.ok) {
          throw new Error(`HTTP error! status: ${uploadResponse.status}`);
        }
        const uploadResult = await uploadResponse.json();
        console.log("Evidencia cargada con éxito:", uploadResult);
      } catch (error) {
        console.error("Error al cargar la evidencia:", error);
        alert(
          "Error al cargar la evidencia. Revisa la consola para más detalles."
        );
      }
    }

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
