// src/utils/validators.js
import {VALIDATION_RULES, USER_ROLES} from "./constants";

/**
 * Validar formato de email
 * @param {string} email - Email a validar
 * @returns {Object} { isValid: boolean, error?: string }
 */
export function validateEmail(email) {
	if (!email) {
		return {isValid: false, error: VALIDATION_RULES.EMAIL.REQUIRED};
	}

	if (email.length > 255) {
		return {isValid: false, error: VALIDATION_RULES.EMAIL.MAX_LENGTH};
	}

	const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
	if (!emailRegex.test(email)) {
		return {isValid: false, error: VALIDATION_RULES.EMAIL.INVALID};
	}

	return {isValid: true};
}

/**
 * Validar contraseña
 * @param {string} password - Contraseña a validar
 * @param {string} confirmation - Confirmación de contraseña (opcional)
 * @returns {Object} { isValid: boolean, error?: string, strength?: string }
 */
export function validatePassword(password, confirmation = null) {
	if (!password) {
		return {isValid: false, error: VALIDATION_RULES.PASSWORD.REQUIRED};
	}

	if (password.length < 8) {
		return {isValid: false, error: VALIDATION_RULES.PASSWORD.MIN_LENGTH};
	}

	// Verificar confirmación si se proporciona
	if (confirmation !== null && password !== confirmation) {
		return {isValid: false, error: VALIDATION_RULES.PASSWORD.CONFIRMATION};
	}

	// Calcular fortaleza de contraseña
	const strength = calculatePasswordStrength(password);

	// Considerar débil si no cumple con criterios mínimos
	if (strength.score < 3) {
		return {
			isValid: false,
			error: VALIDATION_RULES.PASSWORD.WEAK,
			strength: strength.level,
		};
	}

	return {
		isValid: true,
		strength: strength.level,
	};
}

/**
 * Calcular fortaleza de contraseña
 * @param {string} password - Contraseña a evaluar
 * @returns {Object} { score: number, level: string, feedback: Array }
 */
export function calculatePasswordStrength(password) {
	let score = 0;
	const feedback = [];

	if (!password) {
		return {score: 0, level: "very-weak", feedback: ["Contraseña requerida"]};
	}

	// Longitud
	if (password.length >= 8) score += 1;
	else feedback.push("Mínimo 8 caracteres");

	if (password.length >= 12) score += 1;

	// Mayúsculas
	if (/[A-Z]/.test(password)) score += 1;
	else feedback.push("Al menos una mayúscula");

	// Minúsculas
	if (/[a-z]/.test(password)) score += 1;
	else feedback.push("Al menos una minúscula");

	// Números
	if (/\d/.test(password)) score += 1;
	else feedback.push("Al menos un número");

	// Símbolos
	if (/[^A-Za-z0-9]/.test(password)) score += 1;
	else feedback.push("Al menos un símbolo especial");

	// Patrones comunes (restar puntos)
	if (/(.)\1{2,}/.test(password)) {
		score -= 1;
		feedback.push("Evitar caracteres repetidos");
	}

	// Determinar nivel
	let level;
	if (score < 2) level = "very-weak";
	else if (score < 4) level = "weak";
	else if (score < 6) level = "medium";
	else level = "strong";

	return {score, level, feedback};
}

/**
 * Validar nombre
 * @param {string} name - Nombre a validar
 * @returns {Object} { isValid: boolean, error?: string }
 */
export function validateName(name) {
	if (!name || !name.trim()) {
		return {isValid: false, error: VALIDATION_RULES.NAME.REQUIRED};
	}

	const trimmedName = name.trim();

	if (trimmedName.length < 2) {
		return {isValid: false, error: VALIDATION_RULES.NAME.MIN_LENGTH};
	}

	if (trimmedName.length > 255) {
		return {isValid: false, error: VALIDATION_RULES.NAME.MAX_LENGTH};
	}

	// Verificar que no contenga solo números o caracteres especiales
	if (!/[a-zA-ZáéíóúÁÉÍÓÚñÑ]/.test(trimmedName)) {
		return {
			isValid: false,
			error: "El nombre debe contener al menos una letra",
		};
	}

	return {isValid: true};
}

