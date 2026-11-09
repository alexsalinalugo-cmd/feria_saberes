import { DefinirNav } from "../../components/navbar.js";
import { ReportesServices } from "../../services/reportesServices.js";

const MostrarNavbar = document.getElementById("navbar-placeholder");
if (MostrarNavbar) {
  MostrarNavbar.innerHTML = DefinirNav();
}

const statAsistentes = document.getElementById("stat-asistentes");
const statProyectos = document.getElementById("stat-proyectos");
const statTopVotos = document.getElementById("stat-top-votos");
const statExpositores = document.getElementById("stat-expositores");

async function cargarResumenAdmin() {
  try {
    const data = await ReportesServices.obtenerDashboard();

    if (statAsistentes) {
      statAsistentes.textContent = (
        data.checkin?.totalAsistentes || 0
      ).toLocaleString();
    }
    if (statProyectos) {
      statProyectos.textContent = (
        data.proyectos?.totalProyectos || 0
      ).toLocaleString();
    }
    if (statTopVotos) {
      const top = data.proyectos?.proyectoMasValorado;
      statTopVotos.textContent = top ? `${top.valoracion} votos` : "0 votos";
    }
    if (statExpositores) {
      statExpositores.textContent = (
        data.comunidad?.totalExpositores || 0
      ).toLocaleString();
    }
  } catch (error) {
    console.error("No se pudieron cargar las métricas rápidas de admin:", error);
  }
}

document.addEventListener("DOMContentLoaded", () => {
  cargarResumenAdmin();
});
