// src/components/ui/LoadingScreen.jsx
import {motion} from "motion/react";
import PropTypes from "prop-types";

function LoadingScreen({ message = "Cargando..." }) {
	return (
		<div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 transition-colors duration-200">
			<div className="text-center">
				{/* Main Loading Animation */}
				<motion.div
					initial={{scale: 0.8, opacity: 0}}
					animate={{scale: 1, opacity: 1}}
					transition={{duration: 0.5}}
					className="mb-8"
				>
					<div className="relative">
						{/* Outer rotating ring */}
						<motion.div
							className="w-24 h-24 border-4 border-blue-200 dark:border-blue-800 rounded-full"
							animate={{ rotate: 360 }}
							transition={{
								duration: 3,
								repeat: Infinity,
								ease: "linear",
							}}
						/>
						{/* Inner spinning element */}
						<motion.div
							className="absolute top-2 left-2 w-20 h-20 border-4 border-transparent border-t-blue-600 dark:border-t-blue-400 rounded-full"
							animate={{ rotate: -360 }}
							transition={{
								duration: 1.5,
								repeat: Infinity,
								ease: "linear",
							}}
						/>
						{/* Center dot */}
						<motion.div
							className="absolute top-1/2 left-1/2 w-3 h-3 bg-blue-600 dark:bg-blue-400 rounded-full transform -translate-x-1/2 -translate-y-1/2"
							animate={{
								scale: [1, 1.5, 1],
								opacity: [0.5, 1, 0.5],
							}}
							transition={{
								duration: 2,
								repeat: Infinity,
							}}
						/>
					</div>
				</motion.div>

				{/* Loading Text */}
				<motion.div
					initial={{y: 20, opacity: 0}}
					animate={{y: 0, opacity: 1}}
					transition={{delay: 0.3, duration: 0.5}}
				>
					<h2 className="text-xl font-semibold text-gray-800 dark:text-gray-200 mb-2">
						{message}
					</h2>
					<p className="text-gray-600 dark:text-gray-400 text-sm">
						Por favor espera un momento...
					</p>
				</motion.div>

				{/* Animated dots */}
				<motion.div
					className="flex justify-center space-x-2 mt-6"
					initial={{opacity: 0}}
					animate={{opacity: 1}}
					transition={{delay: 0.6}}
				>
					{[0, 1, 2, 3, 4].map((index) => (
						<motion.div
							key={index}
							className="w-2 h-2 bg-blue-500 dark:bg-blue-400 rounded-full"
							animate={{
								y: [0, -10, 0],
								opacity: [0.3, 1, 0.3],
							}}
							transition={{
								duration: 1.5,
								repeat: Infinity,
								delay: index * 0.1,
							}}
						/>
					))}
				</motion.div>

				{/* Progress indicator */}
				<motion.div
					className="w-64 h-1 bg-gray-200 dark:bg-gray-700 rounded-full mt-8 overflow-hidden"
					initial={{width: 0}}
					animate={{width: "16rem"}}
					transition={{delay: 0.8, duration: 0.5}}
				>
					<motion.div
						className="h-full bg-gradient-to-r from-blue-500 to-purple-600 rounded-full"
						animate={{
							x: ["-100%", "100%"],
						}}
						transition={{
							duration: 2,
							repeat: Infinity,
							ease: "easeInOut",
						}}
					/>
				</motion.div>
			</div>
		</div>
	);
}

LoadingScreen.propTypes = {
	message: PropTypes.string,
};

export default LoadingScreen;