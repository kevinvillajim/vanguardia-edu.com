// src/services/course/courseService.js
import {progressAPI, expDateAPI} from "../api/apiService";
import {ERROR_MESSAGES} from "../../utils/constants";
import cursos from "../../utils/cursos";

/**
 * Servicio centralizado para manejo de cursos y progreso
 * Utiliza el sistema de API centralizado
 */
class CourseService {
	constructor() {
		this.coursesCache = null;
		this.expDatesCache = null;
		this.userProgressCache = null;
		this.cacheTimeout = 5 * 60 * 1000; // 5 minutos
		this.lastCacheUpdate = null;
	}

	/**
	 * Obtener todos los cursos disponibles
	 * @returns {Promise<Array>} Lista de cursos
	 */
	async getCourses() {
		try {
			// Los cursos están definidos estáticamente en cursos.js
			// En el futuro podrían venir de la API
			return cursos;
		} catch (error) {
			console.error("CourseService getCourses error:", error);
			throw new Error(ERROR_MESSAGES.COURSE_NOT_FOUND);
		}
	}

	/**
	 * Obtener curso específico por ID
	 * @param {number} courseId - ID del curso
	 * @returns {Promise<Object>} Datos del curso
	 */
	async getCourse(courseId) {
		try {
			const courses = await this.getCourses();
			const course = courses.find((c) => c.id === parseInt(courseId));

			if (!course) {
				throw new Error(`Curso con ID ${courseId} no encontrado`);
			}

			return course;
		} catch (error) {
			console.error("CourseService getCourse error:", error);
			throw error;
		}
	}

	/**
	 * Obtener progreso del usuario actual
	 * @param {number} userId - ID del usuario (opcional)
	 * @returns {Promise<Array>} Progreso del usuario
	 */
	async getUserProgress(userId = null) {
		try {
			// Si se proporciona userId específico, usar endpoint de progreso general
			if (userId) {
				const allProgress = await progressAPI.getAllProgress();
				return allProgress.filter(
					(p) => parseInt(p.user_id) === parseInt(userId)
				);
			}

			// Usar endpoint de progreso del usuario actual
			return await progressAPI.getUserProgress();
		} catch (error) {
			console.error("CourseService getUserProgress error:", error);
			throw new Error("Error al obtener progreso del usuario");
		}
	}

	/**
	 * Obtener fechas de expiración
	 * @returns {Promise<Array>} Fechas de expiración
	 */
	async getExpDates() {
		try {
			return await expDateAPI.getExpDates();
		} catch (error) {
			console.error("CourseService getExpDates error:", error);
			throw new Error("Error al obtener fechas de expiración");
		}
	}

	/**
	 * Actualizar progreso de una unidad
	 * @param {Object} progressData - Datos del progreso
	 * @returns {Promise<Object>} Resultado de la actualización
	 */
	async updateProgress(progressData) {
		try {
			const result = await progressAPI.upsertProgress(progressData);

			// Actualizar cache local
			this.invalidateProgressCache();

			return result;
		} catch (error) {
			console.error("CourseService updateProgress error:", error);
			throw new Error("Error al actualizar progreso");
		}
	}

	/**
	 * Completar quiz de una unidad
	 * @param {Object} quizData - Datos del quiz completado
	 * @returns {Promise<Object>} Resultado
	 */
	async completeQuiz(quizData) {
		try {
			const progressData = {
				user_id: quizData.userId,
				course_id: quizData.courseId,
				unit_id: quizData.unitId,
				progress: 1, // 100%
				completed: true,
				score: quizData.score,
				attempted: 1,
				finishDate: new Date().toISOString().split("T")[0],
			};

			const result = await progressAPI.upsertProgress(progressData);

			// Actualizar localStorage
			localStorage.setItem(
				`Course${quizData.courseId}Quiz${quizData.unitId}`,
				"true"
			);
			localStorage.setItem(
				`Course${quizData.courseId}Unidad${quizData.unitId}`,
				"100"
			);
			localStorage.setItem(
				`Course${quizData.courseId}finishedDate`,
				progressData.finishDate
			);

			// Invalidar cache
			this.invalidateProgressCache();

			return result;
		} catch (error) {
			console.error("CourseService completeQuiz error:", error);
			throw new Error("Error al completar quiz");
		}
	}

	/**
	 * Eliminar progreso de un curso
	 * @param {number} userId - ID del usuario
	 * @param {number} courseId - ID del curso
	 * @returns {Promise<Object>} Resultado
	 */
	async deleteProgress(userId, courseId) {
		try {
			const result = await progressAPI.deleteProgress(userId, courseId);

			// Limpiar localStorage
			Object.keys(localStorage).forEach((key) => {
				if (key.includes(`Course${courseId}`)) {
					localStorage.removeItem(key);
				}
			});

			// Invalidar cache
			this.invalidateProgressCache();

			return result;
		} catch (error) {
			console.error("CourseService deleteProgress error:", error);
			throw new Error("Error al eliminar progreso");
		}
	}

	/**
	 * Actualizar certificado descargado
	 * @param {Object} certificateData - Datos del certificado
	 * @returns {Promise<Object>} Resultado
	 */
	async updateCertificate(certificateData) {
		try {
			return await progressAPI.updateCertificate(certificateData);
		} catch (error) {
			console.error("CourseService updateCertificate error:", error);
			throw new Error("Error al actualizar certificado");
		}
	}

