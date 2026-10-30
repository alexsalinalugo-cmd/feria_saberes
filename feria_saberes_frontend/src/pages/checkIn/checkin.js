import {
  registrarIngreso,
  obtenerUltimosIngresos,
} from "../../services/checkin.service.js";

// Elementos del formulario
const form = document.querySelector("#checkin-form");
const categoriaInput = document.querySelector("#categoria");
const integrantesInput = document.querySelector("#integrantes");
const nombreInput = document.querySelector("#nombre");
const message = document.querySelector("#form-message");
const submitButton = document.querySelector("#submit-button");

// Elementos de la Card de Resumen
const kpiTopCategory = document.querySelector("#kpi-top-category");
const kpiTopCategorySub = document.querySelector("#kpi-top-category-sub");
const kpiPeakHour = document.querySelector("#kpi-peak-hour");
const kpiPeakHourSub = document.querySelector("#kpi-peak-hour-sub");
const kpiTotalPeople = document.querySelector("#kpi-total-people");
const kpiTotalGroups = document.querySelector("#kpi-total-groups");
const pieChartSvg = document.querySelector("#pie-chart-svg");
const donutTotal = document.querySelector("#donut-total");
const chartLegend = document.querySelector("#chart-legend");

// Configuración de colores por categoría
const CATEGORY_CONFIG = {
  familiar: {
    nombre: "Familiar",
    color: "#17365d",
  },
  alumno: {
    nombre: "Alumno",
    color: "#2b6cb0",
  },
  docente: {
    nombre: "Docente",
    color: "#38bdf8",
  },
  otro: {
    nombre: "Otro",
    color: "#94a3b8",
  },
};

// Historial en memoria para alimentar el resumen
let registrosLocales = [];

// Inicialización
document.addEventListener("DOMContentLoaded", () => {
  cargarResumenInicial();
});

