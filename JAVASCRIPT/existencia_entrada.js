document.addEventListener("DOMContentLoaded", () => {
    const productosGridContainer = document.querySelector(
      ".productos-grid-container"
    );
  
    // Función para cargar y mostrar productos
    async function cargarProductos() {
      try {
        const response = await fetch("https://ucv-reports-backend.onrender.com/api/articulos"); // Ajusta esta URL a tu endpoint de artículos
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const productos = await response.json();
  
        productosGridContainer.innerHTML = ''; // Limpiar productos estáticos existentes
  
        productos.forEach((producto) => {
          const productoCard = document.createElement("div");
          productoCard.classList.add("producto-card");
  
          productoCard.innerHTML = `
              <img src="${producto.urlImagen || '../../CSS/auth/images/placeholder.jpg'}" alt="${producto.nombreProducto}">
              <div class="producto-card-info">
                  <h3>Tipo: ${producto.nombreProducto}</h3>
                  <p>Cantidad: ${producto.cantidad}</p>
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
        formData.append("cantidad", document.getElementById("cantidad").value);
  
        const fileInput = document.getElementById("urlImagen");
        if (fileInput.files.length > 0) {
          formData.append("urlImagen", fileInput.files[0]);
        }
  
        try {
          // Asumiendo que el backend tiene un endpoint para guardar productos
          const response = await fetch(
            "https://ucv-reports-backend.onrender.com/api/productos",
            {
              method: "POST",
              body: formData,
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
                          <img src="${imageUrl}" alt="${newProduct.nombreProducto}">
                          <div class="producto-card-info">
                              <h3>Tipo: ${newProduct.articulo}</h3>
                              <p>Cantidad: ${newProduct.cantidad}</p>
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
  