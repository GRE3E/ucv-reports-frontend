const passwordInput = document.getElementById("passwordInput");
const togglePassword = document.getElementById("togglePassword");
const eyeOpen = document.getElementById("eyeOpen");
const eyeClosed = document.getElementById("eyeClosed");

const loginForm = document.getElementById("login-form");
const usernameInput = document.getElementById("username-input");

togglePassword.addEventListener("click", () => {
  const isPassword = passwordInput.type === "password";
  passwordInput.type = isPassword ? "text" : "password";
  eyeOpen.style.display = isPassword ? "none" : "inline";
  eyeClosed.style.display = isPassword ? "inline" : "none";
});

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
        window.location.href = "/registrar_reporte"; // Assuming this path is correct
      } else if (data.role === "Administrador") {
        window.location.href = "/usuarios_gestion"; // Assuming this path is correct
      } else {
        // Default redirection if role is not recognized or not provided
        window.location.href = "/"; // Or any other default page
      }
    } else {
      alert(data.message || "Login failed.");
    }
  } catch (error) {
    console.error("Error:", error);
    alert("An error occurred during login.");
  }
});

document.addEventListener("DOMContentLoaded", function () {
  const passwordInput = document.getElementById("password-input");
  const togglePassword = document.getElementById("togglePassword");
  const eyeIcon = togglePassword.querySelector("i");

  togglePassword.addEventListener("click", function () {
    const isPassword = passwordInput.type === "password";
    passwordInput.type = isPassword ? "text" : "password";
    // Cambia el ícono entre abierto y cerrado
    if (isPassword) {
      eyeIcon.classList.remove("fa-eye-slash");
      eyeIcon.classList.add("fa-eye");
    } else {
      eyeIcon.classList.remove("fa-eye");
      eyeIcon.classList.add("fa-eye-slash");
    }
  });
});
