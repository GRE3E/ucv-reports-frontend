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

  // FUNCIÓN DE DEBUGGING COMPLETA
  function debugFormValues() {
    console.log("=== DEBUGGING FORM VALUES ===");

    const pabellonSelect = document.getElementById("pabellon");
    const pisoSelect = document.getElementById("piso");
    const salonSelect = document.getElementById("salon");

    console.log("Pabellón Element:", pabellonSelect);
    console.log("Pabellón Value:", pabellonSelect?.value);
    console.log("Pabellón Selected Index:", pabellonSelect?.selectedIndex);
    console.log("Pabellón Options:", Array.from(pabellonSelect?.options || []));

    console.log("Piso Element:", pisoSelect);
    console.log("Piso Value:", pisoSelect?.value);
    console.log("Piso Selected Index:", pisoSelect?.selectedIndex);
    console.log("Piso Options:", Array.from(pisoSelect?.options || []));

    console.log("Salón Element:", salonSelect);
    console.log("Salón Value:", salonSelect?.value);
    console.log("Salón Selected Index:", salonSelect?.selectedIndex);
    console.log("Salón Options:", Array.from(salonSelect?.options || []));

    console.log("=== END DEBUGGING ===");
  }

  // FUNCIÓN DE VALIDACIÓN MEJORADA
  function validateFormValues() {
    const pabellon = document.getElementById("pabellon").value;
    const piso = document.getElementById("piso").value;
    const salon = document.getElementById("salon").value;

    const errors = [];

    if (!pabellon || pabellon === "" || pabellon === "0") {
      errors.push("Pabellón no seleccionado o inválido");
    }

    if (!piso || piso === "" || piso === "0") {
      errors.push("Piso no seleccionado o inválido");
    }

    if (!salon || salon === "" || salon === "0") {
      errors.push("Salón no seleccionado o inválido");
    }

    if (errors.length > 0) {
      console.error("Errores de validación:", errors);
      alert("Errores encontrados:\n" + errors.join("\n"));
      return false;
    }

    return true;
  }

  // Función para cargar y mostrar productos
  async function cargarProductos() {
    try {
      const response = await fetchWithAuth(
        "https://ucv-reports-backend.onrender.com/hardware"
      );
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
  const btnAgregarProducto = document.querySelector(".productos-nuevos-btn");
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
    selectPabellonEntrada.addEventListener("change", function () {
      console.log("Pabellón cambiado a:", this.value);
      loadPisosEntrada();
    });
  }

  if (selectPisoEntrada) {
    selectPisoEntrada.addEventListener("change", function () {
      console.log("Piso cambiado a:", this.value);
      loadAulasEntrada();
    });
  }

  if (selectSalonEntrada) {
    selectSalonEntrada.addEventListener("change", function () {
      console.log("Salón cambiado a:", this.value);
    });
  }

  // Funciones para cargar dinámicamente Pabellón, Piso y Salón
  async function loadPabellonesEntrada() {
    try {
      console.log("Cargando pabellones...");
      const response = await fetchWithAuth(
        "https://ucv-reports-backend.onrender.com/pabellon"
      );
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const pabellones = await response.json();
      console.log("Pabellones recibidos:", pabellones);

      selectPabellonEntrada.innerHTML =
        '<option value="">Seleccione un pabellón</option>';

      pabellones.forEach((pabellon) => {
        const option = document.createElement("option");
        option.value = pabellon.id;
        option.textContent = pabellon.Pabellon;
        selectPabellonEntrada.appendChild(option);
        console.log(
          `Pabellón agregado: ID=${pabellon.id}, Nombre=${pabellon.Pabellon}`
        );
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
    console.log("Cargando pisos para pabellón ID:", selectedPabellonId);

    selectPisoEntrada.innerHTML =
      '<option value="">Seleccione un piso</option>';
    selectPisoEntrada.disabled = true;

    // Limpiar también el select de salón
    selectSalonEntrada.innerHTML =
      '<option value="">Seleccione un salón</option>';
    selectSalonEntrada.disabled = true;

    if (!selectedPabellonId) {
      console.log("No hay pabellón seleccionado, cancelando carga de pisos");
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
      console.log("Pisos recibidos:", pisos);

      const filteredPisos = pisos.filter(
        (piso) => piso.idpabellon == selectedPabellonId
      );
      console.log("Pisos filtrados:", filteredPisos);

      selectPisoEntrada.disabled = false;
      filteredPisos.forEach((piso) => {
        const option = document.createElement("option");
        option.value = piso.numero_piso;
        option.textContent = piso.numero_piso;
        selectPisoEntrada.appendChild(option);
        console.log(
          `Piso agregado: Número=${piso.numero_piso}, PabellónID=${piso.idpabellon}`
        );
      });

      // Automatically select the first piso if available and trigger change event
      if (filteredPisos.length > 0) {
        selectPisoEntrada.value = filteredPisos[0].numero_piso;
        console.log(
          "Auto-seleccionando primer piso:",
          filteredPisos[0].numero_piso
        );
        selectPisoEntrada.dispatchEvent(new Event("change"));
      }
    } catch (error) {
      console.error("Error al cargar los pisos:", error);
      alert("Error al cargar los pisos. Revisa la consola para más detalles.");
    }
  }

  async function loadAulasEntrada() {
    const selectedPabellonId = selectPabellonEntrada.value;
    const selectedPisoId = selectPisoEntrada.value;

    console.log("Cargando aulas para:", {
      pabellon: selectedPabellonId,
      piso: selectedPisoId,
    });

    selectSalonEntrada.innerHTML =
      '<option value="">Seleccione un salón</option>';
    selectSalonEntrada.disabled = true;

    if (!selectedPabellonId || !selectedPisoId) {
      console.log("Pabellón o piso no seleccionado, cancelando carga de aulas");
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
      console.log("Aulas recibidas:", aulas);

      // Filtrar por pabellón y piso
      const filteredAulas = aulas.filter((aula) => {
        const match =
          aula.idpabellon == selectedPabellonId &&
          aula.idpiso == selectedPisoId;
        console.log(
          `Aula ${aula.nombre}: PabellónID=${aula.idpabellon}, PisoID=${aula.idpiso}, Match=${match}`
        );
        return match;
      });

      console.log("Aulas filtradas:", filteredAulas);

      selectSalonEntrada.disabled = false;
      filteredAulas.forEach((aula) => {
        const option = document.createElement("option");
        option.value = aula.id;
        option.textContent = aula.nombre;
        selectSalonEntrada.appendChild(option);
        console.log(`Aula agregada: ID=${aula.id}, Nombre=${aula.nombre}`);
      });

      // Seleccionar automáticamente el primer salón válido si existe
      if (filteredAulas.length > 0) {
        selectSalonEntrada.value = filteredAulas[0].id;
        console.log("Auto-seleccionando primera aula:", filteredAulas[0].id);
        // Forzar evento de cambio para asegurar que el valor esté disponible
        const event = new Event("change", { bubbles: true });
        selectSalonEntrada.dispatchEvent(event);
      } else {
        console.warn(
          "No se encontraron aulas para los criterios seleccionados"
        );
      }
    } catch (error) {
      console.error("Error al cargar los salones:", error);
      alert(
        "Error al cargar los salones. Revisa la consola para más detalles."
      );
    }
  }

  // Manejo del envío del formulario
  const formAgregarProducto = document.getElementById("formAgregarProducto");
  if (formAgregarProducto) {
    formAgregarProducto.addEventListener("submit", async function (event) {
      event.preventDefault(); // Prevenir el envío por defecto del formulario

      console.log("=== INICIANDO ENVÍO DEL FORMULARIO ===");

      // DEBUGGING COMPLETO ANTES DEL ENVÍO
      debugFormValues();

      // VALIDACIÓN ANTES DEL ENVÍO
      if (!validateFormValues()) {
        console.error("Validación fallida, cancelando envío");
        return;
      }

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

      // Verificar que salon no sea undefined CON MÁS DETALLE
      const salonValue = document.getElementById("salon").value;
      const pabellonValue = document.getElementById("pabellon").value;
      const pisoValue = document.getElementById("piso").value;

      console.log("=== VERIFICACIÓN FINAL DE VALORES ===");
      console.log("Salón final:", salonValue, typeof salonValue);
      console.log("Pabellón final:", pabellonValue, typeof pabellonValue);
      console.log("Piso final:", pisoValue, typeof pisoValue);

      if (!salonValue || salonValue === "" || salonValue === "0") {
        alert("Por favor selecciona un salón válido antes de continuar.");
        debugFormValues(); // Debug adicional en caso de error
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

      const cantidad = parseInt(document.getElementById("cantidad").value) || 1;

      try {
        let response;
        if (cantidad > 1) {
          const createMultipleHardwareDto = {
            id_articulo: (() => {
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
            codigo_inicial: String(
              document.getElementById("codigoProducto").value
            ),
            nombre_producto: String(
              document.getElementById("nombreProducto").value
            ),
            precio_producto: parseFloat(
              document.getElementById("precio").value || "0"
            ),
            imagen_producto: "../../CSS/auth/images/placeholder.jpg",
            cantidad_registros: cantidad,
            estado_producto: String("Pendiente"),
            idpabellon: parseInt(pabellonValue) || 0,
            idpiso: parseInt(pisoValue) || 0,
            idsalon: parseInt(salonValue) || 0,
          };

          console.log(
            "Datos enviados al backend (multiple):",
            createMultipleHardwareDto
          );

          response = await fetchWithAuth(
            "https://ucv-reports-backend.onrender.com/hardware/multiple",
            {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
              },
              body: JSON.stringify(createMultipleHardwareDto),
            }
          );
        } else {
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
            idpabellon: parseInt(pabellonValue) || 0,
            idpiso: parseInt(pisoValue) || 0,
            idsalon: parseInt(salonValue) || 0,
            imagen: "../../CSS/auth/images/placeholder.jpg",
            Estado: String("Pendiente"),
          };

          console.log("Datos enviados al backend (single):", hardwareData);

          response = await fetchWithAuth(
            "https://ucv-reports-backend.onrender.com/hardware",
            {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
              },
              body: JSON.stringify(hardwareData),
            }
          );
        }

        if (response.ok) {
          const newProduct = await response.json();
          console.log("Producto guardado exitosamente:", newProduct);
          alert("Producto guardado exitosamente!");

          // Añadir el nuevo producto a la UI
          const productoCard = document.createElement("div");
          productoCard.classList.add("producto-card");

          const imageUrl =
            newProduct.urlImagen || "../../CSS/auth/images/placeholder.jpg";

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
          console.error("Error del backend:", errorData);
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
