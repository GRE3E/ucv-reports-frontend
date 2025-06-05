// auth_utils.js

/**
 * Valida la existencia y validez del token JWT en localStorage.
 * Si el token no existe o es inválido, redirige al usuario a la página de login.
 * @returns {string|null} El token JWT si es válido, o null si no lo es.
 */
export function validateTokenAndRedirect() {
  const token = localStorage.getItem("access_token");

  if (!token) {
    console.log("No JWT token found, redirecting to login.");
    window.location.href = "/login"; // Redirige a la página de login
    return null;
  }

  try {
    const payloadBase64 = token.split(".")[1];
    const decodedPayload = JSON.parse(atob(payloadBase64));
    const expirationTime = decodedPayload.exp * 1000; // Convertir a milisegundos

    if (Date.now() >= expirationTime) {
      console.log("JWT token expired, redirecting to login.");
      localStorage.removeItem("access_token");
      window.location.href = "/login";
      return null;
    }
  } catch (error) {
    console.error("Error decoding or validating JWT token:", error);
    localStorage.removeItem("access_token"); // Remove invalid token
    window.location.href = "/login";
    return null;
  }

  return token;
}

/**
 * Añade el token JWT al header de autorización de una solicitud fetch.
 * @param {RequestInfo} url La URL de la solicitud.
 * @param {RequestInit} options Las opciones de la solicitud fetch.
 * @returns {Promise<Response>} La promesa de la respuesta fetch.
 */
export async function fetchWithAuth(url, options = {}) {
  const token = validateTokenAndRedirect();

  if (!token) {
    // If token is null, validateTokenAndRedirect already handled the redirection
    return Promise.reject("No authenticated token available.");
  }

  const headers = {
    ...options.headers,
    Authorization: `Bearer ${token}`,
  };

  const response = await fetch(url, { ...options, headers });

  if (response.status === 401) {
    console.log("Token invalid or expired, redirecting to login.");
    localStorage.removeItem("access_token"); // Clear invalid token
    window.location.href = "/login"; // Redirige a la página de login
    return Promise.reject("Unauthorized: Token invalid or expired.");
  }

  return response;
}
