// src/hooks/useApi.js
import {useState, useCallback, useRef} from "react";
import {useAuth} from "./useAuth";
import {apiService} from "../services/api/apiService";
import {ERROR_MESSAGES, APP_CONFIG} from "../utils/constants";

/**
 * Hook personalizado para manejo de llamadas API
 * Proporciona estados de loading, error y métodos optimizados
 */
export function useApi() {
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState(null);
	const {logout, isAuthenticated} = useAuth();
	const abortControllerRef = useRef(null);

	/**
	 * Ejecutar request con manejo robusto de estados
	 * @param {Function} requestFn - Función que ejecuta el request
	 * @param {Object} options - Opciones de configuración
	 * @returns {Promise<Object>} Resultado del request
	 */
	const handleRequest = useCallback(
		async (requestFn, options = {}) => {
			const {
				showLoading = true,
				onSuccess,
				onError,
				retryOnFailure = false,
				maxRetries = APP_CONFIG.MAX_RETRIES,
			} = options;

			// Cancelar request anterior si existe
			if (abortControllerRef.current) {
				abortControllerRef.current.abort();
			}

			// Crear nuevo AbortController
			abortControllerRef.current = new AbortController();

			try {
				if (showLoading) setLoading(true);
				setError(null);

				let result;
				let retryCount = 0;

				do {
					try {
						result = await requestFn(abortControllerRef.current.signal);
						break; // Éxito, salir del loop
					} catch (err) {
						if (err.name === "AbortError") {
							console.log("Request was aborted");
							return {success: false, aborted: true};
						}

						// Decidir si reintentar
						if (
							retryOnFailure &&
							retryCount < maxRetries &&
							isRetryableError(err)
						) {
							retryCount++;
							console.warn(
								`Request failed, retrying... (${retryCount}/${maxRetries})`
							);
							await sleep(APP_CONFIG.RETRY_DELAY * retryCount);
							continue;
						}

						throw err; // No reintentar, lanzar error
					}
				} while (retryCount <= maxRetries);

				// Ejecutar callback de éxito
				if (onSuccess && result) {
					onSuccess(result);
				}

				return {
					success: true,
					data: result,
					retryCount,
				};
			} catch (err) {
				const errorInfo = handleApiError(err);
				setError(errorInfo);

				// Si es error 401 y estamos autenticados, hacer logout
				if (err.response?.status === 401 && isAuthenticated) {
					console.warn("Unauthorized error, logging out");
					logout();
				}

				// Ejecutar callback de error
				if (onError) {
					onError(errorInfo);
				}

				return {
					success: false,
					error: errorInfo,
					retryCount,
				};
			} finally {
				if (showLoading) setLoading(false);
				abortControllerRef.current = null;
			}
		},
		[logout, isAuthenticated]
	);

	/**
	 * Métodos especializados para diferentes tipos de API calls
	 */
	const authRequest = useCallback(
		(requestFn, options = {}) => {
			return handleRequest(
				async (signal) => await requestFn(apiService.auth, signal),
				{...options, retryOnFailure: false}
			);
		},
		[handleRequest]
	);

	const userRequest = useCallback(
		(requestFn, options = {}) => {
			return handleRequest(
				async (signal) => await requestFn(apiService.users, signal),
				options
			);
		},
		[handleRequest]
	);

	const progressRequest = useCallback(
		(requestFn, options = {}) => {
			return handleRequest(
				async (signal) => await requestFn(apiService.progress, signal),
				options
			);
		},
		[handleRequest]
	);

	const expDateRequest = useCallback(
		(requestFn, options = {}) => {
			return handleRequest(
				async (signal) => await requestFn(apiService.expDates, signal),
				options
			);
		},
		[handleRequest]
	);

	/**
	 * Método para requests con paginación
	 * @param {Function} requestFn - Función del request
	 * @param {Object} paginationParams - Parámetros de paginación
	 * @param {Object} options - Opciones adicionales
	 * @returns {Promise<Object>} Resultado paginado
	 */
	const paginatedRequest = useCallback(
		async (requestFn, paginationParams = {}, options = {}) => {
			const {page = 1, limit = 10, ...otherParams} = paginationParams;

			return handleRequest(async (signal) => {
				const params = {page, limit, ...otherParams};
				return await requestFn(params, signal);
			}, options);
		},
		[handleRequest]
	);

	/**
	 * Método para uploads de archivos
	 * @param {Function} requestFn - Función del request
	 * @param {FormData} formData - Datos del formulario
	 * @param {Object} options - Opciones adicionales
	 * @returns {Promise<Object>} Resultado del upload
	 */
	const uploadRequest = useCallback(
		async (requestFn, formData, options = {}) => {
			return handleRequest(
				async (signal) => await requestFn(formData, signal),
				{
					...options,
					retryOnFailure: false, // No reintentar uploads
				}
			);
		},
		[handleRequest]
	);

	/**
	 * Método para cancelar requests en progreso
	 */
	const cancelRequest = useCallback(() => {
		if (abortControllerRef.current) {
			abortControllerRef.current.abort();
			abortControllerRef.current = null;
			setLoading(false);
		}
	}, []);

	/**
	 * Limpiar estado de error
	 */
	const clearError = useCallback(() => {
		setError(null);
	}, []);

	/**
	 * Verificar si hay un request en progreso
	 */
	const isRequestInProgress = useCallback(() => {
		return loading && abortControllerRef.current !== null;
	}, [loading]);

	return {
		// Estados
		loading,
		error,
		isRequestInProgress: isRequestInProgress(),

		// Métodos principales
		handleRequest,
		authRequest,
		userRequest,
		progressRequest,
		expDateRequest,
		paginatedRequest,
		uploadRequest,

		// Utilidades
		cancelRequest,
		clearError,

		// Acceso directo al servicio API (para casos avanzados)
		apiService,
	};
}

