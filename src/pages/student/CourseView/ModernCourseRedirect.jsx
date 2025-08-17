// src/pages/student/CourseView/ModernCourseRedirect.jsx
import {useEffect, useState} from "react";
import {useNavigate} from "react-router-dom";
import {motion} from "motion/react";
import cursos from "../../../utils/cursos";
import LoadingSpinner from "../../../components/ui/Loading/LoadingSpinner";
import {useCourseAccess} from "../../../hooks/useCourseAccess.jsx";

const ModernCourseRedirect = ({curso}) => {
	const navigate = useNavigate();
	const [redirecting, setRedirecting] = useState(true);
	const [progress, setProgress] = useState(0);
	const {isLoading: checkingAccess, hasAccess} = useCourseAccess(curso);

	useEffect(() => {
		// Solo proceder si el check de acceso ha terminado y el usuario tiene acceso
		if (checkingAccess || !hasAccess) {
			return;
		}

		const handleRedirect = () => {
			try {
				// Simulate loading progress
				const progressInterval = setInterval(() => {
					setProgress((prev) => {
						if (prev >= 90) {
							clearInterval(progressInterval);
							return 90;
						}
						return prev + 10;
					});
				}, 100);

				const initialOpenIndex = localStorage.getItem(
					`Course${curso}initialOpenIndex`
				);

				let targetUrl = `/estudiante/cursos/curso${curso + 1}/unidad1`;

				// Check if we have a saved progress
				if (initialOpenIndex !== null && cursos[curso]) {
					const index = parseInt(initialOpenIndex, 10);
					if (cursos[curso].units[index]) {
						targetUrl = cursos[curso].units[index].url;
					}
				}

				// Complete the progress and redirect
				setTimeout(() => {
					setProgress(100);
					setTimeout(() => {
						navigate(targetUrl);
					}, 300);
				}, 1000);

				return () => clearInterval(progressInterval);
			} catch (error) {
				console.error("Error during course redirect:", error);
				// Fallback redirect
				setTimeout(() => {
					navigate(`/estudiante/cursos/curso${curso + 1}/unidad1`);
				}, 1500);
			}
		};

		handleRedirect();
	}, [curso, navigate, checkingAccess, hasAccess]);

	// Mostrar loader mientras verifica acceso
	if (checkingAccess) {
		return (
			<div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 flex items-center justify-center p-4">
				<motion.div
					initial={{opacity: 0, y: 20}}
					animate={{opacity: 1, y: 0}}
					className="relative z-10 bg-white dark:bg-gray-800 rounded-2xl p-8 shadow-xl text-center max-w-md border border-gray-200 dark:border-gray-700"
				>
					<motion.div
						initial={{scale: 0}}
						animate={{scale: 1}}
						transition={{delay: 0.2, type: "spring", stiffness: 200}}
						className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-6"
					>
						<svg
							className="w-8 h-8 text-white"
							fill="none"
							stroke="currentColor"
							viewBox="0 0 24 24"
						>
							<path
								strokeLinecap="round"
								strokeLinejoin="round"
								strokeWidth={2}
								d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
							/>
						</svg>
					</motion.div>
					<h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
						Verificando acceso
					</h2>
					<p className="text-gray-600 dark:text-gray-400 mb-6">
						Comprobando permisos del curso...
					</p>
					<LoadingSpinner size="lg" color="blue" />
				</motion.div>
			</div>
		);
	}

	// Si no tiene acceso, no renderizar nada (el hook maneja la redirección)
	if (!hasAccess) {
		return null;
	}

	if (!cursos[curso]) {
		return (
			<div className="min-h-screen bg-gradient-to-br from-red-50 to-red-100 dark:from-red-900 dark:to-red-800 flex items-center justify-center p-4">
				<motion.div
					initial={{opacity: 0, scale: 0.9}}
					animate={{opacity: 1, scale: 1}}
					className="bg-white dark:bg-gray-800 rounded-2xl p-8 shadow-xl text-center max-w-md"
				>
					<div className="w-16 h-16 bg-red-100 dark:bg-red-900/20 rounded-full flex items-center justify-center mx-auto mb-4">
						<svg
							className="w-8 h-8 text-red-600 dark:text-red-400"
							fill="none"
							stroke="currentColor"
							viewBox="0 0 24 24"
						>
							<path
								strokeLinecap="round"
								strokeLinejoin="round"
								strokeWidth={2}
								d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
							/>
						</svg>
					</div>
					<h2 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
						Curso no encontrado
					</h2>
					<p className="text-gray-600 dark:text-gray-400 mb-6">
						El curso que estás buscando no existe o no está disponible.
					</p>
					<button
						onClick={() => navigate("/estudiante/dashboard")}
						className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-lg transition-colors"
					>
						Volver al Dashboard
					</button>
				</motion.div>
			</div>
		);
	}

	return (
		<div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 flex items-center justify-center p-4">
			{/* Background Elements */}
			<motion.div
				animate={{
					scale: [1, 1.2, 1],
					rotate: [0, 90, 0],
				}}
				transition={{
					duration: 20,
					repeat: Infinity,
					ease: "linear",
				}}
				className="absolute top-10 left-10 w-32 h-32 bg-blue-200/30 rounded-full blur-xl"
			/>
			<motion.div
				animate={{
					scale: [1.2, 1, 1.2],
					rotate: [90, 0, 90],
				}}
				transition={{
					duration: 15,
					repeat: Infinity,
					ease: "linear",
				}}
				className="absolute bottom-20 right-20 w-48 h-48 bg-purple-200/30 rounded-full blur-xl"
			/>

			<motion.div
				initial={{opacity: 0, y: 20}}
				animate={{opacity: 1, y: 0}}
				className="relative z-10 bg-white dark:bg-gray-800 rounded-2xl p-8 shadow-xl text-center max-w-md border border-gray-200 dark:border-gray-700"
			>
				{/* Course Icon */}
				<motion.div
					initial={{scale: 0}}
					animate={{scale: 1}}
					transition={{delay: 0.2, type: "spring", stiffness: 200}}
					className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-6"
				>
					<svg
						className="w-8 h-8 text-white"
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
				</motion.div>

				{/* Content */}
				<motion.div
					initial={{opacity: 0}}
					animate={{opacity: 1}}
					transition={{delay: 0.4}}
				>
					<h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
						Preparando tu curso
					</h2>
					<p className="text-gray-600 dark:text-gray-400 mb-2">
						{cursos[curso]?.title}
					</p>
					<p className="text-sm text-gray-500 dark:text-gray-500 mb-8">
						Cargando desde donde lo dejaste...
					</p>
				</motion.div>

				{/* Loading Spinner */}
				<div className="mb-6">
					<LoadingSpinner size="lg" color="blue" />
				</div>

				{/* Progress Bar */}
				<div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2 mb-4">
					<motion.div
						className="bg-gradient-to-r from-blue-500 to-purple-600 h-2 rounded-full"
						initial={{width: 0}}
						animate={{width: `${progress}%`}}
						transition={{duration: 0.5, ease: "easeOut"}}
					/>
				</div>

				{/* Progress Text */}
				<motion.p
					initial={{opacity: 0}}
					animate={{opacity: 1}}
					transition={{delay: 0.6}}
					className="text-sm text-gray-500 dark:text-gray-400"
				>
					{progress < 30 && "Verificando progreso..."}
					{progress >= 30 && progress < 60 && "Cargando contenido..."}
					{progress >= 60 && progress < 90 && "Preparando interfaz..."}
					{progress >= 90 && "¡Casi listo!"}
				</motion.p>

				{/* Course Info */}
				{cursos[curso] && (
					<motion.div
						initial={{opacity: 0, y: 10}}
						animate={{opacity: 1, y: 0}}
						transition={{delay: 0.8}}
						className="mt-6 p-4 bg-gray-50 dark:bg-gray-700 rounded-lg"
					>
						<div className="flex items-center justify-between text-sm">
							<div className="flex items-center space-x-2">
								<svg
									className="w-4 h-4 text-blue-600 dark:text-blue-400"
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
								<span className="text-gray-700 dark:text-gray-300">
									{cursos[curso].units.length} unidades
								</span>
							</div>
							<div className="flex items-center space-x-2">
								<svg
									className="w-4 h-4 text-purple-600 dark:text-purple-400"
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
								<span className="text-gray-700 dark:text-gray-300">
									Curso interactivo
								</span>
							</div>
						</div>
					</motion.div>
				)}
			</motion.div>
		</div>
	);
};

export default ModernCourseRedirect;
