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
    window.location.href = "/auth/login.html"; // Redirige a la página de login
    return null;
  }

  // TODO: Add actual token validation (e.g., check expiration, verify signature with backend call)
  // For now, we'll assume any existing token is valid until a backend call proves otherwise.
  // A more robust solution would involve a backend endpoint to validate the token.

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
    window.location.href = "/auth/login.html"; // Redirige a la página de login
    return Promise.reject("Unauthorized: Token invalid or expired.");
  }

  return response;
}
