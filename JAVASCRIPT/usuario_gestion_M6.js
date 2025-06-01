document.addEventListener("DOMContentLoaded", async () => {
  const usersTableBody = document.querySelector(".usuarios-table tbody");
  const roleFilterSelect = document.getElementById("roleFilter");
  const disabledBtn = document.querySelector(".disabled-btn");
  let roles = [];
  let showingDisabled = false;

  // Fetch roles/cargos and populate filter
  async function fetchRoles() {
    try {
      const response = await fetch("https://ucv-reports-backend.onrender.com/cargos");
      if (!response.ok) throw new Error("Error al obtener cargos");
      roles = await response.json();
      roleFilterSelect.innerHTML = `<option value="">Ordenar por Rol</option>`;
      roles.forEach((role) => {
        const option = document.createElement("option");
        option.value = role.idcargo;
        option.textContent = role.descripcion;
        roleFilterSelect.appendChild(option);
      });
    } catch (error) {
      console.error(error);
    }
  }

  // Fetch users (habilitados o deshabilitados, y opcionalmente por cargo)
  async function fetchUsers({ disabled = false, cargoId = "" } = {}) {
    let url = disabled
      ? "https://ucv-reports-backend.onrender.com/usuarios/eliminados"
      : "https://ucv-reports-backend.onrender.com/usuarios/habilitados";
    if (cargoId) url += `?idcargo=${cargoId}`;
    try {
      const response = await fetch(url);
      if (!response.ok) throw new Error("Error al obtener usuarios");
      const users = await response.json();
      populateTable(users, disabled);
    } catch (error) {
      console.error(error);
    }
  }

  // Render users table
  function populateTable(users, disabled = false) {
    usersTableBody.innerHTML = "";
    users.forEach((user) => {
      const row = usersTableBody.insertRow();
      row.insertCell().textContent = user.usuario;
      row.insertCell().textContent = user.nombre;
      row.insertCell().textContent = `${user.apellido_paterno} ${user.apellido_materno}`;
      row.insertCell().textContent = getRoleName(user.id_cargo)
      row.insertCell().textContent = "********";
      const actionsCell = row.insertCell();
      if (disabled) {
        actionsCell.innerHTML = `
          <button class="btn reactivar" data-id="${user.IDUsuario}">
            <i class="fas fa-user-check"></i> Habilitar
          </button>
        `;
        actionsCell.querySelector(".btn.reactivar").onclick = () => habilitarUsuario(user.IDUsuario);
      } else {
        actionsCell.innerHTML = `
          <button class="btn editar" data-id="${user.IDUsuario}">
            <i class="fas fa-edit"></i> Editar
          </button>
          <button class="btn deshabilitar" data-id="${user.IDUsuario}">
            <i class="fas fa-user-slash"></i> Deshabilitar
          </button>
        `;
        actionsCell.querySelector(".btn.editar").onclick = () => openEditModal(user);
        actionsCell.querySelector(".btn.deshabilitar").onclick = () => openDisableModal(user);
      }
    });
  }

  const getRoleName = (id_cargo) => {
 switch (id_cargo) {
case 1:
return "Alumno";
case 2:
return "Docente";
case 3:
return "PersonalUCV";
case 4:
return "Administrador";
default:
return "Desconocido";
 }
};

  // Filtrar por rol/cargo
  roleFilterSelect.addEventListener("change", (e) => {
    const cargoId = e.target.value;
    fetchUsers({ disabled: showingDisabled, cargoId });
  });

  // Alternar entre habilitados y deshabilitados
  disabledBtn.addEventListener("click", () => {
    showingDisabled = !showingDisabled;
    fetchUsers({ disabled: showingDisabled, cargoId: roleFilterSelect.value });
    disabledBtn.innerHTML = showingDisabled
      ? '<i class="fas fa-users"></i> Usuarios Habilitados'
      : '<i class="fas fa-ban"></i> Usuarios Deshabilitados';
  });

  // Buscar usuario por nombre de usuario
  document.querySelector('.search-controls input[type="text"]').addEventListener("keyup", async (event) => {
    const value = event.target.value.trim();
    if (value === "") {
      fetchUsers({ disabled: showingDisabled, cargoId: roleFilterSelect.value });
      return;
    }
    try {
      const response = await fetch(
        `https://ucv-reports-backend.onrender.com/usuarios/buscar-usuario/${encodeURIComponent(value)}`
      );
      if (!response.ok) throw new Error("Error buscando usuario");
      const user = await response.json();
      if (user && (!showingDisabled ? user.Estado === "Habilitado" : user.Estado === "Deshabilitado")) {
        populateTable([user], showingDisabled);
      } else {
        populateTable([], showingDisabled);
      }
    } catch (error) {
      console.error(error);
      populateTable([], showingDisabled);
    }
  });

  // Habilitar usuario
  async function habilitarUsuario(id) {
    await fetch(`https://ucv-reports-backend.onrender.com/usuarios/${id}/enable`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
    });
    fetchUsers({ disabled: true, cargoId: roleFilterSelect.value });
  }

  // Modal editar y deshabilitar (mantén tu lógica actual aquí)
  function openEditModal(user) {
    const modal = document.getElementById("modalEditActual");
    modal.style.display = "block";

    // Populate form fields
    document.getElementById("userName").value = user.usuario;
    document.getElementById("nombreUser").value = user.nombre;
    document.getElementById(
      "apellidosUser"
    ).value = `${user.apellido_paterno} ${user.apellido_materno}`;
    // Set the correct role in the select dropdown
    const roleSelect = document.getElementById("roleUser");
    Array.from(roleSelect.options).forEach((option) => {
      if (option.value === getRoleName(user.id_cargo)) {
        option.selected = true;
      } else {
        option.selected = false;
      }
    });
    document.getElementById("passwordUser").value = ""; // Password should not be pre-filled for security

    // Store user ID in a data attribute on the save button for later use
    document.querySelector(".btn.guardar-edit").dataset.userId = user.IDUsuario;
  }

  // Function to open disable modal and handle disable action
  const openDisableModal = (user) => {
    const modal = document.getElementById("modalDeshabilitar");
    modal.style.display = "block";

    // Store user ID in a data attribute on the accept button for later use
    document.querySelector(
      ".modal-actions-deshabiltar .aceptar"
    ).dataset.userId = user.IDUsuario;

    // Add event listener for the accept button inside the disable modal
    document.querySelector(".modal-actions-deshabiltar .aceptar").onclick =
      async () => {
        const userId = user.IDUsuario;
        try {
          const response = await fetch(
            `https://ucv-reports-backend.onrender.com/usuarios/${userId}/disable`,
            {
              method: "PUT",
              headers: {
                "Content-Type": "application/json",
              },
            }
          );

          if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
          }

          alert("Usuario deshabilitado exitosamente!");
          document.getElementById("modalDeshabilitar").style.display = "none";
          fetchUsers();
          // REMOVE DUPLICATE CALLS
        } catch (error) {
          console.error("Error disabling user:", error);
          alert("Error al deshabilitar el usuario.");
        }
      };

    // Add event listener for the cancel button inside the disable modal
    document.querySelector(".modal-actions-deshabiltar .cancelar").onclick =
      () => {
        document.getElementById("modalDeshabilitar").style.display = "none";
      };
  };

  // Handle save changes button click
  document
    .querySelector(".btn.guardar-edit")
    .addEventListener("click", async (event) => {
      const userId = event.target.dataset.userId;
      const userName = document.getElementById("userName").value;
      const nombreUser = document.getElementById("nombreUser").value;
      const apellidosUser = document.getElementById("apellidosUser").value;
      const roleUser = document.getElementById("roleUser").value;
      const passwordUser = document.getElementById("passwordUser").value;

      // Split apellidosUser into apellido_paterno and apellido_materno
      const apellidosArray = apellidosUser.split(" ");
      const apellido_paterno = apellidosArray[0] || "";
      const apellido_materno = apellidosArray.slice(1).join(" ") || "";

      // Map role name back to id_cargo
      const id_cargo_map = {
        Alumno: 1,
        Docente: 2,
        PersonalUCV: 3,
        Administrador: 4,
      };
      const id_cargo = id_cargo_map[roleUser];

      const updateData = {
        nombre: nombreUser,
        apellido_paterno: apellido_paterno,
        apellido_materno: apellido_materno,
        id_cargo: id_cargo,
      };

      if (passwordUser) {
        updateData.contraseña = passwordUser;
      }

      try {
        const response = await fetch(
          `https://ucv-reports-backend.onrender.com/usuarios/${userId}`,
          {
            method: "PUT",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify(updateData),
          }
        );

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        alert("Usuario actualizado exitosamente!");
        document.getElementById("modalEditActual").style.display = "none";
        fetchUsers();
        // REMOVE DUPLICATE CALLS
      } catch (error) {
        console.error("Error updating user:", error);
        alert("Error al actualizar el usuario.");
      }
    });

  // Inicialización
  await fetchRoles();
  fetchUsers();
});

