document.addEventListener("DOMContentLoaded", async () => {
  const form = document.querySelector("form");
  const facultadSelect = document.getElementById("id_facultad");
  const turnoSelect = document.getElementById("id_turno");
  const pabellonSelect = document.getElementById("id_pabellon");
  const pisoSelect = document.getElementById("id_piso");
  const aulaSelect = document.getElementById("id_aula");
  const articuloSelect = document.getElementById("id_articulo");
  const descripcionInput = document.getElementById("descripcion");
  const archivoInput = document.getElementById("archivo");

  // Inicializar Clerk.js
  if (window.Clerk) {
    await window.Clerk.load();
  } else {
    console.error(
      "Clerk.js SDK no está cargado. Asegúrate de incluir la etiqueta <script> de Clerk en tu HTML."
    );
    alert("Error: El sistema de autenticación no está disponible.");
    return;
  }

  // Funciones para cargar datos de los selects
  const fetchDataAndPopulateSelect = async (url, selectElement, idField, nameField, defaultOptionText) => {
    try {
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      selectElement.innerHTML = `<option value="">${defaultOptionText}</option>`;
      data.forEach(item => {
        const option = document.createElement("option");
        option.value = item[idField];
        option.textContent = item[nameField];
        selectElement.appendChild(option);
      });
    } catch (error) {
      console.error(`Error al cargar ${defaultOptionText.toLowerCase()}:`, error);
    }
  };

  // Cargar todos los selects al iniciar
  await fetchDataAndPopulateSelect("https://ucv-reports-backend.onrender.com/facultades", facultadSelect, "id_facultad", "nombre_facultad", "Seleccione una facultad");
  await fetchDataAndPopulateSelect("https://ucv-reports-backend.onrender.com/turnos", turnoSelect, "id_turno", "nombre_turno", "Seleccione un turno");
  await fetchDataAndPopulateSelect("https://ucv-reports-backend.onrender.com/pabellones", pabellonSelect, "id_pabellon", "nombre_pabellon", "Seleccione un pabellón");
  await fetchDataAndPopulateSelect("https://ucv-reports-backend.onrender.com/pisos", pisoSelect, "id_piso", "numero_piso", "Seleccione un piso");
  await fetchDataAndPopulateSelect("https://ucv-reports-backend.onrender.com/aulas", aulaSelect, "id_aula", "numero_aula", "Seleccione un aula");
  await fetchDataAndPopulateSelect("https://ucv-reports-backend.onrender.com/articulos", articuloSelect, "id_articulo", "nombre_articulo", "Seleccione un artículo");

  form.addEventListener("submit", async (event) => {
    event.preventDefault();

    let token = null;
    let userId = null;

    if (window.Clerk.user) {
      try {
        token = await window.Clerk.user.getToken();
        userId = window.Clerk.user.id; // Obtener el ID del usuario de Clerk
      } catch (error) {
        console.error("Error al obtener el token o ID de Clerk:", error);
        alert(
          "No se pudo obtener el token de autenticación o el ID de usuario. Por favor, inicia sesión de nuevo."
        );
        return;
      }
    } else {
      alert("No hay usuario autenticado. Por favor, inicia sesión.");
      return;
    }

    if (!token || !userId) {
      alert("Token de autenticación o ID de usuario no disponible. Por favor, inicia sesión.");
      return;
    }

    const data = {
      id_facultad: facultadSelect.value,
      id_turno: turnoSelect.value,
      id_pabellon: pabellonSelect.value,
      id_piso: pisoSelect.value,
      id_aula: aulaSelect.value,
      id_articulo: articuloSelect.value,
      descripcion: descripcionInput.value,
      id_usuario: userId, // Asignar el ID del usuario de Clerk
      estado_reporte: "Pendiente", // Estado inicial del reporte
    };

    // Manejo del archivo (si existe)
    const formData = new FormData();
    formData.append('data', JSON.stringify(data));
    if (archivoInput.files[0]) {
      formData.append('archivo', archivoInput.files[0]);
    }

    try {
      const response = await fetch(
        "https://ucv-reports-backend.onrender.com/reportes",
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`, // Incluir el token de autenticación
          },
          body: formData, // Usar FormData para enviar el archivo y los datos
        }
      );

      if (response.ok) {
        alert("Reporte enviado con éxito!");
        form.reset();
      } else {
        const errorData = await response.json();
        alert(
          `Error al enviar el reporte: ${
            errorData.message || response.statusText
          }`
        );
      }
    } catch (error) {
      console.error("Error en la solicitud:", error);
      alert("Ocurrió un error al intentar enviar el reporte.");
    }
  });
});
