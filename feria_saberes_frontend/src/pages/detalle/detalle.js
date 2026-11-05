import { DefinirNav } from "../../components/navbar.js";
import { DetalleServices } from "../../services/detalleServices.js";
import { getImageSource } from "../../utils/image-source.js";

const navbar = document.getElementById("navbar-placeholder");
if (navbar) navbar.innerHTML = DefinirNav();

const detailContent = document.getElementById("project-detail-content");
const params = new URLSearchParams(window.location.search);
const projectId =
  params.get("id") ||
  params.get("proyectoId") ||
  window.location.pathname.match(/\/(\d+)\/?$/)?.[1];

if (!projectId || !/^\d+$/.test(projectId) || Number(projectId) < 1) {
  showError("No se indicó un ID de proyecto válido.");
} else {
  loadProject(projectId);
}

async function loadProject(id) {
  try {
    const project = await DetalleServices.getProyecto(id);
    const { reviewList } = renderProject(project);

    try {
      const reviews = await DetalleServices.getResenas(id);
      renderReviews(reviews, reviewList);
    } catch (error) {
      reviewList.replaceChildren(
        makeTextElement("p", "reviews-empty is-error", error.message),
      );
    }
  } catch (error) {
    showError(error.message);
  } finally {
    detailContent.setAttribute("aria-busy", "false");
  }
}

function renderProject(project) {
  document.title = `${project.titulo} | Feria de Saberes`;
  const article = document.createElement("article");
  article.className = "project-detail";

  const images = project.imagenes_proyectos || [];
  const mainImage =
    images.find((image) => image.es_principal) || images[0];
  if (mainImage) {
    const hero = document.createElement("img");
    hero.className = "project-detail-image";
    hero.src = getImageSource(mainImage.url_imagen);
    hero.alt = `Foto del proyecto ${project.titulo}`;
    article.append(hero);
  }

  if (images.length > 1) {
    const gallery = document.createElement("div");
    gallery.className = "project-image-gallery";
    gallery.setAttribute("aria-label", "Otras imágenes del proyecto");
    for (const image of images.filter((item) => item.id !== mainImage?.id)) {
      const thumbnail = document.createElement("img");
      thumbnail.src = getImageSource(image.url_imagen);
      thumbnail.alt = `Otra foto del proyecto ${project.titulo}`;
      thumbnail.loading = "lazy";
      gallery.append(thumbnail);
    }
    article.append(gallery);
  }

  const body = document.createElement("div");
  body.className = "project-detail-body";
  const division = makeTextElement(
    "p",
    "project-division",
    [
      project.division?.anio,
      project.division?.division,
      project.division?.orientacion,
      project.division?.ciclo,
    ]
      .filter(Boolean)
      .join(" · "),
  );
  const title = makeTextElement("h1", "project-detail-title", project.titulo);
  const description = makeTextElement(
    "p",
    "project-detail-description",
    project.descripcion || "Este proyecto todavía no tiene una descripción.",
  );
  body.append(division, title, description);

  const exhibitors = project.expositores || [];
  if (exhibitors.length) {
    const exhibitorsSection = document.createElement("section");
    exhibitorsSection.className = "project-exhibitors";
    exhibitorsSection.append(
      makeTextElement("h2", "detail-section-title", "Expositores"),
      makeTextElement(
        "p",
        "project-detail-description",
        exhibitors.map((exhibitor) => exhibitor.nombre_completo).join(", "),
      ),
    );
    body.append(exhibitorsSection);
  }

  body.append(
    makeTextElement("h2", "detail-section-title", "Valoración de la comunidad"),
    createRatingWidget(project),
  );

  const reviewsSection = document.createElement("section");
  reviewsSection.className = "project-reviews";
  const reviewList = document.createElement("div");
  reviewList.className = "review-list";
  reviewList.setAttribute("aria-live", "polite");
  reviewsSection.append(
    makeTextElement("h2", "detail-section-title", "Reseñas"),
    reviewList,
    createReviewForm(project, reviewList),
  );
  body.append(reviewsSection);
  article.append(body);
  detailContent.replaceChildren(article);
  return { reviewList };
}

