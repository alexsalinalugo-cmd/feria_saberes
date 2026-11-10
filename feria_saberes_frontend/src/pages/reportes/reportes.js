import { DefinirNav } from "../../components/navbar.js";
import { ReportesServices } from "../../services/reportesServices.js";

// Configuración de categorías de Check-In
const CATEGORY_CONFIG = {
  familiar: {
    nombre: "Familiar",
    color: "#17365d",
  },
  alumno: {
    nombre: "Alumno",
    color: "#2563eb",
  },
  docente: {
    nombre: "Docente",
    color: "#0284c7",
  },
  otro: {
    nombre: "Otro",
    color: "#94a3b8",
  },
};

// Elementos del DOM
const MostrarNavbar = document.getElementById("navbar-placeholder");
const btnRefresh = document.getElementById("btn-refresh");
const lastUpdatedEl = document.getElementById("last-updated");
const statusMessage = document.getElementById("status-message");

// KPIs Globales
const kpiTotalAsistentes = document.getElementById("kpi-total-asistentes");
const kpiTotalGrupos = document.getElementById("kpi-total-grupos");
const kpiTotalProyectos = document.getElementById("kpi-total-proyectos");
const kpiTopProyectoTitulo = document.getElementById("kpi-top-proyecto-titulo");
const kpiTopProyectoVotos = document.getElementById("kpi-top-proyecto-votos");
const kpiTotalExpositores = document.getElementById("kpi-total-expositores");
const kpiTotalResenas = document.getElementById("kpi-total-resenas");

// KPIs de Puerta (Check-In)
const checkinTopCat = document.getElementById("checkin-top-cat");
const checkinTopCatSub = document.getElementById("checkin-top-cat-sub");
const checkinPeakHour = document.getElementById("checkin-peak-hour");
const checkinPeakHourSub = document.getElementById("checkin-peak-hour-sub");
const pieChartSvg = document.getElementById("pie-chart-svg");
const donutTotal = document.getElementById("donut-total");
const chartLegend = document.getElementById("chart-legend");

// Proyectos Spotlight & Barras
const spotlightTitle = document.getElementById("spotlight-title");
const spotlightDivision = document.getElementById("spotlight-division");
const spotlightVotes = document.getElementById("spotlight-votes");
const spotlightExpositores = document.getElementById("spotlight-expositores");
const cycleWinnerElements = {
  Basico: {
    title: document.getElementById("basico-winner-title"),
    division: document.getElementById("basico-winner-division"),
    votes: document.getElementById("basico-winner-votes"),
  },
  Superior: {
    title: document.getElementById("superior-winner-title"),
    division: document.getElementById("superior-winner-division"),
    votes: document.getElementById("superior-winner-votes"),
  },
};

const barInfoVal = document.getElementById("bar-info-val");
const barInfoFill = document.getElementById("bar-info-fill");
const barElecVal = document.getElementById("bar-elec-val");
const barElecFill = document.getElementById("bar-elec-fill");

const barBasicoVal = document.getElementById("bar-basico-val");
const barBasicoFill = document.getElementById("bar-basico-fill");
const barSuperiorVal = document.getElementById("bar-superior-val");
const barSuperiorFill = document.getElementById("bar-superior-fill");

// Tabla Ranking
const rankingTableBody = document.getElementById("ranking-table-body");

// Inicialización
document.addEventListener("DOMContentLoaded", () => {
  if (MostrarNavbar) {
    MostrarNavbar.innerHTML = DefinirNav();
  }

  cargarDashboard();
});

btnRefresh?.addEventListener("click", () => {
  cargarDashboard();
});

/**
 * Carga todos los datos consolidados desde el backend
 */
