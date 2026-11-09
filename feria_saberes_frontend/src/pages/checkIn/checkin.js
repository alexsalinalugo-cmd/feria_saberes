import { registrarIngreso } from "../../services/checkInServices.js";
import { DefinirNav } from "../../components/navbar.js";

// Inicializar Barra de Navegación compartida
const MostrarNavbar = document.getElementById("navbar-placeholder");
if (MostrarNavbar) {
  MostrarNavbar.innerHTML = DefinirNav();
}

// Elementos del formulario
const form = document.querySelector("#checkin-form");
const categoriaInput = document.querySelector("#categoria");
const integrantesInput = document.querySelector("#integrantes");
const nombreInput = document.querySelector("#nombre");
const submitButton = document.querySelector("#submit-button");
const message = document.querySelector("#form-message");

function mostrarMensaje(texto, tipo) {
  if (!message) return;
  message.textContent = texto;
  message.className = `form-message ${tipo}`;
}

// Escuchador de envío del formulario
form?.addEventListener("submit", async (event) => {
  event.preventDefault();

  message.textContent = "";
  message.className = "form-message";

  const categoria = categoriaInput.value;
  const integrantes = Number(integrantesInput.value);
  const nombre = nombreInput.value.trim();

  if (!categoria) {
    mostrarMensaje("Seleccioná una categoría de visitante.", "error");
    categoriaInput.focus();
    return;
  }

  if (!Number.isSafeInteger(integrantes) || integrantes < 1) {
    mostrarMensaje(
      "La cantidad de integrantes debe ser un número entero mayor a cero.",
      "error",
    );
    integrantesInput.focus();
    return;
  }

  const datos = {
    categoria,
    integrantes,
    nombre: nombre || null,
  };

  const originalText = submitButton.textContent;
  submitButton.disabled = true;
  submitButton.textContent = "Registrando ingreso...";

  try {
    const nuevoRegistro = await registrarIngreso(datos);
    console.log("Ingreso guardado exitosamente:", nuevoRegistro);

    mostrarMensaje("¡Ingreso registrado con éxito!", "success");

    // Limpiar campos del formulario y reenfocar
    form.reset();
    integrantesInput.value = "1";
    categoriaInput.focus();
  } catch (error) {
    console.error("Error al registrar ingreso:", error);
    mostrarMensaje(
      error.message ||
        "Error al conectar con el servidor. Verificá que el backend esté activo.",
      "error",
    );
  } finally {
    submitButton.disabled = false;
    submitButton.textContent = originalText;
  }
});
