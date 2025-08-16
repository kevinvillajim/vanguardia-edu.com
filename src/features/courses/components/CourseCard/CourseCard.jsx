// src/components/ui/CourseCard/ModernCourseCard.jsx
import {motion} from "motion/react";
import ProgressRing from "../../../../components/ui/Dashboard/ProgressRing";
import Button from "../../../../components/ui/Button/Button";
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
	instructor,
	tags = [],
	link,
	className = "",
	isLocked = false,
	isNew = false,
	onStart,
	onContinue,
}) => {
	const getDifficultyColor = (level) => {
		switch (level.toLowerCase()) {
			case "principiante":
				return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300";
			case "intermedio":
				return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300";
			case "avanzado":
				return "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300";
			default:
				return "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300";
		}
	};

	const handleCardClick = () => {
		if (isLocked) return;

		if (progress > 0) {
			onContinue?.();
		} else {
			onStart?.();
		}

		if (link) {
			window.location.href = link;
		}
	};

	return (
		<motion.div
			initial={{opacity: 0, y: 20}}
			animate={{opacity: 1, y: 0}}
			transition={{duration: 0.3}}
			whileHover={{y: -8, transition: {duration: 0.2}}}
			className={`
        relative overflow-hidden bg-white dark:bg-gray-800 
        rounded-2xl shadow-lg border border-secondary-300 dark:border-gray-700
        hover:shadow-xl hover:border-primary-500 transition-all duration-300 cursor-pointer
        ${isLocked ? "opacity-60 cursor-not-allowed" : ""}
        ${className}
      `}
			onClick={handleCardClick}
		>
			{/* Lock Overlay */}
			{isLocked && (
				<div className="absolute inset-0 bg-black/20 backdrop-blur-sm z-10 flex items-center justify-center">
					<div className="bg-white dark:bg-gray-800 p-4 rounded-xl shadow-lg">
						<svg
							className="w-8 h-8 text-gray-500 mx-auto mb-2"
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
						<p className="text-sm text-gray-600 dark:text-gray-400">
							Próximamente
						</p>
					</div>
				</div>
			)}

			{/* New Badge */}
			{isNew && (
				<div className="absolute top-4 left-4 z-20">
					<span className="bg-gradient-to-r from-acent-500 to-acent-700 text-white px-3 py-1 rounded-full text-xs font-medium">
						Nuevo
					</span>
				</div>
			)}

			{/* Progress Ring */}
			<div className="absolute top-4 right-4 z-20">
				<ProgressRing
					progress={progress}
					size={60}
					strokeWidth={4}
					showPercentage={false}
				/>
			</div>

			{/* Image */}
			<div className="relative h-48 overflow-hidden">
				<img
					src={image}
					alt={title}
					className="w-full h-full object-cover transition-transform duration-300 hover:scale-110"
				/>
				<div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />

				{/* Progress Bar */}
				<div className="absolute bottom-0 left-0 right-0 h-1 bg-black/20">
					<motion.div
						initial={{width: 0}}
						animate={{width: `${progress}%`}}
						transition={{duration: 1, delay: 0.5}}
						className="h-full bg-gradient-to-r from-primary-500 to-acent-500"
					/>
				</div>
			</div>

			{/* Content */}
			<div className="p-6">
				{/* Title */}
				<h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2 line-clamp-2">
					{title}
				</h3>

				{/* Description */}
				<p className="text-gray-600 dark:text-gray-400 text-sm mb-4 line-clamp-3">
					{description}
				</p>

				{/* Course Meta */}
				<div className="flex items-center justify-between mb-4">
					<div className="flex items-center space-x-4 text-sm text-gray-500 dark:text-gray-400">
						{totalLessons > 0 && (
							<div className="flex items-center space-x-1">
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
								<span>
									{completedLessons}/{totalLessons} lecciones
								</span>
							</div>
						)}
						{duration && (
							<div className="flex items-center space-x-1">
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
										d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
									/>
								</svg>
								<span>{duration}</span>
							</div>
						)}
					</div>

					{/* Difficulty Badge */}
					<span
						className={`px-2 py-1 rounded-full text-xs font-medium ${getDifficultyColor(
							difficulty
						)}`}
					>
						{difficulty}
					</span>
				</div>

				{/* Tags */}
				{tags.length > 0 && (
					<div className="flex flex-wrap gap-2 mb-4">
						{tags.slice(0, 3).map((tag, index) => (
							<span
								key={index}
								className="bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 px-2 py-1 rounded-lg text-xs"
							>
								{tag}
							</span>
						))}
						{tags.length > 3 && (
							<span className="text-gray-500 dark:text-gray-400 text-xs">
								+{tags.length - 3} más
							</span>
						)}
					</div>
				)}

				{/* Instructor */}
				{instructor && (
					<div className="flex items-center space-x-2 mb-4">
						<div className="w-6 h-6 bg-gradient-to-br from-primary-500 to-acent-500 rounded-full flex items-center justify-center">
							<span className="text-white text-xs font-medium">
								{instructor.charAt(0).toUpperCase()}
							</span>
						</div>
						<span className="text-sm text-gray-600 dark:text-gray-400">
							{instructor}
						</span>
					</div>
				)}

				{/* Action Button */}
				<div className="flex items-center justify-between">
					<div className="text-sm text-gray-500 dark:text-gray-400">
						{progress > 0
							? `${Math.round(progress)}% completado`
							: "Aún no iniciado"}
					</div>

					<Button
						variant={progress > 0 ? "secondary" : "acent"}
						size="sm"
						disabled={isLocked}
						rightIcon={
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
									d="M9 5l7 7-7 7"
								/>
							</svg>
						}
					>
						{progress > 0 ? "Continuar" : "Iniciar"}
					</Button>
				</div>
			</div>
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
	link: PropTypes.string,
	className: PropTypes.string,
	isLocked: PropTypes.bool,
	isNew: PropTypes.bool,
	onStart: PropTypes.func,
	onContinue: PropTypes.func,
};

export default ModernCourseCard;
