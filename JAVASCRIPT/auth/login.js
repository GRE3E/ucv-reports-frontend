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

      console.log("Attempting login with username:", usuario);

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
        console.log("Login API response:", data);

        if (response.ok) {
          localStorage.setItem("access_token", data.access_token);
          console.log("Token stored:", data.access_token);
          alert("Login successful!");

          // Conditional redirection based on user role
          if (
            data.role === "Alumno" ||
            data.role === "Profesor" ||
            data.role === "PersonalUCV"
          ) {
            window.location.href = "/reporte_enviar";
          } else if (data.role === "Administrador") {
            console.log("Redirecting to /usuarios_gestion");
            window.location.href = "/usuarios_gestion";
          } else {
            console.log("Redirecting to /");
            window.location.href = "/";
          }
        } else if (response.status === 401) {
          console.error("Login failed: Invalid credentials.");
          alert("Invalid credentials. Please try again.");
        } else {
          console.error("Login failed:", data.message || "Unknown error.");
          alert(data.message || "Login failed.");
        }
      } catch (error) {
        console.error("Error during login API call:", error);
        alert("An error occurred during login.");
      }
    });
  } else {
    console.error("Login form or input fields not found.");
  }
});
