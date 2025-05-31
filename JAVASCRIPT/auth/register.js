window.addEventListener("load", () => {
  const loading = document.getElementById("loading-screen");
  loading.classList.add("slide-away");
  setTimeout(() => {
    loading.style.display = "none";
  }, 1500); // 1.5 segundos
});

document.addEventListener("DOMContentLoaded", function () {
  const passwordInput = document.getElementById("verificarPassword");
  const togglePassword = document.getElementById("toggleVerificarPassword");
  const eyeIcon = togglePassword.querySelector("i");

  togglePassword.addEventListener("click", function () {
    const isPassword = passwordInput.type === "password";
    passwordInput.type = isPassword ? "text" : "password";
    eyeIcon.classList.toggle("fa-eye");
    eyeIcon.classList.toggle("fa-eye-slash");
  });
});