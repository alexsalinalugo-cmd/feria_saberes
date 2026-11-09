import { apiFetch } from "./api/api.client.js";

/**
 * Servicio para la consulta y consolidación de reportes generales
 * y métricas en vivo de la Feria de Saberes.
 */
export const ReportesServices = {
  /**
   * Obtiene el dashboard integral de reportes:
   * - Estadísticas de Check-in (asistentes, categoría top, horario pico, distribución)
   * - Métricas de Proyectos (totales, ranking más votados, orientaciones)
   * - Métricas de Comunidad (expositores, reseñas, usuarios)
   */
  async obtenerDashboard() {
    const response = await apiFetch("/reportes", {
      method: "GET",
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => null);
      const mensaje =
        errorData?.message || "No se pudieron obtener los reportes del sistema.";
      throw new Error(mensaje);
    }

    return await response.json();
  },
};

