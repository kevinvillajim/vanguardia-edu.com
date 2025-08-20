// src/utils/storage.js

import {APP_CONFIG} from "./constants";
import {encryptData, decryptData} from "./crypto";

/**
 * Utilidades para manejo de almacenamiento local y sesión
 */

/**
 * Verificar si localStorage está disponible
 * @returns {boolean} Si localStorage está disponible
 */
export function isLocalStorageAvailable() {
	try {
		const test = "__localStorage_test__";
		localStorage.setItem(test, test);
		localStorage.removeItem(test);
		return true;
	} catch (error) {
		return false;
	}
}

/**
 * Verificar si sessionStorage está disponible
 * @returns {boolean} Si sessionStorage está disponible
 */
export function isSessionStorageAvailable() {
	try {
		const test = "__sessionStorage_test__";
		sessionStorage.setItem(test, test);
		sessionStorage.removeItem(test);
		return true;
	} catch (error) {
		return false;
	}
}

/**
 * Guardar datos en localStorage de forma segura
 * @param {string} key - Clave
 * @param {any} value - Valor a guardar
 * @param {boolean} encrypt - Si encriptar los datos
 * @returns {boolean} Si se guardó exitosamente
 */
export function setLocalStorage(key, value, encrypt = false) {
	if (!isLocalStorageAvailable()) {
		console.warn("localStorage no está disponible");
		return false;
	}

	try {
		const serializedValue = JSON.stringify(value);
		const finalValue = encrypt ? encryptData(serializedValue) : serializedValue;

		localStorage.setItem(key, finalValue);
		return true;
	} catch (error) {
		console.error("Error guardando en localStorage:", error);
		return false;
	}
}

/**
 * Obtener datos de localStorage de forma segura
 * @param {string} key - Clave
 * @param {any} defaultValue - Valor por defecto
 * @param {boolean} encrypted - Si los datos están encriptados
 * @returns {any} Valor obtenido o valor por defecto
 */
export function getLocalStorage(key, defaultValue = null, encrypted = false) {
	if (!isLocalStorageAvailable()) {
		return defaultValue;
	}

	try {
		const item = localStorage.getItem(key);
		if (item === null) return defaultValue;

		const value = encrypted ? decryptData(item) : item;
		return JSON.parse(value);
	} catch (error) {
		console.error("Error leyendo de localStorage:", error);
		return defaultValue;
	}
}

/**
 * Remover item de localStorage
 * @param {string} key - Clave a remover
 * @returns {boolean} Si se removió exitosamente
 */
export function removeLocalStorage(key) {
	if (!isLocalStorageAvailable()) {
		return false;
	}

	try {
		localStorage.removeItem(key);
		return true;
	} catch (error) {
		console.error("Error removiendo de localStorage:", error);
		return false;
	}
}

/**
 * Limpiar todo el localStorage
 * @param {Array} keysToKeep - Claves a mantener
 * @returns {boolean} Si se limpió exitosamente
 */
export function clearLocalStorage(keysToKeep = []) {
	if (!isLocalStorageAvailable()) {
		return false;
	}

	try {
		if (keysToKeep.length === 0) {
			localStorage.clear();
		} else {
			// Guardar valores a mantener
			const valuesToKeep = {};
			keysToKeep.forEach((key) => {
				const value = localStorage.getItem(key);
				if (value !== null) {
					valuesToKeep[key] = value;
				}
			});

			// Limpiar todo
			localStorage.clear();

			// Restaurar valores a mantener
			Object.entries(valuesToKeep).forEach(([key, value]) => {
				localStorage.setItem(key, value);
			});
		}
		return true;
	} catch (error) {
		console.error("Error limpiando localStorage:", error);
		return false;
	}
}

/**
 * Guardar datos en sessionStorage de forma segura
 * @param {string} key - Clave
 * @param {any} value - Valor a guardar
 * @returns {boolean} Si se guardó exitosamente
 */
export function setSessionStorage(key, value) {
	if (!isSessionStorageAvailable()) {
		console.warn("sessionStorage no está disponible");
		return false;
	}

	try {
		const serializedValue = JSON.stringify(value);
		sessionStorage.setItem(key, serializedValue);
		return true;
	} catch (error) {
		console.error("Error guardando en sessionStorage:", error);
		return false;
	}
}

