document.addEventListener("DOMContentLoaded", function () {
  const form = document.getElementById("recuperacionForm");
  form.addEventListener("submit", async function (e) {
    e.preventDefault();
    const usuario = document.getElementById("usuario").value.trim();
    const nombre = document.getElementById("nombre").value.trim();
    const apellidoPaterno = document
      .getElementById("apellidoPaterno")
      .value.trim();
    const apellidoMaterno = document
      .getElementById("apellidoMaterno")
      .value.trim();

    if (!usuario || !nombre || !apellidoPaterno || !apellidoMaterno) {
      alert("Por favor, completa todos los campos.");
      return;
    }

    try {
      const response = await fetch(
        "https://ucv-reports-backend.onrender.com/auth/verificar-datos-recuperacion",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            usuario,
            nombre,
            apellido_paterno: apellidoPaterno,
            apellido_materno: apellidoMaterno,
          }),
        }
      );
      const data = await response.json();
      if (data.success) {
        // Aquí podrías guardar el userId en sessionStorage/localStorage si lo necesitas
        window.location.href = "recuperacion.html";
      } else {
        alert("Los datos ingresados no coinciden con ningún usuario.");
      }
    } catch (error) {
      alert("Error al verificar los datos. Intenta nuevamente.");
    }
  });
});
