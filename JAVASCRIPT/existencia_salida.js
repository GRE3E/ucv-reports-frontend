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
                <i class="fas fa-file-alt fa-sm"></i>
                Informe
            </button>
        `;

        productosGridContainer.appendChild(productoCard);
    });

    // Funcionalidad para el modal Stock Actual
    const modalStockActual = document.getElementById('modalStockActual');
    const spanCerrarStockActual = modalStockActual.querySelector('.close');
    const modalSeleccionarUbicacion = document.getElementById('modalSeleccionarUbicacion');
    const spanCerrarUbicacion = modalSeleccionarUbicacion.querySelector('.close');

    let botonUsarActivo = null; // Variable para guardar el botón 'Usar' activo

    // Función para limpiar el formulario de selección de ubicación
    function limpiarFormularioUbicacion() {
        document.getElementById('pabellon').value = '';
        document.getElementById('piso').value = '';
        document.getElementById('salon').value = '';
    }

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
                    <td><button class="btn usar-articulo">
                            ${item.accion}
                            <i class="fas fa-vote-yea"></i>
                        </button></td>
                `;
                stockTableBody.appendChild(row);
            });

            // Adjuntar event listeners a los botones "Usar" en la tabla de Stock Actual
            modalStockActual.querySelectorAll('.btn.usar-articulo').forEach(botonUsar => {
                botonUsar.addEventListener('click', function() {
                    // Guardar la referencia del botón 'Usar' que se acaba de clickear
                    botonUsarActivo = this;
                    // Ocultar modal de stock y mostrar modal de ubicación
                    modalStockActual.style.display = 'none';
                    modalSeleccionarUbicacion.style.display = 'block';

                    // Limpiar el formulario de ubicación al abrir la modal
                    limpiarFormularioUbicacion();
                });
            });
        });
    });

    // Funcionalidad para el modal Seleccionar Ubicación

    // Event listener para el botón 'Confirmar Ubicación'
    const botonConfirmarUbicacion = modalSeleccionarUbicacion.querySelector('.confirmar-ubicacion');
    if (botonConfirmarUbicacion) {
        botonConfirmarUbicacion.addEventListener('click', function() {
            // Obtener los valores seleccionados/ingresados
            const pabellonSeleccionado = document.getElementById('pabellon').value;
            const pisoSeleccionado = document.getElementById('piso').value;
            const salonIngresado = document.getElementById('salon').value;

            // Guardar la ubicación seleccionada en el botón activo
            if (botonUsarActivo) {
                botonUsarActivo.dataset.pabellon = pabellonSeleccionado;
                botonUsarActivo.dataset.piso = pisoSeleccionado;
                botonUsarActivo.dataset.salon = salonIngresado;

                // Cambiar el texto del botón 'Usar' a 'Dejar de Usar'
                botonUsarActivo.textContent = 'Dejar de usar';
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
        spanCerrarUbicacion.onclick = function() {
            cerrarModalUbicacion();
        }
    }

    // Función para cerrar la modal de selección de ubicación
    function cerrarModalUbicacion() {
        modalSeleccionarUbicacion.style.display = 'none';
        // Opcional: si cierras la modal de ubicación sin confirmar, podrías limpiar el botón activo
        // botonUsarActivo = null; // Descomentar si es necesario limpiar la referencia al cerrar sin confirmar
    }

    // Cerrar modales al hacer clic fuera de su contenido
    window.onclick = function(event) {
      if (event.target == modalStockActual) {
        modalStockActual.style.display = 'none';
      }
      if (event.target == modalSeleccionarUbicacion) {
        cerrarModalUbicacion();
      }
    }
}); 