// src/services/api/endpoints.js

/**
 * Definición centralizada de todos los endpoints de la API
 * Basado en las rutas definidas en routes/api.php del backend Laravel
 */

// Base URL para construcción de endpoints
const getBaseUrl = () =>
	import("../../utils/constants").then(
		(module) => module.APP_CONFIG.API_BASE_URL
	);

// Helper
const buildUrl = async (endpoint, params = {}) => {
	let url = endpoint;
	Object.keys(params).forEach((key) => {
		url = url.replace(`{${key}}`, params[key]);
	});
	const baseUrl = await getBaseUrl();
	return baseUrl + url;
};

// ============================================================================
// ENDPOINTS DE AUTENTICACIÓN
// ============================================================================
export const AUTH_ENDPOINTS = {
	// Rutas públicas
	LOGIN: "/auth/login",
	REGISTER: "/auth/register",

	// Rutas protegidas (requieren auth:api)
	ME: "/me",
	LOGOUT: "/logout",
	REFRESH: "/refresh",
	EDIT_PROFILE: "/edit-profile",
	CHANGE_PASSWORD: "/auth/change-password",
};

// ============================================================================
// ENDPOINTS DE PROGRESO
// ============================================================================
export const PROGRESS_ENDPOINTS = {
	// CRUD básico
	LIST: "/progress",
	CREATE: "/progress",
	SHOW: "/progress/{id}",
	UPDATE: "/progress/{id}",
	DELETE: "/progress/{id}/{course}",

	// Endpoints especializados
	UPSERT: "/progress/upsert",
	UPDATE_CERTIFICATE: "/progress/update-certificate",
	USER_PROGRESS: "/user-progress",

	// Helper methods
	show: (id) => buildUrl("/progress/{id}", {id}),
	delete: (userId, courseId) =>
		buildUrl("/progress/{id}/{course}", {
			id: userId,
			course: courseId,
		}),
};

// ============================================================================
// ENDPOINTS DE USUARIOS (Solo Admin)
// ============================================================================
export const USER_ENDPOINTS = {
	// CRUD de usuarios
	LIST: "/users",
	CREATE: "/users",
	UPDATE: "/users/{id}",
	DELETE: "/users/{id}",
	RESET_PASSWORD: "/users/{id}/reset-password",

	// Importación masiva
	IMPORT: "/import-users",

	// Helper methods
	update: (id) => buildUrl("/users/{id}", {id}),
	delete: (id) => buildUrl("/users/{id}", {id}),
	resetPassword: (id) => buildUrl("/users/{id}/reset-password", {id}),
};

// ============================================================================
// ENDPOINTS DE FECHAS DE EXPIRACIÓN
// ============================================================================
export const EXP_DATE_ENDPOINTS = {
	// CRUD básico
	LIST: "/expdates",
	CREATE: "/expdates",
	SHOW: "/expdates/{id}",
	UPDATE_BY_COURSE: "/expdates/curso/{id}",

	// Helper methods
	show: (id) => buildUrl("/expdates/{id}", {id}),
	updateByCourse: (courseId) =>
		buildUrl("/expdates/curso/{id}", {id: courseId}),
};

// ============================================================================
// ENDPOINTS CONSOLIDADOS (Para compatibilidad con código existente)
// ============================================================================
export const API_ENDPOINTS = {
	// Autenticación
	AUTH: AUTH_ENDPOINTS,

	// Usuarios
	USERS: USER_ENDPOINTS,

	// Progreso de cursos
	PROGRESS: PROGRESS_ENDPOINTS,

	// Fechas de expiración
	EXP_DATES: EXP_DATE_ENDPOINTS,
};

// ============================================================================
// MÉTODOS HELPER PARA USO COMÚN
// ============================================================================
export const EndpointHelpers = {
	/**
	 * Construye URL completa con base URL
	 * @param {string} endpoint - Endpoint relativo
	 * @returns {string} URL completa
	 */
	getFullUrl: (endpoint) => `${buildUrl}${endpoint}`,

	/**
	 * Construye endpoint con parámetros
	 * @param {string} endpoint - Template del endpoint
	 * @param {object} params - Parámetros a reemplazar
	 * @returns {string} Endpoint con parámetros reemplazados
	 */
	buildEndpoint: buildUrl,

	/**
	 * Valida si un endpoint requiere autenticación
	 * @param {string} endpoint - Endpoint a validar
	 * @returns {boolean} true si requiere auth
	 */
	requiresAuth: (endpoint) => {
		const publicEndpoints = [AUTH_ENDPOINTS.LOGIN, AUTH_ENDPOINTS.REGISTER];
		return !publicEndpoints.includes(endpoint);
	},

	/**
	 * Valida si un endpoint requiere rol de admin
	 * @param {string} endpoint - Endpoint a validar
	 * @returns {boolean} true si requiere admin
	 */
	requiresAdmin: (endpoint) => {
		const adminEndpoints = [...Object.values(USER_ENDPOINTS)];
		return adminEndpoints.some((adminEndpoint) => {
			// Comparar sin parámetros dinámicos
			const cleanEndpoint = endpoint.replace(/\/\d+/g, "/{id}");
			const cleanAdminEndpoint = adminEndpoint.replace(/\/\d+/g, "/{id}");
			return cleanEndpoint === cleanAdminEndpoint;
		});
	},
};

