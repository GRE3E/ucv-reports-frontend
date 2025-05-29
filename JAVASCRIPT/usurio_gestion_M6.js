function abrirModalDeshabilitados() {
  document.getElementById('modalDeshabilitados').style.display = 'block';
}
function cerrarModalDeshabilitados() {
  document.getElementById('modalDeshabilitados').style.display = 'none';
}
// Cerrar al hacer clic fuera del modal
window.onclick = function(event) {
  var modal = document.getElementById('modalDeshabilitados');
  if (event.target == modal) {
    modal.style.display = "none";
  }
}