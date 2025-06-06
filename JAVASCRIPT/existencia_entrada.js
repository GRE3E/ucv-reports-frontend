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
  console.log("Token JWT disponible en existencia_entrada.js:", token);
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

  // Función para cargar y mostrar productos
  async function cargarProductos() {
    try {
      const response = await fetchWithAuth(
        "https://ucv-reports-backend.onrender.com/hardware"
      ); // Ajusta esta URL a tu endpoint
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const productos = await response.json();

      productosGridContainer.innerHTML = ""; // Limpiar productos estáticos existentes

      productos.forEach((producto) => {
        const productoCard = document.createElement("div");
        productoCard.classList.add("producto-card");

        productoCard.innerHTML = `
            <img src="${
              producto.urlImagen ||
              "https://cairosales.com/37240-thickbox_default/lenovo-all-in-one-pc-215-inch-fhd-intel-core-i5-8400-4gb-520-22icb.jpg"
            }" alt="${producto.nombre}">
            <div class="producto-card-info">
                <h3>Tipo: ${producto.nombre}</h3>
            </div>
        `;

        productosGridContainer.appendChild(productoCard);
      });
    } catch (error) {
      console.error("Error al cargar los productos:", error);
      alert("No se pudieron cargar los productos.");
    }
  }

  // Llamar a la función para cargar productos al iniciar
  cargarProductos();

  // Funcionalidad para el modal Agregar Producto
  const modalAgregarProducto = document.getElementById("modalAgregarProducto");
  const btnAgregarProducto = document.querySelector(".productos-nuevos-btn"); // Botón + Productos Nuevos
  const spanCerrarModal = modalAgregarProducto.querySelector(".close");
  const selectArticulo = document.getElementById("articulo");
  const otroArticuloGroup = document.getElementById("otroArticuloGroup");

  // Abrir modal al hacer clic en el botón
  if (btnAgregarProducto) {
    btnAgregarProducto.onclick = function () {
      modalAgregarProducto.style.display = "block";
      loadPabellonesEntrada(); // Cargar pabellones al abrir el modal
    };
  }

  // Cerrar modal al hacer clic en la X
  if (spanCerrarModal) {
    spanCerrarModal.onclick = function () {
      modalAgregarProducto.style.display = "none";
    };
  }

  // Cerrar modal al hacer clic fuera del contenido del modal
  window.onclick = function (event) {
    if (event.target == modalAgregarProducto) {
      modalAgregarProducto.style.display = "none";
    }
  };

  // Mostrar/ocultar campo 'Otro Artículo'
  if (selectArticulo) {
    selectArticulo.addEventListener("change", function () {
      if (this.value === "otro") {
        otroArticuloGroup.style.display = "block";
      } else {
        otroArticuloGroup.style.display = "none";
      }
    });
  }

  // Event listeners para los selects de ubicación dentro del modal
  const selectPabellonEntrada = document.getElementById("pabellon");
  const selectPisoEntrada = document.getElementById("piso");
  const selectSalonEntrada = document.getElementById("salon");

  if (selectPabellonEntrada) {
    selectPabellonEntrada.addEventListener("change", loadPisosEntrada);
  }
  if (selectPisoEntrada) {
    selectPisoEntrada.addEventListener("change", loadAulasEntrada);
  }

  // Funciones para cargar dinámicamente Pabellón, Piso y Salón
  async function loadPabellonesEntrada() {
    try {
      const response = await fetchWithAuth(
        "https://ucv-reports-backend.onrender.com/pabellon"
      );
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const pabellones = await response.json();
      selectPabellonEntrada.innerHTML =
        '<option value="">Seleccione un pabellón</option>';
      pabellones.forEach((pabellon) => {
        const option = document.createElement("option");
        option.value = pabellon.id;
        option.textContent = pabellon.Pabellon;
        selectPabellonEntrada.appendChild(option);
      });
    } catch (error) {
      console.error("Error al cargar los pabellones:", error);
      alert(
        "Error al cargar los pabellones. Revisa la consola para más detalles."
      );
    }
  }

  async function loadPisosEntrada() {
    const selectedPabellonId = selectPabellonEntrada.value;
    selectPisoEntrada.innerHTML =
      '<option value="">Seleccione un piso</option>';
    selectPisoEntrada.disabled = true;

    // Limpiar también el select de salón
    selectSalonEntrada.innerHTML =
      '<option value="">Seleccione un salón</option>';
    selectSalonEntrada.disabled = true;

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

      selectPisoEntrada.disabled = false;
      filteredPisos.forEach((piso) => {
        const option = document.createElement("option");
        // Usar el ID del piso como value
        option.value = piso.id;
        option.textContent = piso.numero_piso;
        selectPisoEntrada.appendChild(option);
      });
    } catch (error) {
      console.error("Error al cargar los pisos:", error);
      alert("Error al cargar los pisos. Revisa la consola para más detalles.");
    }
  }

  async function loadAulasEntrada() {
    const selectedPabellonId = selectPabellonEntrada.value;
    const selectedPisoId = selectPisoEntrada.value;

    selectSalonEntrada.innerHTML =
      '<option value="">Seleccione un salón</option>';
    selectSalonEntrada.disabled = true;

    if (!selectedPabellonId || !selectedPisoId) {
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

      // Filtrar por pabellón y piso
      const filteredAulas = aulas.filter((aula) => {
        return (
          aula.idpabellon == selectedPabellonId && aula.idpiso == selectedPisoId
        );
      });

      selectSalonEntrada.disabled = false;
      filteredAulas.forEach((aula) => {
        const option = document.createElement("option");
        option.value = aula.id;
        option.textContent = aula.nombre;
        selectSalonEntrada.appendChild(option);
      });
    } catch (error) {
      console.error("Error al cargar los salones:", error);
      alert(
        "Error al cargar los salones. Revisa la consola para más detalles."
      );
    }
  }
  // Aquí puedes añadir la lógica para manejar el envío del formulario (botón Guardar)
  const formAgregarProducto = document.getElementById("formAgregarProducto");
  if (formAgregarProducto) {
    formAgregarProducto.addEventListener("submit", async function (event) {
      event.preventDefault(); // Prevenir el envío por defecto del formulario

      console.log("Valor de articulo:", selectArticulo.value);
      console.log(
        "Valor de otroArticulo:",
        document.getElementById("otroArticulo").value
      );
      console.log(
        "Valor de codigoProducto:",
        document.getElementById("codigoProducto").value
      );
      console.log(
        "Valor de nombreProducto:",
        document.getElementById("nombreProducto").value
      );
      console.log("Valor de precio:", document.getElementById("precio").value);
      console.log(
        "Valor de pabellon:",
        document.getElementById("pabellon").value
      );
      console.log("Valor de piso:", document.getElementById("piso").value);
      console.log("Valor de salon:", document.getElementById("salon").value);

      // Verificar que salon no sea undefined
      const salonValue = document.getElementById("salon").value;
      if (!salonValue || salonValue === "") {
        alert("Por favor selecciona un salón antes de continuar.");
        return;
      }

      const formData = new FormData();
      formData.append("articulo", selectArticulo.value);
      if (selectArticulo.value === "otro") {
        formData.append(
          "otroArticulo",
          document.getElementById("otroArticulo").value
        );
      }
      formData.append(
        "codigoProducto",
        document.getElementById("codigoProducto").value
      );
      formData.append(
        "nombreProducto",
        document.getElementById("nombreProducto").value
      );
      formData.append("precio", document.getElementById("precio").value);

      try {
        const hardwareData = {
          idarticulostipo: (() => {
            let parsedValue;
            const articleTypeMap = {
              ordenador: 1,
              proyector: 2,
              escritorio: 3,
            };

            if (selectArticulo.value === "otro") {
              parsedValue = parseInt(
                document.getElementById("otroArticulo").value
              );
            } else if (articleTypeMap[selectArticulo.value]) {
              parsedValue = articleTypeMap[selectArticulo.value];
            } else {
              parsedValue = parseInt(selectArticulo.value);
            }
            return isNaN(parsedValue) ? 0 : parsedValue;
          })(),
          Codigo: String(document.getElementById("codigoProducto").value),
          nombre: String(document.getElementById("nombreProducto").value),
          Precio: parseFloat(document.getElementById("precio").value || "0"),

          idpabellon: parseInt(document.getElementById("pabellon").value) || 0,
          idpiso: parseInt(document.getElementById("piso").value) || 0,
          idsalon: parseInt(document.getElementById("salon").value) || 0,
          imagen: "../../CSS/auth/images/placeholder.jpg",
          Estado: String("Pendiente"),
        };

        console.log("Datos enviados al backend:", hardwareData);

        // Asumiendo que el backend tiene un endpoint para guardar productos
        const response = await fetchWithAuth(
          "https://ucv-reports-backend.onrender.com/hardware",
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify(hardwareData),
          }
        );

        if (response.ok) {
          const newProduct = await response.json();
          alert("Producto guardado exitosamente!");
          // Añadir el nuevo producto a la UI
          const productoCard = document.createElement("div");
          productoCard.classList.add("producto-card");

          // Asumiendo que la respuesta del backend incluye la URL de la imagen guardada
          // o que podemos construirla. Por ahora, usaremos un placeholder o la URL temporal.
          const imageUrl =
            newProduct.urlImagen || "../../CSS/auth/images/placeholder.jpg"; // Ajusta esto según tu backend

          productoCard.innerHTML = `
                      <img src="${imageUrl}" alt="${newProduct.nombre}">
                      <div class="producto-card-info">
                          <h3>Tipo: ${newProduct.nombre}</h3>

                      </div>
                      <button class="btn comprar">
                          <i class="fas fa-shopping-cart"></i>
                          Comprar
                      </button>
                  `;

          productosGridContainer.appendChild(productoCard);

          formAgregarProducto.reset();
          modalAgregarProducto.style.display = "none";
          cargarProductos(); // Recargar productos después de agregar uno nuevo
        } else {
          const errorData = await response.json();
          alert(
            `Error al guardar el producto: ${
              errorData.message || response.statusText
            }`
          );
        }
      } catch (error) {
        console.error("Error en la solicitud:", error);
        alert("Ocurrió un error al intentar guardar el producto.");
      }
    });
  }
});
