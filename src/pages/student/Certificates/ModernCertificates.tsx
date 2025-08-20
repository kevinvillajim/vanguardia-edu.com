// src/pages/student/Certificates/ModernCertificates.jsx
import {useEffect, useState} from "react";
import {motion, AnimatePresence} from "motion/react";
import ModernTemplate from "../../../components/layout/ModernTemplate/ModernTemplate";
import {
	Card,
	Button,
	Breadcrumbs,
	EmptyState,
	LoadingSpinner,
	StatsCard,
} from "../../../components/ui";
import cursos from "../../../utils/cursos";
import {getFromLocalStorage} from "../../../utils/crypto";
import api from "../../../config/api";

const ModernCertificates = () => {
	const [user, setUser] = useState(null);
	const [finishedCourses, setFinishedCourses] = useState([]);
	const [loading, setLoading] = useState(true);
	const [selectedCertificate, setSelectedCertificate] = useState(null);

	const breadcrumbItems = [
		{label: "Dashboard", href: "/estudiante/dashboard"},
		{label: "Mis Certificados"},
	];

	useEffect(() => {
		const userData = JSON.parse(getFromLocalStorage("user"));
		setUser(userData);
		if (userData) {
			checkCoursesCompletion(userData.id);
		}
	}, []);

	const checkCoursesCompletion = async (userId) => {
		setLoading(true);
		const finished = [];

		try {
			// Una sola consulta para obtener todo el progreso del usuario
			const response = await api.get(`/progress/student/${userId}`);
			const allProgress = response.data;

			console.log("All user progress:", allProgress);

			// Agrupar progreso por curso
			const progressByCourse = {};
			allProgress.forEach(item => {
				const courseId = parseInt(item.course_id);
				if (!progressByCourse[courseId]) {
					progressByCourse[courseId] = [];
				}
				progressByCourse[courseId].push(item);
			});

			// Verificar cada curso
			for (let courseIndex = 0; courseIndex < cursos.length; courseIndex++) {
				const courseProgress = progressByCourse[courseIndex] || [];
				const expectedUnits = cursos[courseIndex].units.length;

				console.log(`Course ${courseIndex}:`, {
					expectedUnits,
					foundUnits: courseProgress.length,
					progress: courseProgress
				});

				// Verificar si el curso está completado
				const courseCompleted = (
					courseProgress.length === expectedUnits &&
					courseProgress.every((item) => parseInt(item.completed) === 1) &&
					courseProgress.every((item) => parseInt(item.certificate) === 1)
				);

				if (courseCompleted) {
					// Calcular score real del promedio de todas las unidades
					const averageScore = courseProgress.reduce((sum, item) => 
						sum + parseFloat(item.score || 0), 0
					) / courseProgress.length;

					// Obtener fecha de finalización más reciente
					const finishDates = courseProgress
						.filter(item => item.finishDate)
						.map(item => new Date(item.finishDate))
						.sort((a, b) => b - a);
					
					const completedDate = finishDates.length > 0 
						? finishDates[0].toISOString().split("T")[0]
						: new Date().toISOString().split("T")[0];

					finished.push({
						courseIndex,
						course: cursos[courseIndex],
						completedDate,
						score: Math.round(averageScore),
					});

					console.log(`Course ${courseIndex} completed with score:`, Math.round(averageScore));
				}
			}

			setFinishedCourses(finished);
		} catch (error) {
			console.error("Error fetching progress data:", error);
			setFinishedCourses([]);
		} finally {
			setLoading(false);
		}
	};

	const handleDownloadCertificate = (courseIndex) => {
		window.location.href = `${cursos[courseIndex].link}/certificado`;
	};

	const handleViewCertificate = (certificate) => {
		setSelectedCertificate(certificate);
	};

	const getScoreColor = (score) => {
		if (score >= 95) return "text-green-600 dark:text-green-400";
		if (score >= 85) return "text-blue-600 dark:text-blue-400";
		if (score >= 75) return "text-yellow-600 dark:text-yellow-400";
		return "text-orange-600 dark:text-orange-400";
	};

	const getScoreBadge = (score) => {
		if (score >= 95) return "Excelente";
		if (score >= 85) return "Muy Bueno";
		if (score >= 75) return "Bueno";
		return "Aprobado";
	};

	const statsData = [
		{
			title: "Certificados Obtenidos",
			value: finishedCourses.length,
			change:
				finishedCourses.length > 0
					? "¡Felicitaciones!"
					: "Completa cursos para obtener certificados",
			changeType: finishedCourses.length > 0 ? "positive" : "neutral",
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
						d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z"
					/>
				</svg>
			),
			color: "green",
		},
		{
			title: "Promedio de Calificación",
			value:
				finishedCourses.length > 0
					? `${Math.round(
							finishedCourses.reduce((acc, cert) => acc + cert.score, 0) /
								finishedCourses.length
					)}%`
					: "N/A",
			change:
				finishedCourses.length > 0
					? "Excelente desempeño"
					: "Sin calificaciones aún",
			changeType: finishedCourses.length > 0 ? "positive" : "neutral",
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
						d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z"
					/>
				</svg>
			),
			color: "orange",
		},
		{
			title: "Certificados Este Mes",
			value: finishedCourses.filter((cert) => {
				const certDate = new Date(cert.completedDate);
				const currentDate = new Date();
				return certDate.getMonth() === currentDate.getMonth();
			}).length,
			change: "Sigue aprendiendo",
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
			color: "blue",
		},
		{
			title: "Progreso Total",
			value: `${Math.round((finishedCourses.length / cursos.length) * 100)}%`,
			change: `${cursos.length - finishedCourses.length} cursos restantes`,
			changeType:
				finishedCourses.length === cursos.length ? "positive" : "neutral",
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
	];

	if (loading) {
		return (
			<ModernTemplate rol="Estudiante" title="Mis Certificados">
				<div className="flex items-center justify-center h-64">
					<LoadingSpinner size="lg" />
				</div>
			</ModernTemplate>
		);
	}

	return (
		<ModernTemplate rol="Estudiante" title="Mis Certificados">
			<div className="space-y-6">
				{/* Header */}
				<div className="flex items-center justify-between">
					<div>
						<Breadcrumbs items={breadcrumbItems} />
						<h1 className="text-2xl font-bold text-gray-900 dark:text-white mt-2">
							Mis Certificados
						</h1>
						<p className="text-gray-600 dark:text-gray-400 mt-1">
							Descarga y gestiona tus certificados de finalización
						</p>
					</div>

					{finishedCourses.length > 0 && (
						<Button
							variant="primary"
							onClick={() => (window.location.href = "/estudiante/dashboard")}
							leftIcon={
								<svg
									className="w-4 h-4"
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
							}
						>
							Continuar Aprendiendo
						</Button>
					)}
				</div>

				{/* Stats */}
				<div className="grid grid-cols-1 md:grid-cols-4 gap-6">
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

				{/* Certificates Grid */}
				{finishedCourses.length > 0 ? (
					<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
						{finishedCourses.map((certificate, index) => (
							<motion.div
								key={index}
								initial={{opacity: 0, y: 20}}
								animate={{opacity: 1, y: 0}}
								transition={{delay: index * 0.1}}
								whileHover={{y: -5}}
							>
								<Card hover className="overflow-hidden group">
									{/* Certificate Preview */}
									<div className="relative h-48 bg-gradient-to-br from-blue-500 to-purple-600 p-6 text-white">
										{/* Decorative elements */}
										<div className="absolute top-0 right-0 w-20 h-20 bg-white/10 rounded-full -mr-10 -mt-10" />
										<div className="absolute bottom-0 left-0 w-16 h-16 bg-white/10 rounded-full -ml-8 -mb-8" />

										{/* Certificate Icon */}
										<div className="absolute top-4 right-4">
											<div className="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center">
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
														d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z"
													/>
												</svg>
											</div>
										</div>

										{/* Course Image */}
										<div className="w-16 h-16 rounded-lg overflow-hidden mb-4 ring-2 ring-white/30">
											<img
												src={certificate.course.img}
												alt={certificate.course.title}
												className="w-full h-full object-cover"
											/>
										</div>

										{/* Course Title */}
										<h3 className="font-bold text-lg mb-2 leading-tight">
											{certificate.course.title}
										</h3>

										{/* Score Badge */}
										<div className="inline-flex items-center space-x-2 bg-white/20 backdrop-blur-sm rounded-full px-3 py-1">
											<svg
												className="w-4 h-4"
												fill="currentColor"
												viewBox="0 0 20 20"
											>
												<path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
											</svg>
											<span className="text-sm font-medium">
												{certificate.score}%
											</span>
											<span className="text-xs opacity-80">
												{getScoreBadge(certificate.score)}
											</span>
										</div>
									</div>

									{/* Certificate Details */}
									<div className="p-6 space-y-4">
										{/* Completion Date */}
										<div className="flex items-center space-x-2 text-sm text-gray-600 dark:text-gray-400">
											<svg
												className="w-4 h-4"
												fill="none"
												stroke="currentColor"
												viewBox="0 0 24 24"
											>
												<path
													strokeLinecap="round"
													strokeLinejoin="round"
													strokeWidth={2}
													d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
												/>
											</svg>
											<span>
												Completado el{" "}
												{new Date(
													certificate.completedDate
												).toLocaleDateString()}
											</span>
										</div>

										{/* Course Info */}
										<div className="space-y-2">
											<div className="flex justify-between text-sm">
												<span className="text-gray-600 dark:text-gray-400">
													Calificación:
												</span>
												<span
													className={`font-semibold ${getScoreColor(
														certificate.score
													)}`}
												>
													{certificate.score}%
												</span>
											</div>
											<div className="flex justify-between text-sm">
												<span className="text-gray-600 dark:text-gray-400">
													Lecciones:
												</span>
												<span className="font-medium text-gray-900 dark:text-white">
													{certificate.course.units.length}
												</span>
											</div>
										</div>

										{/* Actions */}
										<div className="flex space-x-2 pt-2">
											<Button
												variant="outline"
												size="sm"
												fullWidth
												onClick={() => handleViewCertificate(certificate)}
											>
												Ver Detalles
											</Button>
											<Button
												variant="primary"
												size="sm"
												fullWidth
												onClick={() =>
													handleDownloadCertificate(certificate.courseIndex)
												}
												leftIcon={
													<svg
														className="w-4 h-4"
														fill="none"
														stroke="currentColor"
														viewBox="0 0 24 24"
													>
														<path
															strokeLinecap="round"
															strokeLinejoin="round"
															strokeWidth={2}
															d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
														/>
													</svg>
												}
											>
												Descargar
											</Button>
										</div>
									</div>
								</Card>
							</motion.div>
						))}
					</div>
				) : (
					<EmptyState
						icon={
							<svg
								className="w-16 h-16"
								fill="none"
								stroke="currentColor"
								viewBox="0 0 24 24"
							>
								<path
									strokeLinecap="round"
									strokeLinejoin="round"
									strokeWidth={1}
									d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z"
								/>
							</svg>
						}
						title="Aún no tienes certificados"
						description="Completa tus cursos para obtener certificados oficiales que validen tus conocimientos."
						action={
							<Button
								variant="primary"
								onClick={() => (window.location.href = "/estudiante/dashboard")}
								leftIcon={
									<svg
										className="w-4 h-4"
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
								}
							>
								Explorar Cursos
							</Button>
						}
					/>
				)}

				{/* Certificate Detail Modal */}
				<AnimatePresence>
					{selectedCertificate && (
						<motion.div
							initial={{opacity: 0}}
							animate={{opacity: 1}}
							exit={{opacity: 0}}
							className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4"
							onClick={() => setSelectedCertificate(null)}
						>
							<motion.div
								initial={{scale: 0.9, opacity: 0}}
								animate={{scale: 1, opacity: 1}}
								exit={{scale: 0.9, opacity: 0}}
								onClick={(e) => e.stopPropagation()}
								className="bg-white dark:bg-gray-800 rounded-2xl p-6 max-w-md w-full"
							>
								<div className="flex items-center justify-between mb-4">
									<h3 className="text-lg font-bold text-gray-900 dark:text-white">
										Detalles del Certificado
									</h3>
									<button
										onClick={() => setSelectedCertificate(null)}
										className="p-1 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 dark:hover:bg-gray-700"
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
												d="M6 18L18 6M6 6l12 12"
											/>
										</svg>
									</button>
								</div>

								<div className="space-y-4">
									<div className="text-center">
										<img
											src={selectedCertificate.course.img}
											alt={selectedCertificate.course.title}
											className="w-20 h-20 rounded-lg mx-auto mb-3 object-cover"
										/>
										<h4 className="font-semibold text-gray-900 dark:text-white">
											{selectedCertificate.course.title}
										</h4>
									</div>

									<div className="space-y-3">
										<div className="flex justify-between">
											<span className="text-gray-600 dark:text-gray-400">
												Estudiante:
											</span>
											<span className="font-medium text-gray-900 dark:text-white">
												{user?.name}
											</span>
										</div>
										<div className="flex justify-between">
											<span className="text-gray-600 dark:text-gray-400">
												Calificación:
											</span>
											<span
												className={`font-semibold ${getScoreColor(
													selectedCertificate.score
												)}`}
											>
												{selectedCertificate.score}% -{" "}
												{getScoreBadge(selectedCertificate.score)}
											</span>
										</div>
										<div className="flex justify-between">
											<span className="text-gray-600 dark:text-gray-400">
												Fecha de Finalización:
											</span>
											<span className="font-medium text-gray-900 dark:text-white">
												{new Date(
													selectedCertificate.completedDate
												).toLocaleDateString()}
											</span>
										</div>
										<div className="flex justify-between">
											<span className="text-gray-600 dark:text-gray-400">
												Lecciones Completadas:
											</span>
											<span className="font-medium text-gray-900 dark:text-white">
												{selectedCertificate.course.units.length}
											</span>
										</div>
									</div>

									<div className="flex space-x-3 pt-4">
										<Button
											variant="outline"
											fullWidth
											onClick={() => setSelectedCertificate(null)}
										>
											Cerrar
										</Button>
										<Button
											variant="primary"
											fullWidth
											onClick={() =>
												handleDownloadCertificate(
													selectedCertificate.courseIndex
												)
											}
											leftIcon={
												<svg
													className="w-4 h-4"
													fill="none"
													stroke="currentColor"
													viewBox="0 0 24 24"
												>
													<path
														strokeLinecap="round"
														strokeLinejoin="round"
														strokeWidth={2}
														d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
													/>
												</svg>
											}
										>
											Descargar
										</Button>
									</div>
								</div>
							</motion.div>
						</motion.div>
					)}
				</AnimatePresence>
			</div>
		</ModernTemplate>
	);
};

export default ModernCertificates;
