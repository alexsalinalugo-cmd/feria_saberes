// El token se guarda acá, en memoria RAM, bien protegido de ataques XSS
let accessToken = localStorage.getItem("token");

export const setAccessToken = (token) => {
  //guardamos de paso en el local para que quede
  localStorage.setItem("token", token);
  accessToken = token;
};

export const getAccessToken = () => accessToken;

// Esta función reemplaza al 'fetch' nativo en todos tus servicios
export const apiFetch = async (url, options = {}) => {
  const envUrl =
    typeof import.meta !== "undefined" &&
    import.meta.env &&
    import.meta.env.development;
  const BASE_URL = (envUrl || "http://localhost:3000").replace(/\/$/, "");
  const endpoint = url.startsWith("/") ? url : `/${url}`;

  const headers = {
    ...options.headers,
  };

  // Si hay body, no es FormData y no tiene Content-Type, colocamos application/json
  if (
    options.body !== undefined &&
    !(options.body instanceof FormData) &&
    !headers["Content-Type"]
  ) {
    headers["Content-Type"] = "application/json";
  }
  options.headers = headers;

  // Si tenemos token en localstorage, lo incluimos en el header Authorization
  if (accessToken) {
    headers["Authorization"] = `Bearer ${accessToken}`;
  }

  // Permite el envío de cookies entre frontend y backend
  options.credentials = "include";

  let response = await fetch(`${BASE_URL}${endpoint}`, options);

  // Interceptor para refrescar token en caso de 401
  if (response.status === 401 && endpoint !== "/auth/login") {
    try {
      const refreshRes = await fetch(`${BASE_URL}/auth/refresh`, {
        method: "POST",
        credentials: "include",
      });

      if (!refreshRes.ok) throw new Error("Sesión completamente expirada");

      const data = await refreshRes.json();
      setAccessToken(data.accessToken);

      headers["Authorization"] = `Bearer ${data.accessToken}`;
      response = await fetch(`${BASE_URL}${endpoint}`, options);
    } catch {
      setAccessToken("");
      if (
        typeof window !== "undefined" &&
        window.location.pathname.includes(
          "/feria_saberes_frontend/src/pages/admin/admin.html",
        )
      ) {
        window.location.href =
          "/feria_saberes_frontend/src/pages/auth/auth.html";
      }
    }
  }

  return response;
};