async function cargarDashboard() {
  mostrarError("");
  if (btnRefresh) {
    btnRefresh.disabled = true;
    btnRefresh.innerHTML = `
      <svg class="refresh-svg spinning" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        <path d="M21.5 2v6h-6M21.34 15.57a10 10 0 1 1-.57-8.38l5.67-5.67"/>
      </svg>
      <span>Actualizando...</span>
    `;
  }

  try {
    const data = await ReportesServices.obtenerDashboard();
    renderDashboard(data);

    const ahora = new Date();
    if (lastUpdatedEl) {
      lastUpdatedEl.textContent = `Actualizado ${ahora.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", second: "2-digit" })}`;
    }
  } catch (error) {
    console.error("Error al cargar reportes:", error);
    mostrarError(
      error.message ||
        "Error al conectar con el servidor. Verificá que el backend esté activo.",
    );
  } finally {
    if (btnRefresh) {
      btnRefresh.disabled = false;
      btnRefresh.innerHTML = `
        <svg class="refresh-svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <path d="M21.5 2v6h-6M21.34 15.57a10 10 0 1 1-.57-8.38l5.67-5.67"/>
        </svg>
        <span>Actualizar datos</span>
      `;
    }
  }
}

/**
 * Renderiza todas las secciones del dashboard
 */
function renderDashboard(data) {
  const { checkin, proyectos, comunidad } = data;

  // 1. Renderizar KPIs Principales
  if (kpiTotalAsistentes) {
    kpiTotalAsistentes.textContent = (
      checkin?.totalAsistentes || 0
    ).toLocaleString();
  }
  if (kpiTotalGrupos) {
    const grupos = checkin?.totalGrupos || 0;
    kpiTotalGrupos.textContent = `${grupos} ${grupos === 1 ? "grupo registrado" : "grupos registrados"}`;
  }
  if (kpiTotalProyectos) {
    kpiTotalProyectos.textContent = (
      proyectos?.totalProyectos || 0
    ).toLocaleString();
  }
  if (kpiTotalExpositores) {
    kpiTotalExpositores.textContent = (
      comunidad?.totalExpositores || 0
    ).toLocaleString();
  }
  if (kpiTotalResenas) {
    kpiTotalResenas.textContent = (
      comunidad?.totalResenas || 0
    ).toLocaleString();
  }

  // Proyecto más valorado (KPI Banner)
  const topProy = proyectos?.proyectoMasValorado;
  if (topProy) {
    if (kpiTopProyectoTitulo) {
      kpiTopProyectoTitulo.textContent = topProy.titulo;
      kpiTopProyectoTitulo.title = topProy.titulo;
    }
    if (kpiTopProyectoVotos) {
      kpiTopProyectoVotos.textContent = `${topProy.valoracion} votos`;
    }
  } else {
    if (kpiTopProyectoTitulo) kpiTopProyectoTitulo.textContent = "Sin proyectos";
    if (kpiTopProyectoVotos) kpiTopProyectoVotos.textContent = "0 votos";
  }

  // 2. Renderizar Módulo de Check-In
  renderModuloCheckin(checkin);

  // 3. Renderizar Módulo de Proyectos (Spotlight y Barras)
  renderModuloProyectos(proyectos);

  // 4. Renderizar Ranking de Proyectos
  renderRanking(proyectos?.ranking || []);
}

/**
 * Renderiza la afluencia de Check-In, KPIs de puerta y gráfico Donut
 */
function renderModuloCheckin(checkin) {
  if (!checkin) return;

  // Categoría top
  const topCatKey = checkin.categoriaTop?.categoria || "otro";
  const catNombre = CATEGORY_CONFIG[topCatKey]?.nombre || topCatKey;
  if (checkinTopCat) checkinTopCat.textContent = catNombre;
  if (checkinTopCatSub) {
    checkinTopCatSub.textContent = `${checkin.categoriaTop?.total || 0} personas (${checkin.categoriaTop?.porcentaje || 0}%)`;
  }

  // Horario pico
  if (checkinPeakHour) {
    checkinPeakHour.textContent =
      checkin.horarioPico?.franja || "Sin registros aún";
  }
  if (checkinPeakHourSub) {
    checkinPeakHourSub.textContent =
      checkin.horarioPico?.total > 0
        ? `${checkin.horarioPico.total} personas en esa franja`
        : "Esperando más registros";
  }

  // Donut total
  if (donutTotal) {
    donutTotal.textContent = (checkin.totalAsistentes || 0).toLocaleString();
  }

  // Gráfico Donut SVG
  renderDonutChart(checkin.porCategoria || [], checkin.totalAsistentes || 0);

  // Leyenda
  renderLegend(checkin.porCategoria || [], checkin.totalAsistentes || 0);
}