// Escuchador de envío del formulario
form.addEventListener("submit", async (event) => {
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

  const originalText = submitButton.textContent;
  submitButton.disabled = true;
  submitButton.textContent = "Registrando ingreso...";

  try {
    const nuevoRegistro = await registrarIngreso(datos);
    console.log("Ingreso guardado exitosamente:", nuevoRegistro);

    mostrarMensaje("¡Ingreso registrado con éxito!", "success");

    // Agregar al historial local y actualizar la card de resumen
    registrosLocales.unshift(nuevoRegistro);
    actualizarCardResumen(registrosLocales);

    // Limpiar campos del formulario
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

function mostrarMensaje(texto, tipo) {
  message.textContent = texto;
  message.className = `form-message ${tipo}`;
}

// Cargar registros existentes desde el backend para poblar el resumen
async function cargarResumenInicial() {
  try {
    const ingresos = await obtenerUltimosIngresos();
    if (Array.isArray(ingresos)) {
      registrosLocales = ingresos;
      actualizarCardResumen(registrosLocales);
      return;
    }
  } catch {
    // Si el backend no está disponible en este momento, se inicia en estado limpio
  }
  actualizarCardResumen(registrosLocales);
}

// Cálculo y renderizado de la Card de Resumen
function actualizarCardResumen(ingresos) {
  if (!ingresos || ingresos.length === 0) {
    renderEstadoVacio();
    return;
  }

  let totalPersonas = 0;
  const conteoPorCategoria = {
    familiar: 0,
    alumno: 0,
    docente: 0,
    otro: 0,
  };

  const conteoPorHora = {};

  ingresos.forEach((ingreso) => {
    const cant = Number(ingreso.integrantes) || 1;
    totalPersonas += cant;

    const cat = ingreso.categoria || "otro";
    if (conteoPorCategoria[cat] !== undefined) {
      conteoPorCategoria[cat] += cant;
    } else {
      conteoPorCategoria.otro += cant;
    }

    // Calcular franja horaria (Ej: "11:00 - 12:00 hs")
    if (ingreso.created_at) {
      const fecha = new Date(ingreso.created_at);
      const hora = fecha.getHours();
      const claveHora = `${String(hora).padStart(2, "0")}:00 - ${String(hora + 1).padStart(2, "0")}:00 hs`;
      conteoPorHora[claveHora] = (conteoPorHora[claveHora] || 0) + cant;
    }
  });

  // 1. Determinar categoría con mayor afluencia
  let topCategoriaKey = "familiar";
  let maxPersonasCat = -1;

  for (const [cat, cant] of Object.entries(conteoPorCategoria)) {
    if (cant > maxPersonasCat) {
      maxPersonasCat = cant;
      topCategoriaKey = cat;
    }
  }

  const porcentajeTop =
    totalPersonas > 0 ? Math.round((maxPersonasCat / totalPersonas) * 100) : 0;
  const nombreTop = CATEGORY_CONFIG[topCategoriaKey]?.nombre || topCategoriaKey;

  kpiTopCategory.textContent = nombreTop;
  kpiTopCategorySub.textContent = `${maxPersonasCat} personas (${porcentajeTop}% del total)`;

  // 2. Determinar horario pico de mayor ingreso
  let horarioPico = "Sin datos de hora";
  let maxPersonasHora = -1;

  for (const [horaStr, cant] of Object.entries(conteoPorHora)) {
    if (cant > maxPersonasHora) {
      maxPersonasHora = cant;
      horarioPico = horaStr;
    }
  }

  if (maxPersonasHora > 0) {
    kpiPeakHour.textContent = horarioPico;
    kpiPeakHourSub.textContent = `${maxPersonasHora} ingresos en esta franja`;
  } else {
    kpiPeakHour.textContent = "Horario habitual";
    kpiPeakHourSub.textContent = "Registros en curso";
  }

  // 3. Totales de asistentes
  kpiTotalPeople.textContent = totalPersonas.toLocaleString();
  donutTotal.textContent = totalPersonas.toLocaleString();
  kpiTotalGroups.textContent = `${ingresos.length} ${
    ingresos.length === 1 ? "grupo registrado" : "grupos registrados"
  }`;

  // 4. Renderizar Gráfico Pastel (Donut SVG) y Leyenda
  renderDonutChart(conteoPorCategoria, totalPersonas);
  renderLeyenda(conteoPorCategoria, totalPersonas);
}

// Dibuja el gráfico circular usando SVG nativo
function renderDonutChart(conteoPorCategoria, totalPersonas) {
  pieChartSvg.innerHTML = "";

  if (totalPersonas <= 0) {
    pieChartSvg.innerHTML = `
      <circle cx="80" cy="80" r="58" fill="transparent" stroke="#e2e8f0" stroke-width="18" />
    `;
    return;
  }

  const radio = 58;
  const circunferencia = 2 * Math.PI * radio;
  let offsetAcumulado = 0;

  for (const [key, cant] of Object.entries(conteoPorCategoria)) {
    if (cant <= 0) continue;

    const proporcion = cant / totalPersonas;
    const dashLength = proporcion * circunferencia;
    const color = CATEGORY_CONFIG[key]?.color || "#94a3b8";

    const circle = document.createElementNS(
      "http://www.w3.org/2000/svg",
      "circle",
    );
    circle.setAttribute("cx", "80");
    circle.setAttribute("cy", "80");
    circle.setAttribute("r", radio);
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
  }
}

// Genera la leyenda con los colores y porcentajes
function renderLeyenda(conteoPorCategoria, totalPersonas) {
  chartLegend.innerHTML = "";

  for (const [key, cant] of Object.entries(conteoPorCategoria)) {
    const config = CATEGORY_CONFIG[key];
    const pct =
      totalPersonas > 0 ? Math.round((cant / totalPersonas) * 100) : 0;

    const item = document.createElement("div");
    item.className = "legend-item";
    item.innerHTML = `
      <div class="legend-left">
        <span class="legend-color" style="background-color: ${config.color}"></span>
        <span class="legend-name">${config.nombre}</span>
      </div>
      <div class="legend-right">
        <span class="legend-count">${cant}</span>
        <span class="legend-pct">(${pct}%)</span>
      </div>
    `;

    chartLegend.appendChild(item);
  }
}

// Estado limpio cuando no hay registros aún
function renderEstadoVacio() {
  kpiTopCategory.textContent = "-";
  kpiTopCategorySub.textContent = "Esperando primeros registros";
  kpiPeakHour.textContent = "-";
  kpiPeakHourSub.textContent = "Sin datos de ingresos";
  kpiTotalPeople.textContent = "0";
  kpiTotalGroups.textContent = "0 grupos registrados";
  donutTotal.textContent = "0";

  pieChartSvg.innerHTML = `
    <circle cx="80" cy="80" r="58" fill="transparent" stroke="#e2e8f0" stroke-width="18" />
  `;

  chartLegend.innerHTML = `
    <div style="font-size: 13px; color: #65758b; text-align: center; padding: 12px 0;">
      Aún no hay registros cargados hoy.
    </div>
  `;
}
