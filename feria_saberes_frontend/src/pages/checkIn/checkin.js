const form = document.querySelector("#checkin-form");
const categoriaInput = document.querySelector("#categoria");
const integrantesInput = document.querySelector("#integrantes");
const nombreInput = document.querySelector("#nombre");
const message = document.querySelector("#form-message");

form.addEventListener("submit", (event) => {
  event.preventDefault();

  message.textContent = "";
  message.className = "form-message";

  const categoria = categoriaInput.value;
  const integrantes = Number(integrantesInput.value);
  const nombre = nombreInput.value.trim();

  if (!categoria) {
    mostrarMensaje("Seleccioná una categoría.", "error");
    categoriaInput.focus();
    return;
  }

  if (!Number.isSafeInteger(integrantes) || integrantes < 1) {
    mostrarMensaje(
      "La cantidad de integrantes debe ser un entero mayor que cero.",
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

  console.log("Datos validados del Registro:", datos);

  mostrarMensaje(
    "Los datos son válidos. El registro todavía no está conectado al servidor.",
    "success",
  );
});

function mostrarMensaje(texto, tipo) {
  message.textContent = texto;
  message.className = `form-message ${tipo}`;
}
