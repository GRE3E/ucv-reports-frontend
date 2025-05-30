// Este archivo JavaScript manejará la lógica del formulario y la comunicación con el backend.
// Para integrar Clerk.js en un entorno de HTML/JS puro, debes cargar el SDK de Clerk.js
// a través de una etiqueta <script> en tu HTML, por ejemplo:
// <script async src="https://cdn.jsdelivr.net/npm/@clerk/clerk-js@latest/dist/clerk.browser.js"></script>
// Una vez cargado, el objeto `Clerk` estará disponible globalmente.

// Reemplaza 'YOUR_CLERK_PUBLISHABLE_KEY' con tu clave publicable de Clerk.
// Puedes encontrarla en tu panel de control de Clerk (por ejemplo, pk_live_...).
const clerkPublishableKey =
  "pk_test_YWRqdXN0ZWQta2luZ2Zpc2gtOTcuY2xlcmsuYWNjb3VudHMuZGV2JA";

document.addEventListener("DOMContentLoaded", async () => {
  const form = document.querySelector("form");

  // Inicializar Clerk.js
  if (window.Clerk) {
    await window.Clerk.load({
      publishableKey: clerkPublishableKey,
    });
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
