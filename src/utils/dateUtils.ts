// src/utils/dateUtils.js

/**
 * Utilidades para manejo de fechas en la aplicación
 */

/**
 * Formatear fecha a string legible
 * @param {Date|string} date - Fecha a formatear
 * @param {string} format - Formato deseado ('short', 'long', 'iso', 'date-only')
 * @returns {string} Fecha formateada
 */
export function formatDate(date, format = "short") {
	if (!date) return "";

	const dateObj = new Date(date);
	if (isNaN(dateObj.getTime())) return "";

	const options = {
		short: {
			year: "numeric",
			month: "2-digit",
			day: "2-digit",
		},
		long: {
			year: "numeric",
			month: "long",
			day: "numeric",
			hour: "2-digit",
			minute: "2-digit",
		},
		iso: null, // Manejo especial
		"date-only": {
			year: "numeric",
			month: "2-digit",
			day: "2-digit",
		},
	};

	if (format === "iso") {
		return dateObj.toISOString().split("T")[0];
	}

	return dateObj.toLocaleDateString("es-EC", options[format] || options.short);
}

/**
 * Formatear fecha y hora
 * @param {Date|string} date - Fecha a formatear
 * @returns {string} Fecha y hora formateadas
 */
export function formatDateTime(date) {
	if (!date) return "";

	const dateObj = new Date(date);
	if (isNaN(dateObj.getTime())) return "";

	return dateObj.toLocaleDateString("es-EC", {
		year: "numeric",
		month: "2-digit",
		day: "2-digit",
		hour: "2-digit",
		minute: "2-digit",
	});
}

/**
 * Obtener fecha relativa (hace X días, etc.)
 * @param {Date|string} date - Fecha
 * @returns {string} Fecha relativa
 */
export function getRelativeDate(date) {
	if (!date) return "";

	const dateObj = new Date(date);
	if (isNaN(dateObj.getTime())) return "";

	const now = new Date();
	const diffMs = now - dateObj;
	const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
	const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
	const diffMinutes = Math.floor(diffMs / (1000 * 60));

	if (diffMinutes < 1) return "hace un momento";
	if (diffMinutes < 60)
		return `hace ${diffMinutes} minuto${diffMinutes > 1 ? "s" : ""}`;
	if (diffHours < 24)
		return `hace ${diffHours} hora${diffHours > 1 ? "s" : ""}`;
	if (diffDays < 7) return `hace ${diffDays} día${diffDays > 1 ? "s" : ""}`;
	if (diffDays < 30)
		return `hace ${Math.floor(diffDays / 7)} semana${
			Math.floor(diffDays / 7) > 1 ? "s" : ""
		}`;
	if (diffDays < 365)
		return `hace ${Math.floor(diffDays / 30)} mes${
			Math.floor(diffDays / 30) > 1 ? "es" : ""
		}`;

	return `hace ${Math.floor(diffDays / 365)} año${
		Math.floor(diffDays / 365) > 1 ? "s" : ""
	}`;
}

/**
 * Verificar si una fecha está expirada
 * @param {Date|string} date - Fecha a verificar
 * @returns {boolean} Si está expirada
 */
export function isExpired(date) {
	if (!date) return false;

	const dateObj = new Date(date);
	if (isNaN(dateObj.getTime())) return false;

	return dateObj < new Date();
}

/**
 * Verificar si una fecha está en el futuro
 * @param {Date|string} date - Fecha a verificar
 * @returns {boolean} Si está en el futuro
 */
export function isFuture(date) {
	if (!date) return false;

	const dateObj = new Date(date);
	if (isNaN(dateObj.getTime())) return false;

	return dateObj > new Date();
}

/**
 * Obtener días restantes hasta una fecha
 * @param {Date|string} date - Fecha objetivo
 * @returns {number} Días restantes (negativo si ya pasó)
 */
export function getDaysUntil(date) {
	if (!date) return 0;

	const dateObj = new Date(date);
	if (isNaN(dateObj.getTime())) return 0;

	const now = new Date();
	const diffMs = dateObj - now;
	return Math.ceil(diffMs / (1000 * 60 * 60 * 24));
}

/**
 * Convertir fecha a formato ISO para input date
 * @param {Date|string} date - Fecha
 * @returns {string} Fecha en formato YYYY-MM-DD
 */
