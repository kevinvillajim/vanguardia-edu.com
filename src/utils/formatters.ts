// src/utils/formatters.js

/**
 * Utilidades para formatear diferentes tipos de datos
 */

/**
 * Formatear número como porcentaje
 * @param {number} value - Valor a formatear (0-1 o 0-100)
 * @param {boolean} isDecimal - Si el valor está en decimal (0-1)
 * @param {number} decimals - Número de decimales
 * @returns {string} Porcentaje formateado
 */
export function formatPercentage(value, isDecimal = true, decimals = 0) {
	if (value === null || value === undefined) return "0%";

	const numValue = Number(value);
	if (isNaN(numValue)) return "0%";

	const percentage = isDecimal ? numValue * 100 : numValue;
	return `${percentage.toFixed(decimals)}%`;
}

/**
 * Formatear número como moneda
 * @param {number} amount - Cantidad
 * @param {string} currency - Código de moneda
 * @param {string} locale - Locale para formato
 * @returns {string} Moneda formateada
 */
export function formatCurrency(amount, currency = "USD", locale = "es-EC") {
	if (amount === null || amount === undefined) return "$0.00";

	const numAmount = Number(amount);
	if (isNaN(numAmount)) return "$0.00";

	try {
		return new Intl.NumberFormat(locale, {
			style: "currency",
			currency: currency,
		}).format(numAmount);
	} catch (error) {
		// Fallback si hay error con Intl
		return `$${numAmount.toFixed(2)}`;
	}
}

/**
 * Formatear número grande con abreviaciones (K, M, B)
 * @param {number} num - Número a formatear
 * @param {number} digits - Dígitos decimales
 * @returns {string} Número formateado
 */
export function formatLargeNumber(num, digits = 1) {
	if (num === null || num === undefined) return "0";

	const numValue = Number(num);
	if (isNaN(numValue)) return "0";

	const si = [
		{value: 1e9, symbol: "B"},
		{value: 1e6, symbol: "M"},
		{value: 1e3, symbol: "K"},
	];

	for (let i = 0; i < si.length; i++) {
		if (numValue >= si[i].value) {
			return (
				(numValue / si[i].value)
					.toFixed(digits)
					.replace(/\.0+$|(\.[0-9]*[1-9])0+$/, "$1") + si[i].symbol
			);
		}
	}

	return numValue.toString();
}

/**
 * Formatear nombre propio (capitalizar primera letra de cada palabra)
 * @param {string} name - Nombre a formatear
 * @returns {string} Nombre formateado
 */
export function formatName(name) {
	if (!name || typeof name !== "string") return "";

	return name
		.toLowerCase()
		.split(" ")
		.map((word) => word.charAt(0).toUpperCase() + word.slice(1))
		.join(" ");
}

/**
 * Formatear email (convertir a minúsculas y limpiar espacios)
 * @param {string} email - Email a formatear
 * @returns {string} Email formateado
 */
export function formatEmail(email) {
	if (!email || typeof email !== "string") return "";

	return email.toLowerCase().trim();
}

/**
 * Formatear cédula ecuatoriana con guiones
 * @param {string} ci - Cédula a formatear
 * @returns {string} Cédula formateada
 */
export function formatCI(ci) {
	if (!ci || typeof ci !== "string") return "";

	// Limpiar caracteres no numéricos
	const cleanCI = ci.replace(/\D/g, "");

	if (cleanCI.length === 10) {
		return `${cleanCI.slice(0, 2)}-${cleanCI.slice(2, 9)}-${cleanCI.slice(9)}`;
	}

	return cleanCI;
}

/**
 * Formatear número de teléfono
 * @param {string} phone - Teléfono a formatear
 * @returns {string} Teléfono formateado
 */
export function formatPhone(phone) {
	if (!phone || typeof phone !== "string") return "";

	// Limpiar caracteres no numéricos excepto +
	const cleanPhone = phone.replace(/[^\d+]/g, "");

	// Si empieza con +593 (Ecuador)
	if (cleanPhone.startsWith("+593")) {
		const number = cleanPhone.slice(4);
		if (number.length === 9) {
			return `+593 ${number.slice(0, 1)} ${number.slice(1, 4)} ${number.slice(
				4,
				7
			)} ${number.slice(7)}`;
		}
	}

	// Si empieza con 593
	if (cleanPhone.startsWith("593") && cleanPhone.length === 12) {
		const number = cleanPhone.slice(3);
		return `+593 ${number.slice(0, 1)} ${number.slice(1, 4)} ${number.slice(
			4,
			7
		)} ${number.slice(7)}`;
	}

	// Formato local ecuatoriano (10 dígitos)
	if (cleanPhone.length === 10 && cleanPhone.startsWith("0")) {
		return `${cleanPhone.slice(0, 3)} ${cleanPhone.slice(
			3,
			6
		)} ${cleanPhone.slice(6)}`;
	}

	return cleanPhone;
}

/**
 * Formatear texto para URL (slug)
 * @param {string} text - Texto a formatear
 * @returns {string} Slug formateado
 */
