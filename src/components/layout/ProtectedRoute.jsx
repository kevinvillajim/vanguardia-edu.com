// src/components/layout/ProtectedRoute.jsx
import {Navigate, useLocation} from "react-router-dom";
import {useAuth} from "../../hooks/useAuth";
import {LoadingScreen} from "../ui";
import PropTypes from "prop-types";

function ProtectedRoute({children, requireActive = false}) {
	const {
		isAuthenticated,
		isLoading,
		user,
		passwordChangeRequired,
		isUserActive,
		canAccess,
		error,
	} = useAuth();
	const location = useLocation();

	// Mostrar loading mientras se verifica la autenticación
	if (isLoading) {
		return <LoadingScreen />;
	}

	// Si hay un error crítico de autenticación
	if (error && !isAuthenticated) {
		return <Navigate to="/login" state={{from: location, error}} replace />;
	}

	// Si no está autenticado, redirigir al login
	if (!isAuthenticated) {
		return <Navigate to="/login" state={{from: location}} replace />;
	}

	// Si el usuario no existe (caso edge)
	if (!user) {
		console.error("User object is missing despite being authenticated");
		return <Navigate to="/login" replace />;
	}

	// Si necesita cambiar contraseña y no está en la página de cambio
	if (passwordChangeRequired && location.pathname !== "/change-password") {
		return <Navigate to="/change-password" replace />;
	}

	// Si se requiere usuario activo y no lo es
	if (requireActive && !isUserActive()) {
		return (
			<div className="min-h-screen flex items-center justify-center bg-gray-50">
				<div className="text-center p-8 bg-white rounded-lg shadow-md max-w-md">
					<div className="mb-4">
						<span className="material-symbols-outlined text-6xl text-red-500">
							block
						</span>
					</div>
					<h2 className="text-2xl font-bold text-gray-900 mb-4">
						Cuenta Desactivada
					</h2>
					<p className="text-gray-600 mb-6">
						Tu cuenta ha sido desactivada temporalmente. Por favor, contacta al
						administrador del sistema para más información.
					</p>
					<div className="space-y-3">
						<button
							onClick={() => (window.location.href = "/login")}
							className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-md transition-colors"
						>
							Volver al Login
						</button>
						<a
							href="mailto:soporte@cooprogreso.fin.ec"
							className="block w-full bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium py-2 px-4 rounded-md transition-colors text-center"
						>
							Contactar Soporte
						</a>
					</div>
				</div>
			</div>
		);
	}

	// Verificar acceso general (todos los checks combinados)
	if (requireActive && !canAccess()) {
		console.warn("User failed canAccess check:", {
			isAuthenticated,
			isUserActive: isUserActive(),
			passwordChangeRequired,
			userRole: user?.role,
		});
		return <Navigate to="/login" replace />;
	}

	return children;
}

ProtectedRoute.propTypes = {
	children: PropTypes.node.isRequired,
	requireActive: PropTypes.bool,
};

export default ProtectedRoute;
