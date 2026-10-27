//  El token se guarda acá, en memoria RAM, bien protegido de ataques XSS
let accessToken = "";

export const setAccessToken = () => {
  accessToken = token;
};

export const getAccessToken = () => accessToken;

//  Esta función reemplaza al 'fetch' nativo en todos tus servicios
//  option es la request entera si es get va {} vacio y si es post, etc see lleva body,method,headers con metadatos "Content-Type": "application/json"
export const apiFetch = async (url, options = {}) => {
  const BASE_URL = import.meta.env.VITE_API_URL; // cambia la url base según el entorno (desarrollo o producción)

  const headers = {
    ...options.headers,
  };

  // CORRECCIÓN ACÁ: Si hay body, NO es FormData y NO tiene Content-Type, le ponemos application/json
  // form data es igual archivos digamos y instanceof pregunta si fue creado por new form data
  if (
    options.body !== undefined &&
    !(options.body instanceof FormData) &&
    !headers["Content-Type"]
  ) {
    headers["Content-Type"] = "application/json";
  }
  options.headers = headers;

  // Si tenemos el token guardado en la memoria RAM, lo clavamos en el sobre lo ponemos en el header como ["Authorization"] = Bearer token
  if (accessToken) {
    headers["Authorization"] = `Bearer ${accessToken}`;
  }

  //  CRÍTICO: Obliga al navegador a mandar la cookie de Fastify en cada consulta
  options.credentials = "include";

  // Realizamos la petición original
  let response = await fetch(`${BASE_URL}${url}`, options);

  //  ¡EL INTERCEPTOR MÁGICO! Si el backend nos rebota con un 401 (Token expirado)
  if (response.status === 401 && url !== "/auth/login") {
    try {
      // Le pegamos al endpoint de refresh de NestJS en secreto
      const refreshRes = await fetch(`${BASE_URL}/auth/refresh`, {
        method: "POST",
        credentials: "include", // Manda la cookie del refresh
      });

      if (!refreshRes.ok) throw new Error("Sesión completamente expirada");

      const data = await refreshRes.json();

      // Guardamos el nuevo Access Token en la memoria RAM
      setAccessToken(data.accessToken);

      // Actualizamos el header y REINTENTAMOS la petición original que había fallado
      headers["Authorization"] = `Bearer ${data.accessToken}`;
      response = await fetch(`${BASE_URL}${url}`, options);
    } catch (error) {
      // Si el refresh de 7 días también falló, al lobby: limpiamos y al login
      setAccessToken("");
      window.location.href = "/login";
    }
  }

  return response;
};
