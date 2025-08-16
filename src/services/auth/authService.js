// src/services/auth/authService.js
import {tokenService} from "./tokenService";
import {authAPI} from "../api/apiService";
import {APP_CONFIG} from "../../utils/constants";
import {saveToLocalStorage, getFromLocalStorage} from "../../utils/crypto";

/**
 * Servicio de autenticación mejorado que utiliza
 * los endpoints centralizados y manejo robusto de errores
 */
class AuthService {
	constructor() {
		this.isInitialized = false;
		this.userCache = null;
		this.lastUserFetch = null;
		this.cacheTimeout = 5 * 60 * 1000; // 5 minutos
	}

	/**
	 * Inicializar el servicio de autenticación
	 */
	initialize() {
		if (this.isInitialized) return;

		try {
			// Verificar si hay datos corruptos y limpiarlos
			this.validateStoredData();
			this.isInitialized = true;
		} catch (error) {
			console.error("Error initializing AuthService:", error);
			this.clearLocalData();
		}
	}

	/**
	 * Iniciar sesión con credenciales
	 * @param {Object} credentials - { email, password }
	 * @returns {Promise<Object>} Resultado del login
	 */
	async login(credentials) {
		try {
			// Validar credenciales
			if (!credentials?.email || !credentials?.password) {
				throw new Error("Email y contraseña son requeridos");
			}

			// Llamar al API centralizado
			const result = await authAPI.login(credentials);

			if (!result.success) {
				throw new Error(result.error || "Error en el login");
			}

			// CORRECCIÓN: Validar que tenemos datos de respuesta
			if (!result.data) {
				throw new Error("No se recibieron datos del servidor");
			}

			// Extraer token - manejar diferentes formatos de respuesta del backend
			let token;
			if (result.data.access_token) {
				token = result.data.access_token;
			} else if (result.data.token) {
				token = result.data.token;
			} else if (typeof result.data === "string") {
				token = result.data;
			} else {
				console.error("Token structure:", result.data);
				throw new Error("Token no encontrado en la respuesta del servidor");
			}

			console.log("Token received:", token);

			// Guardar token
			tokenService.setToken(token);

			// Limpiar cache de usuario
			this.clearUserCache();

			// CORRECCIÓN: Devolver toda la estructura de respuesta
			return {
				success: true,
				data: result.data,
				passwordChangeRequired: result.data.password_change_required || false,
			};
		} catch (error) {
			console.error("AuthService login error:", error);
			throw error;
		}
	}

	/**
	 * Obtener usuario actual (con cache)
	 * @param {boolean} forceRefresh - Forzar actualización del cache
	 * @returns {Promise<Object>} Datos del usuario
	 */
	async getCurrentUser(forceRefresh = false) {
		try {
			// Verificar si tenemos un token válido
			if (!tokenService.isTokenValid()) {
				throw new Error("No hay token válido");
			}

			// Verificar cache
			if (!forceRefresh && this.isUserCacheValid()) {
				return this.userCache;
			}

			// Obtener usuario desde API
			const userData = await authAPI.getCurrentUser();

			if (!userData) {
				throw new Error("No se recibieron datos del usuario");
			}

			// Validar estructura del usuario
			this.validateUserData(userData);

			// Actualizar cache
			this.updateUserCache(userData);

			// Guardar en localStorage encriptado
			saveToLocalStorage(
				APP_CONFIG.STORAGE_KEYS.USER,
				JSON.stringify(userData)
			);

			return userData;
		} catch (error) {
			console.error("AuthService getCurrentUser error:", error);

			// Si hay error, intentar obtener usuario del localStorage
			const cachedUser = this.getUserFromStorage();
			if (cachedUser && this.validateUserData(cachedUser, false)) {
				return cachedUser;
			}

			throw error;
		}
	}

	/**
	 * Cambiar contraseña del usuario
	 * @param {string} newPassword - Nueva contraseña
	 * @param {string} confirmation - Confirmación de contraseña
	 * @returns {Promise<Object>} Resultado del cambio
	 */
	async changePassword(newPassword, confirmation) {
		try {
			// Validar parámetros
			if (!newPassword || !confirmation) {
				throw new Error("Nueva contraseña y confirmación son requeridas");
			}

			if (newPassword !== confirmation) {
				throw new Error("Las contraseñas no coinciden");
			}

			if (newPassword.length < 8) {
				throw new Error("La contraseña debe tener al menos 8 caracteres");
			}

			// Llamar al API
			const result = await authAPI.changePassword({
				password: newPassword,
				confirmation: confirmation,
			});

			// Actualizar usuario en cache
			if (this.userCache) {
				this.userCache.password_changed = true;
				this.updateUserCache(this.userCache);
			}

			return result;
		} catch (error) {
			console.error("AuthService changePassword error:", error);
			throw error;
		}
	}