/**
 * Validar cédula ecuatoriana
 * @param {string} ci - Cédula a validar
 * @returns {Object} { isValid: boolean, error?: string }
 */
export function validateCI(ci) {
	if (!ci) {
		return {isValid: false, error: VALIDATION_RULES.CI.REQUIRED};
	}

	// Limpiar espacios y guiones
	const cleanCI = ci.replace(/[\s-]/g, "");

	// Verificar longitud
	if (cleanCI.length !== 10) {
		return {isValid: false, error: VALIDATION_RULES.CI.LENGTH};
	}

	// Verificar que sean solo números
	if (!/^\d{10}$/.test(cleanCI)) {
		return {isValid: false, error: "La cédula debe contener solo números"};
	}

	// Validar algoritmo de cédula ecuatoriana
	const digits = cleanCI.split("").map(Number);
	const province = parseInt(cleanCI.substring(0, 2));

	// Verificar código de provincia (01-24)
	if (province < 1 || province > 24) {
		return {isValid: false, error: "Código de provincia inválido"};
	}

	// Algoritmo de validación
	const coefficients = [2, 1, 2, 1, 2, 1, 2, 1, 2];
	let sum = 0;

	for (let i = 0; i < 9; i++) {
		let product = digits[i] * coefficients[i];
		if (product > 9) product -= 9;
		sum += product;
	}

	const verifier = sum % 10 === 0 ? 0 : 10 - (sum % 10);

	if (verifier !== digits[9]) {
		return {isValid: false, error: VALIDATION_RULES.CI.INVALID};
	}

	return {isValid: true};
}

/**
 * Validar teléfono
 * @param {string} phone - Teléfono a validar
 * @returns {Object} { isValid: boolean, error?: string }
 */
export function validatePhone(phone) {
	if (!phone) {
		return {isValid: true}; // Teléfono es opcional
	}

	// Limpiar espacios, guiones y paréntesis
	const cleanPhone = phone.replace(/[\s()-]/g, "");

	if (cleanPhone.length > 20) {
		return {isValid: false, error: VALIDATION_RULES.PHONE.MAX_LENGTH};
	}

	// Verificar formato básico (números y símbolos permitidos)
	if (!/^[+]?[\d\s()-]{7,20}$/.test(phone)) {
		return {isValid: false, error: VALIDATION_RULES.PHONE.INVALID};
	}

	return {isValid: true};
}

/**
 * Validar rol de usuario
 * @param {number|string} role - Rol a validar
 * @returns {Object} { isValid: boolean, error?: string }
 */
export function validateUserRole(role) {
	const numericRole = parseInt(role);

	if (isNaN(numericRole)) {
		return {isValid: false, error: "El rol debe ser un número"};
	}

	if (!Object.values(USER_ROLES).includes(numericRole)) {
		return {isValid: false, error: "Rol de usuario inválido"};
	}

	return {isValid: true};
}

/**
 * Validar datos completos de usuario
 * @param {Object} userData - Datos del usuario
 * @param {Object} options - Opciones de validación
 * @returns {Object} { isValid: boolean, errors: Object }
 */
