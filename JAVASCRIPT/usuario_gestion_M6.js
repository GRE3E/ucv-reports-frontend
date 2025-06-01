document.addEventListener("DOMContentLoaded", () => {
  const usersTableBody = document.querySelector(".usuarios-table tbody");

  const fetchUsers = async (roleId = null) => {
    try {
      let url = "https://ucv-reports-backend.onrender.com/usuarios/habilitados";
      if (roleId) {
        url = `https://ucv-reports-backend.onrender.com/usuarios/role/${roleId}`;
      }
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const users = await response.json();
      populateTable(users);
    } catch (error) {
      console.error("Error fetching users:", error);
    }
  };

  // Nueva función para obtener usuarios habilitados
  const fetchEnabledUsers = async () => {
    try {
      const response = await fetch(
        "https://ucv-reports-backend.onrender.com/usuarios/habilitados"
      );
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const users = await response.json();
      populateTable(users);
    } catch (error) {
      console.error("Error fetching enabled users:", error);
    }
  };

  // Nueva función para obtener usuarios deshabilitados
  const fetchDisabledUsers = async () => {
    try {
      const response = await fetch(
        "https://ucv-reports-backend.onrender.com/usuarios/eliminados"
      );
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const users = await response.json();
      populateTable(users);
    } catch (error) {
      console.error("Error fetching disabled users:", error);
    }
  };

  const fetchRoles = async () => {
    try {
      const response = await fetch(
        "https://ucv-reports-backend.onrender.com/cargos"
      );
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const roles = await response.json();
      const roleFilterSelect = document.getElementById("roleFilter");
      roles.forEach((role) => {
        const option = document.createElement("option");
        option.value = role.idcargo;
        option.textContent = role.descripcion;
        roleFilterSelect.appendChild(option);
      });
    } catch (error) {
      console.error("Error fetching roles:", error);
    }
  };

  const populateTable = (users) => {
    usersTableBody.innerHTML = ""; // Clear existing rows
    users.forEach((user) => {
      const row = usersTableBody.insertRow();
      row.insertCell().textContent = user.usuario;
      row.insertCell().textContent = user.nombre;
      row.insertCell().textContent = `${user.apellido_paterno} ${user.apellido_materno}`;
      row.insertCell().textContent = getRoleName(user.id_cargo);
      row.insertCell().textContent = "********"; // Password masked
      const actionsCell = row.insertCell();
      actionsCell.innerHTML = `
                <button class="btn-action btn-edit" data-id="${user.IDUsuario}"><i class="fas fa-edit"></i>Editar</button>
                <button class="btn-action btn-disable" data-id="${user.IDUsuario}"><i class="fas fa-user-slash"></i>Deshabilitar</button>
            `;

      // Add event listener for edit button
      actionsCell
        .querySelector(".btn-edit")
        .addEventListener("click", () => openEditModal(user));

      // Add event listener for disable button
      actionsCell
        .querySelector(".btn-disable")
        .addEventListener("click", () => openDisableModal(user));
    });
  };

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

  fetchUsers();
  fetchRoles();

  const roleFilterSelect = document.getElementById("roleFilter");
  roleFilterSelect.addEventListener("change", (event) => {
    const selectedRoleId = event.target.value;
    if (selectedRoleId) {
      fetchUsers(selectedRoleId);
    } else {
      fetchUsers(); // Fetch all enabled users if "Ordenar por Rol" is selected
    }
  });

  // Event listeners para los botones de usuarios habilitados/deshabilitados
  document.addEventListener("click", (event) => {
    // Botón para usuarios habilitados
    if (event.target.closest(".btn-action.enabled-btn")) {
      fetchEnabledUsers();
    }

    // Botón para usuarios deshabilitados
    if (event.target.closest(".btn-action.disabled-btn")) {
      fetchDisabledUsers();
    }
  });

  // Function to open edit modal and populate with user data
  const openEditModal = (user) => {
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
      if (option.value === getRoleName(user.idcargo)) {
        option.selected = true;
      } else {
        option.selected = false;
      }
    });
    document.getElementById("passwordUser").value = ""; // Password should not be pre-filled for security

    // Store user ID in a data attribute on the save button for later use
    document.querySelector(".btn.guardar-edit").dataset.userId = user.IDUsuario;
  };

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
      } catch (error) {
        console.error("Error updating user:", error);
        alert("Error al actualizar el usuario.");
      }
    });

  const searchInput = document.querySelector(
    '.search-controls input[type="text"]'
  );
  searchInput.addEventListener("keyup", async (event) => {
    const value = event.target.value.trim();
    if (value === "") {
      fetchUsers();
      return;
    }
    try {
      const response = await fetch(
        `https://ucv-reports-backend.onrender.com/usuarios/buscar-usuario/${encodeURIComponent(
          value
        )}`
      );
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const user = await response.json();
      if (user) {
        populateTable([user]);
      } else {
        // Si no se encuentra, limpia la tabla
        populateTable([]);
      }
    } catch (error) {
      console.error("Error searching user:", error);
      populateTable([]);
    }
  });
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