/**
 * Renderiza el gráfico SVG tipo Donut con los segmentos circulares
 */
function renderDonutChart(porCategoria, totalPersonas) {
  if (!pieChartSvg) return;
  pieChartSvg.innerHTML = "";

  if (totalPersonas <= 0 || !porCategoria.length) {
    pieChartSvg.innerHTML = `
      <circle cx="80" cy="80" r="58" fill="transparent" stroke="#e2e8f0" stroke-width="18" />
    `;
    return;
  }

  const radio = 58;
  const circunferencia = 2 * Math.PI * radio;
  let offsetAcumulado = 0;

  porCategoria.forEach((item) => {
    const cant = item.totalPersonas || 0;
    if (cant <= 0) return;

    const proporcion = cant / totalPersonas;
    const dashLength = proporcion * circunferencia;
    const color = CATEGORY_CONFIG[item.categoria]?.color || "#94a3b8";

    const circle = document.createElementNS(
      "http://www.w3.org/2000/svg",
      "circle",
    );
    circle.setAttribute("cx", "80");
    circle.setAttribute("cy", "80");
    circle.setAttribute("r", String(radio));
    circle.setAttribute("fill", "transparent");
    circle.setAttribute("stroke", color);
    circle.setAttribute("stroke-width", "18");
    circle.setAttribute(
      "stroke-dasharray",
      `${dashLength} ${circunferencia - dashLength}`,
    );
    circle.setAttribute("stroke-dashoffset", `-${offsetAcumulado}`);
    circle.style.transition = "stroke-dasharray 0.5s ease";

    pieChartSvg.appendChild(circle);
    offsetAcumulado += dashLength;
  });
}

/**
 * Renderiza la leyenda de colores y porcentajes
 */
function renderLegend(porCategoria, totalPersonas) {
  if (!chartLegend) return;
  chartLegend.innerHTML = "";

  if (totalPersonas <= 0 || !porCategoria.length) {
    chartLegend.innerHTML = `
      <div style="font-size: 13px; color: #64748b; text-align: center; padding: 12px 0;">
        Esperando primeros ingresos en puerta.
      </div>
    `;
    return;
  }

  porCategoria.forEach((item) => {
    const config = CATEGORY_CONFIG[item.categoria] || {
      nombre: item.categoria,
      color: "#94a3b8",
    };
    const pct =
      totalPersonas > 0
        ? Math.round((item.totalPersonas / totalPersonas) * 100)
        : 0;

    const div = document.createElement("div");
    div.className = "legend-item";
    div.innerHTML = `
      <div class="legend-left">
        <span class="legend-color" style="background-color: ${config.color}"></span>
        <span class="legend-name">${config.nombre}</span>
      </div>
      <div class="legend-right">
        <span class="legend-count">${item.totalPersonas}</span>
        <span class="legend-pct">(${pct}%)</span>
      </div>
    `;
    chartLegend.appendChild(div);
  });
}

/**
 * Renderiza la sección de proyectos: Spotlight y barras de progreso
 */
