import axios from "axios";

/**
 * Cliente HTTP unico para toda la aplicacion.
 * La URL base se define en el archivo .env del frontend (VITE_API_URL).
 */
const client = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "http://127.0.0.1:8000/api",
  headers: {
    "Content-Type": "application/json",
    Accept: "application/json",
  },
  timeout: 10000,
});

// Interceptor: normaliza los errores de la API para mostrarlos en pantalla.
client.interceptors.response.use(
  (respuesta) => respuesta,
  (error) => {
    const mensaje =
      error.response?.data?.message ||
      error.response?.data?.mensaje ||
      "No se pudo conectar con el servidor de BiblioTech.";
    return Promise.reject(new Error(mensaje));
  }
);

export default client;
