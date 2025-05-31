window.addEventListener("load", () => {
  const loading = document.getElementById("loading-screen");
  loading.classList.add("slide-away");
  setTimeout(() => {
    loading.style.display = "none";
  }, 1500); // 1.5 segundos
});

document.addEventListener("DOMContentLoaded", function () {
  // Para el campo Contraseña
  const passwordInput = document.getElementById("password");
  const togglePassword = document.getElementById("togglePassword");
  if (togglePassword) { // Verifica si el elemento existe
    const eyeIcon = togglePassword.querySelector("i");

    togglePassword.addEventListener("click", function () {
      const isPassword = passwordInput.type === "password";
      passwordInput.type = isPassword ? "text" : "password";
      eyeIcon.classList.toggle("fa-eye");
      eyeIcon.classList.toggle("fa-eye-slash");
    });
  }

  // Para el campo Verificar Contraseña
  const verificarPasswordInput = document.getElementById("verificarPassword");
  const toggleVerificarPassword = document.getElementById("toggleVerificarPassword");
  if (toggleVerificarPassword) { // Verifica si el elemento existe
    const eyeIconVerificar = toggleVerificarPassword.querySelector("i");

    toggleVerificarPassword.addEventListener("click", function () {
      const isPassword = verificarPasswordInput.type === "password";
      verificarPasswordInput.type = isPassword ? "text" : "password";
      eyeIconVerificar.classList.toggle("fa-eye");
      eyeIconVerificar.classList.toggle("fa-eye-slash");
    });
  }
});