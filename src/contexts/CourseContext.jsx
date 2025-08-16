// src/contexts/CourseContext.jsx
import {createContext, useContext, useReducer, useEffect} from "react";
import PropTypes from "prop-types";
import {courseService} from "../services/course/courseService";
import {useAuth} from "./AuthContext";
import {
	calculateCourseProgress,
	calculateOverallProgress,
} from "../features/courses/utils/progressCalculator";

// Tipos de acciones
const COURSE_ACTIONS = {
	SET_LOADING: "SET_LOADING",
	SET_COURSES: "SET_COURSES",
	SET_PROGRESS: "SET_PROGRESS",
	UPDATE_PROGRESS: "UPDATE_PROGRESS",
	SET_ERROR: "SET_ERROR",
	SET_CURRENT_COURSE: "SET_CURRENT_COURSE",
	UPDATE_UNIT_PROGRESS: "UPDATE_UNIT_PROGRESS",
	MARK_QUIZ_COMPLETED: "MARK_QUIZ_COMPLETED",
	SET_EXP_DATES: "SET_EXP_DATES",
	SET_COURSE_PROGRESS: "SET_COURSE_PROGRESS",
	SET_OVERALL_PROGRESS: "SET_OVERALL_PROGRESS",
	CLEAR_DATA: "CLEAR_DATA",
};

// Estado inicial
const initialState = {
	courses: [],
	progress: [],
	courseProgress: {},
	overallProgress: {
		totalCourses: 0,
		completedCourses: 0,
		averageProgress: 0,
		totalUnits: 0,
		completedUnits: 0,
	},
	currentCourse: null,
	currentUnit: null,
	expDates: [],
	isLoading: false,
	error: null,
	initialized: false,
};

// Reducer
function courseReducer(state, action) {
	switch (action.type) {
		case COURSE_ACTIONS.SET_LOADING:
			return {
				...state,
				isLoading: action.payload,
				error: action.payload ? null : state.error,
			};

		case COURSE_ACTIONS.SET_COURSES:
			return {
				...state,
				courses: action.payload,
				isLoading: false,
				error: null,
			};

		case COURSE_ACTIONS.SET_PROGRESS:
			return {
				...state,
				progress: action.payload,
				isLoading: false,
			};

		case COURSE_ACTIONS.SET_COURSE_PROGRESS:
			return {
				...state,
				courseProgress: action.payload,
			};

		case COURSE_ACTIONS.SET_OVERALL_PROGRESS:
			return {
				...state,
				overallProgress: action.payload,
			};

		case COURSE_ACTIONS.UPDATE_PROGRESS: {
			const {courseId, unitId, progressData} = action.payload;
			const key = `course_${courseId}_unit_${unitId}`;

			return {
				...state,
				progress: state.progress.map((p) =>
					parseInt(p.course_id) === courseId && parseInt(p.unit_id) === unitId
						? {...p, ...progressData}
						: p
				),
			};
		}

		case COURSE_ACTIONS.UPDATE_UNIT_PROGRESS: {
			const {courseId, unitId, progress} = action.payload;

			// Actualizar localStorage también
			localStorage.setItem(
				`Course${courseId}Unidad${unitId}`,
				progress.toString()
			);

			return {
				...state,
				progress: state.progress.map((p) =>
					parseInt(p.course_id) === courseId && parseInt(p.unit_id) === unitId
						? {...p, progress: progress / 100}
						: p
				),
			};
		}

		case COURSE_ACTIONS.MARK_QUIZ_COMPLETED: {
			const {courseId, unitId, score, finishDate} = action.payload;

			// Actualizar localStorage
			localStorage.setItem(`Course${courseId}Quiz${unitId}`, "true");
			localStorage.setItem(`Course${courseId}Unidad${unitId}`, "100");
			if (finishDate) {
				localStorage.setItem(`Course${courseId}finishedDate`, finishDate);
			}

			return {
				...state,
				progress: state.progress.map((p) =>
					parseInt(p.course_id) === courseId && parseInt(p.unit_id) === unitId
						? {
								...p,
								progress: 1,
								completed: true,
								score: score || p.score,
								finishDate: finishDate || p.finishDate,
						}
						: p
				),
			};
		}

		case COURSE_ACTIONS.SET_CURRENT_COURSE:
			return {
				...state,
				currentCourse: action.payload.course,
				currentUnit: action.payload.unit || null,
			};

		case COURSE_ACTIONS.SET_EXP_DATES:
			return {
				...state,
				expDates: action.payload,
			};

		case COURSE_ACTIONS.SET_ERROR:
			return {
				...state,
				error: action.payload,
				isLoading: false,
			};

		case COURSE_ACTIONS.CLEAR_DATA:
			return {
				...initialState,
			};

		default:
			return state;
	}
}

// Crear contexto
const CourseContext = createContext();

