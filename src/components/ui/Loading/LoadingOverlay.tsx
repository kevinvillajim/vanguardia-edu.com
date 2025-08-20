// src/components/ui/Loading/LoadingOverlay.jsx - Versión mejorada
import {motion, AnimatePresence} from "motion/react";
import LoadingSpinner from "./LoadingSpinner";
import PropTypes from "prop-types";

const LoadingOverlay = ({
	isVisible,
	message = "Cargando...",
	backdrop = true,
	className = "",
	variant = "modern",
}) => {
	if (variant === "modern") {
		return (
			<AnimatePresence>
				{isVisible && (
					<motion.div
						initial={{opacity: 0}}
						animate={{opacity: 1}}
						exit={{opacity: 0}}
						className={`
							fixed inset-0 z-50 flex items-center justify-center
							${backdrop ? "bg-black/50 dark:bg-black/70 backdrop-blur-sm" : ""}
							${className}
						`}
					>
						<motion.div
							initial={{scale: 0.9, opacity: 0, y: 20}}
							animate={{scale: 1, opacity: 1, y: 0}}
							exit={{scale: 0.9, opacity: 0, y: 20}}
							className="bg-white dark:bg-gray-800 rounded-2xl p-8 shadow-2xl border border-gray-200 dark:border-gray-700 min-w-[200px] max-w-sm mx-4"
						>
							<div className="flex flex-col items-center space-y-4">
								<div className="relative">
									<LoadingSpinner size="lg" variant="ring" />
									<motion.div
										className="absolute inset-0"
										animate={{ rotate: -360 }}
										transition={{
											duration: 2,
											repeat: Infinity,
											ease: "linear",
										}}
									>
										<LoadingSpinner size="lg" variant="dots" color="purple" />
									</motion.div>
								</div>
								<div className="text-center">
									<p className="text-gray-700 dark:text-gray-300 font-medium">
										{message}
									</p>
									<motion.div
										className="flex justify-center space-x-1 mt-2"
										initial={{opacity: 0}}
										animate={{opacity: 1}}
										transition={{delay: 0.5}}
									>
										{[0, 1, 2].map((index) => (
											<motion.div
												key={index}
												className="w-1 h-1 bg-blue-500 dark:bg-blue-400 rounded-full"
												animate={{
													scale: [1, 1.5, 1],
													opacity: [0.3, 1, 0.3],
												}}
												transition={{
													duration: 1.5,
													repeat: Infinity,
													delay: index * 0.2,
												}}
											/>
										))}
									</motion.div>
								</div>
							</div>
						</motion.div>
					</motion.div>
				)}
			</AnimatePresence>
		);
	}

	// Original variant for compatibility
	return (
		<AnimatePresence>
			{isVisible && (
				<motion.div
					initial={{opacity: 0}}
					animate={{opacity: 1}}
					exit={{opacity: 0}}
					className={`
						fixed inset-0 z-50 flex items-center justify-center
						${backdrop ? "bg-black/50 dark:bg-black/70 backdrop-blur-sm" : ""}
						${className}
					`}
				>
					<motion.div
						initial={{scale: 0.9, opacity: 0}}
						animate={{scale: 1, opacity: 1}}
						exit={{scale: 0.9, opacity: 0}}
						className="bg-white dark:bg-gray-800 rounded-2xl p-8 shadow-2xl border border-gray-200 dark:border-gray-700 min-w-[200px]"
					>
						<div className="flex flex-col items-center space-y-4">
							<LoadingSpinner size="lg" />
							<p className="text-gray-700 dark:text-gray-300 font-medium">
								{message}
							</p>
						</div>
					</motion.div>
				</motion.div>
			)}
		</AnimatePresence>
	);
};

LoadingOverlay.propTypes = {
	isVisible: PropTypes.bool.isRequired,
	message: PropTypes.string,
	backdrop: PropTypes.bool,
	className: PropTypes.string,
	variant: PropTypes.oneOf(["modern", "simple"]),
};

export default LoadingOverlay;