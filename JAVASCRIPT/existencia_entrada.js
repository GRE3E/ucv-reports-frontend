document.addEventListener("DOMContentLoaded", () => {
  const productosGridContainer = document.querySelector(
    ".productos-grid-container"
  );

  // Función para cargar y mostrar productos
  async function cargarProductos() {
    try {
      const response = await fetch("https://ucv-reports-backend.onrender.com/hardware"); // Ajusta esta URL a tu endpoint 
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const productos = await response.json();

      productosGridContainer.innerHTML = ''; // Limpiar productos estáticos existentes

      productos.forEach((producto) => {
        const productoCard = document.createElement("div");
        productoCard.classList.add("producto-card");

        productoCard.innerHTML = `
            <img src="${producto.urlImagen || '../../CSS/auth/images/placeholder.jpg'}" alt="${producto.nombre}">
            <div class="producto-card-info">
                <h3>Tipo: ${producto.nombre}</h3>
            </div>
            <button class="btn comprar">
                <img src="../../CSS/auth/images/cartIcon.png" alt="Carrito" class="icono-btn">
                Comprar
            </button>
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
  // Aquí puedes añadir la lógica para manejar el envío del formulario (botón Guardar)
  const formAgregarProducto = document.getElementById("formAgregarProducto");
  if (formAgregarProducto) {
    formAgregarProducto.addEventListener("submit", async function (event) {
      event.preventDefault(); // Prevenir el envío por defecto del formulario

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
                "ordenador": 1,
                "proyector": 2,
                "escritorio": 3
            };

            if (selectArticulo.value === "otro") {
                parsedValue = parseInt(document.getElementById("otroArticulo").value);
            } else if (articleTypeMap[selectArticulo.value]) {
                parsedValue = articleTypeMap[selectArticulo.value];
            } else {
                parsedValue = parseInt(selectArticulo.value);
            }
            return isNaN(parsedValue) ? 0 : parsedValue;
          })(),
          Codigo: String(document.getElementById("codigoProducto").value),
          nombre: String(document.getElementById("nombreProducto").value),
          Precio: parseFloat(document.getElementById("precio").value || '0'),

          idpabellon: parseInt(document.getElementById("pabellon").value || '0'),
          idpiso: parseInt(document.getElementById("piso").value || '0'),
          idsalon: parseInt(document.getElementById("salon").value || '0'),
          imagen: "../../CSS/auth/images/placeholder.jpg",
          Estado: String("Pendiente"),
        };
        // Asumiendo que el backend tiene un endpoint para guardar productos
        const response = await fetch(
            "https://ucv-reports-backend.onrender.com/hardware",
          {
            method: "POST",
            headers: {
              'Content-Type': 'application/json'
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
  
