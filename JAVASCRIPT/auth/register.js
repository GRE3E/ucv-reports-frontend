window.addEventListener("load", () => {
  const loading = document.getElementById("loading-screen");
  loading.classList.add("slide-away");
  setTimeout(() => {
    loading.style.display = "none";
  }, 1500); // 1.5 segundos
});