// ============================================================================
// HELPER FUNCTIONS PRIVADAS
// ============================================================================

/**
 * Determinar si un error es reintentable
 * @param {Error} error - Error a evaluar
 * @returns {boolean} Si se puede reintentar
 */
function isRetryableError(error) {
	// No reintentar errores de autenticación o validación
	if (error.response) {
		const status = error.response.status;
		return ![400, 401, 403, 404, 422].includes(status);
	}

	// Reintentar errores de red
	return !error.response;
}

/**
 * Procesar errores de API de manera consistente
 * @param {Error} error - Error de la API
 * @returns {Object} Información del error procesada
 */
function handleApiError(error) {
	let errorInfo = {
		message: ERROR_MESSAGES.UNKNOWN_ERROR,
		type: "UNKNOWN_ERROR",
		status: null,
		details: null,
	};

	if (error.response) {
		// Error de respuesta HTTP
		const {status, data} = error.response;
		errorInfo.status = status;

		switch (status) {
			case 400:
				errorInfo.type = "VALIDATION_ERROR";
				errorInfo.message = data?.message || ERROR_MESSAGES.VALIDATION_ERROR;
				errorInfo.details = data?.errors || data?.details;
				break;
			case 401:
				errorInfo.type = "UNAUTHORIZED";
				errorInfo.message = ERROR_MESSAGES.UNAUTHORIZED;
				break;
			case 403:
				errorInfo.type = "FORBIDDEN";
				errorInfo.message = ERROR_MESSAGES.FORBIDDEN;
				break;
			case 404:
				errorInfo.type = "NOT_FOUND";
				errorInfo.message = data?.message || "Recurso no encontrado";
				break;
			case 422:
				errorInfo.type = "VALIDATION_ERROR";
				errorInfo.message = data?.message || ERROR_MESSAGES.VALIDATION_ERROR;
				errorInfo.details = data?.errors;
				break;
			case 429:
				errorInfo.type = "RATE_LIMIT";
				errorInfo.message =
					"Demasiadas solicitudes. Intenta nuevamente más tarde.";
				break;
			case 500:
				errorInfo.type = "SERVER_ERROR";
				errorInfo.message = ERROR_MESSAGES.SERVER_ERROR;
				break;
			default:
				errorInfo.message = data?.message || `Error HTTP ${status}`;
		}
	} else if (error.request) {
		// Error de red
		errorInfo.type = "NETWORK_ERROR";
		errorInfo.message = ERROR_MESSAGES.NETWORK_ERROR;
	} else if (error.name === "AbortError") {
		// Request cancelado
		errorInfo.type = "ABORTED";
		errorInfo.message = "Solicitud cancelada";
	} else {
		// Otro tipo de error
		errorInfo.message = error.message || ERROR_MESSAGES.UNKNOWN_ERROR;
	}

	return errorInfo;
}

/**
 * Helper para delays
 * @param {number} ms - Milisegundos a esperar
 * @returns {Promise} Promise que resuelve después del delay
 */
function sleep(ms) {
	return new Promise((resolve) => setTimeout(resolve, ms));
}
