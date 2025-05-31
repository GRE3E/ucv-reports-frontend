const passwordInput = document.getElementById("password-input");
const togglePassword = document.getElementById("togglePassword");
const eyeOpen = document.getElementById("eyeOpen");
const eyeClosed = document.getElementById("eyeClosed");

togglePassword.addEventListener("click", () => {
  const isPassword = passwordInput.type === "password";
  passwordInput.type = isPassword ? "text" : "password";
  eyeOpen.style.display = isPassword ? "inline" : "none";
  eyeClosed.style.display = isPassword ? "none" : "inline";
});
