// src/features/courses/hooks/useCourseProgress.js
import {useState, useEffect, useCallback} from "react";
import {courseService} from "../../../services/course/courseService";
import {useAuth} from "../../../hooks/useAuth";
import {
	calculateCourseProgress,
	calculateOverallProgress,
} from "../utils/progressCalculator";

/**
 * Hook personalizado para manejo de progreso de cursos
 * @param {Object} options - Opciones de configuración
 * @returns {Object} Estados y métodos del hook
 */
export function useCourseProgress(options = {}) {
	const {
		courseId = null,
		userId = null,
		autoLoad = true,
		onProgressUpdate = null,
		onError = null,
	} = options;

	const {user, isAuthenticated} = useAuth();
	const effectiveUserId = userId || user?.id;

	// Estados
	const [progress, setProgress] = useState([]);
	const [courseProgress, setCourseProgress] = useState({});
	const [overallProgress, setOverallProgress] = useState({
		totalCourses: 0,
		completedCourses: 0,
		averageProgress: 0,
		totalUnits: 0,
		completedUnits: 0,
	});
	const [loading, setLoading] = useState(false);
	const [updating, setUpdating] = useState(false);
	const [error, setError] = useState(null);
	const [initialized, setInitialized] = useState(false);

	/**
	 * Cargar progreso del usuario
	 */
	const loadProgress = useCallback(async () => {
		if (!isAuthenticated || !effectiveUserId) {
			return;
		}

		try {
			setLoading(true);
			setError(null);

			const progressData = await courseService.getUserProgress(effectiveUserId);
			setProgress(progressData);

			// Calcular progreso por curso
			const courseProgressData = {};
			const courses = await courseService.getCourses();

			courses.forEach((course) => {
				courseProgressData[course.id] = calculateCourseProgress(
					course,
					progressData
				);
			});

			setCourseProgress(courseProgressData);

			// Calcular progreso general
			const overall = calculateOverallProgress(courses, progressData);
			setOverallProgress(overall);

			// Sincronizar con localStorage
			courseService.syncProgressWithLocalStorage(progressData);

			setInitialized(true);
		} catch (err) {
			console.error("useCourseProgress loadProgress error:", err);
			setError(err.message || "Error al cargar progreso");

			if (onError) {
				onError(err);
			}
		} finally {
			setLoading(false);
		}
	}, [isAuthenticated, effectiveUserId, onError]);

	/**
	 * Actualizar progreso de una unidad
	 */
	const updateUnitProgress = useCallback(
		async (courseId, unitId, progressPercent) => {
			try {
				setUpdating(true);
				setError(null);

				const progressData = {
					user_id: effectiveUserId,
					course_id: courseId,
					unit_id: unitId,
					progress: progressPercent / 100,
					completed: progressPercent >= 100,
				};

				await courseService.updateProgress(progressData);

				// Actualizar localStorage inmediatamente
				localStorage.setItem(
					`Course${courseId}Unidad${unitId}`,
					progressPercent.toString()
				);

				// Recargar progreso
				await loadProgress();

				if (onProgressUpdate) {
					onProgressUpdate({courseId, unitId, progress: progressPercent});
				}

				return {success: true};
			} catch (err) {
				console.error("useCourseProgress updateUnitProgress error:", err);
				setError(err.message || "Error al actualizar progreso");
				return {success: false, error: err.message};
			} finally {
				setUpdating(false);
			}
		},
		[effectiveUserId, loadProgress, onProgressUpdate]
	);

	/**
	 * Completar quiz de una unidad
	 */
	const completeQuiz = useCallback(
		async (courseId, unitId, score) => {
			try {
				setUpdating(true);
				setError(null);

				const result = await courseService.completeQuiz({
					userId: effectiveUserId,
					courseId,
					unitId,
					score,
				});

				// Recargar progreso
				await loadProgress();

				if (onProgressUpdate) {
					onProgressUpdate({courseId, unitId, completed: true, score});
				}

				return {success: true, data: result};
			} catch (err) {
				console.error("useCourseProgress completeQuiz error:", err);
				setError(err.message || "Error al completar quiz");
				return {success: false, error: err.message};
			} finally {
				setUpdating(false);
			}
		},
		[effectiveUserId, loadProgress, onProgressUpdate]
	);

	/**
	 * Resetear progreso de un curso
	 */
	const resetCourseProgress = useCallback(
		async (courseId) => {
			try {
				setUpdating(true);
				setError(null);

				await courseService.deleteProgress(effectiveUserId, courseId);

				// Recargar progreso
				await loadProgress();

				return {success: true};
			} catch (err) {
				console.error("useCourseProgress resetCourseProgress error:", err);
				setError(err.message || "Error al resetear progreso");
				return {success: false, error: err.message};
			} finally {
				setUpdating(false);
			}
		},
		[effectiveUserId, loadProgress]
	);

	/**
	 * Actualizar certificado descargado
	 */
	const updateCertificate = useCallback(
		async (courseId) => {
			try {
				await courseService.updateCertificate({
					user_id: effectiveUserId,
					course_id: courseId,
					certificate: 1,
				});

				// Recargar progreso para reflejar el cambio
				await loadProgress();

				return {success: true};
			} catch (err) {
				console.error("useCourseProgress updateCertificate error:", err);
				return {success: false, error: err.message};
			}
		},
		[effectiveUserId, loadProgress]
	);

	/**
	 * Obtener progreso de un curso específico
	 */
	const getCourseProgress = useCallback(
		(courseId) => {
			return (
				courseProgress[courseId] || {
					courseId: parseInt(courseId),
					totalUnits: 0,
					completedUnits: 0,
					averageProgress: 0,
					isCompleted: false,
					units: [],
				}
			);
		},
		[courseProgress]
	);

	/**
	 * Obtener progreso de una unidad específica
	 */
	const getUnitProgress = useCallback(
		(courseId, unitId) => {
			const courseProgressData = getCourseProgress(courseId);
			return (
				courseProgressData.units.find(
					(unit) => unit.unitId === parseInt(unitId)
				) || {
					unitId: parseInt(unitId),
					progress: 0,
					completed: false,
					score: 0,
					attempted: false,
					finishDate: null,
				}
			);
		},
		[getCourseProgress]
	);

	/**
	 * Verificar si una unidad está completada
	 */
	const isUnitCompleted = useCallback(
		(courseId, unitId) => {
			const unitProgress = getUnitProgress(courseId, unitId);
			return unitProgress.completed;
		},
		[getUnitProgress]
	);

	/**
	 * Verificar si un curso está completado
	 */
	const isCourseCompleted = useCallback(
		(courseId) => {
			const courseProgressData = getCourseProgress(courseId);
			return courseProgressData.isCompleted;
		},
		[getCourseProgress]
	);

	/**
	 * Obtener progreso desde localStorage (fallback)
	 */
	const getLocalStorageProgress = useCallback((courseId, unitId = null) => {
		if (unitId) {
			const key = `Course${courseId}Unidad${unitId}`;
			return parseInt(localStorage.getItem(key) || "0");
		} else {
			// Calcular progreso promedio del curso desde localStorage
			const courses = JSON.parse(localStorage.getItem("courses") || "[]");
			const course = courses.find((c) => c.id === parseInt(courseId));

			if (!course) return 0;

			let totalProgress = 0;
			course.units.forEach((unit) => {
				const key = `Course${courseId}${unit.value}`;
				totalProgress += parseInt(localStorage.getItem(key) || "0");
			});

			return Math.round(totalProgress / course.units.length);
		}
	}, []);

	// Efectos
	useEffect(() => {
		if (autoLoad && isAuthenticated && effectiveUserId && !initialized) {
			loadProgress();
		}
	}, [autoLoad, isAuthenticated, effectiveUserId, initialized, loadProgress]);

	// Limpiar estados cuando el usuario se desautentica
	useEffect(() => {
		if (!isAuthenticated) {
			setProgress([]);
			setCourseProgress({});
			setOverallProgress({
				totalCourses: 0,
				completedCourses: 0,
				averageProgress: 0,
				totalUnits: 0,
				completedUnits: 0,
			});
			setError(null);
			setInitialized(false);
		}
	}, [isAuthenticated]);

	return {
		// Estados
		progress,
		courseProgress,
		overallProgress,
		loading,
		updating,
		error,
		initialized,

		// Métodos de carga
		loadProgress,

		// Métodos de actualización
		updateUnitProgress,
		completeQuiz,
		resetCourseProgress,
		updateCertificate,

		// Métodos de consulta
		getCourseProgress,
		getUnitProgress,
		isUnitCompleted,
		isCourseCompleted,
		getLocalStorageProgress,

		// Estadísticas calculadas
		totalProgress: progress.length,
		completedCoursesCount: overallProgress.completedCourses,
		averageProgressPercent: overallProgress.averageProgress,
	};
}
