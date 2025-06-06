const token = localStorage.getItem("access_token");
if (!token) {
  window.location.replace("/login");
  throw new Error("No token found. Halting script.");
}

import { validateTokenAndRedirect, fetchWithAuth } from "./auth/auth_utils.js";

document.addEventListener("DOMContentLoaded", () => {
  const token = validateTokenAndRedirect();
  if (!token) {
    console.warn("Token no válido. Cancelando ejecución.");
    return; // Detiene toda la ejecución si no hay token
  }

  // Mostrar token en consola si es válido
  console.log("Token JWT disponible en existencia_salida.js:", token);
  try {
    const payloadBase64 = token.split(".")[1];
    const decodedPayload = JSON.parse(atob(payloadBase64));
    console.log("ID de usuario (sub) del token:", decodedPayload.sub);
  } catch (error) {
    console.error("Error al decodificar el token JWT:", error);
  }
  const productosGridContainer = document.querySelector(
    ".productos-grid-container"
  );

  // Función para generar un código aleatorio (ejemplo simple)
  function generarCodigoAleatorio() {
    return "COD-" + Math.random().toString(36).substr(2, 6).toUpperCase();
  }

  // Función para generar un precio aleatorio (entre 10 y 500, por ejemplo)
  function generarPrecioAleatorio() {
    return (Math.random() * (500 - 10) + 10).toFixed(2);
  }

  // Función para cargar productos desde la API
  async function cargarProductos() {
    try {
      const response = await fetchWithAuth(
        "https://ucv-reports-backend.onrender.com/hardware"
      ); // Ajusta esta URL a tu endpoint
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const productos = await response.json();

      productos.forEach((producto, index) => {
        const productoCard = document.createElement("div");
        productoCard.classList.add("producto-card");

        // Ajusta las propiedades según la estructura de tu tabla 'hardware'
        // Asumiendo que 'hardware' tiene campos como 'nombre', 'cantidad', 'imagen_url'
        productoCard.innerHTML = `
                    <img src="${
                      producto.imagen_url ||
                      "https://cairosales.com/37240-thickbox_default/lenovo-all-in-one-pc-215-inch-fhd-intel-core-i5-8400-4gb-520-22icb.jpg"
                    }" alt="${producto.nombre}">
                    <div class="producto-card-info">
                <h3>Tipo: ${producto.nombre}</h3>
            </div>
                    <button class="btn informe" data-producto-id="${
                      producto.id
                    }" data-producto-nombre="${producto.nombre}">
                        <i class="fas fa-file-alt fa-sm"></i>
                        Informe
                    </button>
                `;

        productosGridContainer.appendChild(productoCard);
      });

      // Adjuntar event listeners a los botones "Informe" después de que los productos se hayan cargado
      const botonesInforme = document.querySelectorAll(
        ".producto-card .btn.informe"
      );
      botonesInforme.forEach((boton) => {
        boton.addEventListener("click", async function () {
          modalStockActual.style.display = "block";

          const productoId = this.dataset.productoId;
          const productoNombre = this.dataset.productoNombre;

          const stockTableBody =
            modalStockActual.querySelector(".stock-table tbody");
          stockTableBody.innerHTML = ""; // Limpiar contenido previo

          // Aquí puedes hacer otra llamada a la API si necesitas detalles específicos del stock
          // para un producto en particular, o usar los datos ya cargados si son suficientes.
          // Por ahora, usaremos datos de ejemplo con el nombre del producto.
          const stockData = [
            {
              codigo: generarCodigoAleatorio(),
              nombre: productoNombre,
              estado: "Bueno",
              precio: generarPrecioAleatorio(),
              tipoArticulo: productoNombre,
              accion: "Usar",
            },
          ];

          stockData.forEach((item) => {
            const row = document.createElement("tr");
            row.innerHTML = `
                            <td>${item.codigo}</td>
                            <td>${item.nombre}</td>
                            <td>${item.estado}</td>
                            <td>${item.precio}</td>
                            <td>${item.tipoArticulo}</td>
                            <td><button class="btn usar-articulo">
                                    ${item.accion}
                                    <i class="fas fa-vote-yea"></i>
                                </button></td>
                        `;
            stockTableBody.appendChild(row);
          });

          // Adjuntar event listeners a los botones "Usar" en la tabla de Stock Actual
          modalStockActual
            .querySelectorAll(".btn.usar-articulo")
            .forEach((botonUsar) => {
              botonUsar.addEventListener("click", function () {
                botonUsarActivo = this;
                modalStockActual.style.display = "none";
                modalSeleccionarUbicacion.style.display = "block";
                limpiarFormularioUbicacion();
                loadPabellonesSalida(); // Cargar pabellones al abrir el modal
              });
            });
        });
      });
    } catch (error) {
      console.error("Error al cargar los productos:", error);
      productosGridContainer.innerHTML =
        "<p>Error al cargar los productos. Inténtalo de nuevo más tarde.</p>";
    }
  }

  // Llamar a la función para cargar productos cuando el DOM esté listo
  cargarProductos();

  // Funcionalidad para el modal Stock Actual
  const modalStockActual = document.getElementById("modalStockActual");
  const spanCerrarStockActual = modalStockActual.querySelector(".close");
  const modalSeleccionarUbicacion = document.getElementById(
    "modalSeleccionarUbicacion"
  );
  const spanCerrarUbicacion = modalSeleccionarUbicacion.querySelector(".close");

  // Cerrar modal Stock Actual al hacer clic en la X
  if (spanCerrarStockActual) {
    spanCerrarStockActual.onclick = function () {
      modalStockActual.style.display = "none";
    };
  }

  let botonUsarActivo = null; // Variable para guardar el botón 'Usar' activo

  // Función para limpiar el formulario de selección de ubicación
  function limpiarFormularioUbicacion() {
    document.getElementById("pabellon").value = "";
    document.getElementById("piso").value = "";
    document.getElementById("salon").value = "";
  }

  // Funcionalidad para el modal Seleccionar Ubicación
  const selectPabellonSalida = document.getElementById("pabellon");
  const selectPisoSalida = document.getElementById("piso");
  const selectSalonSalida = document.getElementById("salon");

  if (selectPabellonSalida) {
    selectPabellonSalida.addEventListener("change", loadPisosSalida);
  }
  if (selectPisoSalida) {
    selectPisoSalida.addEventListener("change", loadAulasSalida);
  }

  // Event listener para el botón 'Confirmar Ubicación'
  const botonConfirmarUbicacion = modalSeleccionarUbicacion.querySelector(
    ".confirmar-ubicacion"
  );
  if (botonConfirmarUbicacion) {
    botonConfirmarUbicacion.addEventListener("click", function () {
      // Obtener los valores seleccionados/ingresados
      const pabellonSeleccionado = document.getElementById("pabellon").value;
      const pisoSeleccionado = document.getElementById("piso").value;
      const salonIngresado = document.getElementById("salon").value;

      // Guardar la ubicación seleccionada en el botón activo
      if (botonUsarActivo) {
        botonUsarActivo.dataset.pabellon = pabellonSeleccionado;
        botonUsarActivo.dataset.piso = pisoSeleccionado;
        botonUsarActivo.dataset.salon = salonIngresado;

        // Cambiar el texto del botón 'Usar' a 'Dejar de Usar'
        botonUsarActivo.textContent = "Dejar de usar";
        // Opcional: añadir una clase para estilizar el botón 'Dejar de usar'
        // botonUsarActivo.classList.remove('usar-articulo');
        // botonUsarActivo.classList.add('dejar-de-usar');

        // Limpiar la referencia al botón activo después de usarla
        botonUsarActivo = null;
      }

      // Cerrar la modal de selección de ubicación
      cerrarModalUbicacion();
    });
  }

  // Cerrar modal Seleccionar Ubicación al hacer clic en la X
  if (spanCerrarUbicacion) {
    spanCerrarUbicacion.onclick = function () {
      cerrarModalUbicacion();
    };
  }

  // Función para cerrar la modal de selección de ubicación
  function cerrarModalUbicacion() {
    modalSeleccionarUbicacion.style.display = "none";
    // Opcional: si cierras la modal de ubicación sin confirmar, podrías limpiar el botón activo
    // botonUsarActivo = null; // Descomentar si es necesario limpiar la referencia al cerrar sin confirmar
  }

  // Funciones para cargar dinámicamente Pabellón, Piso y Salón
  async function loadPabellonesSalida() {
    try {
      const response = await fetchWithAuth(
        "https://ucv-reports-backend.onrender.com/pabellon"
      );
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const pabellones = await response.json();
      selectPabellonSalida.innerHTML =
        '<option value="">Seleccione un pabellón</option>';
      pabellones.forEach((pabellon) => {
        const option = document.createElement("option");
        option.value = pabellon.id;
        option.textContent = pabellon.Pabellon;
        selectPabellonSalida.appendChild(option);
      });
    } catch (error) {
      console.error("Error al cargar los pabellones:", error);
      alert(
        "Error al cargar los pabellones. Revisa la consola para más detalles."
      );
    }
  }

  async function loadPisosSalida() {
    const selectedPabellonId = selectPabellonSalida.value;
    selectPisoSalida.innerHTML = '<option value="">Seleccione un piso</option>';
    selectPisoSalida.disabled = true;

    if (!selectedPabellonId) {
      return;
    }

    try {
      const response = await fetchWithAuth(
        "https://ucv-reports-backend.onrender.com/piso"
      );
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const pisos = await response.json();
      const filteredPisos = pisos.filter(
        (piso) => piso.idpabellon == selectedPabellonId
      );

      selectPisoSalida.disabled = false;
      filteredPisos.forEach((piso) => {
        const option = document.createElement("option");
        option.value = piso.numero_piso;
        option.textContent = piso.numero_piso;
        selectPisoSalida.appendChild(option);
      });
    } catch (error) {
      console.error("Error al cargar los pisos:", error);
      alert("Error al cargar los pisos. Revisa la consola para más detalles.");
    }
  }

  async function loadAulasSalida() {
    const selectedPabellonId = selectPabellonSalida.value;
    const selectedPisoNumber = selectPisoSalida.value;
    selectSalonSalida.innerHTML =
      '<option value="">Seleccione un salón</option>';
    selectSalonSalida.disabled = true;

    if (!selectedPabellonId || !selectedPisoNumber) {
      return;
    }

    try {
      const response = await fetchWithAuth(
        "https://ucv-reports-backend.onrender.com/salon"
      );
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const aulas = await response.json();
      const filteredAulas = aulas.filter(
        (aula) =>
          aula.idpabellon == selectedPabellonId &&
          aula.idpiso == selectedPisoNumber
      );

      selectSalonSalida.disabled = false;
      filteredAulas.forEach((aula) => {
        const option = document.createElement("option");
        option.value = aula.nombre;
        option.textContent = aula.nombre;
        selectSalonSalida.appendChild(option);
      });
    } catch (error) {
      console.error("Error al cargar los salones:", error);
      alert(
        "Error al cargar los salones. Revisa la consola para más detalles."
      );
    }
  }

  // Cerrar modales al hacer clic fuera de su contenido
  window.onclick = function (event) {
    if (event.target == modalStockActual) {
      modalStockActual.style.display = "none";
    }
    if (event.target == modalSeleccionarUbicacion) {
      cerrarModalUbicacion();
    }
  };

  // Cargar pabellones al abrir el modal de selección de ubicación
  modalSeleccionarUbicacion.addEventListener("show", loadPabellonesSalida);
});
