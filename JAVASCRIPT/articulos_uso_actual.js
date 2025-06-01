document.addEventListener('DOMContentLoaded', () => {
    const articulosGridContainer = document.querySelector('.articulos-grid-container');

    // Datos de los articulos dañados
    const articulos = [
        {
            imagen: '../../CSS/auth/images/mouse.jpg', // Imagen del monitor dañado
            tipo: 'Mouse Logitech',
            cantidad: 4
        },
    ];

    // Función para generar un código aleatorio para artículos dañados
    function generarCodigoDanadoAleatorio() {
        return 'ART-' + Math.random().toString(36).substr(2, 6).toUpperCase();
    }

    // Función para generar un precio aleatorio (ejemplo)
    function generarPrecioAleatorio() {
        return (Math.random() * (1000 - 50) + 50).toFixed(2);
    }

    articulos.forEach((articulo, index) => {
        const articulosCard = document.createElement('div');
        articulosCard.classList.add('articulos-card');

        articulosCard.innerHTML = `
            <img src="${articulo.imagen}" alt="${articulo.tipo}">
            <div class="articulos-card-info">
                <h3>Tipo: ${articulo.tipo}</h3>
                <p>Cantidad: ${articulo.cantidad}</p>
            </div>
            <button class="btn informe-articulos" data-articulo-index="${index}"> 
            <i class="fas fa-file-alt fa-sm"></i>
            Visualizar
            </button> 
        `;

        articulosGridContainer.appendChild(articulosCard);
    });

    // Funcionalidad para el modal Stock Actual de Artículos Dañados
    const modalStockArticulos = document.getElementById('modalStockArticulos');
    const spanCerrarStockArticulos = modalStockArticulos.querySelector('.close');
    const stockTableBody = modalStockArticulos.querySelector('.stock-table tbody');

    // Abrir modal Stock Actual de Artículos Dañados al hacer clic en el botón Informe
    const botonesInforme = document.querySelectorAll('.articulos-card .btn.informe-articulos');
    botonesInforme.forEach(boton => {
        boton.addEventListener('click', function() {
            modalStockArticulos.style.display = 'block';

            const articuloIndex = this.dataset.articuloIndex;
            const articuloSeleccionado = articulos[articuloIndex];

            // Limpiar contenido previo de la tabla
            stockTableBody.innerHTML = '';

            // Datos de ejemplo para la tabla de stock dañado (un solo ítem por articulo para simplificar)
            const itemArticulo = {
                codigo: generarCodigoDanadoAleatorio(),
                nombre: `Marca ${articuloSeleccionado.tipo}`, // Ejemplo de marca y nombre
                precio: generarPrecioAleatorio(),
                tipoArticulo: articuloSeleccionado.tipo,
                accion: 'Dejar' // Estado inicial del botón
            };

            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${itemArticulo.codigo}</td>
                <td>${itemArticulo.nombre}</td>
                <td>S/. ${itemArticulo.precio}</td>
                <td>${itemArticulo.tipoArticulo}</td>
                <td><button class="btn btn-accion-danado-articulo">${itemArticulo.accion}</button></td>
            `;
            stockTableBody.appendChild(row);

            // Añadir event listener al botón de acción recién creado
            const botonAccion = row.querySelector('.btn-accion-danado-articulo');
            botonAccion.addEventListener('click', function() {
                if (this.textContent === 'Dejar') {
                    this.textContent = 'Usar';
                    this.classList.remove('btn-dejado');
                    this.classList.add('btn-usado');
                } else {
                    this.textContent = 'Dejar';
                    this.classList.remove('btn-usado');
                    this.classList.add('btn-dejado');
                }
            });

            botonAccion.classList.add('btn-dejado');

        });
    });

    // Cerrar modal Stock Actual de Artículos Dañados al hacer clic en la X
    if (spanCerrarStockArticulos) {
        spanCerrarStockArticulos.onclick = function() {
            modalStockArticulos.style.display = 'none';
        }
    }

    // Cerrar modal Stock Actual de Artículos Dañados al hacer clic fuera del contenido del modal
    window.onclick = function(event) {
      if (event.target == modalStockArticulos) {
        modalStockArticulos.style.display = 'none';
      }
    }
}); 