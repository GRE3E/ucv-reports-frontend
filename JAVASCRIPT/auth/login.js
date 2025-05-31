document.addEventListener("DOMContentLoaded", function () {
  const passwordInput = document.getElementById("password-input");
  const togglePassword = document.getElementById("togglePassword");
  const eyeIcon = togglePassword ? togglePassword.querySelector("i") : null;

  const loginForm = document.getElementById("login-form");
  const usernameInput = document.getElementById("username-input");

  // Event listener for password visibility toggle
  if (togglePassword && passwordInput && eyeIcon) {
    togglePassword.addEventListener("click", function () {
      const isPassword = passwordInput.type === "password";
      passwordInput.type = isPassword ? "text" : "password";
      if (isPassword) {
        eyeIcon.classList.remove("fa-eye-slash");
        eyeIcon.classList.add("fa-eye");
      } else {
        eyeIcon.classList.remove("fa-eye");
        eyeIcon.classList.add("fa-eye-slash");
      }
    });
  } else {
    console.error("Password input or toggle button not found.");
  }

  // Event listener for login form submission
  if (loginForm && usernameInput && passwordInput) {
    loginForm.addEventListener("submit", async (event) => {
      event.preventDefault();

      const usuario = usernameInput.value;
      const contraseña = passwordInput.value;

      try {
        const response = await fetch(
          "https://ucv-reports-backend.onrender.com/auth/login",
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({ usuario, contraseña }),
          }
        );

        const data = await response.json();

        if (response.ok) {
          localStorage.setItem("access_token", data.access_token);
          alert("Login successful!");

          // Conditional redirection based on user role
          if (data.role === "Alumno") {
            window.location.href = "/registrar_reporte";
          } else if (data.role === "Administrador") {
            window.location.href = "/usuarios_gestion";
          } else {
            window.location.href = "/";
          }
        } else {
          alert(data.message || "Login failed.");
        }
      } catch (error) {
        console.error("Error:", error);
        alert("An error occurred during login.");
      }
    });
  } else {
    console.error("Login form or input fields not found.");
  }
});
