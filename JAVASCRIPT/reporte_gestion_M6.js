//DESAPROAR REPORTES

function mostrarGestionReportes() {
    document.querySelector('.main-content .usuarios-box').style.display = 'none';
    document.querySelector('.main-content .reportes-box').style.display = 'block';
}
function mostrarGestionUsuarios() {
    document.querySelector('.main-content .usuarios-box').style.display = 'block';
    document.querySelector('.main-content .reportes-box').style.display = 'none';
}
function abrirModalDesaprobar() {
  document.getElementById('modalDesaprobar').style.display = 'block';
  document.getElementById('motivoDesaprobacion').value = '';
}
function cerrarModalDesaprobar() {
  document.getElementById('modalDesaprobar').style.display = 'none';
}
function aceptarDesaprobacion() {
  const motivo = document.getElementById('motivoDesaprobacion').value.trim();
  if (!motivo) {
    alert('Por favor, ingrese el motivo.');
    return;
  }
  // Aquí puedes manejar el motivo (enviar al backend, etc)
  cerrarModalDesaprobar();
  alert('Reporte desaprobado con motivo: ' + motivo);
}
// Cerrar al hacer clic fuera del modal
window.onclick = function(event) {
  var modal = document.getElementById('modalDesaprobar');
  if (event.target == modal) {
    modal.style.display = "none";
  }
}

