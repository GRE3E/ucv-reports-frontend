function toggleSidebar() {
  const sidebar = document.getElementById("sidebar");
  const overlay = document.getElementById("sidebarOverlay");
  const main = document.getElementById("mainContent");
  sidebar.classList.toggle("mobile-visible");
  overlay.classList.toggle("active");
  main.classList.toggle("blur"); // Agrega o quita el desenfoque
  if (sidebar.classList.contains("mobile-visible")) {
    document.body.style.overflow = "hidden";
  } else {
    document.body.style.overflow = "auto";
  }
}

// Al cambiar tamaño de pantalla, restablece el menú si es escritorio
window.addEventListener('resize', function() {
  const sidebar = document.getElementById("sidebar");
  const overlay = document.getElementById("sidebarOverlay");
  const main = document.getElementById("mainContent");
  if (window.innerWidth > 992) {
    sidebar.classList.remove("mobile-visible");
    overlay.classList.remove("active");
    main.classList.remove("blur"); // Quita el desenfoque si se cambia a escritorio
    document.body.style.overflow = "auto";
  }
});