export function formatSlug(text) {
	if (!text || typeof text !== "string") return "";

	return text
		.toLowerCase()
		.normalize("NFD")
		.replace(/[\u0300-\u036f]/g, "") // Remover acentos
		.replace(/[^a-z0-9 -]/g, "") // Solo letras, números, espacios y guiones
		.replace(/\s+/g, "-") // Espacios a guiones
		.replace(/-+/g, "-") // Múltiples guiones a uno
		.trim()
		.replace(/^-+|-+$/g, ""); // Remover guiones al inicio y final
}

/**
 * Formatear tamaño de archivo
 * @param {number} bytes - Tamaño en bytes
 * @param {number} decimals - Decimales a mostrar
 * @returns {string} Tamaño formateado
 */
export function formatFileSize(bytes, decimals = 2) {
	if (bytes === 0) return "0 Bytes";
	if (!bytes || isNaN(bytes)) return "0 Bytes";

	const k = 1024;
	const dm = decimals < 0 ? 0 : decimals;
	const sizes = ["Bytes", "KB", "MB", "GB", "TB"];

	const i = Math.floor(Math.log(bytes) / Math.log(k));

	return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + " " + sizes[i];
}

/**
 * Truncar texto con puntos suspensivos
 * @param {string} text - Texto a truncar
 * @param {number} length - Longitud máxima
 * @param {string} suffix - Sufijo a agregar
 * @returns {string} Texto truncado
 */
export function truncateText(text, length = 100, suffix = "...") {
	if (!text || typeof text !== "string") return "";

	if (text.length <= length) return text;

	return text.slice(0, length - suffix.length) + suffix;
}

/**
 * Formatear duración en minutos a texto legible
 * @param {number} minutes - Minutos
 * @returns {string} Duración formateada
 */
export function formatDuration(minutes) {
	if (!minutes || isNaN(minutes)) return "0 min";

	const hours = Math.floor(minutes / 60);
	const mins = minutes % 60;

	if (hours === 0) {
		return `${mins} min`;
	}

	if (mins === 0) {
		return `${hours} h`;
	}

	return `${hours} h ${mins} min`;
}

/**
 * Formatear tiempo en segundos a MM:SS
 * @param {number} seconds - Segundos
 * @returns {string} Tiempo formateado
 */
export function formatTime(seconds) {
	if (!seconds || isNaN(seconds)) return "00:00";

	const mins = Math.floor(seconds / 60);
	const secs = Math.floor(seconds % 60);

	return `${mins.toString().padStart(2, "0")}:${secs
		.toString()
		.padStart(2, "0")}`;
}

/**
 * Formatear número de score/calificación
 * @param {number} score - Puntuación
 * @param {number} maxScore - Puntuación máxima
 * @returns {string} Score formateado
 */
export function formatScore(score, maxScore = 100) {
	if (score === null || score === undefined) return `0/${maxScore}`;

	const numScore = Number(score);
	if (isNaN(numScore)) return `0/${maxScore}`;

	return `${numScore.toFixed(0)}/${maxScore}`;
}

/**
 * Capitalizar primera letra de una string
 * @param {string} text - Texto
 * @returns {string} Texto capitalizado
 */
export function capitalize(text) {
	if (!text || typeof text !== "string") return "";

	return text.charAt(0).toUpperCase() + text.slice(1).toLowerCase();
}

/**
 * Formatear lista de elementos con comas y "y"
 * @param {Array} items - Lista de elementos
 * @param {string} conjunction - Conjunción a usar
 * @returns {string} Lista formateada
 */
export function formatList(items, conjunction = "y") {
	if (!Array.isArray(items) || items.length === 0) return "";

	if (items.length === 1) return items[0];
	if (items.length === 2) return `${items[0]} ${conjunction} ${items[1]}`;

	const lastItem = items[items.length - 1];
	const otherItems = items.slice(0, -1);

	return `${otherItems.join(", ")} ${conjunction} ${lastItem}`;
}

/**
 * Formatear rol de usuario
 * @param {number|string} role - Rol numérico
 * @returns {string} Nombre del rol
 */
export function formatUserRole(role) {
	const roles = {
		1: "Administrador",
		2: "Estudiante",
		3: "Profesor",
	};

	return roles[parseInt(role)] || "Desconocido";
}

/**
 * Formatear estado activo/inactivo
 * @param {number|boolean} active - Estado activo
 * @returns {string} Estado formateado
 */
export function formatActiveStatus(active) {
	const isActive = Boolean(Number(active));
	return isActive ? "Activo" : "Inactivo";
}

// Export default con todas las funciones
export default {
	formatPercentage,
	formatCurrency,
	formatLargeNumber,
	formatName,
	formatEmail,
	formatCI,
	formatPhone,
	formatSlug,
	formatFileSize,
	truncateText,
	formatDuration,
	formatTime,
	formatScore,
	capitalize,
	formatList,
	formatUserRole,
	formatActiveStatus,
};
