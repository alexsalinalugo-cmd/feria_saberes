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

// ⚠️ IMPORTANTE: Agregué un id="btn-logout" a los botones/enlaces de salida

function NavbarAdmins() {
  return `
        <nav class="navbar">
            <div class="navbar-brand">
                <a href="/src/pages/landing/index.html">Feria de Saberes</a>
            </div>
            <ul class="navbar-links">
                <li><a href="/src/pages/landing/index.html">Proyectos</a></li>
                <li><a href="/src/pages/checkin/checkIn.html">Puerta (Check-In)</a></li>
                <li><a href="/src/pages/admin/admin.html">Administración</a></li>
                <li><a href="#" id="btn-logout" class="logout-btn">Cerrar Sesión</a></li>
            </ul>
        </nav>
    `;
}

function NavbarUser() {
  return `
        <nav class="navbar">
            <div class="navbar-brand">
                <a href="/src/pages/landing/index.html">Feria de Saberes</a>
            </div>
            <ul class="navbar-links">
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
                <a href="/src/pages/landing/index.html">Feria de Saberes</a>
            </div>
            <ul class="navbar-links">
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
  if (e.target && e.target.id === "btn-logout") {
    e.preventDefault();
    AuthServices.logoutGlobal();
  }
});
