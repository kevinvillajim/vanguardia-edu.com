// src/config/routes.js
export const ROUTES = {
	// Rutas públicas
	HOME: "/",
	LOGIN: "/login",
	CURSOS: "/cursos",
	CONTACT: "/contacto",
	ABOUT: "/acerca-de",

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

// Configuración de API endpoints
export const API_ENDPOINTS = {
	AUTH: {
		LOGIN: "/auth/login",
		LOGOUT: "/auth/logout",
		ME: "/me",
		CHANGE_PASSWORD: "/auth/change-password",
		RESET_PASSWORD: "/auth/reset-password",
	},

	USERS: {
		LIST: "/users",
		CREATE: "/users",
		UPDATE: (id) => `/users/${id}`,
		DELETE: (id) => `/users/${id}`,
		RESET_PASSWORD: (id) => `/users/${id}/reset-password`,
		IMPORT: "/import-users",
	},

	COURSES: {
		LIST: "/courses",
		CREATE: "/courses",
		UPDATE: (id) => `/courses/${id}`,
		DELETE: (id) => `/courses/${id}`,
		UPLOAD_MATERIAL: "/courses/materials",
	},

	PROGRESS: {
		LIST: "/progress",
		USER_PROGRESS: "/user-progress",
		STUDENT_PROGRESS: (id) => `/progress/student/${id}`,
		UPSERT: "/progress/upsert",
		DELETE: (userId, courseId) => `/progress/${userId}/${courseId}`,
		UPDATE_CERTIFICATE: "/progress/update-certificate",
	},

	EXP_DATES: {
		LIST: "/expdates",
		CREATE: "/expdates",
		UPDATE_BY_COURSE: (courseId) => `/expdates/curso/${courseId}`,
	},
};

// Mensajes de error comunes
export const ERROR_MESSAGES = {
	NETWORK_ERROR: "Error de conexión. Verifica tu conexión a internet.",
	UNAUTHORIZED: "No tienes permisos para realizar esta acción.",
	SESSION_EXPIRED:
		"Tu sesión ha expirado. Por favor, inicia sesión nuevamente.",
	VALIDATION_ERROR: "Los datos ingresados no son válidos.",
	SERVER_ERROR: "Error interno del servidor. Intenta nuevamente más tarde.",
	COURSE_EXPIRED: "Este curso ha expirado y ya no está disponible.",
	QUIZ_FAILED: "Necesitas obtener al menos 70% para aprobar el quiz.",
	FILE_TOO_LARGE: "El archivo es muy grande. El tamaño máximo es 10MB.",
	INVALID_FILE_TYPE: "Tipo de archivo no permitido.",
};

// Mensajes de éxito
export const SUCCESS_MESSAGES = {
	LOGIN_SUCCESS: "Inicio de sesión exitoso",
	LOGOUT_SUCCESS: "Sesión cerrada correctamente",
	PASSWORD_CHANGED: "Contraseña cambiada exitosamente",
	PROFILE_UPDATED: "Perfil actualizado correctamente",
	COURSE_COMPLETED: "¡Felicitaciones! Has completado el curso",
	QUIZ_PASSED: "¡Excelente! Has aprobado el quiz",
	PROGRESS_SAVED: "Progreso guardado correctamente",
	FILE_UPLOADED: "Archivo subido exitosamente",
};

// Configuración de validaciones
export const VALIDATION_RULES = {
	EMAIL: {
		REQUIRED: "El email es requerido",
		INVALID: "El formato del email no es válido",
	},
	PASSWORD: {
		REQUIRED: "La contraseña es requerida",
		MIN_LENGTH: "La contraseña debe tener al menos 8 caracteres",
		WEAK: "La contraseña debe incluir mayúsculas, minúsculas, números y símbolos",
	},
	NAME: {
		REQUIRED: "El nombre es requerido",
		MIN_LENGTH: "El nombre debe tener al menos 2 caracteres",
	},
	CI: {
		REQUIRED: "La cédula es requerida",
		INVALID: "El formato de la cédula no es válido",
	},
};
