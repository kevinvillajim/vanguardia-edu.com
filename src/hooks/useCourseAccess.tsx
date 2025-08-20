// src/hooks/useCourseAccess.js
import {useState, useEffect} from "react";
import {useNavigate} from "react-router-dom";
import api from "../config/api";
import {useAuth} from "../contexts/AuthContext";
import {useToast} from "../components/ui/Toast/Toast";

export const useCourseAccess = (courseId) => {
	const [isLoading, setIsLoading] = useState(true);
	const [hasAccess, setHasAccess] = useState(false);
	const [expDate, setExpDate] = useState(null);
	const navigate = useNavigate();
	const {user, isAuthenticated} = useAuth();
	const {toast} = useToast();

	useEffect(() => {
		const checkCourseAccess = async () => {
			try {
				setIsLoading(true);

				// Verificar autenticación
				if (!isAuthenticated || !user) {
					navigate("/login");
					return;
				}

				// Verificar rol de estudiante
				if (parseInt(user.role) !== 2) {
					navigate("/admin/dashboard");
					return;
				}

				// Obtener fecha límite del curso
				const response = await api.get("/expdates");
				const expDatesData = response.data;
				
				const courseExpDate = expDatesData.find(
					(date) => parseInt(date.curso_id) === courseId
				);

				if (courseExpDate) {
					setExpDate(courseExpDate.dead_line);
					
					// Verificar si el curso ha expirado
					const currentDate = new Date();
					const deadlineDate = new Date(courseExpDate.dead_line);
					
					if (currentDate > deadlineDate) {
						// Curso expirado - redirigir a dashboard con mensaje
						toast.error("Este curso ha expirado y ya no está disponible");
						navigate("/estudiante/dashboard");
						return;
					}
				}

				// Si llegamos aquí, el usuario tiene acceso
				setHasAccess(true);

			} catch (error) {
				console.error("Error checking course access:", error);
				toast.error("Error al verificar el acceso al curso");
				navigate("/estudiante/dashboard");
			} finally {
				setIsLoading(false);
			}
		};

		checkCourseAccess();
	}, [courseId, isAuthenticated, user, navigate, toast]);

	return {
		isLoading,
		hasAccess,
		expDate,
	};
};