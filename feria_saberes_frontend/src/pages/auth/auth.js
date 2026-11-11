import { DefinirNav } from "../../components/navbar.js";
import { AuthServices } from "../../services/AuthServices.js";

// Pintar el navbar al cargar la página de auth
const MostrarNavbar = document.getElementById("navbar-placeholder");
if (MostrarNavbar) {
  MostrarNavbar.innerHTML = DefinirNav();
}

document.addEventListener("DOMContentLoaded", () => {
  const form = document.getElementById("auth-form");
  const title = document.getElementById("auth-title");
  const description = document.getElementById("auth-description");
  const nombreInput = document.getElementById("nombre");
  const passwordInput = document.getElementById("password");
  const btnSubmit = document.getElementById("btn-submit");
  const btnText = btnSubmit.querySelector(".btn-text");
  const spinner = btnSubmit.querySelector(".spinner");
  const alertBox = document.getElementById("auth-alert");
  const switchPrompt = document.getElementById("auth-switch-prompt");
  const toggleModeButton = document.getElementById("btn-toggle-mode");
  const nombreError = document.getElementById("nombre-error");
  const passwordError = document.getElementById("password-error");
  let mode = "login";

  toggleModeButton.addEventListener("click", () => {
    mode = mode === "login" ? "register" : "login";
    hideAlert();
    nombreError.textContent = "";
    passwordError.textContent = "";

    const registering = mode === "register";
    title.textContent = registering ? "Crear cuenta" : "Bienvenido";
    description.textContent = registering
      ? "Registrate para cargar y administrar tus proyectos."
      : "Ingresá tus credenciales para acceder";
    btnText.textContent = registering ? "Registrarme" : "Ingresar";
    switchPrompt.textContent = registering
      ? "¿Ya tenés cuenta?"
      : "¿Todavía no tenés cuenta?";
    toggleModeButton.textContent = registering
      ? "Iniciar sesión"
      : "Crear una cuenta";
    passwordInput.autocomplete = registering
      ? "new-password"
      : "current-password";
  });

  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    hideAlert();

    const nombre = nombreInput.value.trim();
    const password = passwordInput.value;

    if (!validateForm(nombre, password, mode)) return;

    setLoading(true);

    try {
      if (mode === "register") {
        await AuthServices.Registrer({ nombre, password });
      }

      const data = await AuthServices.Login({ nombre, password });
      localStorage.setItem("token", data.accessToken);
      localStorage.setItem("user", JSON.stringify(data.user));

      showAlert(
        mode === "register"
          ? "¡Cuenta creada! Redirigiendo..."
          : "¡Inicio de sesión exitoso! Redirigiendo...",
        "success",
      );

      setTimeout(() => {
        if (data.user?.rol === "admin") {
          window.location.href = "/src/pages/admin/admin.html";
        } else {
          window.location.href = "/src/pages/usuarios/usuario.html";
        }
      }, 1200);
    } catch (error) {
      showAlert(
        error.message || "Error de conexión con el servidor",
        "error",
      );
    } finally {
      setLoading(false);
    }
  });

  function validateForm(nombre, password, currentMode) {
    let isValid = true;
    nombreError.textContent = "";
    passwordError.textContent = "";

    if (!nombre) {
      nombreError.textContent = "El nombre es requerido";
      isValid = false;
    }

    if (!password) {
      passwordError.textContent = "La contraseña es requerida";
      isValid = false;
    }

    return isValid;
  }

  function setLoading(isLoading) {
    btnSubmit.disabled = isLoading;
    toggleModeButton.disabled = isLoading;
    if (isLoading) {
      btnText.textContent =
        mode === "register" ? "Creando cuenta..." : "Ingresando...";
      spinner.classList.remove("hidden");
    } else {
      btnText.textContent = mode === "register" ? "Registrarme" : "Ingresar";
      spinner.classList.add("hidden");
    }
  }

  function showAlert(message, type) {
    alertBox.textContent = message;
    alertBox.className = `alert ${type}`;
  }

  function hideAlert() {
    alertBox.className = "alert hidden";
    alertBox.textContent = "";
  }
});
