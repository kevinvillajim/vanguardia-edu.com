// src/contexts/AuthContext.jsx
import {createContext, useContext, useReducer, useEffect, useRef, useCallback} from "react";
import PropTypes from "prop-types";
import {authService} from "../services/auth/authService";
import {tokenService} from "../services/auth/tokenService";
import {APP_CONFIG, USER_ROLES} from "../utils/constants";

// Estados de autenticación
const AUTH_STATES = {
	LOADING: "loading",
	AUTHENTICATED: "authenticated",
	UNAUTHENTICATED: "unauthenticated",
	ERROR: "error",
};

// Tipos de acciones
export const AUTH_ACTIONS = {
	SET_LOADING: "SET_LOADING",
	LOGIN_SUCCESS: "LOGIN_SUCCESS",
	LOGIN_ERROR: "LOGIN_ERROR",
	LOGOUT: "LOGOUT",
	UPDATE_USER: "UPDATE_USER",
	RESET_PASSWORD_REQUIRED: "RESET_PASSWORD_REQUIRED",
	TOKEN_REFRESH: "TOKEN_REFRESH",
} as const;

// Estado inicial
const initialState = {
	user: null,
	token: null,
	isAuthenticated: false,
	isLoading: true,
	error: null,
	passwordChangeRequired: false,
	lastActivity: Date.now(),
};

// Reducer para manejar las acciones
function authReducer(state, action) {
	switch (action.type) {
		case AUTH_ACTIONS.SET_LOADING:
			return {
				...state,
				isLoading: action.payload,
				error: null,
			};

		case AUTH_ACTIONS.LOGIN_SUCCESS:
			return {
				...state,
				user: action.payload.user,
				token: action.payload.token,
				isAuthenticated: true,
				isLoading: false,
				error: null,
				passwordChangeRequired: action.payload.passwordChangeRequired || false,
				lastActivity: Date.now(),
			};

		case AUTH_ACTIONS.LOGIN_ERROR:
			return {
				...state,
				user: null,
				token: null,
				isAuthenticated: false,
				isLoading: false,
				error: action.payload,
				passwordChangeRequired: false,
			};

		case AUTH_ACTIONS.LOGOUT:
			return {
				...initialState,
				isLoading: false,
			};

		case AUTH_ACTIONS.UPDATE_USER:
			return {
				...state,
				user: {...state.user, ...action.payload},
				passwordChangeRequired: action.payload.passwordChangeRequired !== undefined 
					? action.payload.passwordChangeRequired 
					: state.passwordChangeRequired,
				lastActivity: Date.now(),
			};

		case AUTH_ACTIONS.RESET_PASSWORD_REQUIRED:
			return {
				...state,
				passwordChangeRequired: true,
			};

		case AUTH_ACTIONS.TOKEN_REFRESH:
			return {
				...state,
				token: action.payload,
				lastActivity: Date.now(),
			};

		default:
			return state;
	}
}

// Crear contexto
export const AuthContext = createContext();

