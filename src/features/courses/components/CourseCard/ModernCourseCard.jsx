// src/features/courses/components/CourseCard/ModernCourseCard.jsx
import {motion} from "motion/react";
import {Card, Button, ProgressRing} from "../../../../components/ui";
import PropTypes from "prop-types";

const ModernCourseCard = ({
	title,
	description,
	image,
	progress = 0,
	totalLessons = 0,
	completedLessons = 0,
	duration,
	difficulty = "Intermedio",
	instructor = "Instructor COOPROGRESO",
	tags = [],
	link,
	isLocked = false,
	isNew = false,
	lastAccessed,
}) => {
	const getProgressColor = () => {
		if (progress >= 100) return "green";
		if (progress >= 75) return "blue";
		if (progress >= 50) return "purple";
		if (progress >= 25) return "orange";
		return "gray";
	};

	const getDifficultyColor = (diff) => {
		switch (diff.toLowerCase()) {
			case "principiante":
				return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200";
			case "intermedio":
				return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200";
			case "avanzado":
				return "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200";
			default:
				return "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200";
		}
	};

	return (
		<motion.div
			initial={{opacity: 0, y: 20}}
			animate={{opacity: 1, y: 0}}
			transition={{duration: 0.3}}
			whileHover={{y: -5}}
			className="group relative"
		>
			<Card
				hover
				className={`overflow-hidden h-full ${
					isLocked ? "opacity-60" : ""
				} relative`}
			>
				{/* Lock Overlay */}
				{isLocked && (
					<div className="absolute inset-0 bg-black/20 backdrop-blur-[1px] z-10 flex items-center justify-center">
						<div className="bg-white dark:bg-gray-800 rounded-full p-3 shadow-lg">
							<svg
								className="w-6 h-6 text-gray-600 dark:text-gray-400"
								fill="none"
								stroke="currentColor"
								viewBox="0 0 24 24"
							>
								<path
									strokeLinecap="round"
									strokeLinejoin="round"
									strokeWidth={2}
									d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
								/>
							</svg>
						</div>
					</div>
				)}

				{/* New Badge */}
				{isNew && (
					<div className="absolute top-3 left-3 z-20">
						<span className="bg-gradient-to-r from-green-500 to-emerald-500 text-white text-xs font-bold px-2 py-1 rounded-full shadow-lg">
							NUEVO
						</span>
					</div>
				)}

				{/* Progress Badge */}
				<div className="absolute top-3 right-3 z-20">
					<div className="bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm rounded-full p-1 shadow-lg">
						<ProgressRing
							progress={progress}
							size={40}
							strokeWidth={4}
							color={getProgressColor()}
							showPercentage={false}
						/>
						<div className="absolute inset-0 flex items-center justify-center">
							<span className="text-xs font-bold text-gray-900 dark:text-white">
								{Math.round(progress)}%
							</span>
						</div>
					</div>
				</div>

				{/* Image */}
				<div className="relative h-48 overflow-hidden">
					<img
						src={image}
						alt={title}
						className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
					/>
					<div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent" />
				</div>

				{/* Content */}
				<div className="p-6 space-y-4">
					{/* Title and Difficulty */}
					<div className="space-y-2">
						<div className="flex items-start justify-between">
							<h3 className="font-bold text-lg text-gray-900 dark:text-white line-clamp-2 leading-tight">
								{title}
							</h3>
						</div>

						<div className="flex items-center space-x-2">
							<span
								className={`px-2 py-1 rounded-full text-xs font-medium ${getDifficultyColor(
									difficulty
								)}`}
							>
								{difficulty}
							</span>
							{duration && (
								<span className="text-xs text-gray-500 dark:text-gray-400 flex items-center">
									<svg
										className="w-3 h-3 mr-1"
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
									{duration}
								</span>
							)}
						</div>
					</div>

					{/* Description */}
					<p className="text-gray-600 dark:text-gray-400 text-sm line-clamp-3 leading-relaxed">
						{description}
					</p>

					{/* Progress Bar */}
					<div className="space-y-2">
						<div className="flex justify-between text-sm">
							<span className="text-gray-600 dark:text-gray-400">Progreso</span>
							<span className="font-medium text-gray-900 dark:text-white">
								{completedLessons} / {totalLessons} lecciones
							</span>
						</div>
						<div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
							<motion.div
								initial={{width: 0}}
								animate={{width: `${progress}%`}}
								transition={{duration: 1, delay: 0.3}}
								className={`h-2 rounded-full bg-gradient-to-r ${
									progress >= 100
										? "from-green-500 to-emerald-500"
										: progress >= 75
										? "from-blue-500 to-cyan-500"
										: progress >= 50
										? "from-purple-500 to-pink-500"
										: progress >= 25
										? "from-orange-500 to-yellow-500"
										: "from-gray-500 to-gray-600"
								}`}
							/>
						</div>
					</div>

					{/* Tags */}
					{tags.length > 0 && (
						<div className="flex flex-wrap gap-1">
							{tags.slice(0, 3).map((tag, index) => (
								<span
									key={index}
									className="px-2 py-1 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 text-xs rounded-md"
								>
									{tag}
								</span>
							))}
							{tags.length > 3 && (
								<span className="px-2 py-1 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 text-xs rounded-md">
									+{tags.length - 3}
								</span>
							)}
						</div>
					)}

					{/* Instructor */}
					<div className="flex items-center space-x-2 text-sm text-gray-500 dark:text-gray-400">
						<div className="w-6 h-6 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
							<span className="text-white text-xs font-medium">
								{instructor.charAt(0)}
							</span>
						</div>
						<span>{instructor}</span>
					</div>

					{/* Last Accessed */}
					{lastAccessed && (
						<p className="text-xs text-gray-500 dark:text-gray-400">
							Último acceso: {lastAccessed}
						</p>
					)}

					{/* Action Button */}
					<div className="pt-2">
						{isLocked ? (
							<Button
								variant="outline"
								fullWidth
								disabled
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
											d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
										/>
									</svg>
								}
							>
								Curso No Disponible
							</Button>
						) : progress >= 100 ? (
							<Button
								variant="success"
								fullWidth
								onClick={() => (window.location.href = link)}
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
											d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
										/>
									</svg>
								}
							>
								Completado - Revisar
							</Button>
						) : progress > 0 ? (
							<Button
								variant="primary"
								fullWidth
								onClick={() => (window.location.href = link)}
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
											d="M14.828 14.828a4 4 0 01-5.656 0M9 10h1m4 0h1m-6 8h10a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v10a2 2 0 002 2z"
										/>
									</svg>
								}
							>
								Continuar Curso
							</Button>
						) : (
							<Button
								variant="outline"
								fullWidth
								onClick={() => (window.location.href = link)}
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
											d="M14.828 14.828a4 4 0 01-5.656 0M9 10h1m4 0h1m-6 8h10a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v10a2 2 0 002 2z"
										/>
									</svg>
								}
							>
								Comenzar Curso
							</Button>
						)}
					</div>
				</div>
			</Card>
		</motion.div>
	);
};

ModernCourseCard.propTypes = {
	title: PropTypes.string.isRequired,
	description: PropTypes.string.isRequired,
	image: PropTypes.string.isRequired,
	progress: PropTypes.number,
	totalLessons: PropTypes.number,
	completedLessons: PropTypes.number,
	duration: PropTypes.string,
	difficulty: PropTypes.string,
	instructor: PropTypes.string,
	tags: PropTypes.arrayOf(PropTypes.string),
	link: PropTypes.string.isRequired,
	isLocked: PropTypes.bool,
	isNew: PropTypes.bool,
	lastAccessed: PropTypes.string,
};

export default ModernCourseCard;
