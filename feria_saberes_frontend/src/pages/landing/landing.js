import { DefinirNav } from "../../components/navbar.js";
import { ProyectosServices } from "../../services/proyectosServices.js";
import { getImageSource } from "../../utils/image-source.js";

const MostrarNavbar = document.getElementById("navbar-placeholder");
if (MostrarNavbar) MostrarNavbar.innerHTML = DefinirNav();

const projectList = document.getElementById("contenedor-proyectos");

try {
  const projects = await ProyectosServices.getProyectos();
  projectList.replaceChildren();

  if (projects.length === 0) {
    const emptyState = document.createElement("p");
    emptyState.className = "projects-empty";
    emptyState.textContent = "Todavía no hay proyectos cargados.";
    projectList.append(emptyState);
  }

  for (const [index, project] of projects.entries()) {
    projectList.append(createProjectCard(project, index));
  }
} catch (error) {
  const errorState = document.createElement("p");
  errorState.className = "projects-empty";
  errorState.textContent = error.message;
  projectList.replaceChildren(errorState);
}

function createProjectCard(project, index) {
  const card = document.createElement("article");
  card.className = "project-card";
  card.style.setProperty("--card-index", index);

  const openButton = document.createElement("button");
  openButton.type = "button";
  openButton.className = "project-open";
  openButton.setAttribute("aria-label", `Ver detalles de ${project.titulo}`);
  openButton.addEventListener("click", () => {
    const detailUrl = new URL(
      "/src/pages/detalle/detalle.html",
      window.location.origin,
    );
    detailUrl.searchParams.set("id", project.id);
    window.location.href = detailUrl.href;
  });

  const mainImage =
    project.imagenes_proyectos?.find((image) => image.es_principal) ||
    project.imagenes_proyectos?.[0];
  const thumbnail = document.createElement("div");
  thumbnail.className = "project-thumbnail";
  if (mainImage) {
    const image = document.createElement("img");
    image.className = "project-image";
    image.src = getImageSource(mainImage.url_imagen);
    image.alt = `Foto del proyecto ${project.titulo}`;
    image.loading = "lazy";
    thumbnail.append(image);
  } else {
    const placeholder = document.createElement("span");
    placeholder.className = "project-image-placeholder";
    placeholder.textContent = "Feria de Saberes";
    thumbnail.append(placeholder);
  }

  const content = document.createElement("div");
  content.className = "project-content";

  const division = document.createElement("p");
  division.className = "project-division";
  division.textContent = [
    project.division?.anio,
    project.division?.division,
    project.division?.orientacion,
  ]
    .filter(Boolean)
    .join(" · ");

  const title = document.createElement("h2");
  title.textContent = project.titulo;

  const description = document.createElement("p");
  description.className = "project-description";
  description.textContent =
    project.descripcion || "Sin descripción disponible.";

  const openLabel = document.createElement("span");
  openLabel.className = "project-open-label";
  openLabel.textContent = "Explorar proyecto";
  content.append(division, title, description, openLabel);
  openButton.append(thumbnail, content);
  card.append(openButton, createRatingWidget(project));
  return card;
}

function createRatingWidget(project) {
  const rating = document.createElement("div");
  rating.className = "project-rating";
  rating.dataset.projectId = project.id;
  rating.setAttribute(
    "aria-label",
    "Votar este proyecto de una a cinco estrellas",
  );

  const summary = document.createElement("div");
  summary.className = "rating-summary";
  const stars = document.createElement("div");
  stars.className = "rating-stars";
  stars.setAttribute("role", "group");
  stars.setAttribute("aria-label", `Votar ${project.titulo}`);

  for (let score = 1; score <= 5; score += 1) {
    const star = document.createElement("button");
    star.type = "button";
    star.className = "rating-star";
    star.setAttribute("aria-label", `Votar ${score} de 5 estrellas`);
    star.addEventListener("click", async () => {
      for (const button of stars.querySelectorAll("button"))
        button.disabled = true;
      try {
        const result = await ProyectosServices.votar(project.id, score);
        localStorage.setItem(`feria-voto-${project.id}`, String(score));
        project.valoracion = result.valoracion;
        refreshProjectRatings(project);
      } catch (error) {
        const voteMessage = rating.querySelector(".vote-message");
        voteMessage.textContent = error.message;
        if (error.message.includes("Ya votaste")) {
          localStorage.setItem(`feria-voto-${project.id}`, "1");
          updateRatingElement(project);
        } else {
          for (const button of stars.querySelectorAll("button"))
            button.disabled = false;
        }
      }
    });
    stars.append(star);
  }

  const summaryValue = document.createElement("span");
  summaryValue.className = "rating-value";
  const voteMessage = document.createElement("span");
  voteMessage.className = "vote-message";
  summary.append(summaryValue, stars);
  rating.append(summary, voteMessage);
  updateRatingElement(rating, project);
  return rating;
}

function updateRatingElement(
  rating,
  project,
  savedVote = Number(localStorage.getItem(`feria-voto-${project.id}`)) || 0,
) {
  const count = project.valoracion || 0;
  rating.querySelector(".rating-value").textContent = count
    ? `  ${count} puntos acumulados`
    : "Sin votos todavía";
  rating.querySelector(".vote-message").textContent = savedVote
    ? "Tu voto quedó registrado"
    : "Elegí una estrella para votar";
  for (const [index, star] of [
    ...rating.querySelectorAll(".rating-star"),
  ].entries()) {
    star.textContent = index < savedVote ? "★" : "☆";
    star.disabled = Boolean(savedVote);
    star.setAttribute("aria-pressed", String(index + 1 === savedVote));
  }
}

function refreshProjectRatings(project) {
  for (const rating of projectList.querySelectorAll(".project-rating")) {
    if (Number(rating.dataset.projectId) === project.id) {
      updateRatingElement(rating, project);
    }
  }
}
