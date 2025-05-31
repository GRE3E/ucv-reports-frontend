document.addEventListener("DOMContentLoaded", () => {
  const usersTableBody = document.querySelector(".usuarios-table tbody");

  const fetchUsers = async () => {
    try {
      const response = await fetch(
        "https://ucv-reports-backend.onrender.com/usuarios"
      );
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const users = await response.json();
      populateTable(users);
    } catch (error) {
      console.error("Error fetching users:", error);
    }
  };

  const populateTable = (users) => {
    usersTableBody.innerHTML = ""; // Clear existing rows
    users.forEach((user) => {
      const row = usersTableBody.insertRow();
      row.insertCell().textContent = user.usuario;
      row.insertCell().textContent = `${user.apellido_paterno} ${user.apellido_materno}`;
      row.insertCell().textContent = getRoleName(user.id_cargo);
      row.insertCell().textContent = "********"; // Password masked
      const actionsCell = row.insertCell();
      actionsCell.innerHTML = `
                <button class="btn-action btn-edit"><i class="fas fa-edit"></i></button>
                <button class="btn-action btn-disable"><i class="fas fa-user-slash"></i></button>
            `;
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
