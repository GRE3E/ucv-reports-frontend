document.addEventListener('DOMContentLoaded', () => {
    const productosGridContainer = document.querySelector('.productos-grid-container');

    // Datos de los productos dañados
    const productos = [
        {
            imagen: '/imagenes/problema monitor.jpg', // Imagen del monitor dañado
            tipo: 'Monitor Dañado',
            cantidad: 1
        },
        {
            imagen: '/imagenes/problema silla.jpg', // Imagen de la silla dañada
            tipo: 'Silla Dañada',
            cantidad: 1
        },
    ];

    // Función para generar un código aleatorio para artículos dañados
    function generarCodigoDanadoAleatorio() {
        return 'DAÑO-' + Math.random().toString(36).substr(2, 6).toUpperCase();
    }

    // Función para generar un precio aleatorio (ejemplo)
    function generarPrecioAleatorio() {
        return (Math.random() * (1000 - 50) + 50).toFixed(2);
    }

    productos.forEach((producto, index) => {
        const productoCard = document.createElement('div');
        productoCard.classList.add('producto-card');

        productoCard.innerHTML = `
            <img src="${producto.imagen}" alt="${producto.tipo}">
            <div class="producto-card-info">
                <h3>Tipo: ${producto.tipo}</h3>
                <p>Cantidad: ${producto.cantidad}</p>
            </div>
            <button class="btn informe" data-producto-index="${index}"> 
                <img src="/imagenes/reportIcon.png" alt="Carrito" class="icono-btn">
                Informe
            </button> <!-- Botón Informe -->
        `;

        productosGridContainer.appendChild(productoCard);
    });

    // Funcionalidad para el modal Stock Actual de Artículos Dañados
    const modalStockActualDanados = document.getElementById('modalStockActualDanados');
    const spanCerrarStockActualDanados = modalStockActualDanados.querySelector('.close');
    const stockTableBody = modalStockActualDanados.querySelector('.stock-table tbody');

    // Abrir modal Stock Actual de Artículos Dañados al hacer clic en el botón Informe
    const botonesInforme = document.querySelectorAll('.producto-card .btn.informe');
    botonesInforme.forEach(boton => {
        boton.addEventListener('click', function() {
            modalStockActualDanados.style.display = 'block';

            const productoIndex = this.dataset.productoIndex;
            const productoSeleccionado = productos[productoIndex];

            // Limpiar contenido previo de la tabla
            stockTableBody.innerHTML = '';

            // Datos de ejemplo para la tabla de stock dañado (un solo ítem por producto para simplificar)
            const itemDanado = {
                codigo: generarCodigoDanadoAleatorio(),
                nombre: `Marca ${productoSeleccionado.tipo}`, // Ejemplo de marca y nombre
                estado: 'Descompuesto',
                precio: generarPrecioAleatorio(),
                tipoArticulo: productoSeleccionado.tipo,
                accion: 'Dañado' // Estado inicial del botón
            };

            const row = document.createElement('tr');
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
            const botonAccion = row.querySelector('.btn-accion-danado');
            botonAccion.addEventListener('click', function() {
                if (this.textContent === 'Dañado') {
                    this.textContent = 'Arreglado';
                    this.classList.remove('btn-danado');
                    this.classList.add('btn-arreglado');
                } else {
                    this.textContent = 'Dañado';
                    this.classList.remove('btn-arreglado');
                    this.classList.add('btn-danado');
                }
            });

            // Asegurarse de añadir la clase inicial 'btn-danado' al botón
            botonAccion.classList.add('btn-danado');

        });
    });

    // Cerrar modal Stock Actual de Artículos Dañados al hacer clic en la X
    if (spanCerrarStockActualDanados) {
        spanCerrarStockActualDanados.onclick = function() {
            modalStockActualDanados.style.display = 'none';
        }
    }

    // Cerrar modal Stock Actual de Artículos Dañados al hacer clic fuera del contenido del modal
    window.onclick = function(event) {
      if (event.target == modalStockActualDanados) {
        modalStockActualDanados.style.display = 'none';
      }
    }
}); 