export function toInputDate(date) {
	if (!date) return "";

	const dateObj = new Date(date);
	if (isNaN(dateObj.getTime())) return "";

	return dateObj.toISOString().split("T")[0];
}

/**
 * Agregar días a una fecha
 * @param {Date|string} date - Fecha base
 * @param {number} days - Días a agregar
 * @returns {Date} Nueva fecha
 */
export function addDays(date, days) {
	const dateObj = new Date(date);
	dateObj.setDate(dateObj.getDate() + days);
	return dateObj;
}

/**
 * Obtener el primer día del mes
 * @param {Date|string} date - Fecha de referencia
 * @returns {Date} Primer día del mes
 */
export function getFirstDayOfMonth(date = new Date()) {
	const dateObj = new Date(date);
	return new Date(dateObj.getFullYear(), dateObj.getMonth(), 1);
}

/**
 * Obtener el último día del mes
 * @param {Date|string} date - Fecha de referencia
 * @returns {Date} Último día del mes
 */
export function getLastDayOfMonth(date = new Date()) {
	const dateObj = new Date(date);
	return new Date(dateObj.getFullYear(), dateObj.getMonth() + 1, 0);
}

/**
 * Verificar si dos fechas son del mismo día
 * @param {Date|string} date1 - Primera fecha
 * @param {Date|string} date2 - Segunda fecha
 * @returns {boolean} Si son del mismo día
 */
export function isSameDay(date1, date2) {
	const d1 = new Date(date1);
	const d2 = new Date(date2);

	return (
		d1.getFullYear() === d2.getFullYear() &&
		d1.getMonth() === d2.getMonth() &&
		d1.getDate() === d2.getDate()
	);
}

/**
 * Obtener el nombre del día de la semana
 * @param {Date|string} date - Fecha
 * @param {boolean} short - Si usar formato corto
 * @returns {string} Nombre del día
 */
export function getDayName(date, short = false) {
	const dateObj = new Date(date);
	const options = {weekday: short ? "short" : "long"};
	return dateObj.toLocaleDateString("es-EC", options);
}

/**
 * Obtener el nombre del mes
 * @param {Date|string} date - Fecha
 * @param {boolean} short - Si usar formato corto
 * @returns {string} Nombre del mes
 */
export function getMonthName(date, short = false) {
	const dateObj = new Date(date);
	const options = {month: short ? "short" : "long"};
	return dateObj.toLocaleDateString("es-EC", options);
}

/**
 * Validar si una string es una fecha válida
 * @param {string} dateString - String de fecha
 * @returns {boolean} Si es válida
 */
export function isValidDate(dateString) {
	const date = new Date(dateString);
	return !isNaN(date.getTime());
}

/**
 * Obtener edad en años
 * @param {Date|string} birthDate - Fecha de nacimiento
 * @returns {number} Edad en años
 */
export function getAge(birthDate) {
	const birth = new Date(birthDate);
	const now = new Date();
	let age = now.getFullYear() - birth.getFullYear();
	const monthDiff = now.getMonth() - birth.getMonth();

	if (monthDiff < 0 || (monthDiff === 0 && now.getDate() < birth.getDate())) {
		age--;
	}

	return age;
}

// Constantes útiles
export const DATE_FORMATS = {
	ISO: "iso",
	SHORT: "short",
	LONG: "long",
	DATE_ONLY: "date-only",
};

export const DAYS_OF_WEEK = [
	"Domingo",
	"Lunes",
	"Martes",
	"Miércoles",
	"Jueves",
	"Viernes",
	"Sábado",
];

export const MONTHS = [
	"Enero",
	"Febrero",
	"Marzo",
	"Abril",
	"Mayo",
	"Junio",
	"Julio",
	"Agosto",
	"Septiembre",
	"Octubre",
	"Noviembre",
	"Diciembre",
];

export default {
	formatDate,
	formatDateTime,
	getRelativeDate,
	isExpired,
	isFuture,
	getDaysUntil,
	toInputDate,
	addDays,
	getFirstDayOfMonth,
	getLastDayOfMonth,
	isSameDay,
	getDayName,
	getMonthName,
	isValidDate,
	getAge,
	DATE_FORMATS,
	DAYS_OF_WEEK,
	MONTHS,
};