/**
 * Obtener datos de sessionStorage de forma segura
 * @param {string} key - Clave
 * @param {any} defaultValue - Valor por defecto
 * @returns {any} Valor obtenido o valor por defecto
 */
export function getSessionStorage(key, defaultValue = null) {
	if (!isSessionStorageAvailable()) {
		return defaultValue;
	}

	try {
		const item = sessionStorage.getItem(key);
		if (item === null) return defaultValue;

		return JSON.parse(item);
	} catch (error) {
		console.error("Error leyendo de sessionStorage:", error);
		return defaultValue;
	}
}

/**
 * Remover item de sessionStorage
 * @param {string} key - Clave a remover
 * @returns {boolean} Si se removió exitosamente
 */
export function removeSessionStorage(key) {
	if (!isSessionStorageAvailable()) {
		return false;
	}

	try {
		sessionStorage.removeItem(key);
		return true;
	} catch (error) {
		console.error("Error removiendo de sessionStorage:", error);
		return false;
	}
}

/**
 * Obtener el tamaño usado en localStorage
 * @returns {number} Tamaño en bytes
 */
export function getLocalStorageSize() {
	if (!isLocalStorageAvailable()) {
		return 0;
	}

	let total = 0;
	try {
		for (let key in localStorage) {
			if (localStorage.hasOwnProperty(key)) {
				total += localStorage[key].length + key.length;
			}
		}
	} catch (error) {
		console.error("Error calculando tamaño de localStorage:", error);
	}

	return total;
}

/**
 * Verificar si localStorage está lleno
 * @returns {boolean} Si está cerca del límite
 */
export function isLocalStorageFull() {
	const maxSize = 5 * 1024 * 1024; // 5MB aproximado
	const currentSize = getLocalStorageSize();
	return currentSize > maxSize * 0.9; // 90% del límite
}

/**
 * Migrar datos de localStorage (útil para actualizaciones)
 * @param {Object} migrations - Migraciones a aplicar
 */
export function migrateLocalStorage(migrations) {
	if (!isLocalStorageAvailable()) {
		return;
	}

	try {
		Object.entries(migrations).forEach(([oldKey, newKey]) => {
			const value = localStorage.getItem(oldKey);
			if (value !== null) {
				localStorage.setItem(newKey, value);
				localStorage.removeItem(oldKey);
				console.log(`Migrated ${oldKey} to ${newKey}`);
			}
		});
	} catch (error) {
		console.error("Error en migración de localStorage:", error);
	}
}

/**
 * Backup de localStorage a un objeto
 * @param {Array} keys - Claves específicas a respaldar
 * @returns {Object} Backup de los datos
 */
export function backupLocalStorage(keys = null) {
	if (!isLocalStorageAvailable()) {
		return {};
	}

	const backup = {};

	try {
		const keysToBackup = keys || Object.keys(localStorage);

		keysToBackup.forEach((key) => {
			const value = localStorage.getItem(key);
			if (value !== null) {
				backup[key] = value;
			}
		});
	} catch (error) {
		console.error("Error creando backup de localStorage:", error);
	}

	return backup;
}

/**
 * Restaurar localStorage desde un backup
 * @param {Object} backup - Backup a restaurar
 * @param {boolean} clearFirst - Si limpiar localStorage primero
 * @returns {boolean} Si se restauró exitosamente
 */
export function restoreLocalStorage(backup, clearFirst = false) {
	if (!isLocalStorageAvailable() || !backup || typeof backup !== "object") {
		return false;
	}

	try {
		if (clearFirst) {
			localStorage.clear();
		}

		Object.entries(backup).forEach(([key, value]) => {
			localStorage.setItem(key, value);
		});

		return true;
	} catch (error) {
		console.error("Error restaurando localStorage:", error);
		return false;
	}
}

/**
 * Limpiar datos expirados del localStorage
 * @param {Array} expirationKeys - Claves que tienen datos de expiración
 */
export function cleanExpiredData(expirationKeys = []) {
	if (!isLocalStorageAvailable()) {
		return;
	}

	const now = Date.now();

	try {
		expirationKeys.forEach((key) => {
			const data = getLocalStorage(key);
			if (data && data.expiry && now > data.expiry) {
				removeLocalStorage(key);
				console.log(`Removed expired data for key: ${key}`);
			}
		});
	} catch (error) {
		console.error("Error limpiando datos expirados:", error);
	}
}

