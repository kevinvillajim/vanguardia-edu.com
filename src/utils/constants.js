// src/utils/constants.js

// Importar endpoints desde el archivo centralizado
import {API_ENDPOINTS as IMPORTED_ENDPOINTS} from "../services/api/endpoints";

export const APP_CONFIG = {
	APP_NAME: "Plataforma Educativa Cooprogreso",
	APP_VERSION: "2.0.0",
	API_BASE_URL:
		import.meta.env.REACT_APP_API_URL ||
		"https://api.capacitacion-cooprogreso.com/api",

	// Timeouts de sesión
	SESSION_TIMEOUT: 60 * 60 * 1000, // 1 hora
	ACTIVITY_TIMEOUT: 5 * 60 * 1000, // 5 minutos

	// Keys para localStorage
	STORAGE_KEYS: {
		TOKEN: "token",
		USER: "user",
		EXP_DATES: "expDates",
		THEME: "theme",
	},

	// Configuración de encriptación
	SECRET_KEY: "n=w^A0weX-d4LjYgEDMP",

	// Configuración de requests
	REQUEST_TIMEOUT: 10000, // 10 segundos
	MAX_RETRIES: 3,
	RETRY_DELAY: 1000, // 1 segundo
};

// ============================================================================
// ROLES DE USUARIO
// ============================================================================
export const USER_ROLES = {
	ADMIN: 1,
	STUDENT: 2,
	TEACHER: 3,
};

// Labels para roles (para UI)
export const USER_ROLE_LABELS = {
	[USER_ROLES.ADMIN]: "Administrador",
	[USER_ROLES.STUDENT]: "Estudiante",
	[USER_ROLES.TEACHER]: "Profesor",
};

// ============================================================================
// ESTADOS DE CURSO Y PROGRESO
// ============================================================================
export const COURSE_STATUS = {
	NOT_STARTED: "not_started",
	IN_PROGRESS: "in_progress",
	COMPLETED: "completed",
	EXPIRED: "expired",
};

export const PROGRESS_STATUS = {
	NOT_STARTED: 0,
	QUARTER: 25,
	HALF: 50,
	THREE_QUARTERS: 75,
	COMPLETED: 100,
};

// ============================================================================
// TIPOS DE CONTENIDO Y ARCHIVOS
// ============================================================================
export const CONTENT_TYPES = {
	TEXT: "text",
	VIDEO: "video",
	IMAGE: "image",
	QUIZ: "quiz",
	PDF: "pdf",
};

export const FILE_CONFIG = {
	MAX_SIZE: 10 * 1024 * 1024, // 10MB
	ALLOWED_TYPES: {
		IMAGE: ["image/jpeg", "image/png", "image/gif", "image/webp"],
		VIDEO: ["video/mp4", "video/webm"],
		DOCUMENT: [
			"application/pdf",
			"application/msword",
			"application/vnd.openxmlformats-officedocument.wordprocessingml.document",
		],
		CSV: ["text/csv", "application/csv"],
	},
};

// ============================================================================
// ESTADOS DE AUTENTICACIÓN
// ============================================================================
export const AUTH_STATUS = {
	LOADING: "loading",
	AUTHENTICATED: "authenticated",
	UNAUTHENTICATED: "unauthenticated",
	ERROR: "error",
};

// ============================================================================
// API ENDPOINTS (Importados desde endpoints.js)
// ============================================================================
export const API_ENDPOINTS = IMPORTED_ENDPOINTS;

