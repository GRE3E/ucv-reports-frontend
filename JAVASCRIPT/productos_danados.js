document.addEventListener("DOMContentLoaded", () => {
  const productosGridContainer = document.querySelector(
    ".productos-grid-container"
  );

  // Función para generar un código aleatorio para artículos dañados
  function generarCodigoDanadoAleatorio() {
    return "DAÑO-" + Math.random().toString(36).substr(2, 6).toUpperCase();
  }

  // Función para generar un precio aleatorio (ejemplo)
  function generarPrecioAleatorio() {
    return (Math.random() * (1000 - 50) + 50).toFixed(2);
  }

  // Función para obtener y mostrar los reportes aprobados
  async function obtenerYMostrarReportesAprobados() {
    try {
      const response = await fetch(
        "https://ucv-reports-backend.onrender.com/reportes/aprobados"
      ); // Asegúrate de que esta URL sea correcta para tu backend
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const reportesAprobados = await response.json();

      productosGridContainer.innerHTML = ""; // Limpiar contenido existente

      reportesAprobados.forEach((reporte, index) => {
        const productoCard = document.createElement("div");
        productoCard.classList.add("producto-card");

        // Usar r_descripcion y lugar_problema del reporte
        productoCard.innerHTML = `
            <img src="https://via.placeholder.com/150" alt="Imagen de Reporte">
            <div class="producto-card-info">
                <h3>Descripción: ${reporte.r_descripcion}</h3>
                <p>Lugar del Problema: ${reporte.lugar_problema}</p>
            </div>
            <button class="btn informe" data-reporte-index="${index}">
            <i class="fas fa-file-alt fa-sm"></i>
            Informe
            </button>
        `;

        productosGridContainer.appendChild(productoCard);
      });

      // Re-adjuntar event listeners después de que los elementos se hayan creado
      adjuntarEventListenersInforme(reportesAprobados);
    } catch (error) {
      console.error("Error al obtener los reportes aprobados:", error);
      productosGridContainer.innerHTML =
        "<p>No se pudieron cargar los reportes aprobados.</p>";
    }
  }

  function adjuntarEventListenersInforme(reportes) {
    const botonesInforme = document.querySelectorAll(
      ".producto-card .btn.informe"
    );
    botonesInforme.forEach((boton) => {
      boton.addEventListener("click", function () {
        modalStockActualDanados.style.display = "block";

        const reporteIndex = this.dataset.reporteIndex;
        const reporteSeleccionado = reportes[reporteIndex];

        // Limpiar contenido previo de la tabla
        stockTableBody.innerHTML = "";

        // Datos de ejemplo para la tabla de stock dañado (un solo ítem por producto para simplificar)
        const itemDanado = {
          codigo: generarCodigoDanadoAleatorio(),
          nombre: `Reporte ID: ${reporteSeleccionado.r_id_reporte}`, // Usar ID del reporte
          estado: "Aprobado", // Estado fijo para reportes aprobados
          precio: generarPrecioAleatorio(),
          tipoArticulo: reporteSeleccionado.r_Articulos, // Usar el tipo de artículo del reporte
          accion: "Dañado", // Estado inicial del botón
        };

        const row = document.createElement("tr");
        row.innerHTML = `
                  <td>${itemDanado.codigo}</td>
                  <td>${itemDanado.nombre}</td>
                  <td>${itemDanado.estado}</td>
                  <td>S/. ${itemDanado.precio}</td>
                  <td>${itemDanado.tipoArticulo}</td>
                  <td><button class="btn btn-accion-danado">${itemDanado.accion}</button></td>
              `;
        stockTableBody.appendChild(row);

        // Añadir event listener al botón de acción recién creado
        const botonAccion = row.querySelector(".btn-accion-danado");
        botonAccion.addEventListener("click", function () {
          if (this.textContent === "Dañado") {
            this.textContent = "Arreglado";
            this.classList.remove("btn-danado");
            this.classList.add("btn-arreglado");
          } else {
            this.textContent = "Dañado";
            this.classList.remove("btn-arreglado");
            this.classList.add("btn-danado");
          }
        });

        // Asegurarse de añadir la clase inicial 'btn-danado' al botón
        botonAccion.classList.add("btn-danado");
      });
    });
  }

  // Llamar a la función para obtener y mostrar los reportes al cargar la página
  obtenerYMostrarReportesAprobados();

  // Funcionalidad para el modal Stock Actual de Artículos Dañados
  const modalStockActualDanados = document.getElementById(
    "modalStockActualDanados"
  );
  const spanCerrarStockActualDanados =
    modalStockActualDanados.querySelector(".close");
  const stockTableBody =
    modalStockActualDanados.querySelector(".stock-table tbody");

  // Cerrar modal Stock Actual de Artículos Dañados al hacer clic en la X
  if (spanCerrarStockActualDanados) {
    spanCerrarStockActualDanados.onclick = function () {
      modalStockActualDanados.style.display = "none";
    };
  }

  // Cerrar modal Stock Actual de Artículos Dañados al hacer clic fuera del contenido del modal
  window.onclick = function (event) {
    if (event.target == modalStockActualDanados) {
      modalStockActualDanados.style.display = "none";
    }
  };
});