	/**
	 * Actualizar perfil del usuario
	 * @param {Object} profileData - Datos del perfil
	 * @returns {Promise<Object>} Perfil actualizado
	 */
	async updateProfile(profileData) {
		try {
			// Validar datos básicos
			if (!profileData?.name || !profileData?.email) {
				throw new Error("Nombre y email son requeridos");
			}

			// Llamar al API
			const result = await authAPI.updateProfile(profileData);

			if (result.success && result.data?.user) {
				// Actualizar cache local
				this.updateUserCache(result.data.user);

				// Actualizar localStorage
				saveToLocalStorage(
					APP_CONFIG.STORAGE_KEYS.USER,
					JSON.stringify(result.data.user)
				);
			}

			return result;
		} catch (error) {
			console.error("AuthService updateProfile error:", error);
			throw error;
		}
	}

	/**
	 * Cerrar sesión
	 * @returns {Promise<void>}
	 */
	async logout() {
		try {
			// Intentar logout en servidor
			await authAPI.logout();
		} catch (error) {
			// El logout local debe funcionar incluso si falla el servidor
			console.warn(
				"Server logout failed, proceeding with local logout:",
				error
			);
		} finally {
			// Limpiar datos locales
			this.clearLocalData();
		}
	}

	/**
	 * Refrescar token de autenticación
	 * @returns {Promise<string>} Nuevo token
	 */
	async refreshToken() {
		try {
			const result = await authAPI.refreshToken();

			let token;
			if (result.access_token) {
				token = result.access_token;
			} else if (result.token) {
				token = result.token;
			} else if (typeof result === "string") {
				token = result;
			}

			if (token) {
				tokenService.setToken(token);
				return token;
			}

			throw new Error("No se recibió token en refresh");
		} catch (error) {
			console.error("AuthService refreshToken error:", error);
			// Si falla el refresh, hacer logout
			await this.logout();
			throw error;
		}
	}

	/**
	 * Verificar si el usuario está autenticado
	 * @returns {boolean} Estado de autenticación
	 */
	isAuthenticated() {
		return tokenService.isTokenValid() && !!this.getUserFromStorage();
	}

	/**
	 * Verificar si el usuario tiene un rol específico
	 * @param {number} role - Rol a verificar
	 * @returns {boolean} Si tiene el rol
	 */
	hasRole(role) {
		const user = this.getUserFromStorage();
		return user && parseInt(user.role) === parseInt(role);
	}

	/**
	 * Verificar si el usuario está activo
	 * @returns {boolean} Si está activo
	 */
	isUserActive() {
		const user = this.getUserFromStorage();
		return user && parseInt(user.active) === 1;
	}

	/**
	 * Obtener usuario desde localStorage
	 * @returns {Object|null} Datos del usuario
	 */
	getUserFromStorage() {
		try {
			const userData = getFromLocalStorage(APP_CONFIG.STORAGE_KEYS.USER);
			return userData ? JSON.parse(userData) : null;
		} catch (error) {
			console.error("Error getting user from storage:", error);
			return null;
		}
	}

	/**
	 * Limpiar todos los datos locales
	 */
	clearLocalData() {
		// Limpiar cache
		this.clearUserCache();

		// Limpiar tokens y usuario
		tokenService.clearAuthData();

		console.info("Auth data cleared successfully");
	}

	/**
	 * Validar datos del usuario
	 * @param {Object} userData - Datos a validar
	 * @param {boolean} throwError - Si lanzar error en caso de fallo
	 * @returns {boolean} Si los datos son válidos
	 */
	validateUserData(userData, throwError = true) {
		const isValid =
			userData &&
			typeof userData === "object" &&
			userData.id &&
			userData.email &&
			userData.role !== undefined;

		if (!isValid && throwError) {
			throw new Error("Datos de usuario inválidos");
		}

		return isValid;
	}

	/**
	 * Validar datos almacenados
	 */
	validateStoredData() {
		const token = tokenService.getToken();
		const user = this.getUserFromStorage();

		// Si hay token pero está expirado, limpiar todo
		if (token && tokenService.isTokenExpired(token)) {
			this.clearLocalData();
			return;
		}

		// Si hay usuario pero datos inválidos, limpiar
		if (user && !this.validateUserData(user, false)) {
			this.clearLocalData();
			return;
		}
	}

	// ========================================================================
	// MÉTODOS DE CACHE PRIVADOS
	// ========================================================================

	/**
	 * Verificar si el cache de usuario es válido
	 * @returns {boolean} Si el cache es válido
	 */
	isUserCacheValid() {
		return (
			this.userCache &&
			this.lastUserFetch &&
			Date.now() - this.lastUserFetch < this.cacheTimeout
		);
	}

	/**
	 * Actualizar cache de usuario
	 * @param {Object} userData - Datos del usuario
	 */
	updateUserCache(userData) {
		this.userCache = userData;
		this.lastUserFetch = Date.now();
	}

	/**
	 * Limpiar cache de usuario
	 */
	clearUserCache() {
		this.userCache = null;
		this.lastUserFetch = null;
	}
}

// Crear instancia singleton
export const authService = new AuthService();

// Inicializar automáticamente
authService.initialize();
