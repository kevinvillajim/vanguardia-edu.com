// src/services/api/client.js
import axios from "axios";
import {APP_CONFIG} from "../../utils/constants";

// Crear instancia de axios
const apiClient = axios.create({
	baseURL: APP_CONFIG.API_BASE_URL,
	timeout: 10000,
	headers: {
		"Content-Type": "application/json",
	},
});

// Interceptor de request para agregar token
apiClient.interceptors.request.use(
	(config) => {
		const token = localStorage.getItem(APP_CONFIG.STORAGE_KEYS.TOKEN);
		if (token) {
			config.headers.Authorization = `Bearer ${token}`;
		}
		return config;
	},
	(error) => {
		return Promise.reject(error);
	}
);

// Interceptor de response para manejar errores globales
apiClient.interceptors.response.use(
	(response) => {
		return response;
	},
	(error) => {
		// Si el token ha expirado o es inválido
		if (error.response?.status === 401) {
			// Limpiar almacenamiento local
			localStorage.removeItem(APP_CONFIG.STORAGE_KEYS.TOKEN);
			localStorage.removeItem(APP_CONFIG.STORAGE_KEYS.USER);

			// Redirigir al login si no estamos ya ahí
			if (window.location.pathname !== "/login") {
				window.location.href = "/login";
			}
		}

		return Promise.reject(error);
	}
);

export default apiClient;
