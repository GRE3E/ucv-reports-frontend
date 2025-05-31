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
                <button class="btn-action btn-edit" data-id="${user.IDUsuario}"><i class="fas fa-edit"></i></button>
                <button class="btn-action btn-disable" data-id="${user.IDUsuario}"><i class="fas fa-user-slash"></i></button>
            `;

            // Add event listener for edit button
            actionsCell.querySelector('.btn-edit').addEventListener('click', () => openEditModal(user));
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

    // Function to open edit modal and populate with user data
    const openEditModal = (user) => {
        const modal = document.getElementById('modalEditActual');
        modal.style.display = 'block';

        // Populate form fields
        document.getElementById('userName').value = user.usuario;
        document.getElementById('apellidosUser').value = `${user.apellido_paterno} ${user.apellido_materno}`;
        // Set the correct role in the select dropdown
        const roleSelect = document.getElementById('roleUser');
        Array.from(roleSelect.options).forEach(option => {
            if (option.value === getRoleName(user.id_cargo)) {
                option.selected = true;
            } else {
                option.selected = false;
            }
        });
        document.getElementById('passwordUser').value = ''; // Password should not be pre-filled for security

        // Store user ID in a data attribute on the save button for later use
        document.querySelector('.btn.guardar-edit').dataset.userId = user.IDUsuario;
    };

    // Handle save changes button click
    document.querySelector('.btn.guardar-edit').addEventListener('click', async (event) => {
        const userId = event.target.dataset.userId;
        const userName = document.getElementById('userName').value;
        const apellidosUser = document.getElementById('apellidosUser').value;
        const roleUser = document.getElementById('roleUser').value;
        const passwordUser = document.getElementById('passwordUser').value;

        // Split apellidosUser into apellido_paterno and apellido_materno
        const apellidosArray = apellidosUser.split(' ');
        const apellido_paterno = apellidosArray[0] || '';
        const apellido_materno = apellidosArray.slice(1).join(' ') || '';

        // Map role name back to id_cargo
        const id_cargo_map = {
            'Alumno': 1,
            'Docente': 2,
            'PersonalUCV': 3,
            'Administrador': 4
        };
        const id_cargo = id_cargo_map[roleUser];

        const updateData = {
            nombre: userName, // Assuming userName is actually the 'nombre' field
            apellido_paterno: apellido_paterno,
            apellido_materno: apellido_materno,
            id_cargo: id_cargo
        };

        if (passwordUser) {
            updateData.contraseña = passwordUser;
        }

        try {
            const response = await fetch(`https://ucv-reports-backend.onrender.com/usuarios/${userId}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(updateData)
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            alert('Usuario actualizado exitosamente!');
            document.getElementById('modalEditActual').style.display = 'none';
            fetchUsers(); // Refresh the table
        } catch (error) {
            console.error('Error updating user:', error);
            alert('Error al actualizar el usuario.');
        }
    });
});

// Funciones para los modales (mantenerlas si ya existen o se planean usar)
function abrirModalDeshabilitados() {
    const modal = document.getElementById('modalDeshabilitados');
    modal.style.display = 'block';
}

function cerrarModalDeshabilitados() {
    const modal = document.getElementById('modalDeshabilitados');
    modal.style.display = 'none';
}

// Cerrar modales al hacer clic fuera de ellos
window.onclick = function(event) {
    const modalDeshabilitados = document.getElementById('modalDeshabilitados');
    const modalEditActual = document.getElementById('modalEditActual');
    const modalDeshabilitar = document.getElementById('modalDeshabilitar');

    if (event.target == modalDeshabilitados) {
        modalDeshabilitados.style.display = 'none';
    }
    if (event.target == modalEditActual) {
        modalEditActual.style.display = 'none';
    }
    if (event.target == modalDeshabilitar) {
        modalDeshabilitar.style.display = 'none';
    }
};

// Cerrar modal de edición con el botón de cerrar
document.querySelectorAll('.modal-content-edit .close').forEach(button => {
    button.addEventListener('click', () => {
        document.getElementById('modalEditActual').style.display = 'none';
    });
});

// Cerrar modal de deshabilitar con el botón de cerrar
document.querySelectorAll('.modal-content-deshabilitar .closeBtnDeshabilitar').forEach(button => {
    button.addEventListener('click', () => {
        document.getElementById('modalDeshabilitar').style.display = 'none';
    });
});