// Retrocompatibilidad - mantener la estructura anterior
export const ROUTES = {
	// Rutas públicas
	HOME: "/",
	LOGIN: "/login",

	// Rutas protegidas
	CHANGE_PASSWORD: "/change-password",
	PROFILE: "/profile",
	EDIT_PROFILE: "/edit-profile",

	// Rutas de admin
	ADMIN: {
		BASE: "/admin",
		DASHBOARD: "/admin/dashboard",
		USERS: "/admin/usuarios",
		STUDENTS: "/admin/alumnos",
		COURSES: "/admin/clases",
		ANALYTICS: "/admin/analytics",
		COURSE_CREATOR: "/admin/crear-curso",
	},

	// Rutas de estudiante
	STUDENT: {
		BASE: "/estudiante",
		DASHBOARD: "/estudiante/dashboard",
		CERTIFICATES: "/estudiante/certificados",
		COURSES: "/estudiante/cursos",
		COURSE_VIEW: (courseId) => `/estudiante/cursos/curso${courseId}`,
		UNIT_VIEW: (courseId, unitId) =>
			`/estudiante/cursos/curso${courseId}/unidad${unitId}`,
		CERTIFICATE_VIEW: (courseId) =>
			`/estudiante/cursos/curso${courseId}/certificado`,
	},
};

// ============================================================================
// MENSAJES DE ERROR Y ÉXITO
// ============================================================================
export const ERROR_MESSAGES = {
	// Errores de red y conexión
	NETWORK_ERROR: "Error de conexión. Verifica tu conexión a internet.",
	TIMEOUT_ERROR: "La solicitud ha expirado. Intenta nuevamente.",
	SERVER_ERROR: "Error interno del servidor. Intenta nuevamente más tarde.",

	// Errores de autenticación
	UNAUTHORIZED: "No tienes permisos para realizar esta acción.",
	SESSION_EXPIRED:
		"Tu sesión ha expirado. Por favor, inicia sesión nuevamente.",
	INVALID_CREDENTIALS:
		"Credenciales inválidas. Verifica tu email y contraseña.",

	// Errores de validación
	VALIDATION_ERROR: "Los datos ingresados no son válidos.",
	INVALID_FILE_TYPE: "Tipo de archivo no permitido.",
	FILE_TOO_LARGE: "El archivo es muy grande. El tamaño máximo es 10MB.",

	// Errores de curso
	COURSE_EXPIRED: "Este curso ha expirado y ya no está disponible.",
	QUIZ_FAILED: "Necesitas obtener al menos 70% para aprobar el quiz.",
	COURSE_NOT_FOUND: "El curso solicitado no existe.",

	// Errores genéricos
	UNKNOWN_ERROR: "Ha ocurrido un error inesperado.",
	FORBIDDEN: "No tienes permisos para acceder a este recurso.",
};

export const SUCCESS_MESSAGES = {
	// Autenticación
	LOGIN_SUCCESS: "Inicio de sesión exitoso",
	LOGOUT_SUCCESS: "Sesión cerrada correctamente",
	PASSWORD_CHANGED: "Contraseña cambiada exitosamente",

	// Perfil y usuario
	PROFILE_UPDATED: "Perfil actualizado correctamente",
	USER_CREATED: "Usuario creado exitosamente",
	USER_UPDATED: "Usuario actualizado exitosamente",
	USER_DELETED: "Usuario eliminado exitosamente",

	// Cursos y progreso
	COURSE_COMPLETED: "¡Felicitaciones! Has completado el curso",
	QUIZ_PASSED: "¡Excelente! Has aprobado el quiz",
	PROGRESS_SAVED: "Progreso guardado correctamente",
	CERTIFICATE_DOWNLOADED: "Certificado descargado exitosamente",

	// Archivos
	FILE_UPLOADED: "Archivo subido exitosamente",
	FILE_IMPORTED: "Datos importados exitosamente",
};

