import { apiFetch } from "./api/api.client.js";

export const ProyectosServices = {
  async getProyectos() {
    const response = await apiFetch("/proyectos");
    if (!response.ok) throw new Error("No se pudieron cargar los proyectos.");
    return response.json();
  },

  async getDivisiones() {
    const response = await apiFetch("/division");
    if (!response.ok) {
      throw new Error("No se pudieron cargar los cursos y divisiones.");
    }
    return response.json();
  },

  async getMisProyectos() {
    const response = await apiFetch("/proyectos/mis-proyectos");
    const data = await response.json().catch(() => ({}));
    if (!response.ok) {
      throw new Error(data.message || "No se pudieron cargar tus proyectos.");
    }
    return data;
  },

  async subirImagen(file) {
    const formData = new FormData();
    formData.append("imagen", file);
    const response = await apiFetch("/proyectos/imagenes", {
      method: "POST",
      body: formData,
    });
    const data = await response.json().catch(() => ({}));
    if (!response.ok) {
      throw new Error(data.message || `No se pudo subir ${file.name}.`);
    }
    return data;
  },

  async crearProyecto(proyecto) {
    const response = await apiFetch("/proyectos", {
      method: "POST",
      body: JSON.stringify(proyecto),
    });

    if (!response.ok) {
      const error = await response.json().catch(() => null);
      if (response.status === 401) {
        throw new Error(
          "Tu sesión venció. Iniciá sesión para enviar el proyecto.",
        );
      }
      throw new Error(
        error?.message || "No se pudo enviar el proyecto. Intentá nuevamente.",
      );
    }

    return response.json();
  },

  async actualizarProyecto(proyectoId, proyecto) {
    const response = await apiFetch(`/proyectos/${encodeURIComponent(proyectoId)}`, {
      method: "PATCH",
      body: JSON.stringify(proyecto),
    });
    const data = await response.json().catch(() => ({}));
    if (!response.ok) {
      throw new Error(
        data.message || "No se pudo actualizar el proyecto.",
      );
    }
    return data;
  },

  async votar(proyectoId, puntuacion) {
    const response = await apiFetch(`/proyectos`, {
      method: "PUT",
      body: JSON.stringify({ proyectoId, puntuacion }),
    });
    const data = await response.json().catch(() => ({}));
    if (!response.ok)
      throw new Error(data.message || "No se pudo registrar el voto.");
    return data;
  },
};
