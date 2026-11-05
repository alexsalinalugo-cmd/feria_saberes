import { DefinirNav } from "../../components/navbar.js";
import { ProyectosServices } from "../../services/proyectosServices.js";
import { getImageSource } from "../../utils/image-source.js";

const navbar = document.getElementById("navbar-placeholder");
if (navbar) navbar.innerHTML = DefinirNav();

const user = getSessionUser();
if (!user || user.rol !== "usuario") {
  window.location.replace(
    user?.rol === "admin"
      ? "/src/pages/admin/admin.html"
      : "/src/pages/auth/auth.html",
  );
} else {
  initializePanel(user);
}

function getSessionUser() {
  const token = localStorage.getItem("token");
  const userValue = localStorage.getItem("user");
  if (!token || token === "null" || !userValue || userValue === "null") {
    return null;
  }
  try {
    return JSON.parse(userValue);
  } catch {
    return null;
  }
}

function initializePanel(user) {
  const form = document.getElementById("project-form");
  const divisionSelect = document.getElementById("project-division");
  const imageInput = document.getElementById("project-images");
  const imageSelection = document.getElementById("image-selection");
  const feedback = document.getElementById("form-feedback");
  const submitButton = document.getElementById("submit-project");
  const projectsContainer = document.getElementById("my-projects");
  const projectsStatus = document.getElementById("projects-status");
  let selectedImages = [];
  let retainedImages = [];
  let editingProject = null;
  const heading = document.getElementById("create-project-heading");

  document.getElementById("welcome-message").textContent =
    `Hola, ${user.nombre || "estudiante"}. Acá podés cargar y consultar tus proyectos.`;

  loadDivisions();
  loadProjects();
  document
    .getElementById("refresh-projects")
    .addEventListener("click", loadProjects);
  document
    .getElementById("cancel-edit-project")
    .addEventListener("click", cancelEdit);

  imageInput.addEventListener("change", () => {
    const newFiles = [...imageInput.files];
    imageInput.value = "";
    feedback.className = "form-feedback";

    const validFiles = newFiles.filter((file) => {
      if (!file.type.startsWith("image/")) {
        feedback.classList.add("is-error");
        feedback.textContent = `${file.name} no es un archivo de imagen.`;
        return false;
      }
      if (file.size > 10 * 1024 * 1024) {
        feedback.classList.add("is-error");
        feedback.textContent = `${file.name} supera el límite de 10 MB.`;
        return false;
      }
      return true;
    });

    const uniqueFiles = validFiles.filter(
      (file) =>
        !selectedImages.some((selected) => sameFile(selected, file)),
    );
    if (retainedImages.length + selectedImages.length + uniqueFiles.length > 10) {
      feedback.classList.add("is-error");
      feedback.textContent =
        "El proyecto puede tener hasta 10 imágenes. Quitá alguna para agregar más.";
      renderImageSelection();
      return;
    }
    selectedImages = [...selectedImages, ...uniqueFiles];
    renderImageSelection();
    if (!feedback.classList.contains("is-error")) {
      const imageCount = retainedImages.length + selectedImages.length;
      feedback.textContent = imageCount
        ? `${imageCount} de 10 imágenes seleccionadas.`
        : "No seleccionaste imágenes.";
    }
  });

  form.addEventListener("submit", async (event) => {
    event.preventDefault();
    feedback.className = "form-feedback";
    feedback.textContent = "";
    if (!form.reportValidity()) return;
    if (!divisionSelect.value) {
      feedback.classList.add("is-error");
      feedback.textContent = "Seleccioná una división para el proyecto.";
      return;
    }

    const exhibitorNames = form.elements.expositores.value
      .split(/\r?\n/)
      .map((name) => name.trim())
      .filter(Boolean);
    if (exhibitorNames.some((name) => name.length > 150)) {
      feedback.classList.add("is-error");
      feedback.textContent =
        "Cada nombre de expositor debe tener como máximo 150 caracteres.";
      return;
    }

    submitButton.disabled = true;
    const files = [...selectedImages];
    try {
      const newImages = [];
      for (const [index, file] of files.entries()) {
        feedback.textContent = `Subiendo imagen ${index + 1} de ${files.length}...`;
        const uploaded = await ProyectosServices.subirImagen(file);
        if (typeof uploaded.url !== "string" || !uploaded.url) {
          throw new Error(`El servidor no devolvió la URL de ${file.name}.`);
        }
        newImages.push({
          url_imagen: uploaded.url,
        });
      }

      const images = [...retainedImages, ...newImages].map((image, index) => ({
        ...image,
        es_principal: index === 0,
      }));
      const projectData = {
        titulo: form.elements.titulo.value.trim(),
        descripcion: form.elements.descripcion.value.trim(),
        division_id: Number(divisionSelect.value),
        imagenes: images,
        expositores: exhibitorNames,
      };

      feedback.textContent = editingProject
        ? "Guardando cambios..."
        : "Guardando proyecto...";
      if (editingProject) {
        await ProyectosServices.actualizarProyecto(
          editingProject.id,
          projectData,
        );
      } else {
        await ProyectosServices.crearProyecto(projectData);
      }

      const wasEditing = Boolean(editingProject);
      form.reset();
      selectedImages = [];
      retainedImages = [];
      editingProject = null;
      renderImageSelection();
      updateFormMode();
      feedback.classList.add("is-success");
      feedback.textContent = wasEditing
        ? "Proyecto actualizado correctamente."
        : "Proyecto publicado correctamente.";
      await loadProjects();
    } catch (error) {
      feedback.classList.add("is-error");
      feedback.textContent = error.message;
    } finally {
      submitButton.disabled = false;
    }
  });

  function renderImageSelection() {
    imageSelection.replaceChildren();
    if (selectedImages.length + retainedImages.length === 0) {
      imageSelection.append(
        makeTextElement("li", "image-selection-empty", "No seleccionaste imágenes."),
      );
      return;
    }

    for (const [index, image] of retainedImages.entries()) {
      const item = document.createElement("li");
      item.className = "image-selection-item";
      const name = makeTextElement(
        "span",
        "image-selection-name",
        `Imagen existente ${index + 1}${index === 0 ? " · portada" : ""}`,
      );
      const removeButton = document.createElement("button");
      removeButton.type = "button";
      removeButton.className = "image-remove";
      removeButton.textContent = "Quitar";
      removeButton.setAttribute(
        "aria-label",
        `Quitar imagen existente ${index + 1}`,
      );
      removeButton.addEventListener("click", () => {
        retainedImages = retainedImages.filter(
          (_, imageIndex) => imageIndex !== index,
        );
        renderImageSelection();
        feedback.className = "form-feedback";
        feedback.textContent = retainedImages.length + selectedImages.length
          ? `${retainedImages.length + selectedImages.length} de 10 imágenes seleccionadas.`
          : "No seleccionaste imágenes.";
      });
      item.append(name, removeButton);
      imageSelection.append(item);
    }

    for (const [index, file] of selectedImages.entries()) {
      const imageIndex = retainedImages.length + index;
      const item = document.createElement("li");
      item.className = "image-selection-item";
      const name = makeTextElement(
        "span",
        "image-selection-name",
        `${file.name}${imageIndex === 0 ? " · portada" : ""}`,
      );
      const removeButton = document.createElement("button");
      removeButton.type = "button";
      removeButton.className = "image-remove";
      removeButton.textContent = "Quitar";
      removeButton.setAttribute("aria-label", `Quitar imagen ${file.name}`);
      removeButton.addEventListener("click", () => {
        selectedImages = selectedImages.filter(
          (_, fileIndex) => fileIndex !== index,
        );
        renderImageSelection();
        feedback.className = "form-feedback";
        feedback.textContent = retainedImages.length + selectedImages.length
          ? `${retainedImages.length + selectedImages.length} de 10 imágenes seleccionadas.`
          : "No seleccionaste imágenes.";
      });
      item.append(name, removeButton);
      imageSelection.append(item);
    }
  }

  function beginEdit(project) {
    editingProject = project;
    retainedImages = (project.imagenes_proyectos || []).map((image) => ({
      id: image.id,
      url_imagen: image.url_imagen,
    }));
    selectedImages = [];
    form.elements.titulo.value = project.titulo || "";
    form.elements.descripcion.value = project.descripcion || "";
    divisionSelect.value = String(project.division_id);
    form.elements.expositores.value = (project.expositores || [])
      .map((exhibitor) => exhibitor.nombre_completo)
      .join("\n");
    renderImageSelection();
    feedback.className = "form-feedback";
    feedback.textContent =
      "Editá los datos y quitá o agregá imágenes antes de guardar.";
    updateFormMode();
    form.scrollIntoView({ behavior: "smooth", block: "start" });
    form.elements.titulo.focus();
  }

  function cancelEdit() {
    form.reset();
    editingProject = null;
    retainedImages = [];
    selectedImages = [];
    renderImageSelection();
    feedback.className = "form-feedback";
    feedback.textContent = "";
    updateFormMode();
  }

  function updateFormMode() {
    heading.textContent = editingProject
      ? `Editar proyecto: ${editingProject.titulo}`
      : "Agregar proyecto";
    submitButton.textContent = editingProject
      ? "Guardar cambios"
      : "Publicar proyecto";
    document.getElementById("cancel-edit-project").hidden = !editingProject;
  }

  async function loadDivisions() {
    divisionSelect.disabled = true;
    try {
      const divisions = await ProyectosServices.getDivisiones();
      if (!Array.isArray(divisions)) {
        throw new Error("La respuesta de divisiones no tiene un formato válido.");
      }
      divisionSelect.replaceChildren(
        new Option("Seleccioná una división", ""),
      );
      for (const division of divisions) {
        const label = [
          division.anio,
          division.ciclo,
          division.division,
          division.orientacion,
        ]
          .filter(Boolean)
          .join(" · ");
        divisionSelect.add(new Option(label, String(division.id)));
      }
      if (divisions.length === 0) {
        divisionSelect.replaceChildren(
          new Option("No hay divisiones disponibles", ""),
        );
        feedback.classList.add("is-error");
        feedback.textContent =
          "Todavía no hay divisiones cargadas. Contactá a la administración.";
      }
    } catch (error) {
      divisionSelect.replaceChildren(new Option("No se pudieron cargar", ""));
      feedback.classList.add("is-error");
      feedback.textContent = error.message;
    } finally {
      divisionSelect.disabled = false;
    }
  }

  async function loadProjects() {
    projectsStatus.classList.remove("is-error");
    projectsStatus.textContent = "Cargando tus proyectos...";
    projectsContainer.replaceChildren();
    try {
      const projects = await ProyectosServices.getMisProyectos();
      if (!Array.isArray(projects)) {
        throw new Error("La respuesta de proyectos no tiene un formato válido.");
      }
      if (projects.length === 0) {
        projectsStatus.textContent =
          "Todavía no agregaste proyectos. Completá el formulario para publicar el primero.";
        return;
      }
      projectsStatus.textContent = `${projects.length} ${
        projects.length === 1 ? "proyecto publicado" : "proyectos publicados"
      }.`;
      projectsContainer.replaceChildren(
        ...projects.map((project) => createProjectCard(project, beginEdit)),
      );
    } catch (error) {
      projectsStatus.classList.add("is-error");
      projectsStatus.textContent = error.message;
    }
  }
}