function renderModuloProyectos(proyectos) {
  if (!proyectos) return;

  renderGanadoresPorCiclo(proyectos.masVotadoPorCiclo);

  const top = proyectos.proyectoMasValorado;
  if (top) {
    if (spotlightTitle) spotlightTitle.textContent = top.titulo;
    if (spotlightDivision) spotlightDivision.textContent = top.division;
    if (spotlightVotes) spotlightVotes.textContent = `${top.valoracion} votos`;
    if (spotlightExpositores) {
      spotlightExpositores.textContent =
        top.expositores?.length > 0
          ? `Alumnos: ${top.expositores.join(", ")}`
          : "Sin expositores registrados";
    }
  } else {
    if (spotlightTitle) spotlightTitle.textContent = "Sin proyectos cargados";
    if (spotlightDivision) spotlightDivision.textContent = "Aún no hay proyectos registrados";
    if (spotlightVotes) spotlightVotes.textContent = "0 votos";
    if (spotlightExpositores) spotlightExpositores.textContent = "-";
  }

  // Barras de Orientación
  const total = proyectos.totalProyectos || 0;
  const infoCount = proyectos.porOrientacion?.informatica || 0;
  const elecCount = proyectos.porOrientacion?.electricidad || 0;

  const infoPct = total > 0 ? Math.round((infoCount / total) * 100) : 0;
  const elecPct = total > 0 ? Math.round((elecCount / total) * 100) : 0;

  if (barInfoVal) barInfoVal.textContent = `${infoCount} (${infoPct}%)`;
  if (barInfoFill) barInfoFill.style.width = `${infoPct}%`;

  if (barElecVal) barElecVal.textContent = `${elecCount} (${elecPct}%)`;
  if (barElecFill) barElecFill.style.width = `${elecPct}%`;

  // Barras de Ciclo
  const basicoCount = proyectos.porCiclo?.Basico || 0;
  const superiorCount = proyectos.porCiclo?.Superior || 0;

  const basicoPct = total > 0 ? Math.round((basicoCount / total) * 100) : 0;
  const superiorPct = total > 0 ? Math.round((superiorCount / total) * 100) : 0;

  if (barBasicoVal) barBasicoVal.textContent = `${basicoCount} (${basicoPct}%)`;
  if (barBasicoFill) barBasicoFill.style.width = `${basicoPct}%`;

  if (barSuperiorVal)
    barSuperiorVal.textContent = `${superiorCount} (${superiorPct}%)`;
  if (barSuperiorFill) barSuperiorFill.style.width = `${superiorPct}%`;
}

function renderGanadoresPorCiclo(ganadores = {}) {
  for (const ciclo of ["Basico", "Superior"]) {
    const elementos = cycleWinnerElements[ciclo];
    const proyecto = ganadores[ciclo];

    if (elementos.title) {
      elementos.title.textContent = proyecto?.titulo || "Sin proyectos";
    }
    if (elementos.division) {
      elementos.division.textContent =
        proyecto?.division || "No hay proyectos en este ciclo";
    }
    if (elementos.votes) {
      elementos.votes.textContent = `${proyecto?.valoracion || 0} votos`;
    }
  }
}

/**
 * Renderiza la tabla de Ranking de Proyectos Top 5
 */
function renderRanking(ranking) {
  if (!rankingTableBody) return;

  if (!ranking.length) {
    rankingTableBody.innerHTML = `
      <tr>
        <td colspan="6" class="table-empty">No hay proyectos registrados en este momento.</td>
      </tr>
    `;
    return;
  }

  rankingTableBody.innerHTML = ranking
    .map((p, index) => {
      const pos = index + 1;
      const rankBadgeClass =
        pos === 1
          ? "rank-1"
          : pos === 2
            ? "rank-2"
            : pos === 3
              ? "rank-3"
              : "rank-other";

      return `
        <tr>
          <td><span class="rank-badge ${rankBadgeClass}">${pos}</span></td>
          <td class="project-cell">
            <strong>${p.titulo}</strong>
            <small>ID #${p.id}</small>
          </td>
          <td>${p.division}</td>
          <td>${p.expositoresCount} alumno${p.expositoresCount === 1 ? "" : "s"}</td>
          <td>${p.resenasCount} reseña${p.resenasCount === 1 ? "" : "s"}</td>
          <td style="text-align: right;">
            <span class="votes-badge">${p.valoracion} votos</span>
          </td>
        </tr>
      `;
    })
    .join("");
}

function mostrarError(mensaje) {
  if (!statusMessage) return;
  if (!mensaje) {
    statusMessage.style.display = "none";
    statusMessage.textContent = "";
    statusMessage.className = "status-message";
    return;
  }
  statusMessage.textContent = mensaje;
  statusMessage.className = "status-message error";
  statusMessage.style.display = "block";
}