// ============================================================================
// REGLAS DE VALIDACIÓN
// ============================================================================
export const VALIDATION_RULES = {
	EMAIL: {
		REQUIRED: "El email es requerido",
		INVALID: "El formato del email no es válido",
		MAX_LENGTH: "El email no puede tener más de 255 caracteres",
	},
	PASSWORD: {
		REQUIRED: "La contraseña es requerida",
		MIN_LENGTH: "La contraseña debe tener al menos 8 caracteres",
		WEAK: "La contraseña debe incluir mayúsculas, minúsculas, números y símbolos",
		CONFIRMATION: "Las contraseñas no coinciden",
	},
	NAME: {
		REQUIRED: "El nombre es requerido",
		MIN_LENGTH: "El nombre debe tener al menos 2 caracteres",
		MAX_LENGTH: "El nombre no puede tener más de 255 caracteres",
	},
	CI: {
		REQUIRED: "La cédula es requerida",
		INVALID: "El formato de la cédula no es válido",
		LENGTH: "La cédula debe tener 10 dígitos",
	},
	PHONE: {
		INVALID: "El formato del teléfono no es válido",
		MAX_LENGTH: "El teléfono no puede tener más de 20 caracteres",
	},
};

// ============================================================================
// CONFIGURACIÓN DE UI Y DISEÑO
// ============================================================================
export const BREAKPOINTS = {
	XS: "320px",
	SM: "640px",
	MD: "768px",
	LG: "1024px",
	XL: "1280px",
	XXL: "1536px",
};

export const THEME_COLORS = {
	PRIMARY: "#95c11f", // Verde principal Cooprogreso
	PRIMARY_DARK: "#006938", // Verde oscuro Cooprogreso
	SECONDARY: "#9fc8b5", // Verde medio Cooprogreso
	BACKGROUND: "#fefffe", // Blanco Cooprogreso
	BACKGROUND_LIGHT: "#e7f1e3", // Verde muy claro Cooprogreso
	SUCCESS: "#95c11f",
	WARNING: "#f59e0b",
	ERROR: "#ef4444",
	INFO: "#006938",

	GRAY: {
		50: "#f9fafb",
		100: "#f3f4f6",
		200: "#e5e7eb",
		300: "#d1d5db",
		400: "#9ca3af",
		500: "#6b7280",
		600: "#4b5563",
		700: "#374151",
		800: "#1f2937",
		900: "#111827",
	},
};

export const ANIMATIONS = {
	DURATION: {
		FAST: "150ms",
		NORMAL: "300ms",
		SLOW: "500ms",
	},
	EASING: {
		EASE_IN: "ease-in",
		EASE_OUT: "ease-out",
		EASE_IN_OUT: "ease-in-out",
	},
};

// ============================================================================
// CONFIGURACIÓN DE QUIZ Y CERTIFICADOS
// ============================================================================
export const QUIZ_CONFIG = {
	PASSING_SCORE: 70, // Porcentaje mínimo para aprobar
	MAX_ATTEMPTS: 3, // Número máximo de intentos
	TIME_LIMIT: 30 * 60, // 30 minutos en segundos
};

export const CERTIFICATE_CONFIG = {
	FORMAT: "PDF",
	TEMPLATE: "default",
	AUTHOR: "Cooperativa de Ahorro y Crédito Cooprogreso",
};

// ============================================================================
// CONFIGURACIÓN DE PAGINACIÓN Y LÍMITES
// ============================================================================
export const PAGINATION_CONFIG = {
	DEFAULT_PAGE_SIZE: 10,
	MAX_PAGE_SIZE: 100,
	PAGE_SIZE_OPTIONS: [10, 25, 50, 100],
};

// ============================================================================
// EXPORT POR DEFECTO PARA COMPATIBILIDAD
// ============================================================================
export default {
	APP_CONFIG,
	USER_ROLES,
	USER_ROLE_LABELS,
	COURSE_STATUS,
	PROGRESS_STATUS,
	CONTENT_TYPES,
	FILE_CONFIG,
	AUTH_STATUS,
	API_ENDPOINTS,
	ROUTES,
	ERROR_MESSAGES,
	SUCCESS_MESSAGES,
	VALIDATION_RULES,
	BREAKPOINTS,
	THEME_COLORS,
	ANIMATIONS,
	QUIZ_CONFIG,
	CERTIFICATE_CONFIG,
	PAGINATION_CONFIG,
};