export function validateUserData(userData, options = {}) {
	const {isNew = false, requirePassword = false} = options;
	const errors = {};

	// Validar nombre
	if (isNew || userData.name !== undefined) {
		const nameValidation = validateName(userData.name);
		if (!nameValidation.isValid) {
			errors.name = nameValidation.error;
		}
	}

	// Validar email
	if (isNew || userData.email !== undefined) {
		const emailValidation = validateEmail(userData.email);
		if (!emailValidation.isValid) {
			errors.email = emailValidation.error;
		}
	}

	// Validar contraseña
	if (requirePassword || userData.password) {
		const passwordValidation = validatePassword(
			userData.password,
			userData.password_confirmation
		);
		if (!passwordValidation.isValid) {
			errors.password = passwordValidation.error;
		}
	}

	// Validar cédula
	if (userData.ci !== undefined) {
		const ciValidation = validateCI(userData.ci);
		if (!ciValidation.isValid) {
			errors.ci = ciValidation.error;
		}
	}

	// Validar teléfono
	if (userData.phone !== undefined) {
		const phoneValidation = validatePhone(userData.phone);
		if (!phoneValidation.isValid) {
			errors.phone = phoneValidation.error;
		}
	}

	// Validar rol
	if (userData.role !== undefined) {
		const roleValidation = validateUserRole(userData.role);
		if (!roleValidation.isValid) {
			errors.role = roleValidation.error;
		}
	}

	return {
		isValid: Object.keys(errors).length === 0,
		errors,
	};
}

/**
 * Validar archivo subido
 * @param {File} file - Archivo a validar
 * @param {Object} options - Opciones de validación
 * @returns {Object} { isValid: boolean, error?: string }
 */
export function validateFile(file, options = {}) {
	const {
		maxSize = 10 * 1024 * 1024, // 10MB por defecto
		allowedTypes = ["image/jpeg", "image/png", "image/gif", "application/pdf"],
		required = false,
	} = options;

	if (!file) {
		if (required) {
			return {isValid: false, error: "Archivo requerido"};
		}
		return {isValid: true};
	}

	// Validar tamaño
	if (file.size > maxSize) {
		const maxSizeMB = Math.round(maxSize / (1024 * 1024));
		return {
			isValid: false,
			error: `Archivo muy grande. Máximo ${maxSizeMB}MB`,
		};
	}

	// Validar tipo
	if (!allowedTypes.includes(file.type)) {
		return {
			isValid: false,
			error: `Tipo de archivo no permitido. Permitidos: ${allowedTypes.join(
				", "
			)}`,
		};
	}

	return {isValid: true};
}

/**
 * Validar formulario completo
 * @param {Object} formData - Datos del formulario
 * @param {Object} validationRules - Reglas de validación
 * @returns {Object} { isValid: boolean, errors: Object }
 */
export function validateForm(formData, validationRules) {
	const errors = {};

	Object.keys(validationRules).forEach((field) => {
		const rules = validationRules[field];
		const value = formData[field];

		// Requerido
		if (rules.required && (!value || value.toString().trim() === "")) {
			errors[field] = rules.required;
			return;
		}

		// Si el campo está vacío y no es requerido, saltar otras validaciones
		if (!value || value.toString().trim() === "") {
			return;
		}

		// Patrón
		if (rules.pattern && !rules.pattern.test(value)) {
			errors[field] = rules.patternMessage || "Formato inválido";
			return;
		}

		// Longitud mínima
		if (rules.minLength && value.length < rules.minLength) {
			errors[field] =
				rules.minLengthMessage || `Mínimo ${rules.minLength} caracteres`;
			return;
		}

		// Longitud máxima
		if (rules.maxLength && value.length > rules.maxLength) {
			errors[field] =
				rules.maxLengthMessage || `Máximo ${rules.maxLength} caracteres`;
			return;
		}

		// Validación personalizada
		if (rules.custom && !rules.custom(value, formData)) {
			errors[field] = rules.customMessage || "Valor inválido";
			return;
		}
	});

	return {
		isValid: Object.keys(errors).length === 0,
		errors,
	};
}

// Export de utilidades adicionales
export const validators = {
	email: validateEmail,
	password: validatePassword,
	name: validateName,
	ci: validateCI,
	phone: validatePhone,
	userRole: validateUserRole,
	userData: validateUserData,
	file: validateFile,
	form: validateForm,
	passwordStrength: calculatePasswordStrength,
};
