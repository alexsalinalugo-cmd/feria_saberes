import { AuthServices } from "./../services/AuthServices";

export function DefinirNav() {
  const usuarioRaw = localStorage.getItem("user");

  if (!usuarioRaw) {
    return Navbar();
  }

  try {
    const usuario = JSON.parse(usuarioRaw);

    if (usuario.rol === "admin") {
      return NavbarAdmins();
    } else if (usuario.rol === "usuario") {
      return NavbarUser();
    } else {
      return Navbar();
    }
  } catch (error) {
    console.error("Error al parsear el usuario del localStorage:", error);
    return Navbar();
  }
}

function NavbarAdmins() {
  return `
        <nav class="navbar">
            <div class="navbar-brand">
                <a href="/index.html" aria-label="Ir al inicio">
                    <img src="/logo.png" alt="" />
                </a>
            </div>
            <h1 class="navbar-title">Feria de Saberes</h1>
            <button class="navbar-toggle" type="button" aria-label="Abrir menú" aria-expanded="false" aria-controls="navbar-links">
                <span></span>
                <span></span>
                <span></span>
            </button>
            <ul class="navbar-links" id="navbar-links">
                <li><a href="/index.html">Proyectos</a></li>
                <li><a href="/src/pages/checkIn/checkIn.html">Puerta (Check-In)</a></li>
                <li><a href="/src/pages/admin/admin.html">Administración</a></li>
                <li><a href="/src/pages/reportes/reportes.html">Reportes</a></li>
                <li><a href="#" id="btn-logout" class="logout-btn">Cerrar Sesión</a></li>
            </ul>
        </nav>
    `;
}

function NavbarUser() {
  return `
        <nav class="navbar">
            <div class="navbar-brand">
                <a href="/index.html" aria-label="Ir al inicio">
                    <img src="/logo.png" alt="" />
                </a>
            </div>
            <h1 class="navbar-title">Feria de Saberes</h1>
            <button class="navbar-toggle" type="button" aria-label="Abrir menú" aria-expanded="false" aria-controls="navbar-links">
                <span></span>
                <span></span>
                <span></span>
            </button>
            <ul class="navbar-links" id="navbar-links">
                <li><a href="/src/pages/usuarios/usuario.html">Panel Usuario</a></li>
                <li><a href="#" id="btn-logout" class="logout-btn">Cerrar Sesión</a></li>
            </ul>
        </nav>
    `;
}

function Navbar() {
  return `
        <nav class="navbar">
            <div class="navbar-brand">
                <a href="/index.html" aria-label="Ir al inicio">
                    <img src="/logo.png" alt="" />
                </a>
            </div>
            <h1 class="navbar-title">Feria de Saberes</h1>
            <button class="navbar-toggle" type="button" aria-label="Abrir menú" aria-expanded="false" aria-controls="navbar-links">
                <span></span>
                <span></span>
                <span></span>
            </button>
            <ul class="navbar-links" id="navbar-links">
                <li><a href="/src/pages/auth/auth.html">Logueo</a></li>
            </ul>
        </nav>
    `;
}

// ==========================================
// CAPTURADOR GLOBAL DEL BOTÓN DE LOGOUT
// ==========================================
// Como el navbar se inyecta dinámicamente mediante innerHTML en cada página,
// escuchamos los clicks en todo el documento y disparamos el logout si presionan el botón.
document.addEventListener("click", (e) => {
  const target = e.target;
  if (!(target instanceof Element)) return;

  const navbar = target.closest(".navbar");
  const toggle = target.closest(".navbar-toggle");

  if (toggle && navbar) {
    const isOpen = toggle.getAttribute("aria-expanded") !== "true";
    toggle.setAttribute("aria-expanded", String(isOpen));
    toggle.setAttribute("aria-label", isOpen ? "Cerrar menú" : "Abrir menú");
    navbar.querySelector(".navbar-links")?.classList.toggle("active", isOpen);
  } else if (target.closest(".navbar-links a") || !navbar) {
    document.querySelectorAll(".navbar").forEach((nav) => {
      const menuToggle = nav.querySelector(".navbar-toggle");
      const links = nav.querySelector(".navbar-links");
      menuToggle?.setAttribute("aria-expanded", "false");
      menuToggle?.setAttribute("aria-label", "Abrir menú");
      links?.classList.remove("active");
    });
  }

  if (target.closest("#btn-logout")) {
    e.preventDefault();
    AuthServices.logoutGlobal();
  }
});

document.addEventListener("keydown", (e) => {
  if (e.key !== "Escape") return;

  document.querySelectorAll(".navbar").forEach((nav) => {
    const menuToggle = nav.querySelector(".navbar-toggle");
    const links = nav.querySelector(".navbar-links");
    if (menuToggle?.getAttribute("aria-expanded") === "true") {
      menuToggle.setAttribute("aria-expanded", "false");
      menuToggle.setAttribute("aria-label", "Abrir menú");
      links?.classList.remove("active");
      menuToggle.focus();
    }
  });
});