/**
 * Configurar datos con expiración
 * @param {string} key - Clave
 * @param {any} value - Valor
 * @param {number} ttl - Tiempo de vida en milisegundos
 * @param {boolean} encrypt - Si encriptar
 * @returns {boolean} Si se guardó exitosamente
 */
export function setWithExpiry(key, value, ttl, encrypt = false) {
	const now = Date.now();
	const item = {
		value: value,
		expiry: now + ttl,
	};

	return setLocalStorage(key, item, encrypt);
}

/**
 * Obtener datos con verificación de expiración
 * @param {string} key - Clave
 * @param {any} defaultValue - Valor por defecto
 * @param {boolean} encrypted - Si está encriptado
 * @returns {any} Valor o null si expiró
 */
export function getWithExpiry(key, defaultValue = null, encrypted = false) {
	const item = getLocalStorage(key, null, encrypted);

	if (!item || !item.expiry) {
		return defaultValue;
	}

	const now = Date.now();
	if (now > item.expiry) {
		removeLocalStorage(key);
		return defaultValue;
	}

	return item.value;
}

/**
 * Obtener información sobre el uso de storage
 * @returns {Object} Información de uso
 */
export function getStorageInfo() {
	return {
		localStorage: {
			available: isLocalStorageAvailable(),
			size: getLocalStorageSize(),
			isFull: isLocalStorageFull(),
			itemCount: isLocalStorageAvailable()
				? Object.keys(localStorage).length
				: 0,
		},
		sessionStorage: {
			available: isSessionStorageAvailable(),
			itemCount: isSessionStorageAvailable()
				? Object.keys(sessionStorage).length
				: 0,
		},
	};
}

// Utilidades específicas para la aplicación usando las claves de configuración
export const appStorage = {
	/**
	 * Guardar token de autenticación
	 */
	setToken: (token) => setLocalStorage(APP_CONFIG.STORAGE_KEYS.TOKEN, token),

	/**
	 * Obtener token de autenticación
	 */
	getToken: () => getLocalStorage(APP_CONFIG.STORAGE_KEYS.TOKEN),

	/**
	 * Guardar datos de usuario encriptados
	 */
	setUser: (userData) =>
		setLocalStorage(APP_CONFIG.STORAGE_KEYS.USER, userData, true),

	/**
	 * Obtener datos de usuario
	 */
	getUser: () => getLocalStorage(APP_CONFIG.STORAGE_KEYS.USER, null, true),

	/**
	 * Guardar fechas de expiración
	 */
	setExpDates: (expDates) =>
		setLocalStorage(APP_CONFIG.STORAGE_KEYS.EXP_DATES, expDates),

	/**
	 * Obtener fechas de expiración
	 */
	getExpDates: () => getLocalStorage(APP_CONFIG.STORAGE_KEYS.EXP_DATES, []),

	/**
	 * Guardar configuración de tema
	 */
	setTheme: (theme) => setLocalStorage(APP_CONFIG.STORAGE_KEYS.THEME, theme),

	/**
	 * Obtener configuración de tema
	 */
	getTheme: () => getLocalStorage(APP_CONFIG.STORAGE_KEYS.THEME, "light"),

	/**
	 * Limpiar todos los datos de la aplicación
	 */
	clearAll: () => {
		const keysToRemove = Object.values(APP_CONFIG.STORAGE_KEYS);
		keysToRemove.forEach((key) => removeLocalStorage(key));

		// Limpiar datos de cursos
		Object.keys(localStorage).forEach((key) => {
			if (key.startsWith("Course")) {
				removeLocalStorage(key);
			}
		});
	},
};

export default {
	// Funciones básicas
	isLocalStorageAvailable,
	isSessionStorageAvailable,
	setLocalStorage,
	getLocalStorage,
	removeLocalStorage,
	clearLocalStorage,
	setSessionStorage,
	getSessionStorage,
	removeSessionStorage,

	// Funciones avanzadas
	getLocalStorageSize,
	isLocalStorageFull,
	migrateLocalStorage,
	backupLocalStorage,
	restoreLocalStorage,
	cleanExpiredData,
	setWithExpiry,
	getWithExpiry,
	getStorageInfo,

	// Utilidades específicas de la app
	appStorage,
};
