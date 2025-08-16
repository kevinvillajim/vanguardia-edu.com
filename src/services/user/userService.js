// src/services/user/userService.js
import {userAPI} from "../api/apiService";
import {
	USER_ROLES,
} from "../../utils/constants";

/**
 * Servicio para manejo de usuarios
 * Utiliza el sistema de API centralizado
 */
class UserService {
	constructor() {
		this.usersCache = null;
		this.cacheTimeout = 5 * 60 * 1000; // 5 minutos
		this.lastCacheUpdate = null;
	}

	/**
	 * Obtener todos los usuarios
	 * @param {boolean} useCache - Usar cache si está disponible
	 * @returns {Promise<Array>} Lista de usuarios
	 */
	async getUsers(useCache = true) {
		try {
			// Verificar cache
			if (useCache && this.isUserseCacheValid()) {
				return this.usersCache;
			}

			const users = await userAPI.getUsers();

			// Actualizar cache
			this.updateUsersCache(users);

			return users;
		} catch (error) {
			console.error("UserService getUsers error:", error);
			throw new Error("Error al obtener usuarios");
		}
	}

	/**
	 * Crear nuevo usuario
	 * @param {Object} userData - Datos del usuario
	 * @returns {Promise<Object>} Usuario creado
	 */
	async createUser(userData) {
		try {
			// Validar datos requeridos
			this.validateUserData(userData, true);

			const result = await userAPI.createUser(userData);

			// Invalidar cache
			this.invalidateUsersCache();

			return result;
		} catch (error) {
			console.error("UserService createUser error:", error);
			throw error;
		}
	}

	/**
	 * Actualizar usuario
	 * @param {number} userId - ID del usuario
	 * @param {Object} userData - Datos a actualizar
	 * @returns {Promise<Object>} Usuario actualizado
	 */
	async updateUser(userId, userData) {
		try {
			// Validar ID
			if (!userId || isNaN(parseInt(userId))) {
				throw new Error("ID de usuario inválido");
			}

			// Validar datos
			this.validateUserData(userData, false);

			const result = await userAPI.updateUser(userId, userData);

			// Invalidar cache
			this.invalidateUsersCache();

			return result;
		} catch (error) {
			console.error("UserService updateUser error:", error);
			throw error;
		}
	}

	/**
	 * Eliminar usuario
	 * @param {number} userId - ID del usuario
	 * @returns {Promise<Object>} Resultado de eliminación
	 */
	async deleteUser(userId) {
		try {
			if (!userId || isNaN(parseInt(userId))) {
				throw new Error("ID de usuario inválido");
			}

			const result = await userAPI.deleteUser(userId);

			// Invalidar cache
			this.invalidateUsersCache();

			return result;
		} catch (error) {
			console.error("UserService deleteUser error:", error);
			throw error;
		}
	}

	/**
	 * Restablecer contraseña de usuario
	 * @param {number} userId - ID del usuario
	 * @returns {Promise<Object>} Resultado
	 */
	async resetUserPassword(userId) {
		try {
			if (!userId || isNaN(parseInt(userId))) {
				throw new Error("ID de usuario inválido");
			}

			const result = await userAPI.resetUserPassword(userId);
			return result;
		} catch (error) {
			console.error("UserService resetUserPassword error:", error);
			throw error;
		}
	}

	/**
	 * Importar usuarios desde CSV
	 * @param {File} file - Archivo CSV
	 * @returns {Promise<Object>} Resultado de importación
	 */
	async importUsers(file) {
		try {
			if (!file) {
				throw new Error("Archivo requerido para importación");
			}

			// Validar tipo de archivo
			if (!file.type.includes("csv") && !file.name.endsWith(".csv")) {
				throw new Error("Solo se permiten archivos CSV");
			}

			// Crear FormData
			const formData = new FormData();
			formData.append("file", file);

			const result = await userAPI.importUsers(formData);

			// Invalidar cache después de importación exitosa
			this.invalidateUsersCache();

			return result;
		} catch (error) {
			console.error("UserService importUsers error:", error);
			throw error;
		}
	}

	/**
	 * Obtener usuarios filtrados por rol
	 * @param {number} role - Rol a filtrar
	 * @param {boolean} useCache - Usar cache
	 * @returns {Promise<Array>} Usuarios filtrados
	 */
	async getUsersByRole(role, useCache = true) {
		try {
			const users = await this.getUsers(useCache);
			return users.filter((user) => parseInt(user.role) === parseInt(role));
		} catch (error) {
			console.error("UserService getUsersByRole error:", error);
			throw error;
		}
	}

	/**
	 * Obtener solo estudiantes
	 * @param {boolean} useCache - Usar cache
	 * @returns {Promise<Array>} Lista de estudiantes
	 */
	async getStudents(useCache = true) {
		return this.getUsersByRole(USER_ROLES.STUDENT, useCache);
	}

	/**
	 * Obtener solo administradores
	 * @param {boolean} useCache - Usar cache
	 * @returns {Promise<Array>} Lista de administradores
	 */
	async getAdmins(useCache = true) {
		return this.getUsersByRole(USER_ROLES.ADMIN, useCache);
	}

