// src/components/layout/RoleRoute.jsx
import {Navigate} from "react-router-dom";
import {useAuth} from "../../hooks/useAuth";
import {USER_ROLES} from "../../utils/constants";
import PropTypes from "prop-types";

function RoleRoute({allowedRoles, children, redirectPath}) {
	const {user, isAuthenticated, isAdmin, isStudent} = useAuth();

	// Si no está autenticado, ProtectedRoute ya maneja esto
	if (!isAuthenticated || !user) {
		return <Navigate to="/login" replace />;
	}

	// Obtener el rol del usuario como número
	const userRole = parseInt(user.role);

	// Validar que el rol es válido
	if (isNaN(userRole) || !Object.values(USER_ROLES).includes(userRole)) {
		console.error("Invalid user role:", user.role);
		return <Navigate to="/login" replace />;
	}

	// Verificar si el usuario tiene uno de los roles permitidos
	const hasAllowedRole = allowedRoles.includes(userRole);

	if (!hasAllowedRole) {
		// Determinar la redirección basada en el rol del usuario
		let defaultRedirect;

		if (isAdmin) {
			defaultRedirect = "/admin/dashboard";
		} else if (isStudent) {
			defaultRedirect = "/estudiante/dashboard";
		} else {
			// Rol no reconocido, redirigir al login
			defaultRedirect = "/login";
		}

		const finalRedirect = redirectPath || defaultRedirect;

		console.warn(
			`User with role ${userRole} attempted to access restricted route. Redirecting to: ${finalRedirect}`
		);

		return <Navigate to={finalRedirect} replace />;
	}

	return children;
}

RoleRoute.propTypes = {
	allowedRoles: PropTypes.arrayOf(PropTypes.number).isRequired,
	children: PropTypes.node.isRequired,
	redirectPath: PropTypes.string,
};

export default RoleRoute;
