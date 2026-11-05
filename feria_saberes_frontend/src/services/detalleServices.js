import { apiFetch } from "./api/api.client.js";

export const DetalleServices = {
  async getProyecto(proyectoId) {
    const response = await apiFetch(
      `/proyectos/${encodeURIComponent(proyectoId)}`,
    );
    const data = await response.json().catch(() => ({}));
    if (!response.ok) {
      throw new Error(
        data.message || "No se pudieron cargar los datos del proyecto.",
      );
    }
    return data;
  },

  async getResenas(proyectoId) {
    const response = await apiFetch(
      `/proyectos/resenas/${encodeURIComponent(proyectoId)}`,
    );
    const data = await response.json().catch(() => ({}));
    if (!response.ok) {
      throw new Error(data.message || "No se pudieron cargar las reseñas.");
    }
    return data;
  },

  async crearResena(resena) {
    const response = await apiFetch("/proyectos/resenas", {
      method: "POST",
      body: JSON.stringify(resena),
    });
    const data = await response.json().catch(() => ({}));
    if (!response.ok) {
      throw new Error(data.message || "No se pudo enviar la reseña.");
    }
    return data;
  },

  async votar(proyectoId, puntuacion) {
    const response = await apiFetch("/proyectos", {
      method: "PUT",
      body: JSON.stringify({ proyectoId, puntuacion }),
    });
    const data = await response.json().catch(() => ({}));
    if (!response.ok) {
      throw new Error(data.message || "No se pudo registrar el voto.");
    }
    return data;
  },
};
