// src/services/api/apiService.js
import apiClient from "./client";

export { apiClient };
import {
	API_ENDPOINTS,
	ERROR_MESSAGES,
	SUCCESS_MESSAGES,
} from "../../utils/constants";
import {EndpointHelpers, EndpointValidators} from "./endpoints";

/**
 * Servicio centralizado para todas las llamadas a la API
 * Proporciona métodos organizados por funcionalidad
 */

// ============================================================================
// SERVICIO DE AUTENTICACIÓN
// ============================================================================
export const authAPI = {
	/**
	 * Iniciar sesión
	 * @param {Object} credentials - { email, password }
	 * @returns {Promise} Respuesta de la API
	 */
	async login(credentials) {
		try {
			// Usar V2 endpoints
			const response = await apiClient.post(
				"/v2/auth/login",
				credentials
			);
			
			console.log("🔍 API Service - Raw response:", response);
			console.log("🔍 API Service - Response data:", response.data);
			console.log("🔍 API Service - Response status:", response.status);
			
			return {
				success: true,
				data: response.data,
				message: SUCCESS_MESSAGES.LOGIN_SUCCESS,
			};
		} catch (error) {
			throw this.handleError(error, "LOGIN_ERROR");
		}
	},

	/**
	 * Registrar nuevo usuario
	 * @param {Object} userData - Datos del usuario
	 * @returns {Promise} Respuesta de la API
	 */
	async register(userData) {
		try {
			const response = await apiClient.post(
				API_ENDPOINTS.AUTH.REGISTER,
				userData
			);
			return {
				success: true,
				data: response.data,
				message: "Usuario registrado exitosamente",
			};
		} catch (error) {
			throw this.handleError(error, "REGISTER_ERROR");
		}
	},

	/**
	 * Obtener información del usuario actual
	 * @returns {Promise} Datos del usuario
	 */
	async getCurrentUser() {
		try {
			// Usar V2 endpoint con GET method
			const response = await apiClient.get("/v2/auth/me");
			return {
				success: true,
				data: response.data,
			};
		} catch (error) {
			throw this.handleError(error, "GET_USER_ERROR");
		}
	},

	/**
	 * Cerrar sesión
	 * @returns {Promise} Respuesta de la API
	 */
	async logout() {
		try {
			const response = await apiClient.post(API_ENDPOINTS.AUTH.LOGOUT);
			return {
				success: true,
				message: SUCCESS_MESSAGES.LOGOUT_SUCCESS,
			};
		} catch (error) {
			// El logout debería funcionar incluso si hay errores
			console.warn("Logout error:", error);
			return {
				success: true,
				message: SUCCESS_MESSAGES.LOGOUT_SUCCESS,
			};
		}
	},

	/**
	 * Refrescar token
	 * @returns {Promise} Nuevo token
	 */
	async refreshToken() {
		try {
			const response = await apiClient.post(API_ENDPOINTS.AUTH.REFRESH);
			return response.data;
		} catch (error) {
			throw this.handleError(error, "REFRESH_TOKEN_ERROR");
		}
	},

	/**
	 * Cambiar contraseña
	 * @param {Object} passwordData - { password, confirmation }
	 * @returns {Promise} Respuesta de la API
	 */
	async changePassword(passwordData) {
		try {
			const response = await apiClient.post(
				API_ENDPOINTS.AUTH.CHANGE_PASSWORD,
				passwordData
			);
			return {
				success: true,
				data: response.data,
				message: SUCCESS_MESSAGES.PASSWORD_CHANGED,
			};
		} catch (error) {
			throw this.handleError(error, "CHANGE_PASSWORD_ERROR");
		}
	},

	/**
	 * Actualizar perfil
	 * @param {Object} profileData - Datos del perfil
	 * @returns {Promise} Respuesta de la API
	 */
	async updateProfile(profileData) {
		try {
			const response = await apiClient.post(
				API_ENDPOINTS.AUTH.EDIT_PROFILE,
				profileData
			);
			return {
				success: true,
				data: response.data,
				message: SUCCESS_MESSAGES.PROFILE_UPDATED,
			};
		} catch (error) {
			throw this.handleError(error, "UPDATE_PROFILE_ERROR");
		}
	},

	// Helper para manejo de errores
	handleError(error, context) {
		const errorMessage =
			error.response?.data?.message ||
			error.response?.data?.error ||
			ERROR_MESSAGES.UNKNOWN_ERROR;

		console.error(`Auth API Error [${context}]:`, error);

		return new Error(errorMessage);
	},
};

