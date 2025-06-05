const token = localStorage.getItem("access_token");
if (!token) {
  window.location.replace("/login");
  throw new Error("No token found. Halting script.");
}

import { validateTokenAndRedirect, fetchWithAuth } from "./auth/auth_utils.js";

document.addEventListener("DOMContentLoaded", () => {
  // Validar token antes de continuar
  const token = validateTokenAndRedirect();
  if (!token) {
    console.warn("Token no válido. Cancelando ejecución.");
    return; // Detiene toda la ejecución si no hay token
  }

  // Mostrar token en consola si es válido
  console.log("Token JWT disponible en usuario_gestion_M6.js:", token);
  try {
    const payloadBase64 = token.split(".")[1];
    const decodedPayload = JSON.parse(atob(payloadBase64));
    console.log("ID de usuario (sub) del token:", decodedPayload.sub);
  } catch (error) {
    console.error("Error al decodificar el token JWT:", error);
  }

  const usersTableBody = document.querySelector(".usuarios-table tbody");

  const fetchUsers = async (status = "habilitados", roleId = null) => {
    try {
      let url = `https://ucv-reports-backend.onrender.com/usuarios/${status}`;
      if (roleId) {
        url = `https://ucv-reports-backend.onrender.com/usuarios/role/${roleId}`;
      }
      const response = await fetchWithAuth(url);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const users = await response.json();
      populateTable(users, status === "eliminados"); // Pass a flag if disabled users are being displayed
    } catch (error) {
      console.error(`Error fetching ${status} users:`, error);
    }
  };

  const fetchRoles = async () => {
    try {
      const response = await fetchWithAuth(
        "https://ucv-reports-backend.onrender.com/cargos"
      );
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const roles = await response.json();
      const roleFilterSelect = document.getElementById("roleFilter");
      const roleUserSelect = document.getElementById("roleUser"); // Get the roleUser select

      roles.forEach((role) => {
        const optionFilter = document.createElement("option");
        optionFilter.value = role.idcargo;
        optionFilter.textContent = role.descripcion;
        roleFilterSelect.appendChild(optionFilter);

        const optionUser = document.createElement("option");
        optionUser.value = role.idcargo;
        optionUser.textContent = role.descripcion;
        roleUserSelect.appendChild(optionUser);
      });
    } catch (error) {
      console.error("Error fetching roles:", error);
    }
  };

  const populateTable = (users, is_disabled_user = false) => {
    usersTableBody.innerHTML = ""; // Clear existing rows
    users.forEach((user) => {
      const row = usersTableBody.insertRow();
      row.insertCell().textContent = user.usuario;
      row.insertCell().textContent = user.nombre;
      row.insertCell().textContent = `${user.apellido_paterno} ${user.apellido_materno}`;
      row.insertCell().textContent = getRoleName(user.id_cargo);
      row.insertCell().textContent = "********"; // Password masked
      const actionsCell = row.insertCell();

      if (is_disabled_user) {
        actionsCell.innerHTML = `
                  <button class="btn-action btn-enable" data-id="${user.IDUsuario}"><i class="fas fa-user-plus"></i>Habilitar</button>
              `;
        actionsCell
          .querySelector(".btn-enable")
          .addEventListener("click", () => enableUser(user.IDUsuario));
      } else {
        actionsCell.innerHTML = `
                  <button class="btn-action btn-edit" data-id="${user.IDUsuario}"><i class="fas fa-edit"></i>Editar</button>
                  <button class="btn-action btn-disable" data-id="${user.IDUsuario}"><i class="fas fa-user-slash"></i>Deshabilitar</button>
              `;
        actionsCell
          .querySelector(".btn-disable")
          .addEventListener("click", () => openDisableModal(user));
      }

      // Add event listener for edit button
      if (!is_disabled_user) {
        actionsCell
          .querySelector(".btn-edit")
          .addEventListener("click", () => openEditModal(user));
      }
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
      fetchUsers("habilitados", selectedRoleId);
    } else {
      fetchUsers("habilitados"); // Fetch all enabled users if "Ordenar por Rol" is selected
    }
  });

  // Event listeners para los botones de usuarios habilitados/deshabilitados
  document.addEventListener("click", (event) => {
    // Botón para usuarios habilitados
    if (event.target.closest(".btn-action.enabled-btn")) {
      fetchUsers("habilitados");
    }

    // Botón para usuarios deshabilitados
    if (event.target.closest(".btn-action.disabled-btn")) {
      fetchUsers("eliminados");
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
      if (parseInt(option.value) === user.id_cargo) {
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
  const enableUser = async (userId) => {
    try {
      const response = await fetchWithAuth(
        `https://ucv-reports-backend.onrender.com/usuarios/${userId}/enable`,
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

      alert("Usuario habilitado exitosamente!");
      fetchUsers("eliminados"); // Refresh the disabled users list
    } catch (error) {
      console.error("Error enabling user:", error);
      alert("Error al habilitar el usuario.");
    }
  };

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
          const response = await fetchWithAuth(
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
          fetchUsers("habilitados"); // Refresh the enabled users list
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
      const id_cargo = parseInt(roleUser);

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
        const response = await fetchWithAuth(
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
        fetchUsers("habilitados");
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
      fetchUsers("habilitados");
      return;
    }

    try {
      const response = await fetchWithAuth(
        `https://ucv-reports-backend.onrender.com/usuarios/buscar-parcial/${encodeURIComponent(
          value
        )}`
      );

      if (!response.ok) {
        if (response.status === 404) {
          populateTable([]);
          return;
        }
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      // Validar si el body está vacío
      const text = await response.text();
      if (!text) {
        populateTable([]);
        return;
      }

      const users = JSON.parse(text);
      if (Array.isArray(users) && users.length > 0) {
        populateTable(users);
      } else {
        populateTable([]);
      }
    } catch (error) {
      console.error("Error searching user:", error);
      populateTable([]);
    }
  });
});

// Manejo de logout
const logoutLink = document.querySelector("#exitBtn");
if (logoutLink) {
  logoutLink.addEventListener("click", function (e) {
    e.preventDefault();
    localStorage.removeItem("access_token");
    window.location.replace("/login");
  });
}

// Cerrar modales al hacer clic fuera de ellos
window.onclick = function (event) {
  const modalEditActual = document.getElementById("modalEditActual");
  const modalDeshabilitar = document.getElementById("modalDeshabilitar");

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
