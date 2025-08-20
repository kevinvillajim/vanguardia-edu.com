// src/features/courses/hooks/useCourseData.js
import {useState, useEffect, useCallback} from "react";
import {courseService} from "../../../services/course/courseService";
import {useAuth} from "../../../hooks/useAuth";

/**
 * Hook personalizado para manejo de datos de cursos
 * @param {Object} options - Opciones de configuración
 * @returns {Object} Estados y métodos del hook
 */
export function useCourseData(options = {}) {
	const {
		autoLoad = true,
		includeExpDates = true,
		includeProgress = true,
		onError = null,
	} = options;

	const {user, isAuthenticated} = useAuth();

	// Estados
	const [courses, setCourses] = useState([]);
	const [availableCourses, setAvailableCourses] = useState([]);
	const [expDates, setExpDates] = useState([]);
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState(null);
	const [initialized, setInitialized] = useState(false);

	/**
	 * Cargar todos los datos de cursos
	 */
	const loadCourseData = useCallback(async () => {
		if (!isAuthenticated || !user) {
			return;
		}

		try {
			setLoading(true);
			setError(null);

			// Cargar datos en paralelo
			const promises = [courseService.getCourses()];

			if (includeExpDates) {
				promises.push(courseService.getExpDates());
			}

			const results = await Promise.all(promises);

			const coursesData = results[0];
			const expDatesData = includeExpDates ? results[1] : [];

			setCourses(coursesData);
			setExpDates(expDatesData);

			// Filtrar cursos disponibles
			if (includeExpDates && expDatesData.length > 0) {
				const available = [];
				for (const course of coursesData) {
					const isAvailable = await courseService.isCourseAvailable(
						course.id,
						expDatesData
					);
					if (isAvailable) {
						available.push(course);
					}
				}
				setAvailableCourses(available);
			} else {
				setAvailableCourses(coursesData);
			}

			setInitialized(true);
		} catch (err) {
			console.error("useCourseData loadCourseData error:", err);
			setError(err.message || "Error al cargar datos de cursos");

			if (onError) {
				onError(err);
			}
		} finally {
			setLoading(false);
		}
	}, [isAuthenticated, user, includeExpDates, onError]);

	/**
	 * Recargar datos de cursos
	 */
	const reloadCourseData = useCallback(() => {
		setInitialized(false);
		return loadCourseData();
	}, [loadCourseData]);

	/**
	 * Obtener curso específico por ID
	 */
	const getCourse = useCallback(
		(courseId) => {
			return courses.find((course) => course.id === parseInt(courseId));
		},
		[courses]
	);

	/**
	 * Verificar si un curso está disponible
	 */
	const isCourseAvailable = useCallback(
		(courseId) => {
			return availableCourses.some(
				(course) => course.id === parseInt(courseId)
			);
		},
		[availableCourses]
	);

	/**
	 * Obtener fecha de expiración de un curso
	 */
	const getCourseExpDate = useCallback(
		(courseId) => {
			return expDates.find(
				(date) => parseInt(date.curso_id) === parseInt(courseId)
			);
		},
		[expDates]
	);

	/**
	 * Verificar si un curso está expirado
	 */
	const isCourseExpired = useCallback(
		(courseId) => {
			const expDate = getCourseExpDate(courseId);
			if (!expDate) return false;

			const currentDate = new Date();
			const deadlineDate = new Date(expDate.dead_line);
			return currentDate > deadlineDate;
		},
		[getCourseExpDate]
	);

	/**
	 * Filtrar cursos por estado
	 */
	const filterCoursesByStatus = useCallback(
		(status) => {
			switch (status) {
				case "available":
					return availableCourses;
				case "expired":
					return courses.filter((course) => isCourseExpired(course.id));
				case "all":
				default:
					return courses;
			}
		},
		[courses, availableCourses, isCourseExpired]
	);

	// Efectos
	useEffect(() => {
		if (autoLoad && isAuthenticated && user && !initialized) {
			loadCourseData();
		}
	}, [autoLoad, isAuthenticated, user, initialized, loadCourseData]);

	// Limpiar estados cuando el usuario se desautentica
	useEffect(() => {
		if (!isAuthenticated) {
			setCourses([]);
			setAvailableCourses([]);
			setExpDates([]);
			setError(null);
			setInitialized(false);
		}
	}, [isAuthenticated]);

	return {
		// Estados
		courses,
		availableCourses,
		expDates,
		loading,
		error,
		initialized,

		// Métodos de datos
		loadCourseData,
		reloadCourseData,
		getCourse,
		getCourseExpDate,

		// Métodos de verificación
		isCourseAvailable,
		isCourseExpired,

		// Métodos de filtrado
		filterCoursesByStatus,

		// Estadísticas calculadas
		totalCourses: courses.length,
		availableCoursesCount: availableCourses.length,
		expiredCoursesCount: courses.length - availableCourses.length,
	};
}