	/**
	 * Obtener solo profesores
	 * @param {boolean} useCache - Usar cache
	 * @returns {Promise<Array>} Lista de profesores
	 */
	async getTeachers(useCache = true) {
		return this.getUsersByRole(USER_ROLES.TEACHER, useCache);
	}

	/**
	 * Obtener usuarios activos
	 * @param {boolean} useCache - Usar cache
	 * @returns {Promise<Array>} Usuarios activos
	 */
	async getActiveUsers(useCache = true) {
		try {
			const users = await this.getUsers(useCache);
			return users.filter((user) => parseInt(user.active) === 1);
		} catch (error) {
			console.error("UserService getActiveUsers error:", error);
			throw error;
		}
	}

	/**
	 * Buscar usuarios por texto
	 * @param {string} searchTerm - Término de búsqueda
	 * @param {boolean} useCache - Usar cache
	 * @returns {Promise<Array>} Usuarios que coinciden
	 */
	async searchUsers(searchTerm, useCache = true) {
		try {
			if (!searchTerm || searchTerm.trim().length === 0) {
				return this.getUsers(useCache);
			}

			const users = await this.getUsers(useCache);
			const term = searchTerm.toLowerCase().trim();

			return users.filter(
				(user) =>
					user.name?.toLowerCase().includes(term) ||
					user.email?.toLowerCase().includes(term) ||
					user.ci?.toLowerCase().includes(term)
			);
		} catch (error) {
			console.error("UserService searchUsers error:", error);
			throw error;
		}
	}

	/**
	 * Obtener estadísticas de usuarios
	 * @param {boolean} useCache - Usar cache
	 * @returns {Promise<Object>} Estadísticas
	 */
	async getUserStats(useCache = true) {
		try {
			const users = await this.getUsers(useCache);

			const stats = {
				total: users.length,
				active: users.filter((u) => parseInt(u.active) === 1).length,
				inactive: users.filter((u) => parseInt(u.active) === 0).length,
				byRole: {
					admins: users.filter((u) => parseInt(u.role) === USER_ROLES.ADMIN)
						.length,
					students: users.filter((u) => parseInt(u.role) === USER_ROLES.STUDENT)
						.length,
					teachers: users.filter((u) => parseInt(u.role) === USER_ROLES.TEACHER)
						.length,
				},
			};

			return {
				...stats,
				activePercentage:
					stats.total > 0 ? Math.round((stats.active / stats.total) * 100) : 0,
				roleDistribution: {
					adminPercentage:
						stats.total > 0
							? Math.round((stats.byRole.admins / stats.total) * 100)
							: 0,
					studentPercentage:
						stats.total > 0
							? Math.round((stats.byRole.students / stats.total) * 100)
							: 0,
					teacherPercentage:
						stats.total > 0
							? Math.round((stats.byRole.teachers / stats.total) * 100)
							: 0,
				},
			};
		} catch (error) {
			console.error("UserService getUserStats error:", error);
			throw error;
		}
	}

	/**
	 * Validar datos de usuario
	 * @param {Object} userData - Datos a validar
	 * @param {boolean} isNew - Si es un usuario nuevo (requiere más campos)
	 */
	validateUserData(userData, isNew = false) {
		const errors = [];

		if (isNew) {
			// Validaciones para usuario nuevo
			if (!userData.name || userData.name.trim().length < 2) {
				errors.push("Nombre es requerido (mínimo 2 caracteres)");
			}

			if (!userData.email || !this.isValidEmail(userData.email)) {
				errors.push("Email válido es requerido");
			}

			if (!userData.password || userData.password.length < 8) {
				errors.push("Contraseña es requerida (mínimo 8 caracteres)");
			}

			if (userData.password !== userData.password_confirmation) {
				errors.push("Las contraseñas no coinciden");
			}
		}

		// Validaciones comunes
		if (userData.email && !this.isValidEmail(userData.email)) {
			errors.push("Formato de email inválido");
		}

		if (
			userData.role &&
			!Object.values(USER_ROLES).includes(parseInt(userData.role))
		) {
			errors.push("Rol de usuario inválido");
		}

		if (
			userData.active !== undefined &&
			![0, 1].includes(parseInt(userData.active))
		) {
			errors.push("Estado activo debe ser 0 o 1");
		}

		if (errors.length > 0) {
			throw new Error(errors.join(", "));
		}
	}

	/**
	 * Validar formato de email
	 * @param {string} email - Email a validar
	 * @returns {boolean} Si es válido
	 */
	isValidEmail(email) {
		const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
		return emailRegex.test(email);
	}

	/**
	 * Verificar si el cache de usuarios es válido
	 * @returns {boolean} Si el cache es válido
	 */
	isUserseCacheValid() {
		return (
			this.usersCache &&
			this.lastCacheUpdate &&
			Date.now() - this.lastCacheUpdate < this.cacheTimeout
		);
	}

	/**
	 * Actualizar cache de usuarios
	 * @param {Array} users - Datos de usuarios
	 */
	updateUsersCache(users) {
		this.usersCache = users;
		this.lastCacheUpdate = Date.now();
	}

	/**
	 * Invalidar cache de usuarios
	 */
	invalidateUsersCache() {
		this.usersCache = null;
		this.lastCacheUpdate = null;
	}
}

// Crear y exportar instancia singleton
export const userService = new UserService();
