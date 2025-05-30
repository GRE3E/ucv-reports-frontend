document.addEventListener("DOMContentLoaded", async () => {
  const form = document.querySelector("form");

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

  form.addEventListener("submit", async (event) => {
    event.preventDefault();

    let token = null;
    if (window.Clerk.user) {
      try {
        token = await window.Clerk.user.getToken();
      } catch (error) {
        console.error("Error al obtener el token de Clerk:", error);
        alert(
          "No se pudo obtener el token de autenticación. Por favor, inicia sesión de nuevo."
        );
        return;
      }
    } else {
      alert("No hay usuario autenticado. Por favor, inicia sesión.");
      return;
    }

    if (!token) {
      alert("Token de autenticación no disponible. Por favor, inicia sesión.");
      return;
    }

    const formData = new FormData(form);
    const data = Object.fromEntries(formData.entries());

    try {
      const response = await fetch(
        "https://ucv-reports-backend.onrender.com/api/reportes",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`, // Incluir el token de autenticación
          },
          body: JSON.stringify(data),
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
