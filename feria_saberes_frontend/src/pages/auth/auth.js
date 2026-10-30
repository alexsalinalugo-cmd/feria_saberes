import { DefinirNav } from "../../components/navbar.js";
import { AuthServices } from "../../services/AuthServices.js";

// Pintar el navbar al cargar la página de auth
const MostrarNavbar = document.getElementById("navbar-placeholder");
if (MostrarNavbar) {
  MostrarNavbar.innerHTML = DefinirNav();
}

document.addEventListener("DOMContentLoaded", () => {
  const form = document.getElementById("login-form");
  const dniInput = document.getElementById("dni");
  const passwordInput = document.getElementById("password");
  const btnSubmit = document.getElementById("btn-submit");
  const btnText = btnSubmit.querySelector(".btn-text");
  const spinner = btnSubmit.querySelector(".spinner");
  const alertBox = document.getElementById("auth-alert");

  // Limpiar solo números en el campo DNI
  dniInput.addEventListener("input", (e) => {
    e.target.value = e.target.value.replace(/\D/g, "");
  });

  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    hideAlert();

    const dni = dniInput.value.trim();
    const password = passwordInput.value.trim();

    if (!validateForm(dni, password)) return;

    setLoading(true);

    try {
      //  le pasamos el objeto plano que espera el servicio
      const data = await AuthServices.Login({ dni, password });

      showAlert("¡Login exitoso! Redirigiendo...", "success");

      let usuario = null;

      if (data.accessToken) {
        localStorage.setItem("token", data.accessToken);
      }

      // Ajustado a cómo te responde el backend { accessToken, user }
      if (data.user) {
        usuario = data.user;
        localStorage.setItem("user", JSON.stringify(usuario)); // Guardado correcto como JSON string
      }

      // Actualizar el navbar visualmente antes de irnos si ya lo tenemos en pantalla
      if (MostrarNavbar) {
        MostrarNavbar.innerHTML = DefinirNav();
      }

      setTimeout(() => {
        if (usuario && usuario.rol === "admin") {
          window.location.href = "/src/pages/admin/admin.html";
        } else {
          window.location.href = "/src/pages/usuarios/usuario.html";
        }
      }, 1200);
    } catch (error) {
      showAlert(error.message || "Error de conexión con el servidor", "error");
    } finally {
      setLoading(false);
    }
  });

  function validateForm(dni, password) {
    let isValid = true;
    document.getElementById("dni-error").textContent = "";
    document.getElementById("password-error").textContent = "";

    if (!dni) {
      document.getElementById("dni-error").textContent = "El DNI es requerido";
      isValid = false;
    } else if (dni.length < 7 || dni.length > 8) {
      document.getElementById("dni-error").textContent =
        "Ingrese un DNI válido (7 u 8 dígitos)";
      isValid = false;
    }

    if (!password) {
      document.getElementById("password-error").textContent =
        "La contraseña es requerida";
      isValid = false;
    }

    return isValid;
  }

  function setLoading(isLoading) {
    btnSubmit.disabled = isLoading;
    if (isLoading) {
      btnText.textContent = "Ingresando...";
      spinner.classList.remove("hidden");
    } else {
      btnText.textContent = "Ingresar";
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
