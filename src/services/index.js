// src/services/index.js

// ============================================================================
// SERVICIOS DE AUTENTICACIÓN
// ============================================================================
export {authService} from "./auth/authService";
export {tokenService} from "./auth/tokenService";

// ============================================================================
// SERVICIOS DE API
// ============================================================================
export {default as apiClient} from "./api/client";
export {
	apiService,
	authAPI,
	userAPI,
	progressAPI,
	expDateAPI,
} from "./api/apiService";

// ============================================================================
// ENDPOINTS Y CONFIGURACIÓN
// ============================================================================
export {
	API_ENDPOINTS,
	AUTH_ENDPOINTS,
	USER_ENDPOINTS,
	PROGRESS_ENDPOINTS,
	EXP_DATE_ENDPOINTS,
	EndpointHelpers,
	EndpointValidators,
	ENDPOINT_METHODS,
	buildUrl,
} from "./api/endpoints";

// ============================================================================
// EXPORTS POR CATEGORÍA PARA FACILITAR IMPORTACIONES
// ============================================================================

// Servicios principales
export const AuthServices = {
	authService,
	tokenService,
};

export const APIServices = {
	apiService,
	apiClient,
	authAPI,
	userAPI,
	progressAPI,
	expDateAPI,
};

// ============================================================================
// CONFIGURACIÓN Y UTILIDADES
// ============================================================================
export const APIConfig = {
	endpoints: API_ENDPOINTS,
	helpers: EndpointHelpers,
	validators: EndpointValidators,
	methods: ENDPOINT_METHODS,
};

// ============================================================================
// EXPORT DEFAULT PARA IMPORTACIÓN SIMPLE
// ============================================================================
export default {
	// Servicios de autenticación
	auth: authService,
	token: tokenService,

	// Servicios de API
	api: apiService,
	client: apiClient,

	// APIs específicas
	authAPI,
	userAPI,
	progressAPI,
	expDateAPI,

	// Configuración
	endpoints: API_ENDPOINTS,
	helpers: EndpointHelpers,
};
