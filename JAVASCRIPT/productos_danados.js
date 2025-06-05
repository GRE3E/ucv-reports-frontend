import { validateTokenAndRedirect, fetchWithAuth } from "./auth/auth_utils.js";

document.addEventListener("DOMContentLoaded", function () {
  validateTokenAndRedirect();
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
      const response = await fetchWithAuth(
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
            <img src="https://cdn-icons-png.flaticon.com/512/7415/7415672.png" alt="Imagen de Reporte">
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

        // Datos del reporte seleccionado para la tabla de stock dañado
        const itemReporte = {
          codigo: generarCodigoDanadoAleatorio(),
          idReporte: reporteSeleccionado.r_id_reporte,
          descripcion: reporteSeleccionado.r_descripcion,
          fecha: new Date(reporteSeleccionado.r_fecha).toLocaleDateString(),
          articulos: reporteSeleccionado.r_Articulos,
          lugarProblema: reporteSeleccionado.lugar_problema,
          estado: "Aprobado", // Asumiendo que solo se muestran reportes aprobados aquí
          precioEstimado: generarPrecioAleatorio(), // Generar un precio estimado
          accion: "Dañado", // Estado inicial del botón
        };

        const row = document.createElement("tr");
        row.innerHTML = `
                  <td>${itemReporte.codigo}</td>
                  <td>${itemReporte.idReporte}</td>
                  <td>${itemReporte.descripcion}</td>
                  <td>${itemReporte.fecha}</td>
                  <td>${itemReporte.articulos}</td>
                  <td>${itemReporte.lugarProblema}</td>
                  <td>${itemReporte.estado}</td>
                  <td>S/. ${itemReporte.precioEstimado}</td>
                  <td><button class="btn btn-accion-danado">${itemReporte.accion}</button></td>
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