export function AuthProvider({children}) {
	const [state, dispatch] = useReducer(authReducer, initialState);
	const activityTimeoutRef = useRef(null);
	const sessionTimeoutRef = useRef(null);

	// Verificar autenticación al cargar la app
	useEffect(() => {
		checkAuthStatus();
	}, []);

	// Configurar timeouts cuando el usuario se autentica
	useEffect(() => {
		if (state.isAuthenticated && state.user) {
			setupSessionTimeouts();
			return () => clearTimeouts();
		}
	}, [state.isAuthenticated, state.user]);

	// Verificar estado de autenticación
	const checkAuthStatus = useCallback(async () => {
		console.log("🔍 Checking authentication status...");
		try {
			const token = tokenService.getToken();
			console.log("🔍 Token check:", { hasToken: !!token, isExpired: token ? tokenService.isTokenExpired(token) : null });
			
			if (!token || tokenService.isTokenExpired(token)) {
				console.log("❌ No token or expired token, logging out");
				dispatch({type: AUTH_ACTIONS.LOGOUT});
				return;
			}

			// Verificar el usuario actual
			console.log("🔍 Fetching current user...");
			const user = await authService.getCurrentUser();
			console.log("🔍 Current user:", { id: user?.id, role: user?.role, email: user?.email });

			// Validar rol del usuario
			if (!user || !isValidUserRole(user.role)) {
				console.error("❌ Invalid user data or role:", user);
				dispatch({type: AUTH_ACTIONS.LOGOUT});
				return;
			}

			console.log("✅ Authentication verified, user logged in");
			dispatch({
				type: AUTH_ACTIONS.LOGIN_SUCCESS,
				payload: {user, token, passwordChangeRequired: false},
			});
		} catch (error) {
			console.error("❌ Error checking auth status:", error);
			dispatch({type: AUTH_ACTIONS.LOGOUT});
		}
	}, []); // Sin dependencias para evitar re-renders innecesarios

	// Validar rol de usuario
	const isValidUserRole = (role) => {
		const numericRole = parseInt(role);
		return (
			!isNaN(numericRole) && Object.values(USER_ROLES).includes(numericRole)
		);
	};

	// Registrar nuevo usuario
	const register = async (userData) => {
		try {
			dispatch({type: AUTH_ACTIONS.SET_LOADING, payload: true});

			const result = await authService.register(userData);
			console.log("Register service result:", result);

			if (!result || !result.success) {
				throw new Error("Respuesta inválida del servidor");
			}

			// Si el registro devuelve token, hacer login automático
			if (result.data?.access_token || result.data?.token) {
				const token = result.data.access_token || result.data.token;
				tokenService.setToken(token);

				// Obtener datos del usuario
				let user;
				if (result.data?.user && result.data.user !== null) {
					user = result.data.user;
				} else {
					try {
						user = await authService.getCurrentUser();
					} catch (getUserError) {
						console.error("Error obteniendo usuario:", getUserError);
						throw new Error("Error obteniendo datos del usuario después del registro");
					}
				}

				// Validar que tenemos datos de usuario válidos
				if (!user || !isValidUserRole(user.role)) {
					console.error("Invalid user data or role:", user);
					throw new Error("Datos de usuario inválidos recibidos");
				}

				dispatch({
					type: AUTH_ACTIONS.LOGIN_SUCCESS,
					payload: {
						user,
						token,
						passwordChangeRequired: false,
					},
				});

				return {success: true};
			} else {
				// Si el registro no devuelve token, solo retornar éxito
				dispatch({type: AUTH_ACTIONS.SET_LOADING, payload: false});
				return {success: true, requiresLogin: true};
			}
		} catch (error) {
			console.error("AuthContext register error:", error);

			const errorMessage =
				error.response?.data?.message ||
				error.response?.data?.error ||
				error.message ||
				"Error en el registro";

			dispatch({
				type: AUTH_ACTIONS.LOGIN_ERROR,
				payload: errorMessage,
			});

			return {success: false, error: errorMessage};
		}
	};

	// Iniciar sesión
	const login = async (credentials) => {
		try {
			dispatch({type: AUTH_ACTIONS.SET_LOADING, payload: true});

			const result = await authService.login(credentials);
			console.log("Login service result:", result);

			// CORRECCIÓN: Validar que tenemos respuesta exitosa y datos necesarios
			if (!result || !result.success || !result.token || !result.user) {
				console.error("❌ Respuesta de login inválida:", result);
				throw new Error("Respuesta inválida del servidor");
			}

			const token = result.token;
			const user = result.user;

			console.log("✅ Login successful:", { token: !!token, user: !!user, userRole: user.role });

			// Guardar token
			tokenService.setToken(token);

			// Validar que tenemos datos de usuario válidos
			if (!user || !isValidUserRole(user.role)) {
				console.error("❌ Invalid user data or role:", user);
				throw new Error("Datos de usuario inválidos recibidos");
			}

			dispatch({
				type: AUTH_ACTIONS.LOGIN_SUCCESS,
				payload: {
					user,
					token,
					passwordChangeRequired: result.passwordChangeRequired || false,
				},
			});

			return {
				success: true,
				user,
				token,
				passwordChangeRequired: result.passwordChangeRequired || false,
			};
		} catch (error) {
			console.error("AuthService login error:", error);

			const errorMessage =
				error.response?.data?.message ||
				error.response?.data?.error ||
				error.message ||
				"Error de autenticación";

			dispatch({
				type: AUTH_ACTIONS.LOGIN_ERROR,
				payload: errorMessage,
			});

			return {success: false, error: errorMessage};
		}
	};

	// Cerrar sesión
	const logout = async () => {
		try {
			clearTimeouts();
			await authService.logout();
		} catch (error) {
			console.warn("Error during logout:", error);
		} finally {
			dispatch({type: AUTH_ACTIONS.LOGOUT});
		}
	};

	// Cambiar contraseña
	const changePassword = async (newPassword, confirmation) => {
		try {
			await authService.changePassword(newPassword, confirmation);
			dispatch({
				type: AUTH_ACTIONS.UPDATE_USER,
				payload: {passwordChangeRequired: false},
			});
			return {success: true};
		} catch (error) {
			return {
				success: false,
				error: error.response?.data?.message || "Error al cambiar contraseña",
			};
		}
	};

	// Actualizar datos del usuario
	const updateUser = (userData) => {
		dispatch({
			type: AUTH_ACTIONS.UPDATE_USER,
			payload: userData,
		});
	};

	// Configurar timeouts de sesión
	const setupSessionTimeouts = () => {
		clearTimeouts();

		// Timeout de actividad
		activityTimeoutRef.current = setTimeout(() => {
			console.warn("Session expired due to inactivity");
			logout();
		}, APP_CONFIG.ACTIVITY_TIMEOUT);

		// Timeout de sesión total
		sessionTimeoutRef.current = setTimeout(() => {
			console.warn("Session expired due to time limit");
			logout();
		}, APP_CONFIG.SESSION_TIMEOUT);

		// Listen for user activity
		const resetActivityTimeout = () => {
			if (activityTimeoutRef.current) {
				clearTimeout(activityTimeoutRef.current);
				activityTimeoutRef.current = setTimeout(() => {
					console.warn("Session expired due to inactivity");
					logout();
				}, APP_CONFIG.ACTIVITY_TIMEOUT);
			}
		};

		// Activity events
		const events = ["mousemove", "keydown", "click", "scroll", "touchstart"];
		events.forEach((event) => {
			window.addEventListener(event, resetActivityTimeout, {passive: true});
		});

		// Cleanup function
		return () => {
			events.forEach((event) => {
				window.removeEventListener(event, resetActivityTimeout);
			});
		};
	};

	// Clear timeouts
	const clearTimeouts = () => {
		if (activityTimeoutRef.current) {
			clearTimeout(activityTimeoutRef.current);
			activityTimeoutRef.current = null;
		}
		if (sessionTimeoutRef.current) {
			clearTimeout(sessionTimeoutRef.current);
			sessionTimeoutRef.current = null;
		}
	};

	// Check if user has a specific role
	const hasRole = (role) => {
		if (!state.user) return false;
		return parseInt(state.user.role) === parseInt(role);
	};

	// Check if user is active
	const isUserActive = () => {
		return state.user && parseInt(state.user.active) === 1;
	};

	// Check if user can access the application
	const canAccess = () => {
		return (
			state.isAuthenticated &&
			isUserActive() &&
			!state.passwordChangeRequired &&
			isValidUserRole(state.user?.role)
		);
	};

	// Context values
	const value = {
		// State
		...state,

		// Actions
		login,
		register,
		logout,
		changePassword,
		updateUser,
		checkAuthStatus,

		// Utilities
		hasRole,
		isUserActive,
		canAccess,

		// Computed states
		isAdmin: hasRole(USER_ROLES.ADMIN),
		isStudent: hasRole(USER_ROLES.STUDENT),
		isTeacher: hasRole(USER_ROLES.TEACHER),
	};

	return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

AuthProvider.propTypes = {
	children: PropTypes.node.isRequired,
};

// Hook to use the context
export function useAuth() {
	const context = useContext(AuthContext);
	if (!context) {
		throw new Error("useAuth must be used within an AuthProvider");
	}
	return context;
}

export { AUTH_STATES };
