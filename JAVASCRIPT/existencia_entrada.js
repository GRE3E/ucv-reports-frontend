const token = localStorage.getItem("access_token");
if (!token) {
  window.location.replace("/login");
  throw new Error("No token found. Halting script.");
}

import { validateTokenAndRedirect, fetchWithAuth } from "./auth/auth_utils.js";

document.addEventListener("DOMContentLoaded", () => {
  const token = validateTokenAndRedirect();
  if (!token) {
    console.warn("Token no válido. Cancelando ejecución.");
    return;
  }

  console.log("Token JWT disponible en existencia_entrada.js:", token);
  try {
    const payloadBase64 = token.split(".")[1];
    const decodedPayload = JSON.parse(atob(payloadBase64));
    console.log("ID de usuario (sub) del token:", decodedPayload.sub);
  } catch (error) {
    console.error("Error al decodificar el token JWT:", error);
  }

  const productosGridContainer = document.querySelector(
    ".productos-grid-container"
  );

  function debugFormValues() {
    console.log("=== DEBUGGING FORM VALUES ===");
    const pabellonSelect = document.getElementById("pabellon");
    const pisoSelect = document.getElementById("piso");
    const salonSelect = document.getElementById("salon");
    console.log("Pabellón Value:", pabellonSelect?.value);
    console.log("Piso Value:", pisoSelect?.value);
    console.log("Salón Value:", salonSelect?.value);
    console.log("=== END DEBUGGING ===");
  }

  function validateFormValues() {
    const pabellon = document.getElementById("pabellon").value;
    const piso = document.getElementById("piso").value;
    const salon = document.getElementById("salon").value;
    const errors = [];
    if (!pabellon || pabellon === "" || pabellon === "0")
      errors.push("Pabellón no seleccionado o inválido");
    if (!piso || piso === "" || piso === "0")
      errors.push("Piso no seleccionado o inválido");
    if (!salon || salon === "" || salon === "0")
      errors.push("Salón no seleccionado o inválido");
    if (errors.length > 0) {
      alert("Errores encontrados:\n" + errors.join("\n"));
      return false;
    }
    return true;
  }

  async function cargarProductos() {
    try {
      const response = await fetchWithAuth(
        "https://ucv-reports-backend.onrender.com/hardware"
      );
      if (!response.ok)
        throw new Error(`HTTP error! status: ${response.status}`);
      const productos = await response.json();
      productosGridContainer.innerHTML = "";
      productos.forEach((producto) => {
        const productoCard = document.createElement("div");
        productoCard.classList.add("producto-card");
        productoCard.innerHTML = `
          <img src="${
            producto.urlImagen ||
            "https://cairosales.com/37240-thickbox_default/lenovo-all-in-one-pc-215-inch-fhd-intel-core-i5-8400-4gb-520-22icb.jpg"
          }" alt="${producto.nombre}">
          <div class="producto-card-info">
              <h3>Tipo: ${producto.nombre}</h3>
          </div>`;
        productosGridContainer.appendChild(productoCard);
      });
    } catch (error) {
      console.error("Error al cargar los productos:", error);
      alert("No se pudieron cargar los productos.");
    }
  }
  cargarProductos();

  const modalAgregarProducto = document.getElementById("modalAgregarProducto");
  const btnAgregarProducto = document.querySelector(".productos-nuevos-btn");
  const spanCerrarModal = modalAgregarProducto.querySelector(".close");
  const selectArticulo = document.getElementById("articulo");
  const otroArticuloGroup = document.getElementById("otroArticuloGroup");
  const selectPabellonEntrada = document.getElementById("pabellon");
  const selectPisoEntrada = document.getElementById("piso");
  const selectSalonEntrada = document.getElementById("salon");

  if (btnAgregarProducto) {
    btnAgregarProducto.onclick = () => {
      modalAgregarProducto.style.display = "block";
      loadPabellonesEntrada();
    };
  }
  if (spanCerrarModal)
    spanCerrarModal.onclick = () =>
      (modalAgregarProducto.style.display = "none");
  window.onclick = (e) => {
    if (e.target == modalAgregarProducto)
      modalAgregarProducto.style.display = "none";
  };
  if (selectArticulo) {
    selectArticulo.addEventListener("change", function () {
      otroArticuloGroup.style.display =
        this.value === "otro" ? "block" : "none";
    });
  }
  if (selectPabellonEntrada) {
    selectPabellonEntrada.addEventListener("change", () => {
      console.log("Pabellón cambiado a:", selectPabellonEntrada.value);
      loadPisosEntrada();
    });
  }
  if (selectPisoEntrada) {
    selectPisoEntrada.addEventListener("change", () => {
      console.log("Piso cambiado a:", selectPisoEntrada.value);
      loadAulasEntrada();
    });
  }

  async function loadPabellonesEntrada() {
    try {
      const response = await fetchWithAuth(
        "https://ucv-reports-backend.onrender.com/pabellon"
      );
      const pabellones = await response.json();
      selectPabellonEntrada.innerHTML =
        '<option value="">Seleccione un pabellón</option>';
      pabellones.forEach((p) => {
        const option = document.createElement("option");
        option.value = p.id;
        option.textContent = p.Pabellon;
        selectPabellonEntrada.appendChild(option);
      });
    } catch (error) {
      console.error("Error al cargar los pabellones:", error);
    }
  }

  async function loadPisosEntrada() {
    const selectedPabellonId = selectPabellonEntrada.value;
    selectPisoEntrada.innerHTML =
      '<option value="">Seleccione un piso</option>';
    selectSalonEntrada.innerHTML =
      '<option value="">Seleccione un salón</option>';
    selectPisoEntrada.disabled = true;
    selectSalonEntrada.disabled = true;
    if (!selectedPabellonId) return;

    try {
      const response = await fetchWithAuth(
        "https://ucv-reports-backend.onrender.com/piso"
      );
      const pisos = await response.json();
      const filtered = pisos.filter((p) => p.idpabellon == selectedPabellonId);
      selectPisoEntrada.disabled = false;
      filtered.forEach((p) => {
        const option = document.createElement("option");
        option.value = p.numero_piso;
        option.textContent = p.numero_piso;
        selectPisoEntrada.appendChild(option);
      });
      if (filtered.length > 0) {
        selectPisoEntrada.value = filtered[0].numero_piso;
        selectPisoEntrada.dispatchEvent(new Event("change"));
      }
    } catch (error) {
      console.error("Error al cargar los pisos:", error);
    }
  }

  async function loadAulasEntrada() {
    const pabellon = selectPabellonEntrada.value;
    const piso = selectPisoEntrada.value;
    if (!pabellon || !piso) return;

    try {
      const response = await fetchWithAuth(
        "https://ucv-reports-backend.onrender.com/salon"
      );
      const aulas = await response.json();
      selectSalonEntrada.innerHTML =
        '<option value="">Seleccione un salón</option>';
      selectSalonEntrada.disabled = true;

      const filtradas = aulas.filter(
        (aula) => aula.idpabellon == pabellon && aula.idpiso == piso
      );
      console.log("Aulas filtradas:", filtradas);
      filtradas.forEach((aula) => {
        const option = document.createElement("option");
        option.value = aula.id_salon; // CORREGIDO: usar id_salon en lugar de id
        option.textContent = aula.nombre;
        selectSalonEntrada.appendChild(option);
      });

      if (filtradas.length > 0) {
        selectSalonEntrada.value = filtradas[0].id_salon;
        console.log(
          "Valor de selectSalonEntrada después de asignar:",
          selectSalonEntrada.value
        );
        selectSalonEntrada.dispatchEvent(new Event("change"));
      }
      selectSalonEntrada.disabled = false;
    } catch (error) {
      console.error("Error al cargar las aulas:", error);
    }
  }

  const formAgregarProducto = document.getElementById("formAgregarProducto");
  if (formAgregarProducto) {
    formAgregarProducto.addEventListener("submit", async (e) => {
      e.preventDefault();
      debugFormValues();
      if (!validateFormValues()) return;
      const pabellon = parseInt(selectPabellonEntrada.value);
      const piso = parseInt(selectPisoEntrada.value);
      const salon = parseInt(selectSalonEntrada.value);
      const cantidad = parseInt(document.getElementById("cantidad").value) || 1;
      const articuloId = (() => {
        const map = { ordenador: 1, proyector: 2, escritorio: 3 };
        if (selectArticulo.value === "otro") {
          return parseInt(document.getElementById("otroArticulo").value);
        } else {
          return map[selectArticulo.value] || parseInt(selectArticulo.value);
        }
      })();
      const baseData = {
        nombre: document.getElementById("nombreProducto").value,
        codigo: document.getElementById("codigoProducto").value,
        precio: parseFloat(document.getElementById("precio").value),
        idpabellon: pabellon,
        idpiso: piso,
        idsalon: salon,
        imagen: "../../CSS/auth/images/placeholder.jpg",
        estado: "Pendiente",
      };
      const payload =
        cantidad > 1
          ? {
              id_articulo: articuloId,
              codigo_inicial: baseData.codigo,
              nombre_producto: baseData.nombre,
              precio_producto: baseData.precio,
              imagen_producto: baseData.imagen,
              cantidad_registros: cantidad,
              estado_producto: baseData.estado,
              idpabellon: baseData.idpabellon,
              idpiso: baseData.idpiso,
              idsalon: baseData.idsalon,
            }
          : {
              idarticulostipo: articuloId,
              Codigo: baseData.codigo,
              nombre: baseData.nombre,
              Precio: baseData.precio,
              idpabellon: baseData.idpabellon,
              idpiso: baseData.idpiso,
              idsalon: baseData.idsalon,
              imagen: baseData.imagen,
              Estado: baseData.estado,
            };
      const url = cantidad > 1 ? "/hardware/multiple" : "/hardware";
      const response = await fetchWithAuth(
        "https://ucv-reports-backend.onrender.com" + url,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        }
      );
      if (response.ok) {
        alert("Producto guardado exitosamente");
        modalAgregarProducto.style.display = "none";
        formAgregarProducto.reset();
        cargarProductos();
      } else {
        const err = await response.json();
        alert("Error: " + (err.message || response.statusText));
      }
    });
  }
});
