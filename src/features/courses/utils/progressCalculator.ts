// src/features/courses/utils/progressCalculator.js

/**
 * Calcula el progreso de un curso específico basado en los datos del usuario
 * @param {Object} course - Datos del curso
 * @param {Array} userProgress - Array de progreso del usuario
 * @returns {Object} Estadísticas del progreso del curso
 */
export function calculateCourseProgress(course, userProgress) {
	try {
		if (!course || !course.units || !Array.isArray(userProgress)) {
			return {
				courseId: course?.id || 0,
				totalUnits: course?.units?.length || 0,
				completedUnits: 0,
				averageProgress: 0,
				isCompleted: false,
				units: [],
			};
		}

		const courseId = course.id;
		const totalUnits = course.units.length;

		// Filtrar progreso específico del curso
		const courseProgressData = userProgress.filter(
			(p) => parseInt(p.course_id) === parseInt(courseId)
		);

		// Calcular estadísticas por unidad
		const units = course.units.map((unit, index) => {
			const unitId = index + 1; // Asumiendo que las unidades empiezan en 1
			const unitProgress = courseProgressData.find(
				(p) => parseInt(p.unit_id) === unitId
			);

			return {
				unitId,
				unitName: unit.unit || `Unidad ${unitId}`,
				progress: unitProgress ? Math.round(unitProgress.progress * 100) : 0,
				completed: unitProgress ? Boolean(unitProgress.completed) : false,
				score: unitProgress ? parseFloat(unitProgress.score) || 0 : 0,
				attempted: unitProgress ? Boolean(unitProgress.attempted) : false,
				finishDate: unitProgress?.finishDate || null,
				createdAt: unitProgress?.created_at || null,
				updatedAt: unitProgress?.updated_at || null,
			};
		});

		// Calcular estadísticas generales del curso
		const completedUnits = units.filter((unit) => unit.completed).length;
		const totalProgress = units.reduce((sum, unit) => sum + unit.progress, 0);
		const averageProgress =
			totalUnits > 0 ? Math.round(totalProgress / totalUnits) : 0;
		const isCompleted = completedUnits === totalUnits && totalUnits > 0;

		// Calcular score promedio
		const unitsWithScore = units.filter((unit) => unit.score > 0);
		const averageScore =
			unitsWithScore.length > 0
				? Math.round(
						unitsWithScore.reduce((sum, unit) => sum + unit.score, 0) /
							unitsWithScore.length
				)
				: 0;

		// Encontrar fecha de finalización del curso (última unidad completada)
		const completedUnitsWithDate = units.filter(
			(unit) => unit.completed && unit.finishDate
		);
		const courseFinishDate =
			completedUnitsWithDate.length > 0
				? completedUnitsWithDate.reduce((latest, unit) => {
						const unitDate = new Date(unit.finishDate);
						const latestDate = new Date(latest);
						return unitDate > latestDate ? unit.finishDate : latest;
				}, completedUnitsWithDate[0].finishDate)
				: null;

		return {
			courseId: parseInt(courseId),
			courseName: course.title || `Curso ${courseId}`,
			totalUnits,
			completedUnits,
			averageProgress,
			averageScore,
			isCompleted,
			courseFinishDate,
			units,

			// Estadísticas adicionales
			progressPercentage: averageProgress,
			completionRate:
				totalUnits > 0 ? Math.round((completedUnits / totalUnits) * 100) : 0,
			hasStarted: units.some((unit) => unit.progress > 0),
			nextUnit: units.find((unit) => !unit.completed) || null,
			lastActivity:
				courseProgressData.length > 0
					? Math.max(
							...courseProgressData.map((p) =>
								new Date(p.updated_at || p.created_at).getTime()
							)
					)
					: null,
		};
	} catch (error) {
		console.error("calculateCourseProgress error:", error);
		return {
			courseId: course?.id || 0,
			totalUnits: course?.units?.length || 0,
			completedUnits: 0,
			averageProgress: 0,
			isCompleted: false,
			units: [],
		};
	}
}

/**
 * Calcula el progreso general del usuario en todos los cursos
 * @param {Array} courses - Array de cursos disponibles
 * @param {Array} userProgress - Array de progreso del usuario
 * @returns {Object} Estadísticas generales de progreso
 */