function createProjectCard(project, onEdit) {
  const card = document.createElement("article");
  card.className = "user-project-card";
  const mainImage =
    project.imagenes_proyectos?.find((image) => image.es_principal) ||
    project.imagenes_proyectos?.[0];
  if (mainImage) {
    const image = document.createElement("img");
    image.className = "user-project-image";
    image.src = getImageSource(mainImage.url_imagen);
    image.alt = `Imagen de ${project.titulo}`;
    image.loading = "lazy";
    card.append(image);
  }

  const details = document.createElement("div");
  details.className = "user-project-details";
  const division = [
    project.division?.anio,
    project.division?.ciclo,
    project.division?.division,
    project.division?.orientacion,
  ]
    .filter(Boolean)
    .join(" · ");
  details.append(
    makeTextElement("p", "user-project-division", division || "Sin división"),
    makeTextElement("h3", "user-project-title", project.titulo),
    makeTextElement(
      "p",
      "user-project-description",
      project.descripcion || "Sin descripción.",
    ),
  );
  if (project.expositores?.length) {
    details.append(
      makeTextElement(
        "p",
        "user-project-exhibitors",
        `Expositores: ${project.expositores
          .map((exhibitor) => exhibitor.nombre_completo)
          .join(", ")}`,
      ),
    );
  }
  const detailLink = document.createElement("a");
  detailLink.className = "user-project-link";
  detailLink.href = `/src/pages/detalle/detalle.html?id=${encodeURIComponent(project.id)}`;
  detailLink.textContent = "Ver proyecto";
  const editButton = document.createElement("button");
  editButton.type = "button";
  editButton.className = "user-project-edit";
  editButton.textContent = "Editar proyecto";
  editButton.addEventListener("click", () => onEdit(project));
  details.append(detailLink, editButton);
  card.append(details);
  return card;
}

function sameFile(first, second) {
  return (
    first.name === second.name &&
    first.size === second.size &&
    first.lastModified === second.lastModified
  );
}

function makeTextElement(tag, className, text) {
  const element = document.createElement(tag);
  if (className) element.className = className;
  element.textContent = text;
  return element;
}
