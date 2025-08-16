// src/pages/student/Dashboard/ModernStudentDashboard.jsx
import {useState, useEffect} from "react";
import {motion} from "motion/react";
import ModernTemplate from "../../../components/layout/ModernTemplate/ModernTemplate";
import ModernCourseCard from "../../../features/courses/components/CourseCard/ModernCourseCard";
import {
	StatsCard,
	ChartCard,
	ProgressRing,
	ActivityFeed,
	Button,
} from "../../../components/ui";
import cursos from "../../../utils/cursos";
import {getFromLocalStorage} from "../../../utils/crypto";

const ModernStudentDashboard = () => {
	const [user, setUser] = useState(null);
	const [expDates, setExpDates] = useState([]);
	const [recentActivity, setRecentActivity] = useState([]);
	const [loading, setLoading] = useState(true);

	useEffect(() => {
		try {
			// Remover JSON.parse - getFromLocalStorage ya retorna datos deserializados
			const userData = getFromLocalStorage("user");
			const expDatesData = getFromLocalStorage("expDates") || [];

			setUser(userData);
			setExpDates(expDatesData);

			// Generate recent activity (this would come from API in real app)
			setRecentActivity([
				{
					id: 1,
					type: "course_progress",
					message: "Completaste la lección 'Introducción a la Seguridad'",
					time: "hace 2 horas",
				},
				{
					id: 2,
					type: "certificate_earned",
					message: "¡Obtuviste tu certificado de Protección de Datos!",
					time: "hace 1 día",
				},
				{
					id: 3,
					type: "course_started",
					message: "Comenzaste el curso de Ciberseguridad Empresarial",
					time: "hace 3 días",
				},
			]);
		} catch (error) {
			console.error("Error loading dashboard data:", error);
			// En caso de error, mantener valores por defecto
			setUser(null);
			setExpDates([]);
			setRecentActivity([]);
		} finally {
			setLoading(false);
		}
	}, []);

	const isCourseAvailable = (cursoId) => {
		const expDate = expDates.find(
			(date) => parseInt(date.curso_id) === cursoId
		);
		if (!expDate) return true;
		const currentDate = new Date();
		const deadlineDate = new Date(expDate.dead_line);
		return currentDate <= deadlineDate;
	};

	// Calculate user stats - same logic as original
	const totalCourses = cursos.length;
	const availableCourses = cursos.filter((_, index) =>
		isCourseAvailable(index)
	).length;

	let completedCourses = 0;
	let totalProgress = 0;
	let totalTimeSpent = 0;

	const courseStats = cursos.map((curso, index) => {
		const courseProgress = curso.units.reduce((acc, unit) => {
			const unitProgress = localStorage.getItem(`Course${index}${unit.value}`);
			return acc + (unitProgress ? parseInt(unitProgress, 10) : 0);
		}, 0);

		const avgProgress = courseProgress / curso.units.length;
		totalProgress += avgProgress;

		const completedLessons = curso.units.filter((unit) => {
			const unitProgress = localStorage.getItem(`Course${index}${unit.value}`);
			return unitProgress && parseInt(unitProgress, 10) >= 100;
		}).length;

		if (avgProgress >= 100) {
			completedCourses++;
		}

		// Estimate time spent (this would come from API)
		totalTimeSpent += completedLessons * 30; // 30 min per lesson

		return {
			courseIndex: index,
			progress: Math.round(avgProgress),
			completedLessons,
			totalLessons: curso.units.length,
			isAvailable: isCourseAvailable(index),
		};
	});

	const overallProgress = totalProgress / totalCourses;

	const statsData = [
		{
			title: "Cursos Disponibles",
			value: availableCourses,
			change:
				cursos.length > availableCourses
					? `${cursos.length - availableCourses} bloqueados`
					: "Todos disponibles",
			changeType: cursos.length > availableCourses ? "warning" : "positive",
			icon: (
				<svg
					className="w-6 h-6"
					fill="none"
					stroke="currentColor"
					viewBox="0 0 24 24"
				>
					<path
						strokeLinecap="round"
						strokeLinejoin="round"
						strokeWidth={2}
						d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C20.832 18.477 19.246 18 17.5 18c-1.746 0-3.332.477-4.5 1.253"
					/>
				</svg>
			),
			color: "blue",
		},
		{
			title: "Cursos Completados",
			value: completedCourses,
			change:
				completedCourses > 0 ? "+1 este mes" : "¡Completa tu primer curso!",
			changeType: completedCourses > 0 ? "positive" : "neutral",
			icon: (
				<svg
					className="w-6 h-6"
					fill="none"
					stroke="currentColor"
					viewBox="0 0 24 24"
				>
					<path
						strokeLinecap="round"
						strokeLinejoin="round"
						strokeWidth={2}
						d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
					/>
				</svg>
			),
			color: "green",
		},
		{
			title: "Progreso General",
			value: `${Math.round(overallProgress)}%`,
			change:
				overallProgress >= 75
					? "¡Excelente progreso!"
					: overallProgress >= 50
					? "Buen avance"
					: "Sigue adelante",
			changeType: overallProgress >= 50 ? "positive" : "neutral",
			icon: (
				<svg
					className="w-6 h-6"
					fill="none"
					stroke="currentColor"
					viewBox="0 0 24 24"
				>
					<path
						strokeLinecap="round"
						strokeLinejoin="round"
						strokeWidth={2}
						d="M13 10V3L4 14h7v7l9-11h-7z"
					/>
				</svg>
			),
			color: "purple",
		},
		{
			title: "Tiempo Estudiado",
			value: `${Math.round(totalTimeSpent / 60)}h`,
			change: `${totalTimeSpent % 60}min adicionales`,
			changeType: "positive",
			icon: (
				<svg
					className="w-6 h-6"
					fill="none"
					stroke="currentColor"
					viewBox="0 0 24 24"
				>
					<path
						strokeLinecap="round"
						strokeLinejoin="round"
						strokeWidth={2}
						d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
					/>
				</svg>
			),
			color: "orange",
		},
	];

	// Get continue studying course (highest progress but not completed)
	const continueStudyingCourse = courseStats
		.filter(
			(stat) => stat.progress > 0 && stat.progress < 100 && stat.isAvailable
		)
		.sort((a, b) => b.progress - a.progress)[0];

	// Get recommended courses (available but not started)
	const recommendedCourses = courseStats
		.filter((stat) => stat.progress === 0 && stat.isAvailable)
		.slice(0, 2);

	if (loading || !user) {
		return (
			<div className="w-screen h-screen flex justify-center items-center">
				<div className="loader-4">
					<div className="loader-square"></div>
					<div className="loader-square"></div>
					<div className="loader-square"></div>
					<div className="loader-square"></div>
					<div className="loader-square"></div>
					<div className="loader-square"></div>
					<div className="loader-square"></div>
				</div>
			</div>
		);
	}

	return (
		<ModernTemplate rol="Estudiante" title="Mi Aprendizaje">
			<div className="space-y-6">
				{/* Welcome Section */}
				<motion.div
					initial={{opacity: 0, y: -20}}
					animate={{opacity: 1, y: 0}}
					className="bg-gradient-to-r from-green-800 to-green-500 rounded-2xl p-6 text-white overflow-hidden relative"
				>
					{/* Background decoration */}
					<div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-16 -mt-16" />
					<div className="absolute bottom-0 left-0 w-24 h-24 bg-white/10 rounded-full -ml-12 -mb-12" />

					<div className="relative z-10">
						<h2 className="text-2xl font-bold mb-2">
							¡Hola, {user?.name || "Estudiante"}! 👋
						</h2>
						<p className="text-purple-100 mb-4">
							Continúa tu aprendizaje donde lo dejaste y alcanza tus objetivos
						</p>

						{continueStudyingCourse && (
							<div className="flex items-center space-x-4 bg-white/10 backdrop-blur-sm rounded-lg p-3">
								<ProgressRing
									progress={continueStudyingCourse.progress}
									size={40}
									color="orange"
									strokeWidth={4}
									showPercentage={false}
								/>
								<div className="flex-1">
									<p className="font-medium text-sm">Continúa estudiando:</p>
									<p className="text-purple-100 text-sm">
										{cursos[continueStudyingCourse.courseIndex].title}
									</p>
								</div>
								<Button
									variant="secondary"
									size="sm"
									onClick={() =>
										(window.location.href =
											cursos[continueStudyingCourse.courseIndex].link)
									}
									className="bg-white/20 hover:bg-white/30 border-white/30"
								>
									Continuar
								</Button>
							</div>
						)}
					</div>
				</motion.div>

				{/* Stats */}
				<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
					{statsData.map((stat, index) => (
						<motion.div
							key={index}
							initial={{opacity: 0, y: 20}}
							animate={{opacity: 1, y: 0}}
							transition={{delay: index * 0.1}}
						>
							<StatsCard {...stat} />
						</motion.div>
					))}
				</div>

				{/* Main Content Grid */}
				<div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
					{/* Progress Overview */}
					<div className="lg:col-span-2 space-y-6">
						{/* Quick Actions */}
						<ChartCard
							title="Acciones Rápidas"
							subtitle="Herramientas para acelerar tu aprendizaje"
						>
							<div className="grid grid-cols-2 md:grid-cols-4 gap-3">
								<Button
									variant="outline"
									className="flex-col h-20 space-y-2"
									onClick={() =>
										(window.location.href = "/estudiante/certificados")
									}
								>
									<svg
										className="w-5 h-5"
										fill="none"
										stroke="currentColor"
										viewBox="0 0 24 24"
									>
										<path
											strokeLinecap="round"
											strokeLinejoin="round"
											strokeWidth={2}
											d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z"
										/>
									</svg>
									<span className="text-xs">Certificados</span>
								</Button>
								<Button
									variant="outline"
									className="flex-col h-20 space-y-2"
									onClick={() => (window.location.href = "/profile")}
								>
									<svg
										className="w-5 h-5"
										fill="none"
										stroke="currentColor"
										viewBox="0 0 24 24"
									>
										<path
											strokeLinecap="round"
											strokeLinejoin="round"
											strokeWidth={2}
											d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
										/>
									</svg>
									<span className="text-xs">Mi Perfil</span>
								</Button>
								<Button variant="outline" className="flex-col h-20 space-y-2">
									<svg
										className="w-5 h-5"
										fill="none"
										stroke="currentColor"
										viewBox="0 0 24 24"
									>
										<path
											strokeLinecap="round"
											strokeLinejoin="round"
											strokeWidth={2}
											d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
										/>
									</svg>
									<span className="text-xs">Ayuda</span>
								</Button>
								<Button variant="outline" className="flex-col h-20 space-y-2">
									<svg
										className="w-5 h-5"
										fill="none"
										stroke="currentColor"
										viewBox="0 0 24 24"
									>
										<path
											strokeLinecap="round"
											strokeLinejoin="round"
											strokeWidth={2}
											d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
										/>
									</svg>
									<span className="text-xs">Progreso</span>
								</Button>
							</div>
						</ChartCard>

						{/* Recommended Courses */}
						{recommendedCourses.length > 0 && (
							<ChartCard
								title="Cursos Recomendados"
								subtitle="Comienza estos cursos para expandir tus conocimientos"
							>
								<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
									{recommendedCourses.map((courseStat) => {
										const curso = cursos[courseStat.courseIndex];
										return (
											<div
												key={courseStat.courseIndex}
												className="border border-gray-200 dark:border-gray-700 rounded-lg p-4 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
											>
												<div className="flex items-center space-x-3 mb-3">
													<img
														src={curso.img}
														alt={curso.title}
														className="w-12 h-12 rounded-lg object-cover"
													/>
													<div className="flex-1">
														<h4 className="font-medium text-sm text-gray-900 dark:text-white">
															{curso.title}
														</h4>
														<p className="text-xs text-gray-500 dark:text-gray-400">
															{curso.units.length} lecciones
														</p>
													</div>
												</div>
												<Button
													variant="outline"
													size="sm"
													fullWidth
													onClick={() => (window.location.href = curso.link)}
												>
													Comenzar
												</Button>
											</div>
										);
									})}
								</div>
							</ChartCard>
						)}
					</div>

					{/* Activity Feed */}
					<div>
						<ChartCard
							title="Actividad Reciente"
							subtitle="Tu progreso de aprendizaje"
						>
							<ActivityFeed activities={recentActivity} />
						</ChartCard>
					</div>
				</div>

				{/* All Courses Grid */}
				<div>
					<div className="flex items-center justify-between mb-6">
						<h3 className="text-xl font-bold text-gray-900 dark:text-white">
							Todos los Cursos
						</h3>
						<span className="text-sm text-gray-500 dark:text-gray-400">
							{availableCourses} de {cursos.length} disponibles
						</span>
					</div>

					<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
						{cursos.map((curso, index) => {
							const courseStat = courseStats[index];
							return (
								<motion.div
									key={index}
									initial={{opacity: 0, y: 20}}
									animate={{opacity: 1, y: 0}}
									transition={{delay: index * 0.1}}
								>
									<ModernCourseCard
										title={curso.title}
										description={curso.content}
										image={curso.img}
										progress={courseStat.progress}
										totalLessons={courseStat.totalLessons}
										completedLessons={courseStat.completedLessons}
										duration={`${curso.units.length} lecciones`}
										difficulty="Intermedio"
										instructor="Instructor COOPROGRESO"
										tags={[
											"Seguridad",
											"Protección de Datos",
											"Ciberseguridad",
										]}
										link={curso.link}
										isLocked={!courseStat.isAvailable}
										isNew={index === 0}
									/>
								</motion.div>
							);
						})}
					</div>
				</div>
			</div>
		</ModernTemplate>
	);
};

export default ModernStudentDashboard;
