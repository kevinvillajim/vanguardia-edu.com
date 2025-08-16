// src/utils/validation.js
// Reglas de validación para formularios

export const validationRules = {
	// Validación requerida
	required: (message = "Este campo es requerido") => (value) => {
		if (!value || (typeof value === "string" && !value.trim())) {
			return message;
		}
		return null;
	},

	// Validación de email
	email: (message = "Formato de email inválido") => (value) => {
		if (!value) return null;
		const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
		if (!emailRegex.test(value)) {
			return message;
		}
		return null;
	},

	// Validación de longitud mínima
	minLength: (min, message) => (value) => {
		if (!value) return null;
		if (value.length < min) {
			return message || `Debe tener al menos ${min} caracteres`;
		}
		return null;
	},

	// Validación de longitud máxima
	maxLength: (max, message) => (value) => {
		if (!value) return null;
		if (value.length > max) {
			return message || `No puede tener más de ${max} caracteres`;
		}
		return null;
	},

	// Validación de contraseña fuerte
	passwordStrength: (message = "La contraseña debe tener al menos 8 caracteres, incluir mayúsculas, minúsculas y números") => (value) => {
		if (!value) return null;
		
		const hasMinLength = value.length >= 8;
		const hasUpperCase = /[A-Z]/.test(value);
		const hasLowerCase = /[a-z]/.test(value);
		const hasNumber = /\d/.test(value);
		
		if (!hasMinLength || !hasUpperCase || !hasLowerCase || !hasNumber) {
			return message;
		}
		return null;
	},

	// Validación de coincidencia de campos
	matchField: (fieldName, message) => (value, formValues) => {
		if (!value) return null;
		if (value !== formValues[fieldName]) {
			return message || `No coincide con ${fieldName}`;
		}
		return null;
	},

	// Validación de teléfono
	phone: (message = "Formato de teléfono inválido") => (value) => {
		if (!value) return null;
		// Formato ecuatoriano: +593 99 123 4567 o variaciones
		const phoneRegex = /^(\+593|0)[0-9]{9,10}$/;
		if (!phoneRegex.test(value.replace(/\s/g, ""))) {
			return message;
		}
		return null;
	},

	// Validación de cédula ecuatoriana
	ecuadorianCI: (message = "Cédula ecuatoriana inválida") => (value) => {
		if (!value) return null;
		
		// Debe tener 10 dígitos
		if (!/^\d{10}$/.test(value)) {
			return message;
		}

		// Algoritmo de validación de cédula ecuatoriana
		const digits = value.split('').map(Number);
		const provinceCode = parseInt(value.substring(0, 2));
		
		// Verificar código de provincia (01-24)
		if (provinceCode < 1 || provinceCode > 24) {
			return message;
		}

		// Cálculo del dígito verificador
		const coefficients = [2, 1, 2, 1, 2, 1, 2, 1, 2];
		let sum = 0;

		for (let i = 0; i < 9; i++) {
			let product = digits[i] * coefficients[i];
			if (product >= 10) {
				product = Math.floor(product / 10) + (product % 10);
			}
			sum += product;
		}

		const remainder = sum % 10;
		const verifierDigit = remainder === 0 ? 0 : 10 - remainder;

		if (digits[9] !== verifierDigit) {
			return message;
		}

		return null;
	},

	// Validación de número
	number: (message = "Debe ser un número válido") => (value) => {
		if (!value) return null;
		if (isNaN(Number(value))) {
			return message;
		}
		return null;
	},

	// Validación de rango numérico
	range: (min, max, message) => (value) => {
		if (!value) return null;
		const num = Number(value);
		if (isNaN(num) || num < min || num > max) {
			return message || `Debe estar entre ${min} y ${max}`;
		}
		return null;
	},

	// Validación personalizada
	custom: (validatorFn, message) => (value, formValues) => {
		if (!validatorFn(value, formValues)) {
			return message || "Valor inválido";
		}
		return null;
	}
};

// Función helper para validar un campo
export const validateField = (value, rules = [], formValues = {}) => {
	for (const rule of rules) {
		const error = rule(value, formValues);
		if (error) {
			return error;
		}
	}
	return null;
};

// Función helper para validar todo un formulario
export const validateForm = (formValues, validationSchema) => {
	const errors = {};
	
	for (const [fieldName, rules] of Object.entries(validationSchema)) {
		const error = validateField(formValues[fieldName], rules, formValues);
		if (error) {
			errors[fieldName] = error;
		}
	}
	
	return errors;
};

export default validationRules;