// src/hooks/useForm.js
import {useState, useCallback} from "react";

export const useForm = (initialValues = {}, validationRules = {}) => {
	const [values, setValues] = useState(initialValues);
	const [errors, setErrors] = useState({});
	const [touched, setTouched] = useState({});
	const [isSubmitting, setIsSubmitting] = useState(false);

	const validate = useCallback(
		(fieldName, value) => {
			const rules = validationRules[fieldName];
			if (!rules) return "";

			for (const rule of rules) {
				const error = rule(value, values);
				if (error) return error;
			}
			return "";
		},
		[validationRules, values]
	);

	const validateAll = useCallback(() => {
		const newErrors = {};
		let isValid = true;

		Object.keys(validationRules).forEach((fieldName) => {
			const error = validate(fieldName, values[fieldName]);
			if (error) {
				newErrors[fieldName] = error;
				isValid = false;
			}
		});

		setErrors(newErrors);
		return isValid;
	}, [validationRules, values, validate]);

	const setValue = useCallback(
		(name, value) => {
			setValues((prev) => ({...prev, [name]: value}));

			// Clear error when user starts typing
			if (errors[name]) {
				setErrors((prev) => ({...prev, [name]: ""}));
			}
		},
		[errors]
	);

	const setFieldValue = setValue;

	const handleChange = useCallback(
		(event) => {
			const {name, value, type, checked} = event.target;
			const fieldValue = type === "checkbox" ? checked : value;
			setValue(name, fieldValue);
		},
		[setValue]
	);

	const handleBlur = useCallback(
		(event) => {
			const {name, value} = event.target;
			setTouched((prev) => ({...prev, [name]: true}));

			const error = validate(name, value);
			setErrors((prev) => ({...prev, [name]: error}));
		},
		[validate]
	);

	const resetForm = useCallback(() => {
		setValues(initialValues);
		setErrors({});
		setTouched({});
		setIsSubmitting(false);
	}, [initialValues]);

	const setFieldError = useCallback((name, error) => {
		setErrors((prev) => ({...prev, [name]: error}));
	}, []);

	const setFieldTouched = useCallback((name, isTouched = true) => {
		setTouched((prev) => ({...prev, [name]: isTouched}));
	}, []);

	const getFieldProps = useCallback(
		(name) => ({
			name,
			value: values[name] || "",
			onChange: handleChange,
			onBlur: handleBlur,
			error: touched[name] ? errors[name] : "",
		}),
		[values, handleChange, handleBlur, touched, errors]
	);

	const isValid = Object.keys(errors).length === 0;
	const isDirty = Object.keys(touched).length > 0;

	return {
		values,
		errors,
		touched,
		isSubmitting,
		isValid,
		isDirty,
		setFieldValue,
		setFieldError,
		setFieldTouched,
		handleChange,
		handleBlur,
		validateAll,
		resetForm,
		getFieldProps,
		setIsSubmitting,
	};
};

// src/utils/validation.js
export const validationRules = {
	required:
		(message = "Este campo es requerido") =>
		(value) => {
			if (!value || (typeof value === "string" && !value.trim())) {
				return message;
			}
			return "";
		},

	email:
		(message = "Ingresa un email válido") =>
		(value) => {
			if (!value) return "";
			const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
			if (!emailRegex.test(value)) {
				return message;
			}
			return "";
		},

	minLength: (min, message) => (value) => {
		if (!value) return "";
		if (value.length < min) {
			return message || `Debe tener al menos ${min} caracteres`;
		}
		return "";
	},

	maxLength: (max, message) => (value) => {
		if (!value) return "";
		if (value.length > max) {
			return message || `No debe exceder ${max} caracteres`;
		}
		return "";
	},

	pattern: (regex, message) => (value) => {
		if (!value) return "";
		if (!regex.test(value)) {
			return message;
		}
		return "";
	},

	numeric:
		(message = "Solo se permiten números") =>
		(value) => {
			if (!value) return "";
			if (!/^\d+$/.test(value)) {
				return message;
			}
			return "";
		},

	phone:
		(message = "Ingresa un número de teléfono válido") =>
		(value) => {
			if (!value) return "";
			const phoneRegex = /^(\+593|0)[0-9]{9}$/;
			if (!phoneRegex.test(value.replace(/\s/g, ""))) {
				return message;
			}
			return "";
		},

	cedula:
		(message = "Ingresa una cédula válida") =>
		(value) => {
			if (!value) return "";

			// Validación básica de cédula ecuatoriana
			if (!/^\d{10}$/.test(value)) {
				return message;
			}

			const digits = value.split("").map(Number);
			const province = parseInt(value.substring(0, 2));

			if (province < 1 || province > 24) {
				return message;
			}

			// Algoritmo de validación de cédula
			const coefficients = [2, 1, 2, 1, 2, 1, 2, 1, 2];
			let sum = 0;

			for (let i = 0; i < 9; i++) {
				let result = digits[i] * coefficients[i];
				if (result > 9) result -= 9;
				sum += result;
			}

			const checkDigit = sum % 10 === 0 ? 0 : 10 - (sum % 10);

			if (checkDigit !== digits[9]) {
				return message;
			}

			return "";
		},

	passwordStrength:
		(
			message = "La contraseña debe tener al menos 8 caracteres, una mayúscula, una minúscula y un número"
		) =>
		(value) => {
			if (!value) return "";

			const hasMinLength = value.length >= 8;
			const hasUpperCase = /[A-Z]/.test(value);
			const hasLowerCase = /[a-z]/.test(value);
			const hasNumbers = /\d/.test(value);

			if (!hasMinLength || !hasUpperCase || !hasLowerCase || !hasNumbers) {
				return message;
			}

			return "";
		},

	matchField: (fieldName, message) => (value, allValues) => {
		if (!value) return "";
		if (value !== allValues[fieldName]) {
			return message || `Debe coincidir con ${fieldName}`;
		}
		return "";
	},

	url:
		(message = "Ingresa una URL válida") =>
		(value) => {
			if (!value) return "";
			try {
				new URL(value);
				return "";
			} catch {
				return message;
			}
		},

	dateRange: (minDate, maxDate, message) => (value) => {
		if (!value) return "";
		const date = new Date(value);
		const min = new Date(minDate);
		const max = new Date(maxDate);

		if (date < min || date > max) {
			return message || `La fecha debe estar entre ${minDate} y ${maxDate}`;
		}
		return "";
	},

	fileSize: (maxSizeInMB, message) => (file) => {
		if (!file) return "";
		const maxSizeInBytes = maxSizeInMB * 1024 * 1024;
		if (file.size > maxSizeInBytes) {
			return message || `El archivo no debe exceder ${maxSizeInMB}MB`;
		}
		return "";
	},

	fileType: (allowedTypes, message) => (file) => {
		if (!file) return "";
		const fileType = file.type;
		const fileName = file.name.toLowerCase();

		const isValidType = allowedTypes.some((type) => {
			if (type.startsWith(".")) {
				return fileName.endsWith(type);
			}
			return fileType.includes(type);
		});

		if (!isValidType) {
			return (
				message ||
				`Tipo de archivo no permitido. Tipos válidos: ${allowedTypes.join(
					", "
				)}`
			);
		}
		return "";
	},
};

export default useForm;