function createRatingWidget(project) {
  const rating = document.createElement("div");
  rating.className = "project-rating";

  const summary = document.createElement("div");
  summary.className = "rating-summary";
  const value = makeTextElement("span", "rating-value", "");
  const stars = document.createElement("div");
  stars.className = "rating-stars";
  stars.setAttribute("role", "group");
  stars.setAttribute("aria-label", `Votar ${project.titulo}`);

  const message = makeTextElement("span", "vote-message", "");
  const savedVoteKey = `feria-voto-${project.id}`;
  let savedVote = Number(localStorage.getItem(savedVoteKey)) || 0;
  value.textContent = project.valoracion
    ? `${project.valoracion} puntos acumulados`
    : "Sin votos todavía";
  message.textContent = savedVote
    ? "Tu voto quedó registrado en este dispositivo"
    : "Elegí una estrella para votar";

  for (let score = 1; score <= 5; score += 1) {
    const star = document.createElement("button");
    star.type = "button";
    star.className = "rating-star";
    star.setAttribute("aria-label", `Votar ${score} de 5 estrellas`);
    star.textContent = score <= savedVote ? "★" : "☆";
    star.disabled = Boolean(savedVote);
    star.setAttribute("aria-pressed", String(score === savedVote));
    star.addEventListener("click", async () => {
      for (const button of stars.querySelectorAll("button")) {
        button.disabled = true;
      }
      message.textContent = "Registrando tu voto...";
      try {
        const result = await DetalleServices.votar(project.id, score);
        project.valoracion = result.valoracion;
        savedVote = score;
        localStorage.setItem(savedVoteKey, String(score));
        value.textContent = `${project.valoracion} puntos acumulados`;
        message.textContent = "Tu voto quedó registrado";
        for (const [index, button] of [...stars.querySelectorAll("button")].entries()) {
          button.textContent = index < savedVote ? "★" : "☆";
          button.setAttribute("aria-pressed", String(index + 1 === savedVote));
        }
      } catch (error) {
        message.textContent = error.message;
        for (const button of stars.querySelectorAll("button")) {
          button.disabled = false;
        }
      }
    });
    stars.append(star);
  }

  summary.append(value, stars);
  rating.append(summary, message);
  return rating;
}

function createReviewForm(project, reviewList) {
  const form = document.createElement("form");
  form.className = "review-form";
  form.innerHTML = `
    <label for="review-name">Nombre para mostrar <span>(opcional)</span></label>
    <input id="review-name" name="nombre" maxlength="80" autocomplete="name" placeholder="Visitante" />
    <label for="review-comment">Tu reseña</label>
    <textarea id="review-comment" name="comentario" minlength="12" maxlength="2000" rows="4" required placeholder="¿Qué te llamó la atención? ¿Qué destacarías del proyecto?"></textarea>
    <div class="review-form-footer">
      <p class="review-feedback" role="status" aria-live="polite"></p>
      <button class="review-submit" type="submit">Publicar reseña</button>
    </div>
  `;
  const feedback = form.querySelector(".review-feedback");
  const submitButton = form.querySelector(".review-submit");
  form.addEventListener("submit", async (event) => {
    event.preventDefault();
    if (!form.reportValidity()) return;
    submitButton.disabled = true;
    feedback.textContent = "Publicando...";
    try {
      const review = await DetalleServices.crearResena({
        proyectoId: project.id,
        nombre: form.elements.nombre.value.trim() || undefined,
        comentario: form.elements.comentario.value.trim(),
      });
      reviewList.querySelector(".reviews-empty")?.remove();
      reviewList.prepend(createReviewItem(review));
      form.reset();
      feedback.textContent = "Gracias por compartir tu reseña.";
      form.classList.add("review-submitted");
    } catch (error) {
      feedback.textContent = error.message;
    } finally {
      submitButton.disabled = form.classList.contains("review-submitted");
    }
  });
  return form;
}

function renderReviews(reviews, reviewList) {
  if (!Array.isArray(reviews)) {
    throw new Error("La respuesta de reseñas no tiene un formato válido.");
  }
  if (reviews.length === 0) {
    reviewList.replaceChildren(
      makeTextElement(
        "p",
        "reviews-empty",
        "Todavía no hay reseñas. Sé la primera persona en compartir tu opinión.",
      ),
    );
    return;
  }
  reviewList.replaceChildren(...reviews.map(createReviewItem));
}

function createReviewItem(review) {
  const item = document.createElement("article");
  item.className = "review-item";
  const header = document.createElement("div");
  header.className = "review-item-header";
  header.append(
    makeTextElement("strong", "review-author", review.nombre || "Visitante"),
    makeTextElement(
      "time",
      "review-date",
      new Intl.DateTimeFormat("es", { dateStyle: "medium" }).format(
        new Date(review.created_at),
      ),
    ),
  );
  item.append(
    header,
    makeTextElement("p", "review-comment", review.comentario),
  );
  return item;
}

function showError(message) {
  detailContent.replaceChildren(makeTextElement("p", "detail-status is-error", message));
  detailContent.setAttribute("aria-busy", "false");
}

function makeTextElement(tag, className, text) {
  const element = document.createElement(tag);
  element.className = className;
  element.textContent = text;
  return element;
}
