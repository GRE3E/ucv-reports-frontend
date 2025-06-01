document.addEventListener("DOMContentLoaded", function () {
  const recuperacionForm = document.getElementById("recuperacionForm");
  const resetPasswordForm = document.getElementById("resetPasswordForm");

  if (recuperacionForm) {
    recuperacionForm.addEventListener("submit", async function (e) {
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
          sessionStorage.setItem("userIdForPasswordReset", data.userId);
          window.location.href = "recuperacion.html";
        } else {
          alert("Los datos ingresados no coinciden con ningún usuario.");
        }
      } catch (error) {
        alert("Error al verificar los datos. Intenta nuevamente.");
      }
    });
  }

  if (resetPasswordForm) {
    resetPasswordForm.addEventListener("submit", async function (e) {
      e.preventDefault();
      const newPassword = document.getElementById("newPassword").value;
      const confirmPassword = document.getElementById("confirmPassword").value;
      const userId = sessionStorage.getItem("userIdForPasswordReset");

      if (!userId) {
        alert(
          "No se encontró el ID de usuario para restablecer la contraseña. Por favor, inicia el proceso de recuperación de nuevo."
        );
        window.location.href = "recuperacion_cuenta.html";
        return;
      }

      if (newPassword !== confirmPassword) {
        alert("Las contraseñas no coinciden.");
        return;
      }

      if (newPassword.length < 6) {
        alert("La nueva contraseña debe tener al menos 6 caracteres.");
        return;
      }

      try {
        const response = await fetch(
          "https://ucv-reports-backend.onrender.com/auth/change-password",
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              userId: parseInt(userId),
              newPassword: newPassword,
            }),
          }
        );
        const data = await response.json();
        if (response.ok) {
          alert(
            "Contraseña restablecida exitosamente. Ahora puedes iniciar sesión con tu nueva contraseña."
          );
          sessionStorage.removeItem("userIdForPasswordReset");
          window.location.href = "/login"; // Redirigir a la página de login
        } else {
          alert(data.message || "Error al restablecer la contraseña.");
        }
      } catch (error) {
        alert("Error de conexión al intentar restablecer la contraseña.");
      }
    });
  }
});
