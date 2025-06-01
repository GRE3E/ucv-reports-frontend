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
  if (togglePassword) {
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
  const toggleVerificarPassword = document.getElementById(
    "toggleVerificarPassword"
  );
  if (toggleVerificarPassword) {
    const eyeIconVerificar = toggleVerificarPassword.querySelector("i");
    toggleVerificarPassword.addEventListener("click", function () {
      const isPassword = verificarPasswordInput.type === "password";
      verificarPasswordInput.type = isPassword ? "text" : "password";
      eyeIconVerificar.classList.toggle("fa-eye");
      eyeIconVerificar.classList.toggle("fa-eye-slash");
    });
  }

  // Lógica de registro
  const registerForm = document.getElementById("registerForm");
  const nombreInput = document.getElementById("nombre");
  const apellidoPaternoInput = document.getElementById("apellidoPaterno");
  const apellidoMaternoInput = document.getElementById("apellidoMaterno");

  // Crear select para cargos
  let cargoSelect = document.createElement("select");
  cargoSelect.id = "cargo";
  cargoSelect.required = true;
  cargoSelect.innerHTML = '<option value="">Selecciona un cargo</option>';
  // Insertar el select antes del campo de contraseña
  const passwordDiv = passwordInput.closest(".input-icon");
  passwordDiv.parentNode.insertBefore(cargoSelect, passwordDiv);

  // Obtener cargos del backend
  fetch("/cargos")
    .then((res) => res.json())
    .then((data) => {
      data.forEach((cargo) => {
        let option = document.createElement("option");
        option.value = cargo.idcargo;
        option.textContent = cargo.descripcion;
        cargoSelect.appendChild(option);
      });
    })
    .catch(() => {
      let option = document.createElement("option");
      option.value = "";
      option.textContent = "Error al cargar cargos";
      cargoSelect.appendChild(option);
    });

  registerForm.addEventListener("submit", function (e) {
    e.preventDefault();
    const nombre = nombreInput.value.trim();
    const apellidoPaterno = apellidoPaternoInput.value.trim();
    const apellidoMaterno = apellidoMaternoInput.value.trim();
    const password = passwordInput.value;
    const verificarPassword = verificarPasswordInput.value;
    const id_cargo = cargoSelect.value;

    if (
      !nombre ||
      !apellidoPaterno ||
      !apellidoMaterno ||
      !password ||
      !verificarPassword ||
      !id_cargo
    ) {
      alert("Por favor, completa todos los campos.");
      return;
    }
    if (password !== verificarPassword) {
      alert("Las contraseñas no coinciden.");
      return;
    }

    fetch("/usuarios/add", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        nombre,
        apellido_paterno: apellidoPaterno,
        apellido_materno: apellidoMaterno,
        contraseña: password,
        id_cargo: parseInt(id_cargo),
      }),
    })
      .then((res) => res.json())
      .then((data) => {
        if (data && data.usuario) {
          alert("Cuenta creada exitosamente. Tu usuario es: " + data.usuario);
          window.location.href = "/login";
        } else if (data && data.message) {
          alert("Error: " + data.message);
        } else {
          alert("Ocurrió un error al crear la cuenta.");
        }
      })
      .catch(() => {
        alert("Ocurrió un error al conectar con el servidor.");
      });
  });
});