	/**
	 * Calcular progreso de un curso específico
	 * @param {number} courseId - ID del curso
	 * @param {Array} userProgress - Progreso del usuario
	 * @returns {Object} Estadísticas del progreso
	 */
	calculateCourseProgress(courseId, userProgress) {
		try {
			const course = cursos.find((c) => c.id === parseInt(courseId));
			if (!course) {
				throw new Error(`Curso ${courseId} no encontrado`);
			}

			const courseProgress = userProgress.filter(
				(p) => parseInt(p.course_id) === parseInt(courseId)
			);

			const totalUnits = course.units.length;
			const completedUnits = courseProgress.filter((p) => p.completed).length;
			const averageProgress =
				courseProgress.reduce((acc, p) => acc + p.progress * 100, 0) /
				totalUnits;

			return {
				courseId: parseInt(courseId),
				totalUnits,
				completedUnits,
				averageProgress: Math.round(averageProgress),
				isCompleted: completedUnits === totalUnits && totalUnits > 0,
				units: courseProgress.map((p) => ({
					unitId: p.unit_id,
					progress: Math.round(p.progress * 100),
					completed: Boolean(p.completed),
					score: parseFloat(p.score) || 0,
					attempted: Boolean(p.attempted),
					finishDate: p.finishDate,
				})),
			};
		} catch (error) {
			console.error("CourseService calculateCourseProgress error:", error);
			return {
				courseId: parseInt(courseId),
				totalUnits: 0,
				completedUnits: 0,
				averageProgress: 0,
				isCompleted: false,
				units: [],
			};
		}
	}

	/**
	 * Verificar si un curso está disponible (no expirado)
	 * @param {number} courseId - ID del curso
	 * @param {Array} expDates - Fechas de expiración (opcional)
	 * @returns {Promise<boolean>} Si está disponible
	 */
	async isCourseAvailable(courseId, expDates = null) {
		try {
			const dates = expDates || (await this.getExpDates());
			const expDate = dates.find(
				(date) => parseInt(date.curso_id) === parseInt(courseId)
			);

			if (!expDate) {
				return true; // Si no hay fecha de expiración, está disponible
			}

			const currentDate = new Date();
			const deadlineDate = new Date(expDate.dead_line);
			return currentDate <= deadlineDate;
		} catch (error) {
			console.error("CourseService isCourseAvailable error:", error);
			return true; // En caso de error, asumir que está disponible
		}
	}

	/**
	 * Obtener cursos disponibles para el usuario
	 * @returns {Promise<Array>} Cursos disponibles
	 */
	async getAvailableCourses() {
		try {
			const [courses, expDates] = await Promise.all([
				this.getCourses(),
				this.getExpDates(),
			]);

			const availableCourses = [];

			for (const course of courses) {
				const isAvailable = await this.isCourseAvailable(course.id, expDates);
				if (isAvailable) {
					availableCourses.push(course);
				}
			}

			return availableCourses;
		} catch (error) {
			console.error("CourseService getAvailableCourses error:", error);
			throw new Error("Error al obtener cursos disponibles");
		}
	}

	/**
	 * Sincronizar progreso con localStorage
	 * @param {Array} progressData - Datos de progreso desde la API
	 */
	syncProgressWithLocalStorage(progressData) {
		try {
			// Limpiar localStorage existente de cursos
			Object.keys(localStorage).forEach((key) => {
				if (key.startsWith("Course") && !key.includes("initialOpenIndex")) {
					localStorage.removeItem(key);
				}
			});

			// Sincronizar con datos de la API
			const courseProgress = {};
			const completedUnits = {};

			progressData.forEach((progress) => {
				const progressKey = `Course${progress.course_id}Unidad${progress.unit_id}`;
				const progressPercent = Math.floor(progress.progress * 100);

				localStorage.setItem(progressKey, progressPercent.toString());

				if (!completedUnits[progress.course_id]) {
					completedUnits[progress.course_id] = new Set();
				}

				if (progress.completed) {
					completedUnits[progress.course_id].add(progress.unit_id);
					localStorage.setItem(
						`Course${progress.course_id}Quiz${progress.unit_id}`,
						"true"
					);

					if (progress.finishDate) {
						const finishDate = new Date(progress.finishDate);
						if (
							!courseProgress[progress.course_id] ||
							finishDate > courseProgress[progress.course_id]
						) {
							courseProgress[progress.course_id] = finishDate;
						}
					}
				}
			});

			// Marcar cursos completados
			cursos.forEach((course) => {
				const courseId = course.id;
				const totalUnits = course.units.length;
				const completedUnitCount = completedUnits[courseId]
					? completedUnits[courseId].size
					: 0;

				if (completedUnitCount === totalUnits) {
					localStorage.setItem(`Course${courseId}isFinished`, "true");
					const finishDate = courseProgress[courseId];
					if (finishDate) {
						localStorage.setItem(
							`Course${courseId}finishedDate`,
							finishDate.toISOString().split("T")[0]
						);
					}
				}
			});

			console.info("Progress synchronized with localStorage");
		} catch (error) {
			console.error("CourseService syncProgressWithLocalStorage error:", error);
		}
	}

	/**
	 * Invalidar cache de progreso
	 */
	invalidateProgressCache() {
		this.userProgressCache = null;
		this.lastCacheUpdate = null;
	}

	/**
	 * Invalidar todo el cache
	 */
	invalidateCache() {
		this.coursesCache = null;
		this.expDatesCache = null;
		this.userProgressCache = null;
		this.lastCacheUpdate = null;
	}
}

// Crear y exportar instancia singleton
export const courseService = new CourseService();
