import { apiFetch } from "./api/api.client.js";

/**
 * Servicio para la gestión de ingresos (Check-In) en la Feria de Saberes
 */

/**
 * Registra un nuevo ingreso en la feria
 * @param {{ categoria: 'familiar' | 'alumno' | 'docente' | 'otro', integrantes: number, nombre?: string }} datos
 */
export async function registrarIngreso(datos) {
  const response = await apiFetch("/check-in", {
    method: "POST",
    body: JSON.stringify({
      categoria: datos.categoria,
      integrantes: Number(datos.integrantes),
      nombre: datos.nombre?.trim() || undefined,
    }),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => null);
    let mensaje = "Error al registrar el ingreso en el servidor.";
    if (errorData?.message) {
      mensaje = Array.isArray(errorData.message)
        ? errorData.message.join(", ")
        : errorData.message;
    }
    throw new Error(mensaje);
  }

  return await response.json();
}

/**
 * Obtiene las estadísticas generales de asistencia y conteo
 */
export async function obtenerEstadisticasCheckin() {
  const response = await apiFetch("/check-in/stats", {
    method: "GET",
  });

  if (!response.ok) {
    throw new Error("No se pudieron cargar las estadísticas.");
  }

  return await response.json();
}

/**
 * Obtiene los ingresos más recientes para el historial del operador
 */
export async function obtenerUltimosIngresos() {
  const response = await apiFetch("/check-in", {
    method: "GET",
  });

  if (!response.ok) {
    throw new Error("No se pudieron obtener los últimos ingresos.");
  }

  return await response.json();
}