// ============================================================================
// SERVICIO DE USUARIOS (Admin)
// ============================================================================
export const userAPI = {
	/**
	 * Obtener lista de usuarios
	 * @returns {Promise} Lista de usuarios
	 */
	async getUsers() {
		try {
			const response = await apiClient.get(API_ENDPOINTS.USERS.LIST);
			return response.data;
		} catch (error) {
			throw this.handleError(error, "GET_USERS_ERROR");
		}
	},

	/**
	 * Crear nuevo usuario
	 * @param {Object} userData - Datos del usuario
	 * @returns {Promise} Usuario creado
	 */
	async createUser(userData) {
		try {
			const response = await apiClient.post(
				API_ENDPOINTS.USERS.CREATE,
				userData
			);
			return {
				success: true,
				data: response.data,
				message: SUCCESS_MESSAGES.USER_CREATED,
			};
		} catch (error) {
			throw this.handleError(error, "CREATE_USER_ERROR");
		}
	},

	/**
	 * Actualizar usuario
	 * @param {number} id - ID del usuario
	 * @param {Object} userData - Datos a actualizar
	 * @returns {Promise} Usuario actualizado
	 */
	async updateUser(id, userData) {
		try {
			const endpoint = API_ENDPOINTS.USERS.update(id);
			const response = await apiClient.put(endpoint, userData);
			return {
				success: true,
				data: response.data,
				message: SUCCESS_MESSAGES.USER_UPDATED,
			};
		} catch (error) {
			throw this.handleError(error, "UPDATE_USER_ERROR");
		}
	},

	/**
	 * Eliminar usuario
	 * @param {number} id - ID del usuario
	 * @returns {Promise} Confirmación
	 */
	async deleteUser(id) {
		try {
			const endpoint = API_ENDPOINTS.USERS.delete(id);
			await apiClient.delete(endpoint);
			return {
				success: true,
				message: SUCCESS_MESSAGES.USER_DELETED,
			};
		} catch (error) {
			throw this.handleError(error, "DELETE_USER_ERROR");
		}
	},

	/**
	 * Restablecer contraseña de usuario
	 * @param {number} id - ID del usuario
	 * @returns {Promise} Confirmación
	 */
	async resetUserPassword(id) {
		try {
			const endpoint = API_ENDPOINTS.USERS.resetPassword(id);
			const response = await apiClient.put(endpoint);
			return {
				success: true,
				data: response.data,
				message: "Contraseña restablecida exitosamente",
			};
		} catch (error) {
			throw this.handleError(error, "RESET_PASSWORD_ERROR");
		}
	},

	/**
	 * Importar usuarios desde CSV
	 * @param {FormData} fileData - Archivo CSV
	 * @returns {Promise} Resultado de importación
	 */
	async importUsers(fileData) {
		try {
			const response = await apiClient.post(
				API_ENDPOINTS.USERS.IMPORT,
				fileData,
				{
					headers: {
						"Content-Type": "multipart/form-data",
					},
				}
			);
			return {
				success: true,
				data: response.data,
				message: SUCCESS_MESSAGES.FILE_IMPORTED,
			};
		} catch (error) {
			throw this.handleError(error, "IMPORT_USERS_ERROR");
		}
	},

	// Helper para manejo de errores
	handleError(error, context) {
		const errorMessage =
			error.response?.data?.message ||
			error.response?.data?.error ||
			ERROR_MESSAGES.UNKNOWN_ERROR;

		console.error(`User API Error [${context}]:`, error);

		return new Error(errorMessage);
	},
};

// ============================================================================
// SERVICIO DE PROGRESO
// ============================================================================
export const progressAPI = {
	/**
	 * Obtener todo el progreso
	 * @returns {Promise} Lista de progreso
	 */
	async getAllProgress() {
		try {
			const response = await apiClient.get(API_ENDPOINTS.PROGRESS.LIST);
			return response.data;
		} catch (error) {
			throw this.handleError(error, "GET_ALL_PROGRESS_ERROR");
		}
	},

	/**
	 * Obtener progreso del usuario actual
	 * @returns {Promise} Progreso del usuario
	 */
	async getUserProgress() {
		try {
			const response = await apiClient.get(
				API_ENDPOINTS.PROGRESS.USER_PROGRESS
			);
			return response.data;
		} catch (error) {
			throw this.handleError(error, "GET_USER_PROGRESS_ERROR");
		}
	},

	/**
	 * Obtener progreso específico
	 * @param {number} id - ID del progreso
	 * @returns {Promise} Progreso específico
	 */
	async getProgress(id) {
		try {
			const endpoint = API_ENDPOINTS.PROGRESS.show(id);
			const response = await apiClient.get(endpoint);
			return response.data;
		} catch (error) {
			throw this.handleError(error, "GET_PROGRESS_ERROR");
		}
	},

	/**
	 * Crear o actualizar progreso
	 * @param {Object} progressData - Datos del progreso
	 * @returns {Promise} Progreso actualizado
	 */
	async upsertProgress(progressData) {
		try {
			const response = await apiClient.post(
				API_ENDPOINTS.PROGRESS.UPSERT,
				progressData
			);
			return {
				success: true,
				data: response.data,
				message: SUCCESS_MESSAGES.PROGRESS_SAVED,
			};
		} catch (error) {
			throw this.handleError(error, "UPSERT_PROGRESS_ERROR");
		}
	},

	/**
	 * Eliminar progreso
	 * @param {number} userId - ID del usuario
	 * @param {number} courseId - ID del curso
	 * @returns {Promise} Confirmación
	 */
	async deleteProgress(userId, courseId) {
		try {
			const endpoint = API_ENDPOINTS.PROGRESS.delete(userId, courseId);
			await apiClient.delete(endpoint);
			return {
				success: true,
				message: "Progreso eliminado exitosamente",
			};
		} catch (error) {
			throw this.handleError(error, "DELETE_PROGRESS_ERROR");
		}
	},

	/**
	 * Actualizar certificado
	 * @param {Object} certificateData - Datos del certificado
	 * @returns {Promise} Confirmación
	 */
	async updateCertificate(certificateData) {
		try {
			const response = await apiClient.post(
				API_ENDPOINTS.PROGRESS.UPDATE_CERTIFICATE,
				certificateData
			);
			return {
				success: true,
				data: response.data,
				message: SUCCESS_MESSAGES.CERTIFICATE_DOWNLOADED,
			};
		} catch (error) {
			throw this.handleError(error, "UPDATE_CERTIFICATE_ERROR");
		}
	},

	// Helper para manejo de errores
	handleError(error, context) {
		const errorMessage =
			error.response?.data?.message ||
			error.response?.data?.error ||
			ERROR_MESSAGES.UNKNOWN_ERROR;

		console.error(`Progress API Error [${context}]:`, error);

		return new Error(errorMessage);
	},
};

