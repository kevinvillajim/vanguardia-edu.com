// src/hooks/usePermissions.js
import {useMemo} from "react";
import {useAuth} from "./useAuth";
import {USER_ROLES} from "../utils/constants";

export function usePermissions() {
	const {user, isAuthenticated} = useAuth();

	const permissions = useMemo(() => {
		if (!isAuthenticated || !user) {
			return {
				canViewAdmin: false,
				canManageUsers: false,
				canManageCourses: false,
				canViewStudentDashboard: false,
				canTakeCourses: false,
				canDownloadCertificates: false,
			};
		}

		const userRole = parseInt(user.role);

		return {
			canViewAdmin: userRole === USER_ROLES.ADMIN,
			canManageUsers: userRole === USER_ROLES.ADMIN,
			canManageCourses: userRole === USER_ROLES.ADMIN,
			canViewStudentDashboard: userRole === USER_ROLES.STUDENT,
			canTakeCourses: userRole === USER_ROLES.STUDENT,
			canDownloadCertificates: userRole === USER_ROLES.STUDENT,
		};
	}, [user, isAuthenticated]);

	return permissions;
}
