import { apiFetch } from "./api/api.client";

export class AuthServices {
  static async Login(objetoPlano) {
    const res = await apiFetch("/auth/login", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(objetoPlano),
      // CRÍTICO: Para que Fastify te guarde la cookie HttpOnly del refresh token
      credentials: "include",
    });

    const resultado = await res.json();

    //  Si el backend tiró un error (401, 400, etc.), lanzamos una excepción con el mensaje del servidor
    if (!res.ok) {
      throw new Error(resultado.message || "Error al iniciar sesión");
    }

    //  Si todo salió bien, le retornamos el json al controlador del formulario
    return resultado;
  }
  static async Registrer(nuevoUsuario) {
    const response = await apiFetch("/auth/registrer", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(nuevoUsuario),
    });
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      // Lanzamos un error que contenga la estructura exacta que manda NestJS
      throw {
        response: {
          data: errorData,
        },
      };
    }
    return response.json();
  }
  static async logoutGlobal() {
    localStorage.setItem("token", null);
    localStorage.setItem("user", null);

    try {
      await apiFetch(`/auth/logout`, {
        method: "POST",
        credentials: "include",
      });
    } catch (error) {
      console.error("No se pudo cerrar la sesión:", error);
    } finally {
      window.location.href = "/src/pages/landing/index.html";
    }
  }
}