// ============================================================================
// SERVICIO DE FECHAS DE EXPIRACIÓN
// ============================================================================
export const expDateAPI = {
	/**
	 * Obtener todas las fechas de expiración
	 * @returns {Promise} Lista de fechas
	 */
	async getExpDates() {
		try {
			const response = await apiClient.get(API_ENDPOINTS.EXP_DATES.LIST);
			return response.data;
		} catch (error) {
			throw this.handleError(error, "GET_EXP_DATES_ERROR");
		}
	},

	/**
	 * Obtener fecha de expiración específica
	 * @param {number} id - ID de la fecha
	 * @returns {Promise} Fecha específica
	 */
	async getExpDate(id) {
		try {
			const endpoint = API_ENDPOINTS.EXP_DATES.show(id);
			const response = await apiClient.get(endpoint);
			return response.data;
		} catch (error) {
			throw this.handleError(error, "GET_EXP_DATE_ERROR");
		}
	},

	/**
	 * Crear nueva fecha de expiración
	 * @param {Object} expDateData - Datos de la fecha
	 * @returns {Promise} Fecha creada
	 */
	async createExpDate(expDateData) {
		try {
			const response = await apiClient.post(
				API_ENDPOINTS.EXP_DATES.CREATE,
				expDateData
			);
			return {
				success: true,
				data: response.data,
				message: "Fecha de expiración creada exitosamente",
			};
		} catch (error) {
			throw this.handleError(error, "CREATE_EXP_DATE_ERROR");
		}
	},

	/**
	 * Actualizar fecha por curso
	 * @param {number} courseId - ID del curso
	 * @param {Object} expDateData - Datos de la fecha
	 * @returns {Promise} Fecha actualizada
	 */
	async updateExpDateByCourse(courseId, expDateData) {
		try {
			const endpoint = API_ENDPOINTS.EXP_DATES.updateByCourse(courseId);
			const response = await apiClient.put(endpoint, expDateData);
			return {
				success: true,
				data: response.data,
				message: "Fecha de expiración actualizada exitosamente",
			};
		} catch (error) {
			throw this.handleError(error, "UPDATE_EXP_DATE_ERROR");
		}
	},

	// Helper para manejo de errores
	handleError(error, context) {
		const errorMessage =
			error.response?.data?.message ||
			error.response?.data?.error ||
			ERROR_MESSAGES.UNKNOWN_ERROR;

		console.error(`ExpDate API Error [${context}]:`, error);

		return new Error(errorMessage);
	},
};

// ============================================================================
// SERVICIO PRINCIPAL CONSOLIDADO
// ============================================================================
export const apiService = {
	auth: authAPI,
	users: userAPI,
	progress: progressAPI,
	expDates: expDateAPI,

	/**
	 * Validar endpoint antes de hacer request
	 * @param {string} endpoint - Endpoint a validar
	 * @param {string} method - Método HTTP
	 * @param {object} params - Parámetros del endpoint
	 * @returns {object} Resultado de validación
	 */
	validateRequest(endpoint, method, params = {}) {
		const paramValidation = EndpointValidators.validateParams(endpoint, params);
		const methodValidation = EndpointValidators.validateMethod(
			endpoint,
			method
		);

		return {
			isValid: paramValidation.isValid && methodValidation,
			errors: {
				missingParams: paramValidation.missingParams,
				invalidMethod: !methodValidation,
			},
		};
	},

	/**
	 * Construir URL completa
	 * @param {string} endpoint - Endpoint relativo
	 * @returns {string} URL completa
	 */
	getFullUrl(endpoint) {
		return EndpointHelpers.getFullUrl(endpoint);
	},
};

// Export por defecto
export default apiService;