export function calculateOverallProgress(courses, userProgress) {
	try {
		if (!Array.isArray(courses) || !Array.isArray(userProgress)) {
			return {
				totalCourses: 0,
				completedCourses: 0,
				averageProgress: 0,
				totalUnits: 0,
				completedUnits: 0,
				averageScore: 0,
				coursesProgress: [],
			};
		}

		// Calcular progreso para cada curso
		const coursesProgress = courses.map((course) =>
			calculateCourseProgress(course, userProgress)
		);

		// Estadísticas generales
		const totalCourses = courses.length;
		const completedCourses = coursesProgress.filter(
			(cp) => cp.isCompleted
		).length;
		const totalUnits = coursesProgress.reduce(
			(sum, cp) => sum + cp.totalUnits,
			0
		);
		const completedUnits = coursesProgress.reduce(
			(sum, cp) => sum + cp.completedUnits,
			0
		);

		// Progreso promedio ponderado por unidades
		const totalProgress = coursesProgress.reduce(
			(sum, cp) => sum + cp.averageProgress * cp.totalUnits,
			0
		);
		const averageProgress =
			totalUnits > 0 ? Math.round(totalProgress / totalUnits) : 0;

		// Score promedio
		const coursesWithScore = coursesProgress.filter(
			(cp) => cp.averageScore > 0
		);
		const averageScore =
			coursesWithScore.length > 0
				? Math.round(
						coursesWithScore.reduce((sum, cp) => sum + cp.averageScore, 0) /
							coursesWithScore.length
				)
				: 0;

		// Estadísticas por estado
		const notStartedCourses = coursesProgress.filter(
			(cp) => !cp.hasStarted
		).length;
		const inProgressCourses = coursesProgress.filter(
			(cp) => cp.hasStarted && !cp.isCompleted
		).length;

		return {
			totalCourses,
			completedCourses,
			inProgressCourses,
			notStartedCourses,
			averageProgress,
			totalUnits,
			completedUnits,
			averageScore,
			coursesProgress,

			// Ratios y porcentajes
			completionRate:
				totalCourses > 0
					? Math.round((completedCourses / totalCourses) * 100)
					: 0,
			unitCompletionRate:
				totalUnits > 0 ? Math.round((completedUnits / totalUnits) * 100) : 0,

			// Estado general
			hasStartedLearning: coursesProgress.some((cp) => cp.hasStarted),
			isAllCompleted: totalCourses > 0 && completedCourses === totalCourses,

			// Actividad reciente
			lastActivity: coursesProgress.reduce((latest, cp) => {
				return cp.lastActivity && cp.lastActivity > latest
					? cp.lastActivity
					: latest;
			}, 0),
		};
	} catch (error) {
		console.error("calculateOverallProgress error:", error);
		return {
			totalCourses: 0,
			completedCourses: 0,
			averageProgress: 0,
			totalUnits: 0,
			completedUnits: 0,
			coursesProgress: [],
		};
	}
}

/**
 * Calcula el progreso de una unidad específica
 * @param {Array} userProgress - Array de progreso del usuario
 * @param {number} courseId - ID del curso
 * @param {number} unitId - ID de la unidad
 * @returns {Object} Datos de progreso de la unidad
 */
export function calculateUnitProgress(userProgress, courseId, unitId) {
	try {
		const unitProgress = userProgress.find(
			(p) =>
				parseInt(p.course_id) === parseInt(courseId) &&
				parseInt(p.unit_id) === parseInt(unitId)
		);

		if (!unitProgress) {
			return {
				courseId: parseInt(courseId),
				unitId: parseInt(unitId),
				progress: 0,
				completed: false,
				score: 0,
				attempted: false,
				finishDate: null,
				exists: false,
			};
		}

		return {
			courseId: parseInt(courseId),
			unitId: parseInt(unitId),
			progress: Math.round(unitProgress.progress * 100),
			completed: Boolean(unitProgress.completed),
			score: parseFloat(unitProgress.score) || 0,
			attempted: Boolean(unitProgress.attempted),
			finishDate: unitProgress.finishDate,
			createdAt: unitProgress.created_at,
			updatedAt: unitProgress.updated_at,
			exists: true,
		};
	} catch (error) {
		console.error("calculateUnitProgress error:", error);
		return {
			courseId: parseInt(courseId),
			unitId: parseInt(unitId),
			progress: 0,
			completed: false,
			score: 0,
			attempted: false,
			finishDate: null,
			exists: false,
		};
	}
}

/**
 * Obtiene estadísticas de progreso para un período específico
 * @param {Array} userProgress - Array de progreso del usuario
 * @param {Date} startDate - Fecha de inicio
 * @param {Date} endDate - Fecha de fin
 * @returns {Object} Estadísticas del período
 */
export function getProgressStatsForPeriod(userProgress, startDate, endDate) {
	try {
		const periodProgress = userProgress.filter((p) => {
			const progressDate = new Date(p.updated_at || p.created_at);
			return progressDate >= startDate && progressDate <= endDate;
		});

		return {
			totalActivities: periodProgress.length,
			unitsCompleted: periodProgress.filter((p) => p.completed).length,
			averageScore:
				periodProgress.length > 0
					? Math.round(
							periodProgress.reduce(
								(sum, p) => sum + (parseFloat(p.score) || 0),
								0
							) / periodProgress.length
					)
					: 0,
			coursesActive: [...new Set(periodProgress.map((p) => p.course_id))]
				.length,
			firstActivity:
				periodProgress.length > 0
					? Math.min(
							...periodProgress.map((p) => new Date(p.created_at).getTime())
					)
					: null,
			lastActivity:
				periodProgress.length > 0
					? Math.max(
							...periodProgress.map((p) =>
								new Date(p.updated_at || p.created_at).getTime()
							)
					)
					: null,
		};
	} catch (error) {
		console.error("getProgressStatsForPeriod error:", error);
		return {
			totalActivities: 0,
			unitsCompleted: 0,
			averageScore: 0,
			coursesActive: 0,
			firstActivity: null,
			lastActivity: null,
		};
	}
}