// Provider del contexto
export function CourseProvider({children}) {
	const [state, dispatch] = useReducer(courseReducer, initialState);
	const {user, isAuthenticated} = useAuth();

	// Cargar datos cuando el usuario esté autenticado
	useEffect(() => {
		if (isAuthenticated && user) {
			loadInitialData();
		} else {
			dispatch({type: COURSE_ACTIONS.CLEAR_DATA});
		}
	}, [isAuthenticated, user]);

	// Cargar datos iniciales
	const loadInitialData = async () => {
		try {
			dispatch({type: COURSE_ACTIONS.SET_LOADING, payload: true});

			// Cargar datos en paralelo
			const [coursesData, progressData, expDatesData] = await Promise.all([
				courseService.getCourses(),
				courseService.getUserProgress(),
				courseService.getExpDates(),
			]);

			dispatch({type: COURSE_ACTIONS.SET_COURSES, payload: coursesData});
			dispatch({type: COURSE_ACTIONS.SET_EXP_DATES, payload: expDatesData});
			dispatch({type: COURSE_ACTIONS.SET_PROGRESS, payload: progressData});

			// Calcular progreso por curso
			const courseProgressData = {};
			coursesData.forEach((course) => {
				courseProgressData[course.id] = calculateCourseProgress(
					course,
					progressData
				);
			});
			dispatch({
				type: COURSE_ACTIONS.SET_COURSE_PROGRESS,
				payload: courseProgressData,
			});

			// Calcular progreso general
			const overallProgress = calculateOverallProgress(
				coursesData,
				progressData
			);
			dispatch({
				type: COURSE_ACTIONS.SET_OVERALL_PROGRESS,
				payload: overallProgress,
			});

			// Sincronizar con localStorage
			courseService.syncProgressWithLocalStorage(progressData);

			state.initialized = true;
		} catch (error) {
			console.error("Error loading initial course data:", error);
			dispatch({
				type: COURSE_ACTIONS.SET_ERROR,
				payload: "Error al cargar los datos del curso",
			});
		}
	};

	// Actualizar progreso de unidad
	const updateUnitProgress = async (courseId, unitId, progressPercent) => {
		try {
			// Actualizar estado local inmediatamente
			dispatch({
				type: COURSE_ACTIONS.UPDATE_UNIT_PROGRESS,
				payload: {courseId, unitId, progress: progressPercent},
			});

			// Enviar al servidor
			const result = await courseService.updateProgress({
				user_id: user.id,
				course_id: courseId,
				unit_id: unitId,
				progress: progressPercent / 100,
				completed: progressPercent >= 100,
			});

			// Recargar datos para mantener sincronización
			await loadInitialData();

			return result;
		} catch (error) {
			console.error("Error updating progress:", error);
			// Revertir cambio local en caso de error
			await loadInitialData();
			throw error;
		}
	};

	// Completar quiz
	const completeQuiz = async (courseId, unitId, score) => {
		try {
			const finishDate = new Date().toISOString().split("T")[0];

			// Actualizar estado local
			dispatch({
				type: COURSE_ACTIONS.MARK_QUIZ_COMPLETED,
				payload: {courseId, unitId, score, finishDate},
			});

			// Enviar al servidor usando el servicio centralizado
			const result = await courseService.completeQuiz({
				userId: user.id,
				courseId,
				unitId,
				score,
			});

			// Recargar datos para mantener sincronización
			await loadInitialData();

			return {success: true, data: result};
		} catch (error) {
			console.error("Error completing quiz:", error);
			// Recargar datos en caso de error
			await loadInitialData();
			return {success: false, error: error.message};
		}
	};

	// Obtener progreso de un curso específico
	const getCourseProgress = (courseId) => {
		return (
			state.courseProgress[courseId] || {
				courseId: parseInt(courseId),
				totalUnits: 0,
				completedUnits: 0,
				averageProgress: 0,
				isCompleted: false,
				units: [],
			}
		);
	};

	// Verificar si un curso está disponible (no expirado)
	const isCourseAvailable = (courseId) => {
		const expDate = state.expDates.find(
			(date) => parseInt(date.curso_id) === parseInt(courseId)
		);
		if (!expDate) return true;

		const currentDate = new Date();
		const deadlineDate = new Date(expDate.dead_line);
		return currentDate <= deadlineDate;
	};

	// Obtener cursos disponibles para el usuario
	const getAvailableCourses = () => {
		return state.courses.filter((course) => isCourseAvailable(course.id));
	};

	// Resetear progreso de un curso
	const resetCourseProgress = async (courseId) => {
		try {
			// Llamar al servicio centralizado
			const result = await courseService.deleteProgress(user.id, courseId);

			// Recargar datos
			await loadInitialData();

			return {success: true, data: result};
		} catch (error) {
			console.error("Error resetting course progress:", error);
			return {success: false, error: error.message};
		}
	};

	// Establecer curso actual
	const setCurrentCourse = (course, unit = null) => {
		dispatch({
			type: COURSE_ACTIONS.SET_CURRENT_COURSE,
			payload: {course, unit},
		});
	};

	// Actualizar certificado
	const updateCertificate = async (courseId) => {
		try {
			const result = await courseService.updateCertificate({
				user_id: user.id,
				course_id: courseId,
				certificate: 1,
			});

			return {success: true, data: result};
		} catch (error) {
			console.error("Error updating certificate:", error);
			return {success: false, error: error.message};
		}
	};

	// Valores del contexto
	const value = {
		// Estado
		...state,

		// Acciones
		updateUnitProgress,
		completeQuiz,
		resetCourseProgress,
		setCurrentCourse,
		loadInitialData,
		updateCertificate,

		// Utilidades
		getCourseProgress,
		isCourseAvailable,
		getAvailableCourses,

		// Estadísticas calculadas
		totalCourses: state.courses.length,
		availableCoursesCount: getAvailableCourses().length,
		completedCoursesCount: state.overallProgress.completedCourses,
		averageProgressPercent: state.overallProgress.averageProgress,
	};

	return (
		<CourseContext.Provider value={value}>{children}</CourseContext.Provider>
	);
}

CourseProvider.propTypes = {
	children: PropTypes.node.isRequired,
};

// Hook para usar el contexto
export function useCourse() {
	const context = useContext(CourseContext);
	if (!context) {
		throw new Error("useCourse debe ser usado dentro de un CourseProvider");
	}
	return context;
}

// Exportar constantes
export {COURSE_ACTIONS};
