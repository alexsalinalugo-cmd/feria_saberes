import { apiFetch } from "./api/api.client";

export const AdminServices = {
  async getUsuarios() {
    const response = await apiFetch("/administracion/usuarios");
    const data = await response.json().catch(() => ({}));

    if (!response.ok) {
      throw new Error(data.message || "No se pudieron cargar los Usuarios.");
    }

    return data;
  },

  async crearUsuario(usuario) {
    const response = await apiFetch("/administracion/usuarios", {
      method: "POST",
      body: JSON.stringify(usuario),
    });

    const data = await response.json().catch(() => ({}));

    if (!response.ok) {
      throw new Error(data.message || "No se pudo crear el Usuario.");
    }

    return data;
  },

  async actualizarUsuario(id, usuario) {
    const response = await apiFetch(
      `/administracion/usuarios/${encodeURIComponent(id)}`,
      {
        method: "PATCH",
        body: JSON.stringify(usuario),
      },
    );

    const data = await response.json().catch(() => ({}));

    if (!response.ok) {
      throw new Error(data.message || "No se pudo actualizar el usuario.");
    }
    return data;
  },

  async getDivisiones() {
    const response = await apiFetch("/administracion/divisiones");
    const data = await response.json().catch(() => ({}));

    if (!response.ok) {
      throw new Error(data.message || "No se pudieron Cargar las Divisiones.");
    }

    return data;
  },

  async crearDivision(division) {
    const response = await apiFetch("/administracion/divisiones", {
      method: "POST",
      body: JSON.stringify(division),
    });

    const data = await response.json().catch(() => ({}));

    if (!response.ok) {
      throw new Error(data.message || "No se pudo Crear la Division.");
    }

    return data;
  },

  async actualizarDivision(id, division) {
    const response = await apiFetch(
      `/administracion/divisiones/${encodeURIComponent(id)}`,
      {
        method: "PATCH",
        body: JSON.stringify(division),
      },
    );

    const data = await response.json().catch(() => ({}));

    if (!response.ok) {
      throw new Error(data.message || "No se pudo actualizar la Division.");
    }

    return data;
  },
  async getProyectos() {
    const response = await apiFetch("/administracion/proyectos");
    const data = await response.json().catch(() => ({}));

    if (!response.ok) {
      throw new Error(data.message || "No se pudieron cargar los proyectos.");
    }

    return data;
  },

  async getTodosProyectos() {
    const response = await apiFetch("/administracion/proyectos/todos");
    const data = await response.json().catch(() => ({}));

    if (!response.ok) {
      throw new Error(
        data.message || "No se pudieron cargar todos los proyectos.",
      );
    }

    return data;
  },

  async getProyecto(id) {
    const response = await apiFetch(
      `/administracion/proyectos/${encodeURIComponent(id)}`,
    );
    const data = await response.json().catch(() => ({}));

    if (!response.ok) {
      throw new Error(data.message || "No se pudo cargar el proyecto.");
    }

    return data;
  },

  async actualizarProyecto(id, proyecto) {
    const response = await apiFetch(
      `/administracion/proyectos/${encodeURIComponent(id)}`,
      {
        method: "PATCH",
        body: JSON.stringify(proyecto),
      },
    );

    const data = await response.json().catch(() => ({}));

    if (!response.ok) {
      throw new Error(data.message || "No se pudo actualizar el proyecto.");
    }

    return data;
  },

  async darDeBajaProyecto(id, motivo) {
    const response = await apiFetch(
      `/administracion/proyectos/${encodeURIComponent(id)}/baja`,
      {
        method: "PATCH",
        body: JSON.stringify({ motivo }),
      },
    );

    const data = await response.json().catch(() => ({}));

    if (!response.ok) {
      throw new Error(data.message || "No se pudo dar de baja el proyecto.");
    }

    return data;
  },

  async reactivarProyecto(id) {
    const response = await apiFetch(
      `/administracion/proyectos/${encodeURIComponent(id)}/reactivar`,
      {
        method: "PATCH",
      },
    );

    const data = await response.json().catch(() => ({}));

    if (!response.ok) {
      throw new Error(data.message || "No se pudo reactivar el proyecto.");
    }

    return data;
  },
};