/**
 * Sincroniza datos de progreso con localStorage
 * @param {Array} userProgress - Array de progreso del usuario
 * @param {Array} courses - Array de cursos
 */
export function syncProgressWithLocalStorage(userProgress, courses) {
	try {
		// Limpiar localStorage de cursos previo
		Object.keys(localStorage).forEach((key) => {
			if (key.startsWith("Course") && !key.includes("initialOpenIndex")) {
				localStorage.removeItem(key);
			}
		});

		const courseCompletion = {};

		// Sincronizar progreso por unidad
		userProgress.forEach((progress) => {
			const courseId = progress.course_id;
			const unitId = progress.unit_id;
			const progressPercent = Math.floor(progress.progress * 100);

			// Guardar progreso de unidad
			localStorage.setItem(
				`Course${courseId}Unidad${unitId}`,
				progressPercent.toString()
			);

			// Marcar quiz completado si está terminado
			if (progress.completed) {
				localStorage.setItem(`Course${courseId}Quiz${unitId}`, "true");
			}

			// Trackear completación por curso
			if (!courseCompletion[courseId]) {
				courseCompletion[courseId] = {
					completed: [],
					finishDates: [],
				};
			}

			if (progress.completed) {
				courseCompletion[courseId].completed.push(unitId);
				if (progress.finishDate) {
					courseCompletion[courseId].finishDates.push(
						new Date(progress.finishDate)
					);
				}
			}
		});

		// Marcar cursos completados
		courses.forEach((course) => {
			const courseId = course.id;
			const totalUnits = course.units.length;
			const completed = courseCompletion[courseId]?.completed || [];

			if (completed.length === totalUnits) {
				localStorage.setItem(`Course${courseId}isFinished`, "true");

				// Guardar fecha de finalización más reciente
				const finishDates = courseCompletion[courseId].finishDates;
				if (finishDates.length > 0) {
					const latestFinish = new Date(Math.max(...finishDates));
					localStorage.setItem(
						`Course${courseId}finishedDate`,
						latestFinish.toISOString().split("T")[0]
					);
				}
			}
		});

		console.info("Progress synchronized with localStorage successfully");
	} catch (error) {
		console.error("syncProgressWithLocalStorage error:", error);
	}
}

/**
 * Obtiene el progreso desde localStorage (fallback)
 * @param {number} courseId - ID del curso
 * @param {number} unitId - ID de la unidad (opcional)
 * @returns {number|Object} Progreso de la unidad o curso
 */
export function getProgressFromLocalStorage(courseId, unitId = null) {
	try {
		if (unitId) {
			// Progreso de unidad específica
			const key = `Course${courseId}Unidad${unitId}`;
			return parseInt(localStorage.getItem(key) || "0");
		} else {
			// Progreso promedio del curso
			const keys = Object.keys(localStorage).filter((key) =>
				key.startsWith(`Course${courseId}Unidad`)
			);

			if (keys.length === 0) return 0;

			const totalProgress = keys.reduce((sum, key) => {
				return sum + parseInt(localStorage.getItem(key) || "0");
			}, 0);

			return Math.round(totalProgress / keys.length);
		}
	} catch (error) {
		console.error("getProgressFromLocalStorage error:", error);
		return unitId ? 0 : 0;
	}
}

/**
 * Valida la integridad de los datos de progreso
 * @param {Array} userProgress - Array de progreso del usuario
 * @returns {Object} Resultado de validación
 */
export function validateProgressData(userProgress) {
	const errors = [];
	const warnings = [];

	try {
		if (!Array.isArray(userProgress)) {
			errors.push("Progress data must be an array");
			return {isValid: false, errors, warnings};
		}

		userProgress.forEach((progress, index) => {
			// Validar campos requeridos
			if (!progress.user_id) {
				errors.push(`Progress[${index}]: Missing user_id`);
			}
			if (!progress.course_id) {
				errors.push(`Progress[${index}]: Missing course_id`);
			}
			if (!progress.unit_id) {
				errors.push(`Progress[${index}]: Missing unit_id`);
			}

			// Validar tipos de datos
			if (
				progress.progress !== undefined &&
				(typeof progress.progress !== "number" ||
					progress.progress < 0 ||
					progress.progress > 1)
			) {
				errors.push(
					`Progress[${index}]: Progress must be a number between 0 and 1`
				);
			}

			// Validar consistencia
			if (progress.completed && progress.progress < 1) {
				warnings.push(
					`Progress[${index}]: Unit marked as completed but progress < 100%`
				);
			}

			if (!progress.completed && progress.progress === 1) {
				warnings.push(
					`Progress[${index}]: Progress is 100% but unit not marked as completed`
				);
			}
		});

		return {
			isValid: errors.length === 0,
			errors,
			warnings,
			totalRecords: userProgress.length,
		};
	} catch (error) {
		console.error("validateProgressData error:", error);
		return {
			isValid: false,
			errors: ["Validation process failed"],
			warnings: [],
		};
	}
}
