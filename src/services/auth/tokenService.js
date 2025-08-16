// src/services/auth/tokenService.js
import {APP_CONFIG} from "../../utils/constants";

class TokenService {
	constructor() {
		this.storageKey = APP_CONFIG.STORAGE_KEYS.TOKEN;
		this.refreshThreshold = 5 * 60; // 5 minutos antes de expirar
	}

	/**
	 * Obtiene el token del localStorage
	 * @returns {string|null} Token JWT o null si no existe
	 */
	getToken() {
		try {
			return localStorage.getItem(this.storageKey);
		} catch (error) {
			console.error("Error accessing localStorage for token:", error);
			return null;
		}
	}

	/**
	 * Guarda el token en localStorage
	 * @param {string} token - Token JWT a guardar
	 */
	setToken(token) {
		if (!token || typeof token !== "string") {
			console.error("Invalid token provided to setToken:", token);
			return;
		}

		try {
			// Solo validar que no esté vacío, no el formato JWT específico
			// El backend puede devolver diferentes tipos de tokens
			if (token.trim().length === 0) {
				throw new Error("Empty token");
			}

			localStorage.setItem(this.storageKey, token);
		} catch (error) {
			console.error("Error storing token:", error);
			throw new Error("Failed to store authentication token");
		}
	}

	/**
	 * Remueve el token del localStorage
	 */
	removeToken() {
		try {
			localStorage.removeItem(this.storageKey);
		} catch (error) {
			console.error("Error removing token from localStorage:", error);
		}
	}

	/**
	 * Verifica si un token ha expirado
	 * @param {string} token - Token a verificar (opcional, usa el stored token si no se provee)
	 * @returns {boolean} true si el token está expirado
	 */
	isTokenExpired(token = null) {
		const tokenToCheck = token || this.getToken();

		if (!tokenToCheck) {
			return true;
		}

		try {
			// Intentar decodificar como JWT, pero no fallar si no es JWT
			if (this.isValidJWTFormat(tokenToCheck)) {
				const payload = this.getTokenPayload(tokenToCheck);
				if (payload && payload.exp) {
					const currentTime = Math.floor(Date.now() / 1000);
					return payload.exp <= currentTime;
				}
			}

			// Si no es JWT o no tiene exp, considerar que no ha expirado
			// El backend manejará la validación del token
			return false;
		} catch (error) {
			console.warn("Error checking token expiration:", error);
			// En caso de error, no asumir que está expirado
			return false;
		}
	}

	/**
	 * Obtiene el payload decodificado del token (solo para JWT)
	 * @param {string} token - Token a decodificar (opcional)
	 * @returns {object|null} Payload del token o null si hay error
	 */
	getTokenPayload(token = null) {
		const tokenToCheck = token || this.getToken();

		if (!tokenToCheck || !this.isValidJWTFormat(tokenToCheck)) {
			return null;
		}

		try {
			const base64Payload = tokenToCheck.split(".")[1];
			const payload = JSON.parse(atob(base64Payload));
			return payload;
		} catch (error) {
			console.warn("Error decoding token payload:", error);
			return null;
		}
	}

	/**
	 * Verifica si el token actual es válido
	 * @returns {boolean} true si el token existe y no ha expirado
	 */
	isTokenValid() {
		const token = this.getToken();
		return token && !this.isTokenExpired(token);
	}

	/**
	 * Verifica si el token necesita ser renovado pronto
	 * @param {string} token - Token a verificar (opcional)
	 * @returns {boolean} true si el token expira dentro del threshold
	 */
	shouldRefreshToken(token = null) {
		const tokenToCheck = token || this.getToken();

		if (!tokenToCheck || this.isTokenExpired(tokenToCheck)) {
			return false;
		}

		try {
			if (this.isValidJWTFormat(tokenToCheck)) {
				const payload = this.getTokenPayload(tokenToCheck);
				if (payload && payload.exp) {
					const currentTime = Math.floor(Date.now() / 1000);
					const timeUntilExpiry = payload.exp - currentTime;
					return timeUntilExpiry <= this.refreshThreshold;
				}
			}
			return false;
		} catch (error) {
			console.warn("Error checking token refresh need:", error);
			return false;
		}
	}

	/**
	 * Obtiene información del usuario desde el token (solo para JWT)
	 * @param {string} token - Token a verificar (opcional)
	 * @returns {object|null} Información del usuario o null
	 */
	getUserFromToken(token = null) {
		const payload = this.getTokenPayload(token);

		if (!payload) {
			return null;
		}

		// Extraer información común del usuario del token
		return {
			id: payload.sub || payload.user_id || payload.id,
			email: payload.email,
			role: payload.role,
			exp: payload.exp,
			iat: payload.iat,
		};
	}

	/**
	 * Valida el formato básico de un JWT
	 * @param {string} token - Token a validar
	 * @returns {boolean} true si tiene formato JWT válido
	 */
	isValidJWTFormat(token) {
		if (!token || typeof token !== "string") {
			return false;
		}

		// Un JWT debe tener exactamente 3 partes separadas por puntos
		const parts = token.split(".");
		if (parts.length !== 3) {
			return false;
		}

		// Cada parte debe ser base64 válida (con padding si es necesario)
		try {
			parts.forEach((part, index) => {
				if (part.length === 0) {
					throw new Error("Empty JWT part");
				}

				// Agregar padding si es necesario para base64
				let paddedPart = part;
				while (paddedPart.length % 4) {
					paddedPart += "=";
				}

				atob(paddedPart);
			});
			return true;
		} catch (error) {
			return false;
		}
	}

	/**
	 * Obtiene el tiempo restante hasta la expiración del token
	 * @param {string} token - Token a verificar (opcional)
	 * @returns {number} Segundos hasta expiración, -1 si ya expiró o hay error
	 */
	getTimeUntilExpiry(token = null) {
		try {
			const payload = this.getTokenPayload(token);
			if (!payload || !payload.exp) {
				return -1;
			}

			const currentTime = Math.floor(Date.now() / 1000);
			return Math.max(0, payload.exp - currentTime);
		} catch (error) {
			console.warn("Error calculating time until expiry:", error);
			return -1;
		}
	}

	/**
	 * Limpia todos los datos relacionados con autenticación
	 */
	clearAuthData() {
		try {
			this.removeToken();
			localStorage.removeItem(APP_CONFIG.STORAGE_KEYS.USER);
			localStorage.removeItem(APP_CONFIG.STORAGE_KEYS.EXP_DATES);

			// Limpiar datos de cursos
			Object.keys(localStorage).forEach((key) => {
				if (key.startsWith("Course")) {
					localStorage.removeItem(key);
				}
			});
		} catch (error) {
			console.error("Error clearing auth data:", error);
		}
	}
}

export const tokenService = new TokenService();
