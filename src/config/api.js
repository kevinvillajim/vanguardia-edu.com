// src/config/api.js
import axios from "axios";
import {APP_CONFIG} from "../utils/constants";

// Crear instancia de axios con configuración base
const api = axios.create({
	baseURL:
		APP_CONFIG.API_BASE_URL || "https://api.capacitacion-cooprogreso.com/api",
	timeout: 10000,
	headers: {
		"Content-Type": "application/json",
	},
});

// Variable para trackear si ya estamos redirigiendo
let isRedirecting = false;

// Interceptor de request - agregar token automáticamente
api.interceptors.request.use(
	(config) => {
		const token = localStorage.getItem(APP_CONFIG.STORAGE_KEYS.TOKEN);

		if (token) {
			// Verificar que el token no esté expirado antes de enviarlo
			try {
				const payload = JSON.parse(atob(token.split(".")[1]));
				const currentTime = Math.floor(Date.now() / 1000);

				if (payload.exp && payload.exp > currentTime) {
					config.headers.Authorization = `Bearer ${token}`;
				} else {
					// Token expirado, removerlo
					console.warn("Token expired, removing from storage");
					localStorage.removeItem(APP_CONFIG.STORAGE_KEYS.TOKEN);
					localStorage.removeItem(APP_CONFIG.STORAGE_KEYS.USER);
				}
			} catch (error) {
				// Token malformado, removerlo
				console.error("Malformed token, removing from storage:", error);
				localStorage.removeItem(APP_CONFIG.STORAGE_KEYS.TOKEN);
				localStorage.removeItem(APP_CONFIG.STORAGE_KEYS.USER);
			}
		}

		return config;
	},
	(error) => {
		console.error("Request interceptor error:", error);
		return Promise.reject(error);
	}
);

// Interceptor de response - manejar errores de autenticación
api.interceptors.response.use(
	(response) => {
		// Reset redirect flag on successful response
		isRedirecting = false;
		return response;
	},
	(error) => {
		const {response} = error;

		if (response) {
			const {status, data} = response;

			switch (status) {
				case 401:
					// Token inválido o expirado
					if (!isRedirecting) {
						isRedirecting = true;
						handleAuthError("Session expired. Please login again.");
					}
					break;

				case 403:
					// Acceso prohibido - rol insuficiente
					console.error("Access forbidden - insufficient permissions");
					break;

				case 422:
					// Error de validación
					console.error("Validation error:", data.message || data.errors);
					break;

				case 429:
					// Rate limiting
					console.error("Too many requests, please try again later");
					break;

				case 500:
					// Error interno del servidor
					console.error("Internal server error");
					break;

				case 503:
					// Servicio no disponible
					console.error("Service unavailable");
					break;

				default:
					console.error(
						`HTTP Error ${status}:`,
						data?.message || error.message
					);
			}
		} else if (error.request) {
			// Network error
			console.error("Network error - no response received:", error.request);
		} else {
			// Request setup error
			console.error("Request setup error:", error.message);
		}

		return Promise.reject(error);
	}
);

// Función para manejar errores de autenticación
function handleAuthError(message = "Authentication error") {
	console.warn(message);

	// Limpiar almacenamiento local
	localStorage.removeItem(APP_CONFIG.STORAGE_KEYS.TOKEN);
	localStorage.removeItem(APP_CONFIG.STORAGE_KEYS.USER);

	// Limpiar datos de cursos
	Object.keys(localStorage).forEach((key) => {
		if (key.startsWith("Course")) {
			localStorage.removeItem(key);
		}
	});

	// Redirigir al login solo si no estamos ya ahí
	if (
		window.location.pathname !== "/login" &&
		window.location.pathname !== "/home"
	) {
		// Pequeño delay para evitar loops
		setTimeout(() => {
			window.location.href = "/login";
			isRedirecting = false;
		}, 100);
	} else {
		isRedirecting = false;
	}
}

// Función helper para verificar conectividad
export const checkConnectivity = async () => {
	try {
		const response = await api.get("/health");
		return response.status === 200;
	} catch (error) {
		console.error("Connectivity check failed:", error);
		return false;
	}
};

// Función helper para retry de requests
export const retryRequest = async (requestFn, maxRetries = 3, delay = 1000) => {
	for (let i = 0; i <= maxRetries; i++) {
		try {
			return await requestFn();
		} catch (error) {
			if (i === maxRetries) throw error;

			// No hacer retry en errores de autenticación
			if (error.response?.status === 401 || error.response?.status === 403) {
				throw error;
			}

			console.warn(
				`Request failed, retrying in ${delay}ms... (${i + 1}/${maxRetries})`
			);
			await new Promise((resolve) => setTimeout(resolve, delay));
			delay *= 2; // Exponential backoff
		}
	}
};

export default api;