// Funciones para los modales (mantenerlas si ya existen o se planean usar)
function abrirModalDeshabilitados() {
  const modal = document.getElementById("modalDeshabilitados");
  modal.style.display = "block";
}

function cerrarModalDeshabilitados() {
  const modal = document.getElementById("modalDeshabilitados");
  modal.style.display = "none";
}

// Cerrar modales al hacer clic fuera de ellos
window.onclick = function (event) {
  const modalDeshabilitados = document.getElementById("modalDeshabilitados");
  const modalEditActual = document.getElementById("modalEditActual");
  const modalDeshabilitar = document.getElementById("modalDeshabilitar");

  if (event.target == modalDeshabilitados) {
    modalDeshabilitados.style.display = "none";
  }
  if (event.target == modalEditActual) {
    modalEditActual.style.display = "none";
  }
  if (event.target == modalDeshabilitar) {
    modalDeshabilitar.style.display = "none";
  }
};

// Cerrar modal de edición con el botón de cerrar
document.querySelectorAll(".modal-content-edit .close").forEach((button) => {
  button.addEventListener("click", () => {
    document.getElementById("modalEditActual").style.display = "none";
  });
});

// Cerrar modal de deshabilitar con el botón de cerrar
document
  .querySelectorAll(".modal-content-deshabilitar .closeBtnDeshabilitar")
  .forEach((button) => {
    button.addEventListener("click", () => {
      document.getElementById("modalDeshabilitar").style.display = "none";
    });
  });