// ============================================================================
// CONFIGURACIÓN DE REQUEST METHODS POR ENDPOINT
// ============================================================================
export const ENDPOINT_METHODS = {
	// Auth endpoints
	[AUTH_ENDPOINTS.LOGIN]: "POST",
	[AUTH_ENDPOINTS.REGISTER]: "POST",
	[AUTH_ENDPOINTS.ME]: "POST",
	[AUTH_ENDPOINTS.LOGOUT]: "POST",
	[AUTH_ENDPOINTS.REFRESH]: "POST",
	[AUTH_ENDPOINTS.EDIT_PROFILE]: "POST",
	[AUTH_ENDPOINTS.CHANGE_PASSWORD]: "POST",

	// Progress endpoints
	[PROGRESS_ENDPOINTS.LIST]: "GET",
	[PROGRESS_ENDPOINTS.CREATE]: "POST",
	[PROGRESS_ENDPOINTS.SHOW]: "GET",
	[PROGRESS_ENDPOINTS.UPDATE]: "PUT",
	[PROGRESS_ENDPOINTS.DELETE]: "DELETE",
	[PROGRESS_ENDPOINTS.UPSERT]: "POST",
	[PROGRESS_ENDPOINTS.UPDATE_CERTIFICATE]: "POST",
	[PROGRESS_ENDPOINTS.USER_PROGRESS]: "GET",

	// User endpoints
	[USER_ENDPOINTS.LIST]: "GET",
	[USER_ENDPOINTS.CREATE]: "POST",
	[USER_ENDPOINTS.UPDATE]: "PUT",
	[USER_ENDPOINTS.DELETE]: "DELETE",
	[USER_ENDPOINTS.RESET_PASSWORD]: "PUT",
	[USER_ENDPOINTS.IMPORT]: "POST",

	// ExpDate endpoints
	[EXP_DATE_ENDPOINTS.LIST]: "GET",
	[EXP_DATE_ENDPOINTS.CREATE]: "POST",
	[EXP_DATE_ENDPOINTS.SHOW]: "GET",
	[EXP_DATE_ENDPOINTS.UPDATE_BY_COURSE]: "PUT",
};

// ============================================================================
// VALIDACIONES DE ENDPOINTS
// ============================================================================
export const EndpointValidators = {
	/**
	 * Valida parámetros requeridos para un endpoint
	 * @param {string} endpoint - Endpoint a validar
	 * @param {object} params - Parámetros proporcionados
	 * @returns {object} { isValid: boolean, missingParams: string[] }
	 */
	validateParams: (endpoint, params = {}) => {
		const paramMatches = endpoint.match(/\{(\w+)\}/g);
		if (!paramMatches) {
			return {isValid: true, missingParams: []};
		}

		const requiredParams = paramMatches.map((match) => match.slice(1, -1));
		const missingParams = requiredParams.filter((param) => !(param in params));

		return {
			isValid: missingParams.length === 0,
			missingParams,
		};
	},

	/**
	 * Valida método HTTP para un endpoint
	 * @param {string} endpoint - Endpoint a validar
	 * @param {string} method - Método HTTP
	 * @returns {boolean} true si el método es correcto
	 */
	validateMethod: (endpoint, method) => {
		const expectedMethod = ENDPOINT_METHODS[endpoint];
		return expectedMethod === method.toUpperCase();
	},
};

// ============================================================================
// EXPORT DEFAULT PARA COMPATIBILIDAD
// ============================================================================
export default {
	AUTH_ENDPOINTS,
	PROGRESS_ENDPOINTS,
	USER_ENDPOINTS,
	EXP_DATE_ENDPOINTS,
	API_ENDPOINTS,
	EndpointHelpers,
	ENDPOINT_METHODS,
	EndpointValidators,
	buildUrl,
};
