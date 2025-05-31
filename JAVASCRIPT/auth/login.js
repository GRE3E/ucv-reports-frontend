const passwordInput = document.getElementById("password-input");
const togglePassword = document.getElementById("togglePassword");
const eyeOpen = document.getElementById("eyeOpen");
const eyeClosed = document.getElementById("eyeClosed");

const loginForm = document.getElementById("login-form");
const usernameInput = document.getElementById("username-input");

togglePassword.addEventListener("click", () => {
  const isPassword = passwordInput.type === "password";
  passwordInput.type = isPassword ? "text" : "password";
  eyeOpen.style.display = isPassword ? "inline" : "none";
  eyeClosed.style.display = isPassword ? "none" : "inline";
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
        window.location.href = "/dashboard.html"; // Or any other default page
      }
    } else {
      alert(data.message || "Login failed.");
    }
  } catch (error) {
    console.error("Error:", error);
    alert("An error occurred during login.");
  }
});
