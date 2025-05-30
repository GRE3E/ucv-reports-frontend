document.addEventListener('DOMContentLoaded', () => {
    const productosGridContainer = document.querySelector('.productos-grid-container');

    // Datos de ejemplo de productos (reemplazar con datos reales y rutas de imagen correctas)
    const productos = [
        {
            imagen: '../../CSS/auth/images/ordenador.jpg',
            tipo: 'Ordenador',
            cantidad: 16
        },
        {
            imagen: '../../CSS/auth/images/proyector.jpg',
            tipo: 'Proyector',
            cantidad: 5
        },
        {
            imagen: '../../CSS/auth/images/escritorios.jpg',
            tipo: 'Escritorio',
            cantidad: 9
        },
        {
            imagen: '../../CSS/auth/images/pizarra.jpg',
            tipo: 'Pizarra Acrilica',
            cantidad: 1
        },
        {
            imagen: '../../CSS/auth/images/ventilador.jpg',
            tipo: 'Ventilador',
            cantidad: 15
        },
        {
            imagen: '../../CSS/auth/images/mouse.jpg',
            tipo: 'Mouse',
            cantidad: 50
        },
    ];

    // Función para generar un código aleatorio (ejemplo simple)
    function generarCodigoAleatorio() {
        return 'COD-' + Math.random().toString(36).substr(2, 6).toUpperCase();
    }

    // Función para generar un precio aleatorio (entre 10 y 500, por ejemplo)
    function generarPrecioAleatorio() {
        return (Math.random() * (500 - 10) + 10).toFixed(2);
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
                <img src="../../CSS/auth/images/reportIcon.png" alt="Carrito" class="icono-btn">
                Informe
            </button> <!-- Botón cambiado -->
        `;

        productosGridContainer.appendChild(productoCard);
    });

    // Funcionalidad para el modal Stock Actual
    const modalStockActual = document.getElementById('modalStockActual');
    const spanCerrarStockActual = modalStockActual.querySelector('.close');

    // Abrir modal Stock Actual al hacer clic en el botón Informe
    const botonesInforme = document.querySelectorAll('.producto-card .btn.informe');
    botonesInforme.forEach(boton => {
        boton.addEventListener('click', function() {
            modalStockActual.style.display = 'block';

            const productoIndex = this.dataset.productoIndex;
            const productoSeleccionado = productos[productoIndex];

            // Aquí iría la lógica para cargar los datos específicos de stock para este producto
            const stockTableBody = modalStockActual.querySelector('.stock-table tbody');
            stockTableBody.innerHTML = ''; // Limpiar contenido previo

            // Datos de stock de ejemplo para el producto seleccionado (pueden variar)
            // Ahora usando productoSeleccionado para obtener los datos correctos
            const stockData = [
                { codigo: generarCodigoAleatorio(), nombre: productoSeleccionado.tipo, estado: 'Bueno', precio: generarPrecioAleatorio(), tipoArticulo: productoSeleccionado.tipo, accion: 'Usar' }
                // Puedes añadir más filas de stock aquí si un producto tiene múltiples ítems en stock
            ];

            stockData.forEach(item => {
                const row = document.createElement('tr');
                row.innerHTML = `
                    <td>${item.codigo}</td>
                    <td>${item.nombre}</td>
                    <td>${item.estado}</td>
                    <td>${item.precio}</td>
                    <td>${item.tipoArticulo}</td>
                    <td><button class="btn usar-articulo">${item.accion}</button></td>
                `;
                stockTableBody.appendChild(row);
            });

            // Re-adjuntar event listeners a los nuevos botones "Usar"
            modalStockActual.querySelectorAll('.btn.usar-articulo').forEach(botonUsar => {
                botonUsar.addEventListener('click', function() {
                    if (this.textContent === 'Usar') {
                        this.textContent = 'Dejar de Usar';
                    } else {
                        this.textContent = 'Usar';
                    }
                });
            });
        });
    });

    // Cerrar modal Stock Actual al hacer clic en la X
    if (spanCerrarStockActual) {
        spanCerrarStockActual.onclick = function() {
            modalStockActual.style.display = 'none';
        }
    }

    // Cerrar modal Stock Actual al hacer clic fuera del contenido del modal
    window.onclick = function(event) {
      if (event.target == modalStockActual) {
        modalStockActual.style.display = 'none';
      }
      // Asegurarse de no cerrar otros modales si están abiertos y se hace clic fuera de ellos
      // if (event.target == modalOtroModal) { modalOtroModal.style.display = 'none'; }
    }
}); 